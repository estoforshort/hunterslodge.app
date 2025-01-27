import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    update: z.number({ coerce: true }).positive().int().max(4294967295),
    project: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.projectChange.findUnique({
    select: {
      groupChanges: {
        select: {
          stackId: true,
          groupId: true,
          projectGroup: {
            select: {
              stackGroup: {
                select: {
                  gameGroup: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          earnedPlatinumFrom: true,
          earnedPlatinumTo: true,
          earnedGoldFrom: true,
          earnedGoldTo: true,
          earnedSilverFrom: true,
          earnedSilverTo: true,
          earnedBronzeFrom: true,
          earnedBronzeTo: true,
          streamPlatinumFrom: true,
          streamPlatinumTo: true,
          streamGoldFrom: true,
          streamGoldTo: true,
          streamSilverFrom: true,
          streamSilverTo: true,
          streamBronzeFrom: true,
          streamBronzeTo: true,
          progressFrom: true,
          progressTo: true,
          pointsFrom: true,
          pointsTo: true,
          streamPointsFrom: true,
          streamPointsTo: true,
          createdAt: true,
        },
        orderBy: {
          groupId: "asc",
        },
      },
    },
    where: {
      updateId_stackId: {
        updateId: params.update,
        stackId: params.project,
      },
    },
  });

  return { data: data?.groupChanges ?? [] };
});
