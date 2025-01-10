import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.profile.findUnique({
    select: {
      id: true,
      userId: true,
      regionId: true,
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
    where: { id: params.profile },
  });

  return { data };
});
