import { z } from "zod";

export default defineCachedEventHandler(
  async (event) => {
    const paramsSchema = z.object({
      region: z.string().length(2),
    });

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    const data = await prisma.profileRegion.findUnique({
      select: {
        id: true,
        name: true,
      },
      where: { id: params.region },
    });

    return { data };
  },
  { maxAge: 60 * 60 },
);
