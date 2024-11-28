import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    update: z.number({ coerce: true }).positive().int().max(4294967295),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.update.findUnique({
    select: {
      id: true,
      profile: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              imageUrl: true,
            },
          },
        },
      },
      status: true,
      type: true,
      fullUpdate: true,
      startedAt: true,
      progress: true,
      finishedAt: true,
      startedProjectsFrom: true,
      startedProjectsTo: true,
      completedProjectsFrom: true,
      completedProjectsTo: true,
      definedPlatinumFrom: true,
      definedPlatinumTo: true,
      definedGoldFrom: true,
      definedGoldTo: true,
      definedSilverFrom: true,
      definedSilverTo: true,
      definedBronzeFrom: true,
      definedBronzeTo: true,
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
      hiddenTrophiesFrom: true,
      hiddenTrophiesTo: true,
      completionFrom: true,
      completionTo: true,
      pointsFrom: true,
      pointsTo: true,
      streamPointsFrom: true,
      streamPointsTo: true,
      createdAt: true,
    },
    where: { id: params.update },
  });

  return { data };
});
