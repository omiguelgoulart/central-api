-- AlterTable
ALTER TABLE `jogos` ADD COLUMN `atualizadoPorId` VARCHAR(191) NULL,
    ADD COLUMN `criadoPorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `jogos` ADD CONSTRAINT `jogos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jogos` ADD CONSTRAINT `jogos_atualizadoPorId_fkey` FOREIGN KEY (`atualizadoPorId`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
