import { linkProfile } from "~/utils/abilities/profiles";
import { getName } from "country-list";
import fetch from "node-fetch";
import dayjs from "dayjs";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  await authorize(event, linkProfile);

  const appSettings = await prisma.appSettings.findUniqueOrThrow({
    select: { linkingEnabled: true },
    where: { appId: "app" },
  });

  if (!appSettings.linkingEnabled) {
    return {
      data: {
        success: false,
        message: "Linking is currently disabled",
      },
    };
  }

  const bodySchema = z.object({
    onlineId: z.string().min(3).max(16),
  });

  const body = await readValidatedBody(event, bodySchema.parse);
  const psnProfile = await psn.findProfile({ onlineId: body.onlineId });

  if (!psnProfile.data) {
    return {
      data: {
        success: false,
        message: "Successfully failed to find profile on PSN",
      },
    };
  }

  if (
    psnProfile.data.profile.aboutMe.trim().toLowerCase() !==
    `link:${session.user.username}`
  ) {
    return {
      data: {
        success: false,
        message: `Please change your About me on PSN temporarily to link:${session.user.username}`,
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

  const [region, profilesCount] = await Promise.all([
    getRegion(),
    prisma.profile.count(),
  ]);

  const createProfile = await prisma.profile.create({
    data: {
      userId: session.user.id,
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
      profilesCount: profilesCount + 1,
    },
  });

  try {
    const fetchImage = await fetch(createProfile.imageUrl);

    if (fetchImage.ok) {
      const image = new Uint8Array(await fetchImage.arrayBuffer());

      await prisma.profileImage.create({
        data: {
          profileId: createProfile.id,
          image,
        },
      });
    }
  } catch (e) {
    console.error(e);
  }

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
      streamPlatinumFrom: 0,
      streamGoldFrom: 0,
      streamSilverFrom: 0,
      streamBronzeFrom: 0,
      hiddenTrophiesFrom: 0,
      completionFrom: 0,
      pointsFrom: 0,
      streamPointsFrom: 0,
    },
  });

  await addJob({
    type: "UPDATE",
    update: { id: createUpdate.id, type: "INITIAL" },
  });

  await setUserSession(event, {
    user: {
      ...session.user,
      profileId: createProfile.id,
    },
  });

  return {
    data: {
      success: true,
      message: "Profile successfully linked. Welcome to Hunters Lodge!",
    },
  };
});
