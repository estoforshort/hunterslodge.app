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
CREATE TABLE `ProfileRegion` (
    `id` CHAR(2) NOT NULL,
    `appId` CHAR(3) NOT NULL,
    `name` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `appId` CHAR(3) NOT NULL,
    `regionId` CHAR(2) NOT NULL,
    `accountId` VARCHAR(36) NOT NULL,
    `onlineId` VARCHAR(16) NOT NULL,
    `imageUrl` VARCHAR(512) NOT NULL,
    `platinum` SMALLINT UNSIGNED NOT NULL,
    `gold` MEDIUMINT UNSIGNED NOT NULL,
    `silver` MEDIUMINT UNSIGNED NOT NULL,
    `bronze` MEDIUMINT UNSIGNED NOT NULL,
    `lastCheckedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_accountId_key`(`accountId`),
    UNIQUE INDEX `Profile_onlineId_key`(`onlineId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileSummary` (
    `profileId` SMALLINT UNSIGNED NOT NULL,
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
    `lastTrophyAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `firstTrophyAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hiddenTrophies` MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    `completion` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `lastPartialUpdateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastFullUpdateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProfileSummary_profileId_key`(`profileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppTokens` ADD CONSTRAINT `AppTokens_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileRegion` ADD CONSTRAINT `ProfileRegion_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `ProfileRegion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProfileSummary` ADD CONSTRAINT `ProfileSummary_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
