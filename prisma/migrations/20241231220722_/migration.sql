/*
  Warnings:

  - You are about to drop the column `voltage` on the `transformers` table. All the data in the column will be lost.
  - You are about to drop the column `voltageStatus` on the `transformers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `transformers` DROP COLUMN `voltage`,
    DROP COLUMN `voltageStatus`,
    ADD COLUMN `HTStatus` VARCHAR(191) NULL,
    ADD COLUMN `HTvoltage` DOUBLE NULL,
    ADD COLUMN `LTStatus` VARCHAR(191) NULL,
    ADD COLUMN `LTvoltage` DOUBLE NULL;
