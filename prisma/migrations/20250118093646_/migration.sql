-- CreateIndex
CREATE INDEX `Profile_streamPoints_idx` ON `Profile`(`streamPoints`);

-- CreateIndex
CREATE INDEX `Profile_timeStreamed_idx` ON `Profile`(`timeStreamed`);

-- CreateIndex
CREATE INDEX `Profile_streamPosition_idx` ON `Profile`(`streamPosition`);

-- RenameIndex
ALTER TABLE `ProjectTrophy` RENAME INDEX `ProjectTrophy_streamId_fkey` TO `ProjectTrophy_streamId_idx`;
