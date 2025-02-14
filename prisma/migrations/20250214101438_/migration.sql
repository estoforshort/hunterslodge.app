/*
  Warnings:

  - You are about to drop the column `appId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Overlay` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Platform` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `ProfileRegion` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `ProjectTrophy` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Stack` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `StackGroup` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `StackTrophy` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Trophy` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `Update` table. All the data in the column will be lost.
  - You are about to drop the column `appId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `GameImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrophyImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Game` DROP FOREIGN KEY `Game_appId_fkey`;

-- DropForeignKey
ALTER TABLE `GameImage` DROP FOREIGN KEY `GameImage_gameId_fkey`;

-- DropForeignKey
ALTER TABLE `Group` DROP FOREIGN KEY `Group_appId_fkey`;

-- DropForeignKey
ALTER TABLE `GroupImage` DROP FOREIGN KEY `GroupImage_gameId_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `Overlay` DROP FOREIGN KEY `Overlay_appId_fkey`;

-- DropForeignKey
ALTER TABLE `Platform` DROP FOREIGN KEY `Platform_appId_fkey`;

-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_appId_fkey`;

-- DropForeignKey
ALTER TABLE `ProfileImage` DROP FOREIGN KEY `ProfileImage_profileId_fkey`;

-- DropForeignKey
ALTER TABLE `ProfileRegion` DROP FOREIGN KEY `ProfileRegion_appId_fkey`;

-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_appId_fkey`;

-- DropForeignKey
ALTER TABLE `ProjectTrophy` DROP FOREIGN KEY `ProjectTrophy_appId_fkey`;

-- DropForeignKey
ALTER TABLE `Stack` DROP FOREIGN KEY `Stack_appId_fkey`;

-- DropForeignKey
ALTER TABLE `StackGroup` DROP FOREIGN KEY `StackGroup_appId_fkey`;

-- DropForeignKey
ALTER TABLE `StackTrophy` DROP FOREIGN KEY `StackTrophy_appId_fkey`;

-- DropForeignKey
ALTER TABLE `Stream` DROP FOREIGN KEY `Stream_appId_fkey`;

-- DropForeignKey
ALTER TABLE `Trophy` DROP FOREIGN KEY `Trophy_appId_fkey`;

-- DropForeignKey
ALTER TABLE `TrophyImage` DROP FOREIGN KEY `TrophyImage_gameId_groupId_trophyId_fkey`;

-- DropForeignKey
ALTER TABLE `Update` DROP FOREIGN KEY `Update_appId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_appId_fkey`;

-- DropForeignKey
ALTER TABLE `UserImage` DROP FOREIGN KEY `UserImage_userId_fkey`;

-- DropIndex
DROP INDEX `Game_appId_fkey` ON `Game`;

-- DropIndex
DROP INDEX `Group_appId_fkey` ON `Group`;

-- DropIndex
DROP INDEX `Overlay_appId_fkey` ON `Overlay`;

-- DropIndex
DROP INDEX `Platform_appId_fkey` ON `Platform`;

-- DropIndex
DROP INDEX `Profile_appId_fkey` ON `Profile`;

-- DropIndex
DROP INDEX `ProfileRegion_appId_fkey` ON `ProfileRegion`;

-- DropIndex
DROP INDEX `Project_appId_fkey` ON `Project`;

-- DropIndex
DROP INDEX `ProjectTrophy_appId_fkey` ON `ProjectTrophy`;

-- DropIndex
DROP INDEX `Stack_appId_fkey` ON `Stack`;

-- DropIndex
DROP INDEX `StackGroup_appId_fkey` ON `StackGroup`;

-- DropIndex
DROP INDEX `StackTrophy_appId_fkey` ON `StackTrophy`;

-- DropIndex
DROP INDEX `Stream_appId_fkey` ON `Stream`;

-- DropIndex
DROP INDEX `Trophy_appId_fkey` ON `Trophy`;

-- DropIndex
DROP INDEX `Update_appId_fkey` ON `Update`;

-- DropIndex
DROP INDEX `User_appId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Game` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Group` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Overlay` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Platform` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `ProfileRegion` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `ProjectTrophy` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Stack` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `StackGroup` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `StackTrophy` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Stream` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Trophy` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `Update` DROP COLUMN `appId`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `appId`;

-- DropTable
DROP TABLE `GameImage`;

-- DropTable
DROP TABLE `GroupImage`;

-- DropTable
DROP TABLE `ProfileImage`;

-- DropTable
DROP TABLE `TrophyImage`;

-- DropTable
DROP TABLE `UserImage`;
