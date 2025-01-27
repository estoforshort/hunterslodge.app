import { z } from "zod";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    name: z.string().min(1).max(512),
  });

  const body = await readValidatedBody(event, bodySchema.parse);

  const gameSearch = defineCachedFunction(
    async (name: string) => {
      return await prisma.stack.findMany({
        select: {
          id: true,
          game: {
            select: {
              name: true,
              platforms: {
                select: {
                  platformId: true,
                },
              },
            },
          },
          definedPlatinum: true,
          definedGold: true,
          definedSilver: true,
          definedBronze: true,
          firstTrophyEarnedAt: true,
          lastTrophyEarnedAt: true,
          quality: true,
          timesStarted: true,
          timesCompleted: true,
          avgProgress: true,
          value: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          game: {
            _relevance: {
              fields: ["name"],
              search: name + "*",
              sort: "desc",
            },
          },
        },
        take: 50,
      });
    },
    { maxAge: 60, staleMaxAge: 60 },
  );

  const data = await gameSearch(body.name);

  return { data };
});
