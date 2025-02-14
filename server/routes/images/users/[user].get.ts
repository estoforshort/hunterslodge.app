import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    user: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  return await useStorage("images").getItemRaw(`users/${params.user}`);
});
