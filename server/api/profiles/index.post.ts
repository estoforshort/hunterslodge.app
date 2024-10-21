import { getName } from "country-list";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const psnProfile = await psn.findProfile({ onlineId: body.onlineId });

  if (!psnProfile.data) {
    return {
      data: {
        success: false,
        message: "Successfully failed to find profile on PSN",
      },
    };
  }

  if (!psnProfile.data.trophySummary.earnedTrophies.platinum) {
    return {
      data: {
        success: false,
        message:
          "To join Hunters Lodge, you need have at least 1 platinum on your profile",
      },
    };
  }

  const psnAlreadyLinked = await prisma.profile.count({
    where: {
      OR: [
        {
          accountId: psnProfile.data.trophySummary.accountId,
        },
        {
          onlineId: psnProfile.data.profile.onlineId,
        },
      ],
    },
  });

  if (psnAlreadyLinked) {
    return {
      data: {
        success: false,
        message: "Profile already linked by an other user",
      },
    };
  }

  const getRegion = async () => {
    const findRegion = await prisma.profileRegion.findUnique({
      where: { id: psnProfile.data.profile.region },
    });

    if (findRegion) return findRegion;

    return await prisma.profileRegion.create({
      data: {
        id: psnProfile.data.profile.region,
        appId: "app",
        name: getName(psnProfile.data.profile.region),
      },
    });
  };

  const region = await getRegion();

  const createProfile = await prisma.profile.create({
    data: {
      appId: "app",
      regionId: region.id,
      accountId: psnProfile.data.trophySummary.accountId,
      onlineId: psnProfile.data.profile.onlineId,
      imageUrl: psnProfile.data.profile.avatarUrl,
      platinum: psnProfile.data.trophySummary.earnedTrophies.platinum,
      gold: psnProfile.data.trophySummary.earnedTrophies.gold,
      silver: psnProfile.data.trophySummary.earnedTrophies.silver,
      bronze: psnProfile.data.trophySummary.earnedTrophies.bronze,
      lastCheckedAt: dayjs().format(),
      summary: { create: {} },
    },
  });

  const createUpdate = await prisma.update.create({
    data: {
      appId: "app",
      profileId: createProfile.id,
      status: "WAITING",
      type: "INITIAL",
      fullUpdate: true,
      startedProjectsFrom: 0,
      completedProjectsFrom: 0,
      definedPlatinumFrom: 0,
      definedGoldFrom: 0,
      definedSilverFrom: 0,
      definedBronzeFrom: 0,
      earnedPlatinumFrom: 0,
      earnedGoldFrom: 0,
      earnedSilverFrom: 0,
      earnedBronzeFrom: 0,
      hiddenTrophiesFrom: 0,
      completionFrom: 0,
      pointsFrom: 0,
    },
  });

  await addJob({
    type: "UPDATE",
    update: { id: createUpdate.id, type: "INITIAL" },
  });

  return {
    data: {
      success: true,
      message: "Profile successfully linked. Welcome to Hunters Lodge!",
    },
  };
});
