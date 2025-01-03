/*
  Warnings:

  - You are about to alter the column `observedBy` on the `securityreport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `supervisor` on the `securityreport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `securityreport` MODIFY `observedBy` INTEGER NOT NULL,
    MODIFY `supervisor` INTEGER NOT NULL;
