/*
  Warnings:

  - A unique constraint covering the columns `[matricula]` on the table `torcedores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matricula` to the `torcedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `torcedores` ADD COLUMN `matricula` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `torcedores_matricula_key` ON `torcedores`(`matricula`);
