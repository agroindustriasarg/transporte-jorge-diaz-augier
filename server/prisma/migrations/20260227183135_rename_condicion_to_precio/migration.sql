/*
  Warnings:

  - You are about to drop the column `condicionCompra` on the `viajes` table. All the data in the column will be lost.
  - You are about to drop the column `condicionVenta` on the `viajes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "viajes" DROP COLUMN "condicionCompra",
DROP COLUMN "condicionVenta",
ADD COLUMN     "precioCompra" DOUBLE PRECISION,
ADD COLUMN     "precioVenta" DOUBLE PRECISION;
