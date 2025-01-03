-- DropIndex
DROP INDEX `Department_code_key` ON `department`;

-- AlterTable
ALTER TABLE `department` MODIFY `code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `feedbackcomplain` MODIFY `materialReq` VARCHAR(191) NULL,
    MODIFY `actionTaken` VARCHAR(191) NULL,
    MODIFY `attendedBy` VARCHAR(191) NULL;
