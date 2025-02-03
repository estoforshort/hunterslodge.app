import fetch from "node-fetch";
import dayjs from "dayjs";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const paramsSchema = z.object({
    shadow: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const appSettings = await prisma.appSettings.findUnique({
    select: { updatesEnabled: true },
    where: { appId: "app" },
  });

  if (!appSettings) {
    return {
      data: {
        success: false,
        message: "App settings not found",
      },
    };
  }

  if (!appSettings.updatesEnabled) {
    return {
      data: {
        success: false,
        message: "Updates are currently disabled",
      },
    };
  }

  const profile = await prisma.profile.findUnique({
    select: {
      id: true,
      accountId: true,
      imageUrl: true,
      platinum: true,
      gold: true,
      silver: true,
      bronze: true,
      lastCheckedAt: true,
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
      lastFullUpdateAt: true,
      profilesCount: true,
      updates: {
        select: {
          id: true,
        },
        where: {
          OR: [
            {
              status: "WAITING",
            },
            {
              status: "RUNNING",
            },
          ],
        },
      },
    },
    where: { onlineId: params.shadow },
  });

  if (!profile) {
    return {
      data: {
        success: false,
        message: "Successfully failed to find the profile",
      },
    };
  }

  if (profile.updates.length > 0) {
    return {
      data: {
        success: false,
        message: "They already have an update in queue",
      },
    };
  }

  const initialUpdate = await prisma.update.findFirst({
    select: {
      id: true,
      status: true,
    },
    where: {
      profileId: profile.id,
      type: "INITIAL",
    },
  });

  if (!initialUpdate) {
    return {
      data: {
        success: false,
        message: "Successfully failed to queue an update",
      },
    };
  }

  if (initialUpdate.status !== "SUCCESSFUL") {
    const updateUpdate = await prisma.update.update({
      where: { id: initialUpdate.id },
      data: {
        status: "WAITING",
      },
    });

    await addJob({
      type: "UPDATE",
      update: { id: updateUpdate.id, type: updateUpdate.type },
    });

    return {
      data: {
        success: true,
        message: "Initial update successfully requeued",
      },
    };
  }

  const [psnProfile, profilesCount] = await Promise.all([
    psn.profile({ accountId: profile.accountId }),
    prisma.profile.count(),
  ]);

  if (!psnProfile.data) {
    return {
      data: {
        success: false,
        message: "Successfully failed to queue an update",
      },
    };
  }

  const findAvatar = psnProfile.data.profile.avatars.find(
    (a) => a.size === "l",
  );

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      onlineId: psnProfile.data.profile.onlineId,
      imageUrl: findAvatar?.url ?? undefined,
      platinum: psnProfile.data.trophySummary.earnedTrophies.platinum,
      gold: psnProfile.data.trophySummary.earnedTrophies.gold,
      silver: psnProfile.data.trophySummary.earnedTrophies.silver,
      bronze: psnProfile.data.trophySummary.earnedTrophies.bronze,
      lastCheckedAt: dayjs().format(),
      profilesCount,
    },
  });

  if (findAvatar && findAvatar.url !== profile.imageUrl) {
    try {
      const fetchImage = await fetch(findAvatar.url);

      if (fetchImage.ok) {
        const image = new Uint8Array(await fetchImage.arrayBuffer());

        await prisma.profileImage.update({
          where: {
            profileId: profile.id,
          },
          data: { image },
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (
    profile.platinum !==
      psnProfile.data.trophySummary.earnedTrophies.platinum ||
    profile.gold !== psnProfile.data.trophySummary.earnedTrophies.gold ||
    profile.silver !== psnProfile.data.trophySummary.earnedTrophies.silver ||
    profile.bronze !== psnProfile.data.trophySummary.earnedTrophies.bronze
  ) {
    const createUpdate = await prisma.update.create({
      data: {
        appId: "app",
        profileId: profile.id,
        status: "WAITING",
        type: "MANUAL",
        fullUpdate: dayjs().isAfter(
          dayjs(profile.lastFullUpdateAt).add(3, "hours"),
        )
          ? true
          : profile.profilesCount !== profilesCount
            ? true
            : false,
        startedProjectsFrom: profile.startedProjects,
        completedProjectsFrom: profile.completedProjects,
        definedPlatinumFrom: profile.definedPlatinum,
        definedGoldFrom: profile.definedGold,
        definedSilverFrom: profile.definedSilver,
        definedBronzeFrom: profile.definedBronze,
        earnedPlatinumFrom: profile.earnedPlatinum,
        earnedGoldFrom: profile.earnedGold,
        earnedSilverFrom: profile.earnedSilver,
        earnedBronzeFrom: profile.earnedBronze,
        streamPlatinumFrom: profile.streamPlatinum,
        streamGoldFrom: profile.streamGold,
        streamSilverFrom: profile.streamSilver,
        streamBronzeFrom: profile.streamBronze,
        hiddenTrophiesFrom: profile.hiddenTrophies,
        completionFrom: profile.completion,
        pointsFrom: profile.points,
        streamPointsFrom: profile.streamPoints,
      },
    });

    await addJob({
      type: "UPDATE",
      update: { id: createUpdate.id, type: createUpdate.type },
    });

    return {
      data: {
        success: true,
        message: "Update successfully queued",
      },
    };
  }

  return {
    data: {
      success: false,
      message: "No new trophies detected",
    },
  };
});
