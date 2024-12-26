-- DropForeignKey
ALTER TABLE `StackGroupChange` DROP FOREIGN KEY `StackGroupChange_stackChangeId_fkey`;

-- DropForeignKey
ALTER TABLE `StackTrophyChange` DROP FOREIGN KEY `StackTrophyChange_stackChangeId_stackId_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `StackGroupChange` ADD CONSTRAINT `StackGroupChange_stackChangeId_fkey` FOREIGN KEY (`stackChangeId`) REFERENCES `StackChange`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackTrophyChange` ADD CONSTRAINT `StackTrophyChange_stackChangeId_stackId_groupId_fkey` FOREIGN KEY (`stackChangeId`, `stackId`, `groupId`) REFERENCES `StackGroupChange`(`stackChangeId`, `stackId`, `groupId`) ON DELETE CASCADE ON UPDATE CASCADE;
