import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    project: z.string().min(1).max(36),
    group: z.string().length(3),
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

  const data = await prisma.projectGroup.findUnique({
    select: {
      trophies: {
        select: {
          stackTrophy: {
            select: {
              stackId: true,
              gameId: true,
              groupId: true,
              trophyId: true,
              gameTrophy: {
                select: {
                  type: true,
                  name: true,
                  description: true,
                },
              },
              firstEarnedAt: true,
              lastEarnedAt: true,
              quality: true,
              timesEarned: true,
              rarity: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          streamId: true,
          earnedAt: true,
          points: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { trophyId: "asc" },
      },
    },
    where: {
      profileId_stackId_groupId: {
        profileId: user?.profile?.id ?? 0,
        stackId: params.project,
        groupId: params.group,
      },
    },
  });

  return { data: data?.trophies ?? [] };
});
