import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).min(0).max(65535).int(),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await prisma.trophyImage.findUnique({
    where: {
      gameId_groupId_trophyId: {
        gameId: params.game,
        groupId: params.group,
        trophyId: params.trophy,
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
