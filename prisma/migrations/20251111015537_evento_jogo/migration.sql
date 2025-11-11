/*
  Warnings:

  - You are about to drop the column `assentoId` on the `ingressos` table. All the data in the column will be lost.
  - You are about to drop the column `eventoId` on the `ingressos` table. All the data in the column will be lost.
  - You are about to drop the column `socioId` on the `ingressos` table. All the data in the column will be lost.
  - You are about to alter the column `valor` on the `ingressos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `setorId` on the `lotes` table. All the data in the column will be lost.
  - You are about to alter the column `precoUnitario` on the `lotes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the `assentos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jogoId` to the `ingressos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jogoSetorId` to the `lotes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assentos` DROP FOREIGN KEY `assentos_setorId_fkey`;

-- DropForeignKey
ALTER TABLE `ingressos` DROP FOREIGN KEY `ingressos_assentoId_fkey`;

-- DropForeignKey
ALTER TABLE `ingressos` DROP FOREIGN KEY `ingressos_eventoId_fkey`;

-- DropForeignKey
ALTER TABLE `ingressos` DROP FOREIGN KEY `ingressos_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `lotes` DROP FOREIGN KEY `lotes_setorId_fkey`;

-- DropIndex
DROP INDEX `checkins_ingressoId_feitoEm_key` ON `checkins`;

-- DropIndex
DROP INDEX `ingressos_eventoId_status_loteId_assentoId_idx` ON `ingressos`;

-- AlterTable
ALTER TABLE `ingressos` DROP COLUMN `assentoId`,
    DROP COLUMN `eventoId`,
    DROP COLUMN `socioId`,
    ADD COLUMN `jogoId` VARCHAR(191) NOT NULL,
    ADD COLUMN `torcedorId` VARCHAR(191) NULL,
    MODIFY `valor` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` ENUM('PENDENTE', 'VALIDO', 'USADO', 'CANCELADO', 'EXPIRADO', 'ESTORNADO') NOT NULL DEFAULT 'VALIDO';

-- AlterTable
ALTER TABLE `jogos` MODIFY `local` VARCHAR(191) NOT NULL DEFAULT 'Bento Freitas';

-- AlterTable
ALTER TABLE `lotes` DROP COLUMN `setorId`,
    ADD COLUMN `fimVendas` DATETIME(3) NULL,
    ADD COLUMN `inicioVendas` DATETIME(3) NULL,
    ADD COLUMN `jogoSetorId` VARCHAR(191) NOT NULL,
    ADD COLUMN `limitePorCPF` INTEGER NULL,
    ADD COLUMN `tipo` ENUM('INTEIRA', 'MEIA', 'CORTESIA', 'PROMO') NOT NULL DEFAULT 'INTEIRA',
    MODIFY `quantidade` INTEGER NULL,
    MODIFY `precoUnitario` DECIMAL(10, 2) NOT NULL;

-- DropTable
DROP TABLE `assentos`;

-- CreateTable
CREATE TABLE `jogos_setores` (
    `id` VARCHAR(191) NOT NULL,
    `jogoId` VARCHAR(191) NOT NULL,
    `setorId` VARCHAR(191) NOT NULL,
    `capacidade` INTEGER NOT NULL,
    `aberto` BOOLEAN NOT NULL DEFAULT true,
    `tipo` ENUM('ARQUIBANCADA', 'CADEIRA', 'CAMAROTE', 'VISITANTE', 'ACESSIVEL') NOT NULL DEFAULT 'ARQUIBANCADA',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `jogos_setores_jogoId_setorId_idx`(`jogoId`, `setorId`),
    UNIQUE INDEX `jogos_setores_jogoId_setorId_key`(`jogoId`, `setorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ingressos_jogoId_status_loteId_idx` ON `ingressos`(`jogoId`, `status`, `loteId`);

-- CreateIndex
CREATE INDEX `lotes_jogoSetorId_idx` ON `lotes`(`jogoSetorId`);

-- AddForeignKey
ALTER TABLE `jogos_setores` ADD CONSTRAINT `jogos_setores_jogoId_fkey` FOREIGN KEY (`jogoId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jogos_setores` ADD CONSTRAINT `jogos_setores_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_jogoSetorId_fkey` FOREIGN KEY (`jogoSetorId`) REFERENCES `jogos_setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `torcedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_jogoId_fkey` FOREIGN KEY (`jogoId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
