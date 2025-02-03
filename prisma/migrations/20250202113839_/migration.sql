-- CreateIndex
CREATE INDEX `ProjectChange_profileId_stackId_createdAt_idx` ON `ProjectChange`(`profileId`, `stackId`, `createdAt`);

-- CreateIndex
CREATE INDEX `ProjectGroupChange_profileId_stackId_groupId_createdAt_idx` ON `ProjectGroupChange`(`profileId`, `stackId`, `groupId`, `createdAt`);

-- CreateIndex
CREATE INDEX `ProjectTrophyChange_profileId_stackId_groupId_trophyId_creat_idx` ON `ProjectTrophyChange`(`profileId`, `stackId`, `groupId`, `trophyId`, `createdAt`);

-- CreateIndex
CREATE INDEX `StackChange_stackId_createdAt_idx` ON `StackChange`(`stackId`, `createdAt`);

-- CreateIndex
CREATE INDEX `StackGroupChange_stackId_groupId_createdAt_idx` ON `StackGroupChange`(`stackId`, `groupId`, `createdAt`);

-- CreateIndex
CREATE INDEX `StackTrophyChange_stackId_groupId_trophyId_createdAt_idx` ON `StackTrophyChange`(`stackId`, `groupId`, `trophyId`, `createdAt`);
