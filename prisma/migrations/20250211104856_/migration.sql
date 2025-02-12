-- AlterTable
ALTER TABLE `Game` ADD COLUMN `downloaded` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Group` ADD COLUMN `downloaded` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `downloaded` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Trophy` ADD COLUMN `downloaded` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `downloaded` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `GroupImage_gameId_idx` ON `GroupImage`(`gameId`);

-- CreateIndex
CREATE INDEX `TrophyImage_gameId_idx` ON `TrophyImage`(`gameId`);
