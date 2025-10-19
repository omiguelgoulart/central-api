/*
  Warnings:

  - You are about to drop the `torcedor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `assinatura` DROP FOREIGN KEY `Assinatura_torcedorId_fkey`;

-- DropForeignKey
ALTER TABLE `ingressos` DROP FOREIGN KEY `ingressos_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `pagamentos` DROP FOREIGN KEY `pagamentos_socioId_fkey`;

-- DropTable
DROP TABLE `torcedor`;

-- CreateTable
CREATE TABLE `torcedores` (
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

    UNIQUE INDEX `torcedores_email_key`(`email`),
    UNIQUE INDEX `torcedores_cpf_key`(`cpf`),
    INDEX `torcedores_statusSocio_idx`(`statusSocio`),
    INDEX `torcedores_cpf_idx`(`cpf`),
    INDEX `torcedores_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `torcedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
