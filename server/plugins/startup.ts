export default defineNitroPlugin(async () => {
  const app = await prisma.app.findUnique({ where: { id: "app" } });

  if (!app) {
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

  await worker.run();
});
