const maxAge = 86400;

export const getUserImage = defineCachedFunction(
  async (userId: string) => {
    return await prisma.userImage.findUnique({ where: { userId } });
  },
  { maxAge },
);

export const getGameImage = defineCachedFunction(
  async (gameId: number) => {
    return await prisma.gameImage.findUnique({ where: { gameId } });
  },
  { maxAge },
);
