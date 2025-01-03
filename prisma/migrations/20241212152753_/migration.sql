/*
  Warnings:

  - Added the required column `department` to the `JobSlip` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `JobSlip_jobId_key` ON `jobslip`;

-- AlterTable
ALTER TABLE `jobslip` ADD COLUMN `department` VARCHAR(191) NOT NULL;
