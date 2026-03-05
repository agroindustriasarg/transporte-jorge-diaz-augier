/*
  Warnings:

  - You are about to drop the column `carga` on the `viajes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "viajes" DROP COLUMN "carga",
ADD COLUMN     "productoId" TEXT;

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);
