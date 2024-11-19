import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    gameId: z.number({ coerce: true }).positive().int(),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await getGameImage(params.gameId);

  if (!findImage) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  return Buffer.from(findImage.image);
});
