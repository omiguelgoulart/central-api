/*
  Warnings:

  - A unique constraint covering the columns `[emailToken]` on the table `torcedores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "torcedores" ADD COLUMN     "emailToken" TEXT,
ADD COLUMN     "emailTokenExpiraEm" TIMESTAMP(3),
ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_emailToken_key" ON "torcedores"("emailToken");
