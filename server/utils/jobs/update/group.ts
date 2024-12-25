import { updateTrophy } from "./trophy";
import fetch from "node-fetch";

type Data = {
  service: string;
  gameId: number;
  stackId: string;
  group: {
    trophyGroupId: string;
    trophyGroupName: string;
    trophyGroupIconUrl: string;
    definedTrophies: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
  };
};

export const updateGroup = async (data: Data) => {
  try {
    let updateSuccessful = true;

    const findGroup = await prisma.group.findUnique({
      where: {
        gameId_id: {
          gameId: data.gameId,
          id:
            data.group.trophyGroupId === "default"
              ? "000"
              : data.group.trophyGroupId,
        },
      },
    });

    if (
      !findGroup ||
      findGroup.definedPlatinum !== data.group.definedTrophies.platinum ||
      findGroup.definedGold !== data.group.definedTrophies.gold ||
      findGroup.definedSilver !== data.group.definedTrophies.silver ||
      findGroup.definedBronze !== data.group.definedTrophies.bronze
    ) {
      const trophies = await psn.gameGroupTrophies({
        npCommunicationId: data.stackId,
        trophyGroupId: data.group.trophyGroupId,
        npServiceName: data.service,
      });

      if (!trophies.data) {
        return {
          data: null,
        };
      }

      const getGroup = async () => {
        if (!findGroup) {
          const createGroup = await prisma.group.create({
            data: {
              gameId: data.gameId,
              appId: "app",
              id:
                data.group.trophyGroupId === "default"
                  ? "000"
                  : data.group.trophyGroupId,
              name: data.group.trophyGroupName.replace(/\s+/g, " ").trim(),
              imageUrl: data.group.trophyGroupIconUrl,
            },
          });

          try {
            const fetchImage = await fetch(createGroup.imageUrl);

            if (fetchImage.ok) {
              const image = new Uint8Array(await fetchImage.arrayBuffer());

              await prisma.groupImage.create({
                data: {
                  gameId: createGroup.gameId,
                  groupId: createGroup.id,
                  image,
                },
              });
            }
          } catch (e) {
            console.error(e);
          }

          return createGroup;
        }

        return findGroup;
      };

      const group = await getGroup();

      const trophiesToUpdate = [];

      for (let t = 0, tl = trophies.data.trophies.length; t < tl; t++) {
        const trophy = trophies.data.trophies[t];

        trophiesToUpdate.push(
          updateTrophy({
            gameId: data.gameId,
            groupId: group.id,
            trophy,
          }).then((updatedTrophy) => {
            if (!updatedTrophy.data) {
              updateSuccessful = false;
            }
          }),
        );
      }

      await Promise.all(trophiesToUpdate);

      if (!updateSuccessful) {
        return {
          data: null,
        };
      }

      return {
        data: await prisma.group.update({
          where: { gameId_id: { gameId: group.gameId, id: group.id } },
          data: {
            definedPlatinum: data.group.definedTrophies.platinum,
            definedGold: data.group.definedTrophies.gold,
            definedSilver: data.group.definedTrophies.silver,
            definedBronze: data.group.definedTrophies.bronze,
          },
        }),
      };
    }

    return {
      data: findGroup,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
