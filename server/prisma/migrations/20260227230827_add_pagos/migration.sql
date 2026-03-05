-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "entidadId" TEXT,
    "entidadNombre" TEXT,
    "concepto" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "cotizacion" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "monto" DOUBLE PRECISION NOT NULL,
    "montoARS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);
