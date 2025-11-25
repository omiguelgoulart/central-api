-- CreateTable
CREATE TABLE `Pedido` (
    `id` VARCHAR(191) NOT NULL,
    `torcedorId` VARCHAR(191) NOT NULL,
    `status` ENUM('RASCUNHO', 'RESERVA_ATIVA', 'PENDENTE_PAGAMENTO', 'PAGO', 'CANCELADO', 'EXPIRADO') NOT NULL DEFAULT 'RASCUNHO',
    `total` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `expiraEm` DATETIME(3) NULL,
    `pagamentoId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemPedido` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `setorId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('INTEIRA', 'MEIA') NOT NULL,
    `preco` DECIMAL(65, 30) NOT NULL,
    `nomeTitular` VARCHAR(191) NULL,
    `torcedorCpf` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_torcedorId_fkey` FOREIGN KEY (`torcedorId`) REFERENCES `torcedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_pagamentoId_fkey` FOREIGN KEY (`pagamentoId`) REFERENCES `pagamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemPedido` ADD CONSTRAINT `ItemPedido_setorId_fkey` FOREIGN KEY (`setorId`) REFERENCES `setores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
