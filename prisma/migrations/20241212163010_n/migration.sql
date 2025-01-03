/*
  Warnings:

  - Added the required column `departments` to the `JobSlip` table without a default value. This is not possible if the table is not empty.
  - Made the column `department` on table `jobslip` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `jobslip` ADD COLUMN `departments` VARCHAR(191) NOT NULL,
    MODIFY `department` VARCHAR(191) NOT NULL;
