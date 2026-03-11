/*
  Warnings:

  - A unique constraint covering the columns `[senhaToken]` on the table `torcedores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "torcedores" ADD COLUMN     "senhaToken" TEXT,
ADD COLUMN     "senhaTokenExpiraEm" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_senhaToken_key" ON "torcedores"("senhaToken");
