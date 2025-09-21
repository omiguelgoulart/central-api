/*
  Warnings:

  - You are about to drop the column `vencimento` on the `pagamentos` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `torcedores` table. All the data in the column will be lost.
  - You are about to drop the `eventos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `torcedores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricula]` on the table `torcedores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `atualizadoEm` to the `ingressos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `ingressos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataVencimento` to the `pagamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `torcedores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `torcedores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ingressos` DROP FOREIGN KEY `ingressos_eventoId_fkey`;

-- DropForeignKey
ALTER TABLE `torcedores` DROP FOREIGN KEY `torcedores_usuarioId_fkey`;

-- DropIndex
DROP INDEX `ingressos_eventoId_status_idx` ON `ingressos`;

-- DropIndex
DROP INDEX `pagamentos_status_vencimento_idx` ON `pagamentos`;

-- AlterTable
ALTER TABLE `ingressos` ADD COLUMN `assentoId` VARCHAR(191) NULL,
    ADD COLUMN `atualizadoEm` DATETIME(3) NOT NULL,
    ADD COLUMN `loteId` VARCHAR(191) NULL,
    ADD COLUMN `valor` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `pagamentos` DROP COLUMN `vencimento`,
    ADD COLUMN `dataVencimento` DATETIME(3) NOT NULL,
    ADD COLUMN `descricao` VARCHAR(191) NULL,
    ADD COLUMN `faturaId` VARCHAR(191) NULL,
    MODIFY `valor` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `planos` MODIFY `valor` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `torcedores` DROP COLUMN `usuarioId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `matricula` VARCHAR(191) NULL,
    ADD COLUMN `senha` VARCHAR(191) NOT NULL,
    MODIFY `cpf` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `eventos`;

-- DropTable
DROP TABLE `usuarios`;

-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assinatura` (
    `id` VARCHAR(191) NOT NULL,
    `torcedorId` VARCHAR(191) NOT NULL,
    `planoId` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVA', 'CANCELADA', 'SUSPENSA', 'EXPIRADA') NOT NULL DEFAULT 'ATIVA',
    `inicioEm` DATETIME(3) NOT NULL,
    `fimEm` DATETIME(3) NULL,
    `proximaCobrancaEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Assinatura_torcedorId_status_idx`(`torcedorId`, `status`),
    INDEX `Assinatura_planoId_idx`(`planoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fatura` (
    `id` VARCHAR(191) NOT NULL,
    `assinaturaId` VARCHAR(191) NOT NULL,
    `competencia` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('ABERTA', 'PAGA', 'ATRASADA', 'CANCELADA') NOT NULL DEFAULT 'ABERTA',
    `vencimentoEm` DATETIME(3) NOT NULL,
    `pagoEm` DATETIME(3) NULL,
    `referencia` VARCHAR(191) NULL,
    `metodo` ENUM('BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'PIX') NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Fatura_referencia_key`(`referencia`),
    INDEX `Fatura_assinaturaId_status_vencimentoEm_competencia_idx`(`assinaturaId`, `status`, `vencimentoEm`, `competencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jogos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `jogos_data_idx`(`data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `capacidade` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `setores_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assentos` (
    `id` VARCHAR(191) NOT NULL,
    `setorId` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `assentos_setorId_idx`(`setorId`),
    UNIQUE INDEX `assentos_setorId_numero_key`(`setorId`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lotes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `precoUnitario` DECIMAL(65, 30) NOT NULL,
    `jogoId` VARCHAR(191) NOT NULL,
    `setorId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `lotes_jogoId_nome_idx`(`jogoId`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkins` (
    `id` VARCHAR(191) NOT NULL,
    `ingressoId` VARCHAR(191) NOT NULL,
    `feitoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `feitoPor` VARCHAR(191) NULL,
    `local` VARCHAR(191) NULL,

    INDEX `checkins_ingressoId_idx`(`ingressoId`),
    UNIQUE INDEX `checkins_ingressoId_feitoEm_key`(`ingressoId`, `feitoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ingressos_eventoId_status_loteId_assentoId_idx` ON `ingressos`(`eventoId`, `status`, `loteId`, `assentoId`);

-- CreateIndex
CREATE INDEX `pagamentos_status_dataVencimento_metodo_idx` ON `pagamentos`(`status`, `dataVencimento`, `metodo`);

-- CreateIndex
CREATE UNIQUE INDEX `torcedores_email_key` ON `torcedores`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `torcedores_matricula_key` ON `torcedores`(`matricula`);

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_planoId_fkey` FOREIGN KEY (`planoId`) REFERENCES `planos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fatura` ADD CONSTRAINT `Fatura_assinaturaId_fkey` FOREIGN KEY (`assinaturaId`) REFERENCES `Assinatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_faturaId_fkey` FOREIGN KEY (`faturaId`) REFERENCES `Fatura`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assentos` ADD CONSTRAINT `assentos_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_loteId_fkey` FOREIGN KEY (`loteId`) REFERENCES `lotes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_assentoId_fkey` FOREIGN KEY (`assentoId`) REFERENCES `assentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_jogoId_fkey` FOREIGN KEY (`jogoId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_ingressoId_fkey` FOREIGN KEY (`ingressoId`) REFERENCES `ingressos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
