export default defineEventHandler(async () => {
  const data = await prisma.appSettings.findUnique({
    select: {
      overlaysEnabled: true,
      linkingEnabled: true,
      updatesEnabled: true,
    },
    where: { appId: "app" },
  });

  return { data };
});
