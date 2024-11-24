/*
  Warnings:

  - You are about to drop the column `createAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `deleteAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Contact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Made the column `linkPrecedence` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Contact` DROP COLUMN `createAt`,
    DROP COLUMN `deleteAt`,
    DROP COLUMN `updateAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `linkPrecedence` VARCHAR(191) NOT NULL DEFAULT 'primary';

-- CreateIndex
CREATE UNIQUE INDEX `Contact_phoneNumber_key` ON `Contact`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Contact_email_key` ON `Contact`(`email`);
