import type { TrophyType } from "@prisma/client";
import fetch from "node-fetch";

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
      if (!findTrophy.downloaded) {
        try {
          const fetchImage = await fetch(data.trophy.trophyIconUrl);

          if (fetchImage.ok) {
            const image = new Uint8Array(await fetchImage.arrayBuffer());

            await useStorage("images").setItemRaw(
              `trophies/${data.gameId}/${data.groupId}/${findTrophy.id}`,
              image,
            );

            await prisma.trophy.update({
              data: {
                imageUrl: data.trophy.trophyIconUrl,
                downloaded: true,
              },
              where: {
                gameId_groupId_id: {
                  gameId: findTrophy.gameId,
                  groupId: findTrophy.groupId,
                  id: findTrophy.id,
                },
              },
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      return {
        data: findTrophy,
      };
    }

    const createTrophy = await prisma.trophy.create({
      data: {
        gameId: data.gameId,
        groupId: data.groupId,
        id: data.trophy.trophyId,
        type: data.trophy.trophyType,
        name: data.trophy.trophyName.replace(/\s+/g, " ").trim(),
        description: data.trophy.trophyDetail.replace(/\s+/g, " ").trim(),
        imageUrl: data.trophy.trophyIconUrl,
      },
    });

    try {
      const fetchImage = await fetch(createTrophy.imageUrl);

      if (fetchImage.ok) {
        const image = new Uint8Array(await fetchImage.arrayBuffer());

        await useStorage("images").setItemRaw(
          `trophies/${data.gameId}/${data.groupId}/${createTrophy.id}`,
          image,
        );

        await prisma.trophy.update({
          data: {
            downloaded: true,
          },
          where: {
            gameId_groupId_id: {
              gameId: createTrophy.gameId,
              groupId: createTrophy.groupId,
              id: createTrophy.id,
            },
          },
        });
      }
    } catch (e) {
      console.error(e);
    }

    return {
      data: createTrophy,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
