import { getName } from "country-list";
import fetch from "node-fetch";
import dayjs from "dayjs";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (session.user.profileId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const appSettings = await prisma.appSettings.findUnique({
    select: { linkingEnabled: true },
    where: { appId: "app" },
  });

  if (!appSettings?.linkingEnabled) {
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
    `link:${session.user.id}`
  ) {
    return {
      data: {
        success: false,
        message: `Please change your About me on PSN temporarily to link:${session.user.id}`,
      },
    };
  }

  if (!psnProfile.data.trophySummary.earnedTrophies.platinum) {
    return {
      data: {
        success: false,
        message:
          "To join the Lodge, you need to earn at least one platinum trophy first",
      },
    };
  }

  const psnAlreadyLinked = await prisma.profile.findFirst({
    select: {
      id: true,
      userId: true,
      startedProjects: true,
      completedProjects: true,
      definedPlatinum: true,
      definedGold: true,
      definedSilver: true,
      definedBronze: true,
      earnedPlatinum: true,
      earnedGold: true,
      earnedSilver: true,
      earnedBronze: true,
      streamPlatinum: true,
      streamGold: true,
      streamSilver: true,
      streamBronze: true,
      hiddenTrophies: true,
      completion: true,
      points: true,
      streamPoints: true,
    },
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

  const getRegion = async () => {
    const findRegion = await prisma.profileRegion.findUnique({
      where: { id: psnProfile.data.profile.region },
    });

    if (findRegion) return findRegion;

    return await prisma.profileRegion.create({
      data: {
        id: psnProfile.data.profile.region,
        name: getName(psnProfile.data.profile.region),
      },
    });
  };

  const [region, profilesCount] = await Promise.all([
    getRegion(),
    prisma.profile.count(),
  ]);

  if (psnAlreadyLinked) {
    if (!psnAlreadyLinked.userId) {
      const updateProfile = await prisma.profile.update({
        where: { id: psnAlreadyLinked.id },
        data: {
          userId: session.user.id,
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
        const fetchImage = await fetch(updateProfile.imageUrl);

        if (fetchImage.ok) {
          const image = new Uint8Array(await fetchImage.arrayBuffer());

          await useStorage("images").setItemRaw(
            `profiles/${updateProfile.id}`,
            image,
          );

          await prisma.profile.update({
            data: {
              downloaded: true,
            },
            where: {
              id: updateProfile.id,
            },
          });
        }
      } catch (e) {
        await prisma.profile.update({
          data: {
            downloaded: false,
          },
          where: {
            id: updateProfile.id,
          },
        });

        console.error(e);
      }

      const createUpdate = await prisma.update.create({
        data: {
          profileId: updateProfile.id,
          status: "WAITING",
          type: "MANUAL",
          fullUpdate: true,
          startedProjectsFrom: psnAlreadyLinked.startedProjects,
          completedProjectsFrom: psnAlreadyLinked.completedProjects,
          definedPlatinumFrom: psnAlreadyLinked.definedPlatinum,
          definedGoldFrom: psnAlreadyLinked.definedGold,
          definedSilverFrom: psnAlreadyLinked.definedSilver,
          definedBronzeFrom: psnAlreadyLinked.definedBronze,
          earnedPlatinumFrom: psnAlreadyLinked.earnedPlatinum,
          earnedGoldFrom: psnAlreadyLinked.earnedGold,
          earnedSilverFrom: psnAlreadyLinked.earnedSilver,
          earnedBronzeFrom: psnAlreadyLinked.earnedBronze,
          streamPlatinumFrom: psnAlreadyLinked.streamPlatinum,
          streamGoldFrom: psnAlreadyLinked.streamGold,
          streamSilverFrom: psnAlreadyLinked.streamSilver,
          streamBronzeFrom: psnAlreadyLinked.streamBronze,
          hiddenTrophiesFrom: psnAlreadyLinked.hiddenTrophies,
          completionFrom: psnAlreadyLinked.completion,
          pointsFrom: psnAlreadyLinked.points,
          streamPointsFrom: psnAlreadyLinked.streamPoints,
        },
      });

      await addJob({
        type: "UPDATE",
        update: { id: createUpdate.id, type: "MANUAL" },
      });

      await setUserSession(event, {
        user: {
          ...session.user,
          profileId: updateProfile.id,
        },
      });

      return {
        data: {
          success: true,
          message: "PSN successfully linked. Welcome to the Lodge, Hunter!",
        },
      };
    }

    return {
      data: {
        success: false,
        message: "PSN already linked by an other user",
      },
    };
  }

  const createProfile = await prisma.profile.create({
    data: {
      userId: session.user.id,
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

      await useStorage("images").setItemRaw(
        `profiles/${createProfile.id}`,
        image,
      );

      await prisma.profile.update({
        data: {
          downloaded: true,
        },
        where: {
          id: createProfile.id,
        },
      });
    }
  } catch (e) {
    console.error(e);
  }

  const createUpdate = await prisma.update.create({
    data: {
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
      message: "PSN successfully linked. Welcome to the Lodge, Hunter!",
    },
  };
});
