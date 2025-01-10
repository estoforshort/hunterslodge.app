import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
    project: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.project.findUnique({
    select: {
      stackId: true,
      earnedPlatinum: true,
      earnedGold: true,
      earnedSilver: true,
      earnedBronze: true,
      streamPlatinum: true,
      streamGold: true,
      streamSilver: true,
      streamBronze: true,
      firstTrophyEarnedAt: true,
      lastTrophyEarnedAt: true,
      progress: true,
      points: true,
      streamPoints: true,
      timeStreamed: true,
    },
    where: {
      profileId_stackId: {
        profileId: params.profile,
        stackId: params.project,
      },
    },
  });

  return { data };
});
