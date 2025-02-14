export default defineEventHandler(async () => {
  const data = await prisma.profileRegion.findMany({
    select: {
      id: true,
      name: true,
      earnedPlatinum: true,
      earnedGold: true,
      earnedSilver: true,
      earnedBronze: true,
      points: true,
      position: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      position: { gte: 1 },
    },
    orderBy: {
      position: "asc",
    },
  });

  return { data };
});
