-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "combLitros" DOUBLE PRECISION,
ADD COLUMN     "combNFactura" TEXT,
ADD COLUMN     "combNOrden" TEXT,
ADD COLUMN     "combPrecioLitro" DOUBLE PRECISION,
ADD COLUMN     "combProveedor" TEXT,
ADD COLUMN     "esCombustible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numeroComprobante" TEXT;
