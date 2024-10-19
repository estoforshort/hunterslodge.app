import type { TrophyType } from "@prisma/client";

type Data = {
  gameId: number;
  groupId: string;
  trophy: {
    trophyId: number;
    trophyType: TrophyType;
    trophyName: string;
    trophyDetail: string;
    trophyIconUrl: string;
  };
};

export const updateTrophy = async (data: Data) => {
  try {
    const findTrophy = await prisma.trophy.findUnique({
      where: {
        gameId_groupId_id: {
          gameId: data.gameId,
          groupId: data.groupId,
          id: data.trophy.trophyId,
        },
      },
    });

    if (findTrophy) {
      return {
        data: findTrophy,
      };
    }

    return {
      data: await prisma.trophy.create({
        data: {
          gameId: data.gameId,
          groupId: data.groupId,
          appId: "app",
          id: data.trophy.trophyId,
          type: data.trophy.trophyType,
          name: data.trophy.trophyName.replace(/\s+/g, " ").trim(),
          description: data.trophy.trophyDetail.replace(/\s+/g, " ").trim(),
          imageUrl: data.trophy.trophyIconUrl,
        },
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
