/*
  Warnings:

  - You are about to drop the column `licencia` on the `choferes` table. All the data in the column will be lost.
  - You are about to drop the column `vencimientoLicencia` on the `choferes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "choferes" DROP COLUMN "licencia",
DROP COLUMN "vencimientoLicencia",
ADD COLUMN     "marcaCamion" TEXT,
ADD COLUMN     "patenteAcoplado" TEXT,
ADD COLUMN     "patenteCamion" TEXT;
