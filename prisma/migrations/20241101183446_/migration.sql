-- CreateTable
CREATE TABLE `App` (
    `id` CHAR(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppTokens` (
    `appId` CHAR(3) NOT NULL,
    `accessToken` VARCHAR(3072) NULL,
    `expiresAt` DATETIME(3) NULL,
    `refreshToken` CHAR(36) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppTokens_appId_key`(`appId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppSettings` (
    `appId` CHAR(3) NOT NULL,
    `linkingEnabled` BOOLEAN NOT NULL DEFAULT false,
    `updatesEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppSettings_appId_key`(`appId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(36) NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `username` VARCHAR(25) NOT NULL,
    `displayName` VARCHAR(50) NOT NULL,
    `imageUrl` VARCHAR(512) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL,
    `isFounder` BOOLEAN NOT NULL,
    `isLinked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserImage` (
    `userId` VARCHAR(36) NOT NULL,
    `image` MEDIUMBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserImage_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileRegion` (
    `id` CHAR(2) NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `name` VARCHAR(64) NULL,
    `rankedProfiles` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedPlatinum` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGold` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilver` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronze` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `completion` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `points` DECIMAL(24, 2) NOT NULL DEFAULT 0,
    `position` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `appId` CHAR(3) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `regionId` CHAR(2) NOT NULL,
    `accountId` VARCHAR(36) NOT NULL,
    `onlineId` VARCHAR(16) NOT NULL,
    `imageUrl` VARCHAR(512) NOT NULL,
    `platinum` SMALLINT UNSIGNED NOT NULL,
    `gold` MEDIUMINT UNSIGNED NOT NULL,
    `silver` MEDIUMINT UNSIGNED NOT NULL,
    `bronze` MEDIUMINT UNSIGNED NOT NULL,
    `lastCheckedAt` DATETIME(3) NOT NULL,
    `firstTrophyEarnedAt` DATETIME(3) NULL,
    `lastTrophyEarnedAt` DATETIME(3) NULL,
    `startedProjects` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `completedProjects` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedPlatinum` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGold` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilver` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronze` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedPlatinum` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGold` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilver` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronze` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `hiddenTrophies` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `completion` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `points` DECIMAL(19, 2) NOT NULL DEFAULT 0,
    `lastFullUpdateAt` DATETIME(3) NULL,
    `regionalPosition` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `globalPosition` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    UNIQUE INDEX `Profile_accountId_key`(`accountId`),
    UNIQUE INDEX `Profile_onlineId_key`(`onlineId`),
    INDEX `Profile_regionId_idx`(`regionId`),
    INDEX `Profile_lastFullUpdateAt_idx`(`lastFullUpdateAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileImage` (
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `image` MEDIUMBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProfileImage_profileId_key`(`profileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Overlay` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `lastCalledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `viewers` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `language` CHAR(2) NOT NULL,
    `mature` BOOLEAN NOT NULL,
    `gameId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Overlay_profileId_key`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stream` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `maxViewers` MEDIUMINT UNSIGNED NOT NULL,
    `avgViewers` MEDIUMINT UNSIGNED NOT NULL,
    `platinum` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `gold` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `silver` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `bronze` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `endsAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Stream_profileId_createdAt_endsAt_idx`(`profileId`, `createdAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Viewers` (
    `id` VARCHAR(36) NOT NULL,
    `streamId` VARCHAR(36) NOT NULL,
    `viewers` MEDIUMINT UNSIGNED NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Viewers_streamId_idx`(`streamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Update` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `appId` CHAR(3) NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `status` ENUM('WAITING', 'RUNNING', 'SUCCESSFUL', 'FAILED') NOT NULL,
    `type` ENUM('INITIAL', 'MANUAL', 'OVERLAY', 'AUTOMATIC', 'FORCED') NOT NULL,
    `fullUpdate` BOOLEAN NOT NULL,
    `startedAt` DATETIME(3) NULL,
    `progress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `finishedAt` DATETIME(3) NULL,
    `startedProjectsFrom` SMALLINT UNSIGNED NOT NULL,
    `startedProjectsTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `completedProjectsFrom` SMALLINT UNSIGNED NOT NULL,
    `completedProjectsTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedPlatinumFrom` SMALLINT UNSIGNED NOT NULL,
    `definedPlatinumTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGoldFrom` MEDIUMINT UNSIGNED NOT NULL,
    `definedGoldTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilverFrom` MEDIUMINT UNSIGNED NOT NULL,
    `definedSilverTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronzeFrom` MEDIUMINT UNSIGNED NOT NULL,
    `definedBronzeTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedPlatinumFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedPlatinumTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGoldFrom` MEDIUMINT UNSIGNED NOT NULL,
    `earnedGoldTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilverFrom` MEDIUMINT UNSIGNED NOT NULL,
    `earnedSilverTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronzeFrom` MEDIUMINT UNSIGNED NOT NULL,
    `earnedBronzeTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `hiddenTrophiesFrom` MEDIUMINT UNSIGNED NOT NULL,
    `hiddenTrophiesTo` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `completionFrom` DECIMAL(5, 2) NOT NULL,
    `completionTo` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `pointsFrom` DECIMAL(19, 2) NOT NULL,
    `pointsTo` DECIMAL(19, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Update_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `appId` CHAR(3) NOT NULL,
    `hash` CHAR(32) NOT NULL,
    `service` VARCHAR(7) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `imageUrl` VARCHAR(512) NOT NULL,
    `definedPlatinum` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGold` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilver` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronze` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Game_hash_key`(`hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameImage` (
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `image` MEDIUMBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GameImage_gameId_key`(`gameId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Platform` (
    `id` VARCHAR(6) NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlatformsOnGames` (
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `platformId` VARCHAR(6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`gameId`, `platformId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group` (
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `id` CHAR(3) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `imageUrl` VARCHAR(512) NOT NULL,
    `definedPlatinum` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGold` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilver` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronze` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`gameId`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupImage` (
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `image` MEDIUMBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`gameId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trophy` (
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `id` SMALLINT UNSIGNED NOT NULL,
    `type` ENUM('platinum', 'gold', 'silver', 'bronze') NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `description` VARCHAR(1024) NOT NULL,
    `imageUrl` VARCHAR(512) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`gameId`, `groupId`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrophyImage` (
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `trophyId` SMALLINT UNSIGNED NOT NULL,
    `image` MEDIUMBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`gameId`, `groupId`, `trophyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stack` (
    `id` VARCHAR(36) NOT NULL,
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `definedPlatinum` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGold` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilver` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronze` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `firstTrophyEarnedAt` DATETIME(3) NULL,
    `lastTrophyEarnedAt` DATETIME(3) NULL,
    `psnRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `timesStarted` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `timesCompleted` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `avgProgress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `value` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Stack_gameId_idx`(`gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StackGroup` (
    `stackId` VARCHAR(36) NOT NULL,
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `definedPlatinum` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGold` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilver` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronze` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `firstTrophyEarnedAt` DATETIME(3) NULL,
    `lastTrophyEarnedAt` DATETIME(3) NULL,
    `psnRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `timesCompleted` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `avgProgress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `value` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`stackId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StackTrophy` (
    `stackId` VARCHAR(36) NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `gameId` SMALLINT UNSIGNED NOT NULL,
    `trophyId` SMALLINT UNSIGNED NOT NULL,
    `firstEarnedAt` DATETIME(3) NULL,
    `lastEarnedAt` DATETIME(3) NULL,
    `psnRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `timesEarned` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `rate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `ratio` DECIMAL(7, 2) NOT NULL DEFAULT 1,
    `value` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StackTrophy_stackId_idx`(`stackId`),
    INDEX `StackTrophy_gameId_trophyId_idx`(`gameId`, `trophyId`),
    PRIMARY KEY (`stackId`, `groupId`, `trophyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `overlayId` VARCHAR(36) NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `earnedPlatinum` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGold` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilver` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronze` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `firstTrophyEarnedAt` DATETIME(3) NULL,
    `lastTrophyEarnedAt` DATETIME(3) NULL,
    `progress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `value` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `points` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `completion` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_overlayId_key`(`overlayId`),
    INDEX `Project_stackId_progress_idx`(`stackId`, `progress`),
    PRIMARY KEY (`profileId`, `stackId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StreamsOnProjects` (
    `streamId` VARCHAR(36) NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `timeStreamed` INTEGER UNSIGNED NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`streamId`, `profileId`, `stackId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectGroup` (
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `earnedPlatinum` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGold` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilver` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronze` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `firstTrophyEarnedAt` DATETIME(3) NULL,
    `lastTrophyEarnedAt` DATETIME(3) NULL,
    `progress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `value` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `points` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `completion` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProjectGroup_stackId_groupId_idx`(`stackId`, `groupId`),
    PRIMARY KEY (`profileId`, `stackId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTrophy` (
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `trophyId` SMALLINT UNSIGNED NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `streamId` VARCHAR(36) NULL,
    `earnedAt` DATETIME(3) NULL,
    `points` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`profileId`, `stackId`, `groupId`, `trophyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectChange` (
    `updateId` INTEGER UNSIGNED NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `earnedPlatinumFrom` TINYINT UNSIGNED NOT NULL,
    `earnedPlatinumTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGoldFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedGoldTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilverFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedSilverTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronzeFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedBronzeTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `progressFrom` TINYINT UNSIGNED NOT NULL,
    `progressTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `pointsFrom` DECIMAL(14, 2) NOT NULL,
    `pointsTo` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`updateId`, `stackId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectGroupChange` (
    `updateId` INTEGER UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `earnedPlatinumFrom` TINYINT UNSIGNED NOT NULL,
    `earnedPlatinumTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedGoldFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedGoldTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedSilverFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedSilverTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `earnedBronzeFrom` SMALLINT UNSIGNED NOT NULL,
    `earnedBronzeTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `progressFrom` TINYINT UNSIGNED NOT NULL,
    `progressTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `pointsFrom` DECIMAL(14, 2) NOT NULL,
    `pointsTo` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`updateId`, `stackId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTrophyChange` (
    `updateId` INTEGER UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `trophyId` SMALLINT UNSIGNED NOT NULL,
    `pointsFrom` DECIMAL(10, 2) NOT NULL,
    `pointsTo` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`updateId`, `stackId`, `groupId`, `trophyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StackChange` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `stackId` VARCHAR(36) NOT NULL,
    `definedPlatinumFrom` TINYINT UNSIGNED NOT NULL,
    `definedPlatinumTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGoldFrom` SMALLINT UNSIGNED NOT NULL,
    `definedGoldTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilverFrom` SMALLINT UNSIGNED NOT NULL,
    `definedSilverTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronzeFrom` SMALLINT UNSIGNED NOT NULL,
    `definedBronzeTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `psnRateFrom` DECIMAL(5, 2) NOT NULL,
    `psnRateTo` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `timesStartedFrom` SMALLINT UNSIGNED NOT NULL,
    `timesStartedTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `timesCompletedFrom` SMALLINT UNSIGNED NOT NULL,
    `timesCompletedTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `avgProgressFrom` TINYINT UNSIGNED NOT NULL,
    `avgProgressTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `valueFrom` DECIMAL(14, 2) NOT NULL,
    `valueTo` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StackGroupChange` (
    `stackChangeId` INTEGER UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `definedPlatinumFrom` TINYINT UNSIGNED NOT NULL,
    `definedPlatinumTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedGoldFrom` TINYINT UNSIGNED NOT NULL,
    `definedGoldTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedSilverFrom` TINYINT UNSIGNED NOT NULL,
    `definedSilverTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `definedBronzeFrom` TINYINT UNSIGNED NOT NULL,
    `definedBronzeTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `psnRateFrom` DECIMAL(5, 2) NOT NULL,
    `psnRateTo` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `timesCompletedFrom` SMALLINT UNSIGNED NOT NULL,
    `timesCompletedTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `avgProgressFrom` TINYINT UNSIGNED NOT NULL,
    `avgProgressTo` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `valueFrom` DECIMAL(14, 2) NOT NULL,
    `valueTo` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`stackChangeId`, `stackId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StackTrophyChange` (
    `stackChangeId` INTEGER UNSIGNED NOT NULL,
    `stackId` VARCHAR(36) NOT NULL,
    `groupId` CHAR(3) NOT NULL,
    `trophyId` SMALLINT UNSIGNED NOT NULL,
    `psnRateFrom` DECIMAL(5, 2) NOT NULL,
    `psnRateTo` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `timesEarnedFrom` SMALLINT UNSIGNED NOT NULL,
    `timesEarnedTo` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `rateFrom` DECIMAL(5, 2) NOT NULL,
    `rateTo` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `ratioFrom` DECIMAL(7, 2) NOT NULL,
    `ratioTo` DECIMAL(7, 2) NOT NULL DEFAULT 1,
    `valueFrom` DECIMAL(10, 2) NOT NULL,
    `valueTo` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`stackChangeId`, `stackId`, `groupId`, `trophyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileRegionChange` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `regionId` CHAR(2) NOT NULL,
    `rankedProfilesFrom` SMALLINT UNSIGNED NOT NULL,
    `rankedProfilesTo` SMALLINT UNSIGNED NOT NULL,
    `earnedPlatinumFrom` MEDIUMINT UNSIGNED NOT NULL,
    `earnedPlatinumTo` MEDIUMINT UNSIGNED NOT NULL,
    `earnedGoldFrom` INTEGER UNSIGNED NOT NULL,
    `earnedGoldTo` INTEGER UNSIGNED NOT NULL,
    `earnedSilverFrom` INTEGER UNSIGNED NOT NULL,
    `earnedSilverTo` INTEGER UNSIGNED NOT NULL,
    `earnedBronzeFrom` INTEGER UNSIGNED NOT NULL,
    `earnedBronzeTo` INTEGER UNSIGNED NOT NULL,
    `completionFrom` DECIMAL(5, 2) NOT NULL,
    `completionTo` DECIMAL(5, 2) NOT NULL,
    `pointsFrom` DECIMAL(24, 2) NOT NULL,
    `pointsTo` DECIMAL(24, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileRegionPositionChange` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `regionId` CHAR(2) NOT NULL,
    `positionFrom` TINYINT UNSIGNED NOT NULL,
    `positionTo` TINYINT UNSIGNED NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileRegionalPositionChange` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `regionalPositionFrom` SMALLINT UNSIGNED NOT NULL,
    `regionalPositionTo` SMALLINT UNSIGNED NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfielGlobalPositionChange` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `profileId` SMALLINT UNSIGNED NOT NULL,
    `globalPositionFrom` SMALLINT UNSIGNED NOT NULL,
    `globalPositionTo` SMALLINT UNSIGNED NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppTokens` ADD CONSTRAINT `AppTokens_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppSettings` ADD CONSTRAINT `AppSettings_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserImage` ADD CONSTRAINT `UserImage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileRegion` ADD CONSTRAINT `ProfileRegion_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `ProfileRegion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileImage` ADD CONSTRAINT `ProfileImage_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overlay` ADD CONSTRAINT `Overlay_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stream` ADD CONSTRAINT `Stream_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Viewers` ADD CONSTRAINT `Viewers_streamId_fkey` FOREIGN KEY (`streamId`) REFERENCES `Stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Update` ADD CONSTRAINT `Update_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Update` ADD CONSTRAINT `Update_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameImage` ADD CONSTRAINT `GameImage_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Platform` ADD CONSTRAINT `Platform_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlatformsOnGames` ADD CONSTRAINT `PlatformsOnGames_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlatformsOnGames` ADD CONSTRAINT `PlatformsOnGames_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupImage` ADD CONSTRAINT `GroupImage_gameId_groupId_fkey` FOREIGN KEY (`gameId`, `groupId`) REFERENCES `Group`(`gameId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trophy` ADD CONSTRAINT `Trophy_gameId_groupId_fkey` FOREIGN KEY (`gameId`, `groupId`) REFERENCES `Group`(`gameId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trophy` ADD CONSTRAINT `Trophy_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrophyImage` ADD CONSTRAINT `TrophyImage_gameId_groupId_trophyId_fkey` FOREIGN KEY (`gameId`, `groupId`, `trophyId`) REFERENCES `Trophy`(`gameId`, `groupId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stack` ADD CONSTRAINT `Stack_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackGroup` ADD CONSTRAINT `StackGroup_stackId_fkey` FOREIGN KEY (`stackId`) REFERENCES `Stack`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackGroup` ADD CONSTRAINT `StackGroup_gameId_groupId_fkey` FOREIGN KEY (`gameId`, `groupId`) REFERENCES `Group`(`gameId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackTrophy` ADD CONSTRAINT `StackTrophy_stackId_groupId_fkey` FOREIGN KEY (`stackId`, `groupId`) REFERENCES `StackGroup`(`stackId`, `groupId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackTrophy` ADD CONSTRAINT `StackTrophy_gameId_groupId_trophyId_fkey` FOREIGN KEY (`gameId`, `groupId`, `trophyId`) REFERENCES `Trophy`(`gameId`, `groupId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_overlayId_fkey` FOREIGN KEY (`overlayId`) REFERENCES `Overlay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_stackId_fkey` FOREIGN KEY (`stackId`) REFERENCES `Stack`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreamsOnProjects` ADD CONSTRAINT `StreamsOnProjects_streamId_fkey` FOREIGN KEY (`streamId`) REFERENCES `Stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreamsOnProjects` ADD CONSTRAINT `StreamsOnProjects_profileId_stackId_fkey` FOREIGN KEY (`profileId`, `stackId`) REFERENCES `Project`(`profileId`, `stackId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectGroup` ADD CONSTRAINT `ProjectGroup_profileId_stackId_fkey` FOREIGN KEY (`profileId`, `stackId`) REFERENCES `Project`(`profileId`, `stackId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectGroup` ADD CONSTRAINT `ProjectGroup_stackId_groupId_fkey` FOREIGN KEY (`stackId`, `groupId`) REFERENCES `StackGroup`(`stackId`, `groupId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTrophy` ADD CONSTRAINT `ProjectTrophy_profileId_stackId_groupId_fkey` FOREIGN KEY (`profileId`, `stackId`, `groupId`) REFERENCES `ProjectGroup`(`profileId`, `stackId`, `groupId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTrophy` ADD CONSTRAINT `ProjectTrophy_stackId_groupId_trophyId_fkey` FOREIGN KEY (`stackId`, `groupId`, `trophyId`) REFERENCES `StackTrophy`(`stackId`, `groupId`, `trophyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTrophy` ADD CONSTRAINT `ProjectTrophy_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTrophy` ADD CONSTRAINT `ProjectTrophy_streamId_fkey` FOREIGN KEY (`streamId`) REFERENCES `Stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectChange` ADD CONSTRAINT `ProjectChange_updateId_fkey` FOREIGN KEY (`updateId`) REFERENCES `Update`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectChange` ADD CONSTRAINT `ProjectChange_profileId_stackId_fkey` FOREIGN KEY (`profileId`, `stackId`) REFERENCES `Project`(`profileId`, `stackId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectGroupChange` ADD CONSTRAINT `ProjectGroupChange_updateId_stackId_fkey` FOREIGN KEY (`updateId`, `stackId`) REFERENCES `ProjectChange`(`updateId`, `stackId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectGroupChange` ADD CONSTRAINT `ProjectGroupChange_profileId_stackId_groupId_fkey` FOREIGN KEY (`profileId`, `stackId`, `groupId`) REFERENCES `ProjectGroup`(`profileId`, `stackId`, `groupId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTrophyChange` ADD CONSTRAINT `ProjectTrophyChange_updateId_stackId_groupId_fkey` FOREIGN KEY (`updateId`, `stackId`, `groupId`) REFERENCES `ProjectGroupChange`(`updateId`, `stackId`, `groupId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTrophyChange` ADD CONSTRAINT `ProjectTrophyChange_profileId_stackId_groupId_trophyId_fkey` FOREIGN KEY (`profileId`, `stackId`, `groupId`, `trophyId`) REFERENCES `ProjectTrophy`(`profileId`, `stackId`, `groupId`, `trophyId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackChange` ADD CONSTRAINT `StackChange_stackId_fkey` FOREIGN KEY (`stackId`) REFERENCES `Stack`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackGroupChange` ADD CONSTRAINT `StackGroupChange_stackChangeId_fkey` FOREIGN KEY (`stackChangeId`) REFERENCES `StackChange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackGroupChange` ADD CONSTRAINT `StackGroupChange_stackId_groupId_fkey` FOREIGN KEY (`stackId`, `groupId`) REFERENCES `StackGroup`(`stackId`, `groupId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackTrophyChange` ADD CONSTRAINT `StackTrophyChange_stackChangeId_stackId_groupId_fkey` FOREIGN KEY (`stackChangeId`, `stackId`, `groupId`) REFERENCES `StackGroupChange`(`stackChangeId`, `stackId`, `groupId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StackTrophyChange` ADD CONSTRAINT `StackTrophyChange_stackId_groupId_trophyId_fkey` FOREIGN KEY (`stackId`, `groupId`, `trophyId`) REFERENCES `StackTrophy`(`stackId`, `groupId`, `trophyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileRegionChange` ADD CONSTRAINT `ProfileRegionChange_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `ProfileRegion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileRegionPositionChange` ADD CONSTRAINT `ProfileRegionPositionChange_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `ProfileRegion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileRegionalPositionChange` ADD CONSTRAINT `ProfileRegionalPositionChange_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfielGlobalPositionChange` ADD CONSTRAINT `ProfielGlobalPositionChange_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
