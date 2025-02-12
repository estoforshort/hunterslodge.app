import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.profile.findFirst({
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          username: true,
          displayName: true,
          isAdmin: true,
          isFounder: true,
        },
      },
      regionId: true,
      region: {
        select: {
          name: true,
        },
      },
      onlineId: true,
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
      updatedAt: true,
    },
    where: { user: { username: params.hunter } },
  });

  return { data };
});
