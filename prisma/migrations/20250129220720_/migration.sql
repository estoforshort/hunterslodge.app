/*
  Warnings:

  - You are about to alter the column `points` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,2)` to `Decimal(10,2)`.
  - You are about to alter the column `streamPoints` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,2)` to `Decimal(10,2)`.
  - You are about to alter the column `points` on the `ProfileRegion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(24,2)` to `Decimal(13,2)`.
  - You are about to alter the column `pointsFrom` on the `ProfileRegionChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(24,2)` to `Decimal(13,2)`.
  - You are about to alter the column `pointsTo` on the `ProfileRegionChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(24,2)` to `Decimal(13,2)`.
  - You are about to alter the column `value` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `points` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `streamPoints` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `pointsFrom` on the `ProjectChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `pointsTo` on the `ProjectChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `streamPointsFrom` on the `ProjectChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `streamPointsTo` on the `ProjectChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `value` on the `ProjectGroup` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `points` on the `ProjectGroup` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `streamPoints` on the `ProjectGroup` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `pointsFrom` on the `ProjectGroupChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `pointsTo` on the `ProjectGroupChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `streamPointsFrom` on the `ProjectGroupChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `streamPointsTo` on the `ProjectGroupChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `points` on the `ProjectTrophy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(5,2)`.
  - You are about to alter the column `pointsFrom` on the `ProjectTrophyChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(7,2)`.
  - You are about to alter the column `pointsTo` on the `ProjectTrophyChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(7,2)`.
  - You are about to alter the column `value` on the `Stack` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `valueFrom` on the `StackChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `valueTo` on the `StackChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `value` on the `StackGroup` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(7,2)`.
  - You are about to alter the column `valueFrom` on the `StackGroupChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `valueTo` on the `StackGroupChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(8,2)`.
  - You are about to alter the column `rarity` on the `StackTrophy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(7,2)` to `Decimal(5,2)`.
  - You are about to alter the column `value` on the `StackTrophy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(5,2)`.
  - You are about to alter the column `rarityFrom` on the `StackTrophyChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(7,2)` to `Decimal(5,2)`.
  - You are about to alter the column `rarityTo` on the `StackTrophyChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(7,2)` to `Decimal(5,2)`.
  - You are about to alter the column `valueFrom` on the `StackTrophyChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(7,2)`.
  - You are about to alter the column `valueTo` on the `StackTrophyChange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(7,2)`.
  - You are about to alter the column `pointsFrom` on the `Update` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,2)` to `Decimal(10,2)`.
  - You are about to alter the column `pointsTo` on the `Update` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,2)` to `Decimal(10,2)`.
  - You are about to alter the column `streamPointsFrom` on the `Update` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,2)` to `Decimal(10,2)`.
  - You are about to alter the column `streamPointsTo` on the `Update` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,2)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `Profile` MODIFY `points` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `streamPoints` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ProfileRegion` MODIFY `points` DECIMAL(13, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ProfileRegionChange` MODIFY `pointsFrom` DECIMAL(13, 2) NOT NULL,
    MODIFY `pointsTo` DECIMAL(13, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Project` MODIFY `value` DECIMAL(7, 2) NOT NULL DEFAULT 0,
    MODIFY `points` DECIMAL(7, 2) NOT NULL DEFAULT 0,
    MODIFY `streamPoints` DECIMAL(7, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ProjectChange` MODIFY `pointsFrom` DECIMAL(8, 2) NOT NULL,
    MODIFY `pointsTo` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    MODIFY `streamPointsFrom` DECIMAL(8, 2) NOT NULL,
    MODIFY `streamPointsTo` DECIMAL(8, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ProjectGroup` MODIFY `value` DECIMAL(7, 2) NOT NULL DEFAULT 0,
    MODIFY `points` DECIMAL(7, 2) NOT NULL DEFAULT 0,
    MODIFY `streamPoints` DECIMAL(7, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ProjectGroupChange` MODIFY `pointsFrom` DECIMAL(8, 2) NOT NULL,
    MODIFY `pointsTo` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    MODIFY `streamPointsFrom` DECIMAL(8, 2) NOT NULL,
    MODIFY `streamPointsTo` DECIMAL(8, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ProjectTrophy` MODIFY `points` DECIMAL(5, 2) NOT NULL;

-- AlterTable
ALTER TABLE `ProjectTrophyChange` MODIFY `pointsFrom` DECIMAL(7, 2) NOT NULL,
    MODIFY `pointsTo` DECIMAL(7, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Stack` MODIFY `value` DECIMAL(7, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `StackChange` MODIFY `valueFrom` DECIMAL(8, 2) NOT NULL,
    MODIFY `valueTo` DECIMAL(8, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `StackGroup` MODIFY `value` DECIMAL(7, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `StackGroupChange` MODIFY `valueFrom` DECIMAL(8, 2) NOT NULL,
    MODIFY `valueTo` DECIMAL(8, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `StackTrophy` MODIFY `rarity` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    MODIFY `value` DECIMAL(5, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `StackTrophyChange` MODIFY `rarityFrom` DECIMAL(5, 2) NOT NULL,
    MODIFY `rarityTo` DECIMAL(5, 2) NOT NULL DEFAULT 1,
    MODIFY `valueFrom` DECIMAL(7, 2) NOT NULL,
    MODIFY `valueTo` DECIMAL(7, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Update` MODIFY `pointsFrom` DECIMAL(10, 2) NOT NULL,
    MODIFY `pointsTo` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `streamPointsFrom` DECIMAL(10, 2) NOT NULL,
    MODIFY `streamPointsTo` DECIMAL(10, 2) NOT NULL DEFAULT 0;
