export default defineEventHandler(async () => {
  const data = await prisma.platform.findMany({
    select: {
      id: true,
    },
    orderBy: { id: "asc" },
  });

  return { data };
});
