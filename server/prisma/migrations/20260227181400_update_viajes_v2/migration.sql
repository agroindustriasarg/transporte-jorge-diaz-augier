/*
  Warnings:

  - You are about to drop the column `estado` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `viajes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "viajes" DROP COLUMN "estado",
DROP COLUMN "observaciones",
ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "condicionCompra" TEXT,
ADD COLUMN     "condicionVenta" TEXT,
ADD COLUMN     "descuento" DOUBLE PRECISION,
ADD COLUMN     "precioPizarra" DOUBLE PRECISION,
ADD COLUMN     "proveedorId" TEXT;

-- DropEnum
DROP TYPE "ViajeEstado";
