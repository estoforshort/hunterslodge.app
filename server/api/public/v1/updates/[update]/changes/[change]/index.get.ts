import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    update: z.number({ coerce: true }).positive().int().max(4294967295),
    change: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.projectChange.findUnique({
    select: {
      project: {
        select: {
          stack: {
            select: {
              id: true,
              game: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
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
      groupChanges: {
        select: {
          projectGroup: {
            select: {
              stackGroup: {
                select: {
                  gameGroup: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
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
          trophyChanges: {
            select: {
              projectTrophy: {
                select: {
                  stackTrophy: {
                    select: {
                      gameTrophy: {
                        select: {
                          id: true,
                          name: true,
                          imageUrl: true,
                        },
                      },
                    },
                  },
                },
              },
              pointsFrom: true,
              pointsTo: true,
              createdAt: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    where: {
      updateId_stackId: {
        updateId: params.update,
        stackId: params.change,
      },
    },
  });

  return { data };
});
