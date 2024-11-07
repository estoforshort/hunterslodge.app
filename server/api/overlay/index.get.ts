export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const overlay = await prisma.overlay.findFirst({
    select: {
      id: true,
      project: {
        select: {
          stack: {
            select: {
              id: true,
              game: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      showProject: true,
      updateProject: true,
      updateTrophies: true,
    },
    where: { profile: { userId: session.user.id } },
  });

  return {
    data: overlay,
  };
});