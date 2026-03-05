-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "chequeBanco" TEXT,
ADD COLUMN     "chequeEmpresa" TEXT,
ADD COLUMN     "chequeFechaCobro" TIMESTAMP(3),
ADD COLUMN     "chequeNumero" TEXT,
ADD COLUMN     "formaPago" TEXT;
