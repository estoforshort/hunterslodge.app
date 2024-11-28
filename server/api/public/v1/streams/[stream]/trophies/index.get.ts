import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stream: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stream.findUnique({
    select: {
      trophies: {
        select: {
          stackTrophy: {
            select: {
              gameTrophy: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  imageUrl: true,
                },
              },
            },
          },
          earnedAt: true,
          points: true,
          createdAt: true,
        },
      },
    },
    where: { id: params.stream },
  });

  return { data };
});
