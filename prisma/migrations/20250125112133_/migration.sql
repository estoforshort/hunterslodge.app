/*
  Warnings:

  - You are about to drop the column `language` on the `Overlay` table. All the data in the column will be lost.
  - You are about to drop the column `mature` on the `Overlay` table. All the data in the column will be lost.
  - You are about to drop the column `viewers` on the `Overlay` table. All the data in the column will be lost.
  - You are about to drop the column `avgViewers` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `maxViewers` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the `Viewers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Viewers` DROP FOREIGN KEY `Viewers_streamId_fkey`;

-- AlterTable
ALTER TABLE `Overlay` DROP COLUMN `language`,
    DROP COLUMN `mature`,
    DROP COLUMN `viewers`;

-- AlterTable
ALTER TABLE `Stream` DROP COLUMN `avgViewers`,
    DROP COLUMN `maxViewers`;

-- DropTable
DROP TABLE `Viewers`;
