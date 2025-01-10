import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
    project: z.string().min(1).max(36),
    group: z.string().min(3).max(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.projectGroup.findUnique({
    select: {
      stackId: true,
      groupId: true,
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
      createdAt: true,
    },
    where: {
      profileId_stackId_groupId: {
        profileId: params.profile,
        stackId: params.project,
        groupId: params.group,
      },
    },
  });

  return { data };
});
