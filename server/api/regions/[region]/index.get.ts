import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    region: z.string().length(2),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.profileRegion.findUnique({
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
      updatedAt: true,
    },
    where: { id: params.region },
  });

  return { data };
});
