export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const data = await prisma.appTokens.findUniqueOrThrow({
    select: {
      expiresAt: true,
      refreshTokenExpiresAt: true,
      updatedAt: true,
    },
    where: { appId: "app" },
  });

  return { data };
});
