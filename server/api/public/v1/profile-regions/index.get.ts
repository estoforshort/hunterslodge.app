import { z } from "zod";

export default defineEventHandler(async (event) => {
  const orderBy = ["createdAt"] as const;

  const querySchema = z.object({
    orderBy: z.enum(orderBy).optional(),
    direction: z.enum(["asc", "desc"]).optional(),
  });

  const query = await getValidatedQuery(event, querySchema.parse);

  const data = await prisma.profileRegion.findMany({
    select: {
      id: true,
      name: true,
      earnedPlatinum: true,
      earnedGold: true,
      earnedSilver: true,
      earnedBronze: true,
      points: true,
      position: true,
      createdAt: true,
    },
    where: {
      position: { gte: 1 },
    },
    orderBy: {
      [query.orderBy ?? "position"]: query.direction ?? "asc",
    },
  });

  return { data };
});
