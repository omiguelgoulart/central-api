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
CREATE TABLE `torcedores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `dataNasc` DATETIME(3) NULL,
    `endereco` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `status` ENUM('ATIVO', 'INADIMPLENTE', 'CANCELADO') NOT NULL DEFAULT 'ATIVO',
    `planoId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `torcedores_email_key`(`email`),
    UNIQUE INDEX `torcedores_matricula_key`(`matricula`),
    UNIQUE INDEX `torcedores_cpf_key`(`cpf`),
    INDEX `torcedores_status_idx`(`status`),
    INDEX `torcedores_planoId_idx`(`planoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `periodicidade` ENUM('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL') NOT NULL,
    `beneficios` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `planos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assinatura` (
    `id` VARCHAR(191) NOT NULL,
    `torcedorId` VARCHAR(191) NOT NULL,
    `planoId` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVA', 'CANCELADA', 'SUSPENSA', 'EXPIRADA') NOT NULL DEFAULT 'ATIVA',
    `inicioEm` DATETIME(3) NOT NULL,
    `expiraEm` DATETIME(3) NULL,
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
CREATE TABLE `pagamentos` (
    `id` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `dataVencimento` DATETIME(3) NOT NULL,
    `pagoEm` DATETIME(3) NULL,
    `referencia` VARCHAR(191) NULL,
    `metodo` ENUM('BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'PIX') NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `faturaId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `pagamentos_socioId_idx`(`socioId`),
    INDEX `pagamentos_status_dataVencimento_metodo_idx`(`status`, `dataVencimento`, `metodo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jogos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `criadoPorId` VARCHAR(191) NULL,
    `atualizadoPorId` VARCHAR(191) NULL,
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
CREATE TABLE `ingressos` (
    `id` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NULL,
    `eventoId` VARCHAR(191) NOT NULL,
    `qrCode` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('VALIDO', 'USADO', 'CANCELADO') NOT NULL DEFAULT 'VALIDO',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usadoEm` DATETIME(3) NULL,
    `atualizadoEm` DATETIME(3) NOT NULL,
    `loteId` VARCHAR(191) NULL,
    `assentoId` VARCHAR(191) NULL,

    UNIQUE INDEX `ingressos_qrCode_key`(`qrCode`),
    INDEX `ingressos_eventoId_status_loteId_assentoId_idx`(`eventoId`, `status`, `loteId`, `assentoId`),
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

-- AddForeignKey
ALTER TABLE `torcedores` ADD CONSTRAINT `torcedores_planoId_fkey` FOREIGN KEY (`planoId`) REFERENCES `planos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assinatura` ADD CONSTRAINT `Assinatura_planoId_fkey` FOREIGN KEY (`planoId`) REFERENCES `planos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fatura` ADD CONSTRAINT `Fatura_assinaturaId_fkey` FOREIGN KEY (`assinaturaId`) REFERENCES `Assinatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_faturaId_fkey` FOREIGN KEY (`faturaId`) REFERENCES `Fatura`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jogos` ADD CONSTRAINT `jogos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jogos` ADD CONSTRAINT `jogos_atualizadoPorId_fkey` FOREIGN KEY (`atualizadoPorId`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assentos` ADD CONSTRAINT `assentos_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `torcedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
