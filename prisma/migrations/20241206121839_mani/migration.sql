-- Step 1: Add `tenantId` as a nullable column
ALTER TABLE `feedbackcomplain` ADD COLUMN `tenantId` INTEGER;

-- Step 2: Backfill `tenantId` with a default value
UPDATE `feedbackcomplain` SET `tenantId` = 1; -- Replace `1` with the appropriate tenant ID.

-- Step 3: Alter `tenantId` to be NOT NULL
ALTER TABLE `feedbackcomplain` MODIFY COLUMN `tenantId` INTEGER NOT NULL;

-- Step 4: Add the foreign key constraint
ALTER TABLE `feedbackcomplain` ADD CONSTRAINT `FeedbackComplain_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;
