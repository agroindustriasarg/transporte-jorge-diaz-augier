// @ts-nocheck
import * as cheerio from 'cheerio';
import { prisma } from '../utils/prisma.js';

const BCR_URL = 'https://www.cac.bcr.com.ar/es/precios-de-pizarra';

// Clase CSS del board → nombre en DB
const BOARD_CLASS_MAP: Record<string, string> = {
  'board-trigo':   'TRIGO',
  'board-maiz':    'MAÍZ',
  'board-girasol': 'GIRASOL',
  'board-soja':    'SOJA',
  'board-sorgo':   'SORGO',
};

function parseArgNumber(s: string): number {
  if (!s) return 0;
  // "253.250,00" → 253250.00 | "$253.250,00" → 253250.00
  return parseFloat(s.trim().replace('$', '').replace(/\./g, '').replace(',', '.')) || 0;
}

export async function scrapePreciosCereales(): Promise<Record<string, any>> {
  console.log('🌾 Scraping precios BCR...');

  const response = await fetch(BCR_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-AR,es;q=0.9',
    },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: Record<string, any> = {};

  // Estructura real de BCR: div.board.board-{cereal}
  $('.board').each((_, boardEl) => {
    const $board = $(boardEl);
    const classes = $board.attr('class') || '';

    // Identificar el cereal por la clase CSS
    let cereal: string | undefined;
    for (const [cls, name] of Object.entries(BOARD_CLASS_MAP)) {
      if (classes.includes(cls)) {
        cereal = name;
        break;
      }
    }
    if (!cereal) return;

    // Precio principal: div.price
    const precio = parseArgNumber($board.find('.price').text());

    // Celdas de datos: div.bottom > div.cell
    // Orden: [0]"DIF. $/tn" [1]valor [2]"DIF. %" [3]valor [4]"TEND." [5]indicador
    const cells = $board.find('.bottom .cell').toArray();
    const difPesos = cells[1] ? parseArgNumber($(cells[1]).text()) : 0;
    const difPct   = cells[3] ? parseArgNumber($(cells[3]).text()) : 0;

    // Tendencia: revisar el HTML del último cell por clases/imágenes
    let tendencia = difPesos >= 0 ? 'up' : 'down';
    if (cells[5]) {
      const tendHtml = ($(cells[5]).html() || '').toLowerCase();
      if (tendHtml.includes('down') || tendHtml.includes('baja') || tendHtml.includes('arrow-down')) {
        tendencia = 'down';
      } else if (tendHtml.includes('up') || tendHtml.includes('sube') || tendHtml.includes('arrow-up')) {
        tendencia = 'up';
      }
    }

    results[cereal] = { precio, difPesos, difPct, tendencia };
    console.log(`  ✓ ${cereal}: $${precio} | DIF $: ${difPesos} | DIF %: ${difPct} | ${tendencia}`);
  });

  if (Object.keys(results).length === 0) {
    // Fallback: log primeros 500 chars del HTML para debug
    console.error('⚠️  No se encontraron .board divs. Primeros 500 chars del HTML:');
    console.error(html.substring(0, 500));
    throw new Error('No se encontraron precios en la página de BCR');
  }

  // Guardar en DB
  for (const [cereal, data] of Object.entries(results)) {
    await prisma.precioCereal.upsert({
      where:  { cereal },
      update: data,
      create: { cereal, ...data },
    });
  }

  console.log(`✅ BCR: ${Object.keys(results).length} precios actualizados`);
  return results;
}
