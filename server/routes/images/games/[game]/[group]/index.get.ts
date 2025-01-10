import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await prisma.groupImage.findUnique({
    where: {
      gameId_groupId: {
        gameId: params.game,
        groupId: params.group,
      },
    },
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
