export default defineEventHandler(async () => {
  const data = await prisma.platform.findMany({
    select: {
      id: true,
      _count: {
        select: {
          games: true,
        },
      },
    },
  });

  return { data };
});
