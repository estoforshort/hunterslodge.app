export default defineEventHandler(async () => {
  const data = await prisma.appSettings.findUniqueOrThrow({
    select: {
      overlaysEnabled: true,
      linkingEnabled: true,
      updatesEnabled: true,
    },
    where: { appId: "app" },
  });

  return { data };
});
