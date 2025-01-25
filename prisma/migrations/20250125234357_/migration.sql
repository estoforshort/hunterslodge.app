-- RenameIndex
ALTER TABLE `ProfileGlobalPositionChange` RENAME INDEX `ProfileGlobalPositionChange_profileId_fkey` TO `ProfileGlobalPositionChange_profileId_idx`;

-- RenameIndex
ALTER TABLE `ProfileRegionPositionChange` RENAME INDEX `ProfileRegionPositionChange_regionId_fkey` TO `ProfileRegionPositionChange_regionId_idx`;

-- RenameIndex
ALTER TABLE `ProfileRegionalPositionChange` RENAME INDEX `ProfileRegionalPositionChange_profileId_fkey` TO `ProfileRegionalPositionChange_profileId_idx`;

-- RenameIndex
ALTER TABLE `ProfileStreamPositionChange` RENAME INDEX `ProfileStreamPositionChange_profileId_fkey` TO `ProfileStreamPositionChange_profileId_idx`;
