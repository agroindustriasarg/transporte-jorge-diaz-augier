/*
  Warnings:

  - You are about to drop the column `clienteId` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `destino` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `origen` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `proveedorId` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `tarifa` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `toneladas` on the `viajes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "viajes" DROP COLUMN "clienteId",
DROP COLUMN "destino",
DROP COLUMN "origen",
DROP COLUMN "proveedorId",
DROP COLUMN "tarifa",
DROP COLUMN "toneladas",
ADD COLUMN     "cpe" TEXT,
ADD COLUMN     "kgCargados" DOUBLE PRECISION,
ADD COLUMN     "kgDescargados" DOUBLE PRECISION,
ADD COLUMN     "kmRecorridos" DOUBLE PRECISION,
ADD COLUMN     "tarifaCliente" DOUBLE PRECISION,
ADD COLUMN     "tarifaTransporte" DOUBLE PRECISION,
ADD COLUMN     "transporte" TEXT;
