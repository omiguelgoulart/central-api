/*
  Warnings:

  - Added the required column `senha` to the `torcedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `torcedores` ADD COLUMN `senha` VARCHAR(191) NOT NULL;
