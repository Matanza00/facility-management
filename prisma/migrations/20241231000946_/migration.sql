/*
  Warnings:

  - You are about to alter the column `voltage` on the `transformers` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `transformers` MODIFY `voltage` VARCHAR(191) NULL;
