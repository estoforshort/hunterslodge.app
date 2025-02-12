import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    project: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const user = await prisma.user.findUnique({
    select: {
      profile: {
        select: {
          id: true,
        },
      },
    },
    where: { username: params.hunter },
  });

  const data = await prisma.project.findUnique({
    select: {
      groups: {
        select: {
          stackGroup: {
            select: {
              stackId: true,
              gameId: true,
              groupId: true,
              gameGroup: {
                select: {
                  name: true,
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
              createdAt: true,
              updatedAt: true,
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
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { groupId: "asc" },
      },
    },
    where: {
      profileId_stackId: {
        profileId: user?.profile?.id ?? 0,
        stackId: params.project,
      },
    },
  });

  return { data: data?.groups ?? [] };
});
