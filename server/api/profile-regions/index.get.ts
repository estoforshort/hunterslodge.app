export default defineCachedEventHandler(async () => {
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
