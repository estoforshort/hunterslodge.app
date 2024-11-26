export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const data = await prisma.profile.findUnique({
    select: {
      id: true,
    },
    where: { userId: session.user.id },
  });

  return { data };
});
