import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).min(1).max(65535).int(),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).min(0).max(65535).int(),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  return await useStorage("images").getItemRaw(
    `trophies/${params.game}/${params.group}/${params.trophy}`,
  );
});
