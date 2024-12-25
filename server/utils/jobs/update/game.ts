import { updateGroup } from "./group";
import fetch from "node-fetch";

type Data = {
  gameId: number | null;
  hash: string;
  stackId: string;
  service: string;
  name: string;
  imageUrl: string;
  platform: string;
  definedPlatinum: number;
  definedGold: number;
  definedSilver: number;
  definedBronze: number;
};

export const updateGame = async (data: Data) => {
  try {
    let updateSuccessful = true;

    const gameFinder = async () => {
      if (data.gameId) {
        return await prisma.game.findUnique({
          where: { id: data.gameId },
        });
      }

      return await prisma.game.findUnique({
        where: { hash: data.hash },
      });
    };

    const findGame = await gameFinder();

    if (
      !findGame ||
      findGame.hash !== data.hash ||
      findGame.definedPlatinum !== data.definedPlatinum ||
      findGame.definedGold !== data.definedGold ||
      findGame.definedSilver !== data.definedSilver ||
      findGame.definedBronze !== data.definedBronze
    ) {
      const groups = await psn.gameGroups({
        npCommunicationId: data.stackId,
        npServiceName: data.service,
      });

      if (!groups.data) {
        return {
          data: null,
        };
      }

      const getGame = async () => {
        if (!findGame) {
          const createGame = await prisma.game.create({
            data: {
              appId: "app",
              hash: data.hash,
              service: data.service,
              name: data.name,
              imageUrl: data.imageUrl,
            },
          });

          try {
            const fetchImage = await fetch(createGame.imageUrl);

            if (fetchImage.ok) {
              const image = new Uint8Array(await fetchImage.arrayBuffer());

              await prisma.gameImage.create({
                data: {
                  gameId: createGame.id,
                  image,
                },
              });
            }
          } catch (e) {
            console.error(e);
          }

          await updatePlatforms(createGame.id);
          return createGame;
        }

        await updatePlatforms(findGame.id);
        return findGame;

        async function updatePlatforms(gameId: number) {
          const platforms = data.platform.split(",");

          for (let p = 0, pl = platforms.length; p < pl; p++) {
            const platform = platforms[p];

            const findPlatform = await prisma.platform.findUnique({
              where: {
                id: platform.toLowerCase(),
              },
            });

            if (!findPlatform) {
              const createPlatform = await prisma.platform.create({
                data: {
                  id: platform.toLowerCase(),
                  appId: "app",
                },
              });

              await prisma.platformsOnGames.create({
                data: {
                  gameId: gameId,
                  platformId: createPlatform.id,
                },
              });
            } else {
              const findPlatformOnGame =
                await prisma.platformsOnGames.findUnique({
                  where: {
                    gameId_platformId: {
                      gameId: gameId,
                      platformId: findPlatform.id,
                    },
                  },
                });

              if (!findPlatformOnGame) {
                await prisma.platformsOnGames.create({
                  data: {
                    gameId: gameId,
                    platformId: findPlatform.id,
                  },
                });
              }
            }
          }

          return;
        }
      };

      const game = await getGame();

      const groupsToUpdate = [];

      for (let g = 0, gl = groups.data.trophyGroups.length; g < gl; g++) {
        const group = groups.data.trophyGroups[g];

        groupsToUpdate.push(
          updateGroup({
            service: data.service,
            gameId: game.id,
            stackId: data.stackId,
            group,
          }).then((updatedGroup) => {
            if (!updatedGroup.data) {
              updateSuccessful = false;
            }
          }),
        );
      }

      await Promise.all(groupsToUpdate);

      if (!updateSuccessful) {
        return {
          data: null,
        };
      }

      return {
        data: await prisma.game.update({
          where: { id: game.id },
          data: {
            hash: data.hash,
            definedPlatinum: data.definedPlatinum,
            definedGold: data.definedGold,
            definedSilver: data.definedSilver,
            definedBronze: data.definedBronze,
          },
        }),
      };
    }

    return {
      data: findGame,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
