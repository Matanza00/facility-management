/*
  Warnings:

  - Made the column `materialReq` on table `jobslip` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `jobslip` MODIFY `materialReq` VARCHAR(191) NOT NULL;
