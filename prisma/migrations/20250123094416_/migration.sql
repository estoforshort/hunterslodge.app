/*
  Warnings:

  - You are about to drop the column `rarity` on the `Stack` table. All the data in the column will be lost.
  - You are about to drop the column `rarityFrom` on the `StackChange` table. All the data in the column will be lost.
  - You are about to drop the column `rarityTo` on the `StackChange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Stack` DROP COLUMN `rarity`;

-- AlterTable
ALTER TABLE `StackChange` DROP COLUMN `rarityFrom`,
    DROP COLUMN `rarityTo`;
