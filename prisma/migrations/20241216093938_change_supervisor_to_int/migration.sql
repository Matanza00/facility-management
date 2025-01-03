/*
  Warnings:

  - You are about to alter the column `supervisor` on the `dailydutyreport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `dailydutyreport` MODIFY `supervisor` INTEGER NOT NULL;
