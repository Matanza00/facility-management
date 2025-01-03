/*
  Warnings:

  - Added the required column `engineer` to the `transformers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transformers` ADD COLUMN `engineer` INTEGER NOT NULL;
