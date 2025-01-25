import { z } from "zod";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    name: z.string().min(1).max(50),
  });

  const body = await readValidatedBody(event, bodySchema.parse);

  const gameSearch = defineCachedFunction(
    async (name: string) => {
      return await prisma.profile.findMany({
        select: {
          user: {
            select: {
              username: true,
              displayName: true,
              isAdmin: true,
              isFounder: true,
            },
          },
          region: {
            select: {
              id: true,
              name: true,
            },
          },
          onlineId: true,
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
          updatedAt: true,
        },
        orderBy: {
          user: {
            _relevance: {
              fields: ["displayName"],
              search: name + "*",
              sort: "desc",
            },
          },
        },
        take: 100,
      });
    },
    { maxAge: 60, staleMaxAge: 60 },
  );

  const data = await gameSearch(body.name);

  return { data };
});
