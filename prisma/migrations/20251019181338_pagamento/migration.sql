/*
  Warnings:

  - You are about to alter the column `valor` on the `pagamentos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[referencia]` on the table `pagamentos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ingressos` ADD COLUMN `pagamentoId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pagamentos` MODIFY `valor` DECIMAL(10, 2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `pagamentos_referencia_key` ON `pagamentos`(`referencia`);

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_pagamentoId_fkey` FOREIGN KEY (`pagamentoId`) REFERENCES `pagamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `pagamentos` RENAME INDEX `pagamentos_faturaId_fkey` TO `pagamentos_faturaId_idx`;
