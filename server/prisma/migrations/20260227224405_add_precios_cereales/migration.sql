-- CreateTable
CREATE TABLE "precios_cereales" (
    "id" TEXT NOT NULL,
    "cereal" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difPesos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tendencia" TEXT NOT NULL DEFAULT 'up',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "precios_cereales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "precios_cereales_cereal_key" ON "precios_cereales"("cereal");
