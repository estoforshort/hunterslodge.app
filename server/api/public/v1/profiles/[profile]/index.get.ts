import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.profile.findFirst({
    select: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          imageUrl: true,
          isAdmin: true,
          isFounder: true,
        },
      },
      region: {
        select: {
          id: true,
          name: true,
        },
      },
      accountId: true,
      onlineId: true,
      imageUrl: true,
      firstTrophyEarnedAt: true,
      lastTrophyEarnedAt: true,
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
      timeStreamed: true,
      lastFullUpdateAt: true,
      streamPosition: true,
      regionalPosition: true,
      globalPosition: true,
      createdAt: true,
    },
    where: {
      user: {
        username: params.profile,
      },
    },
  });

  return { data };
});
