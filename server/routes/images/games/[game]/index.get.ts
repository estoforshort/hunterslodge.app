import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await prisma.gameImage.findUnique({
    where: { gameId: params.game },
  });

  if (!findImage) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  const fileType = await fileTypeFromBuffer(findImage.image);

  appendResponseHeaders(event, {
    "content-type": fileType?.mime,
    "cache-control": "max-age=604800",
  });

  return new Blob([findImage.image]);
});
