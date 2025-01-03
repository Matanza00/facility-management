/*
  Warnings:

  - Added the required column `inventoryRecieptNo` to the `JobSlip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jobslip` ADD COLUMN `inventoryRecieptNo` VARCHAR(191) NOT NULL;
