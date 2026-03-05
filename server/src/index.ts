import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { connectDB, disconnectDB } from './utils/prisma.js';
import routes from './routes/index.js';
import { scrapePreciosCereales } from './services/cerealesScraper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  // Desarrollo local
  /^http:\/\/localhost:\d+$/,
  // Producción: dominio Vercel (configurar FRONTEND_URL en Render)
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // peticiones sin origin (Render health checks, etc.)
    const allowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : (o as RegExp).test(origin)
    );
    if (allowed) callback(null, true);
    else callback(new Error(`CORS: origen no permitido: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema de Transporte API' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
    });

    // Cron: scrapear BCR de lunes a viernes a las 10:30 hs Argentina (13:30 UTC)
    cron.schedule('30 13 * * 1-5', async () => {
      try {
        await scrapePreciosCereales();
      } catch (e) {
        console.error('❌ Cron BCR falló:', e);
      }
    });
    console.log('⏰ Cron BCR activo: L-V 10:30 hs ART');
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Cerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

startServer();
