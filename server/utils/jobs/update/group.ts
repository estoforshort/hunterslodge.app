import { updateTrophy } from "./trophy";

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
      const trophies = await psnApiFetchGameTrophies({
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
          return await prisma.group.create({
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
        }

        return findGroup;
      };

      const group = await getGroup();

      for (let t = 0, tl = trophies.data.trophies.length; t < tl; t++) {
        const trophy = trophies.data.trophies[t];

        const updatedTrophy = await updateTrophy({
          gameId: data.gameId,
          groupId: group.id,
          trophy,
        });

        if (!updatedTrophy.data) {
          updateSuccessful = false;
          break;
        }
      }

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
