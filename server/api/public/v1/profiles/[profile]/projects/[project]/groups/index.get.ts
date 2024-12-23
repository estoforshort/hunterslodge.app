import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
    project: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.project.findUnique({
    select: {
      groups: {
        select: {
          stackGroup: {
            select: {
              gameGroup: {
                select: {
                  gameId: true,
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
              definedPlatinum: true,
              definedGold: true,
              definedSilver: true,
              definedBronze: true,
              firstTrophyEarnedAt: true,
              lastTrophyEarnedAt: true,
              quality: true,
              timesCompleted: true,
              avgProgress: true,
              value: true,
            },
          },
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
        },
        orderBy: { groupId: "asc" },
      },
    },
    where: {
      profileId_stackId: {
        profileId: params.profile,
        stackId: params.project,
      },
    },
  });

  return { data: data?.groups ?? [] };
});
