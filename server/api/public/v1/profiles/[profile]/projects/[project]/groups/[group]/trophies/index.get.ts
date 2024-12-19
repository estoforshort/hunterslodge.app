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
      trophies: {
        select: {
          stackTrophy: {
            select: {
              gameTrophy: {
                select: {
                  gameId: true,
                  groupId: true,
                  id: true,
                  type: true,
                  name: true,
                  description: true,
                  imageUrl: true,
                },
              },
              firstEarnedAt: true,
              lastEarnedAt: true,
              psnRate: true,
              quality: true,
              timesEarned: true,
              rarity: true,
              value: true,
            },
          },
          streamId: true,
          earnedAt: true,
          points: true,
        },
        orderBy: { trophyId: "asc" },
      },
    },
    where: {
      profileId_stackId_groupId: {
        profileId: params.profile,
        stackId: params.project,
        groupId: params.group,
      },
    },
  });

  return { data: data?.trophies ?? [] };
});
