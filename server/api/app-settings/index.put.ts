import { updateSettings } from "~/utils/abilities/app-settings";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  await authorize(event, updateSettings);

  const bodySchema = z.object({
    overlaysEnabled: z.boolean(),
    linkingEnabled: z.boolean(),
    updatesEnabled: z.boolean(),
  });

  const body = await readValidatedBody(event, bodySchema.parse);

  await prisma.appSettings.update({
    where: { appId: "app" },
    data: body,
  });

  return true;
});
