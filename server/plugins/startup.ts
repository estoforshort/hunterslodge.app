export default defineNitroPlugin(async () => {
  const appData = await prisma.app.findUnique({ where: { id: "app" } });

  if (!appData) {
    await prisma.app.create({
      data: {
        id: "app",
        tokens: {
          create: {},
        },
        settings: {
          create: {},
        },
      },
    });
  }

  worker.run();
});
