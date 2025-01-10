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
          gameId: true,
          definedPlatinum: true,
          definedGold: true,
          definedSilver: true,
          definedBronze: true,
          firstTrophyEarnedAt: true,
          lastTrophyEarnedAt: true,
          quality: true,
          timesStarted: true,
          rarity: true,
          timesCompleted: true,
          avgProgress: true,
          value: true,
          createdAt: true,
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
        take: 100,
      });
    },
    { maxAge: 300 },
  );

  const data = await gameSearch(body.name);

  return { data };
});
