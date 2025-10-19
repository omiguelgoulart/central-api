/*
  Warnings:

  - You are about to drop the column `socioId` on the `pagamentos` table. All the data in the column will be lost.
  - Added the required column `torcedorId` to the `pagamentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pagamentos` DROP FOREIGN KEY `pagamentos_socioId_fkey`;

-- AlterTable
ALTER TABLE `pagamentos` DROP COLUMN `socioId`,
    ADD COLUMN `torcedorId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `pagamentos_torcedorId_idx` ON `pagamentos`(`torcedorId`);

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
