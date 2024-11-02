import { updateSettings } from "~/utils/abilities/app-settings";

export default defineEventHandler(async (event) => {
  await authorize(event, updateSettings);

  const data = await prisma.appSettings.findUniqueOrThrow({
    select: {
      linkingEnabled: true,
      updatesEnabled: true,
    },
    where: { appId: "app" },
  });

  return {
    data,
  };
});
