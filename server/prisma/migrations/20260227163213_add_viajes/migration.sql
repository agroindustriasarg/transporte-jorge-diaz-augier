-- CreateEnum
CREATE TYPE "ViajeEstado" AS ENUM ('PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "viajes" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "clienteId" TEXT,
    "proveedorId" TEXT,
    "chofer" TEXT,
    "patente" TEXT,
    "carga" TEXT,
    "toneladas" DOUBLE PRECISION,
    "tarifa" DOUBLE PRECISION,
    "estado" "ViajeEstado" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viajes_pkey" PRIMARY KEY ("id")
);
