/*
  Warnings:

  - You are about to drop the `torcedores` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `assinatura` DROP FOREIGN KEY `Assinatura_torcedorId_fkey`;

-- DropForeignKey
ALTER TABLE `ingressos` DROP FOREIGN KEY `ingressos_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `pagamentos` DROP FOREIGN KEY `pagamentos_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `torcedores` DROP FOREIGN KEY `torcedores_planoId_fkey`;

-- AlterTable
ALTER TABLE `assinatura` ADD COLUMN `canceladaEm` DATETIME(3) NULL,
    ADD COLUMN `gatewayAssinaturaId` VARCHAR(191) NULL,
    ADD COLUMN `gatewayClienteId` VARCHAR(191) NULL,
    ADD COLUMN `moeda` VARCHAR(191) NULL DEFAULT 'BRL',
    ADD COLUMN `motivoCancelamento` VARCHAR(191) NULL,
    ADD COLUMN `periodicidade` ENUM('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL') NOT NULL DEFAULT 'MENSAL',
    ADD COLUMN `retomadaEm` DATETIME(3) NULL,
    ADD COLUMN `suspensaEm` DATETIME(3) NULL,
    ADD COLUMN `valorAtual` DECIMAL(10, 2) NULL;

-- DropTable
DROP TABLE `torcedores`;

-- CreateTable
CREATE TABLE `Torcedor` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `dataNascimento` DATETIME(3) NULL,
    `genero` VARCHAR(191) NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `enderecoLogradouro` VARCHAR(191) NULL,
    `enderecoNumero` VARCHAR(191) NULL,
    `enderecoBairro` VARCHAR(191) NULL,
    `enderecoCidade` VARCHAR(191) NULL,
    `enderecoUF` VARCHAR(191) NULL,
    `enderecoCEP` VARCHAR(191) NULL,
    `statusSocio` ENUM('ATIVO', 'INADIMPLENTE', 'CANCELADO') NULL,
    `inadimplenteDesde` DATETIME(3) NULL,
    `aceitaTermosEm` DATETIME(3) NULL,
    `aceitaMarketing` BOOLEAN NULL DEFAULT false,
    `aceitaMarketingEm` DATETIME(3) NULL,
    `origemCadastro` VARCHAR(191) NULL,
    `documentoFrenteUrl` VARCHAR(191) NULL,
    `documentoVersoUrl` VARCHAR(191) NULL,
    `gatewayClienteId` VARCHAR(191) NULL,
    `faceId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Torcedor_email_key`(`email`),
    UNIQUE INDEX `Torcedor_cpf_key`(`cpf`),
    INDEX `Torcedor_statusSocio_idx`(`statusSocio`),
    INDEX `Torcedor_cpf_idx`(`cpf`),
    INDEX `Torcedor_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Assinatura_status_proximaCobrancaEm_idx` ON `Assinatura`(`status`, `proximaCobrancaEm`);

-- CreateIndex
CREATE INDEX `Assinatura_torcedorId_planoId_status_idx` ON `Assinatura`(`torcedorId`, `planoId`, `status`);

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `Torcedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Torcedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Torcedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
