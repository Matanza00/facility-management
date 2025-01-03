/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `NotificationTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `NotificationTemplate_name_key` ON `NotificationTemplate`(`name`);
