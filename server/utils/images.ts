export const moveImages = async () => {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });

    for (let u = 0, ul = users.length; u < ul; u++) {
      const user = users[u];

      const image = await prisma.userImage.findUnique({
        where: { userId: user.id },
      });

      if (image) {
        await useStorage("images").setItemRaw(`users/${user.id}`, image.image);

        await Promise.all([
          prisma.userImage.delete({ where: { userId: user.id } }),
          prisma.user.update({
            data: { downloaded: true },
            where: { id: user.id },
          }),
        ]);
      }
    }

    const profiles = await prisma.profile.findMany({ select: { id: true } });

    for (let p = 0, pl = profiles.length; p < pl; p++) {
      const profile = profiles[p];

      const image = await prisma.profileImage.findUnique({
        where: { profileId: profile.id },
      });

      if (image) {
        await useStorage("images").setItemRaw(
          `profiles/${profile.id}`,
          image.image,
        );

        await Promise.all([
          prisma.profileImage.delete({ where: { profileId: profile.id } }),
          prisma.profile.update({
            data: { downloaded: true },
            where: { id: profile.id },
          }),
        ]);
      }
    }

    const games = await prisma.game.findMany({ select: { id: true } });

    for (let g = 0, gl = games.length; g < gl; g++) {
      const game = games[g];

      const gameGroups = await prisma.group.findMany({
        select: {
          id: true,
        },
        where: {
          gameId: game.id,
        },
      });

      for (let gg = 0, ggl = gameGroups.length; gg < ggl; gg++) {
        const gameGroup = gameGroups[gg];

        const gameGroupTrophies = await prisma.trophy.findMany({
          select: {
            id: true,
          },
          where: {
            gameId: game.id,
            groupId: gameGroup.id,
          },
        });

        for (let ggt = 0, ggtl = gameGroupTrophies.length; ggt < ggtl; ggt++) {
          const gameGroupTrophy = gameGroupTrophies[ggt];

          const image = await prisma.trophyImage.findUnique({
            where: {
              gameId_groupId_trophyId: {
                gameId: game.id,
                groupId: gameGroup.id,
                trophyId: gameGroupTrophy.id,
              },
            },
          });

          if (image) {
            await useStorage("images").setItemRaw(
              `trophies/${game.id}/${gameGroup.id}/${gameGroupTrophy.id}`,
              image.image,
            );

            await Promise.all([
              prisma.trophyImage.delete({
                where: {
                  gameId_groupId_trophyId: {
                    gameId: game.id,
                    groupId: gameGroup.id,
                    trophyId: gameGroupTrophy.id,
                  },
                },
              }),
              prisma.trophy.update({
                data: { downloaded: true },
                where: {
                  gameId_groupId_id: {
                    gameId: game.id,
                    groupId: gameGroup.id,
                    id: gameGroupTrophy.id,
                  },
                },
              }),
            ]);
          }
        }

        const image = await prisma.groupImage.findUnique({
          where: {
            gameId_groupId: {
              gameId: game.id,
              groupId: gameGroup.id,
            },
          },
        });

        if (image) {
          await useStorage("images").setItemRaw(
            `groups/${game.id}/${gameGroup.id}`,
            image.image,
          );

          await Promise.all([
            prisma.groupImage.delete({
              where: {
                gameId_groupId: {
                  gameId: game.id,
                  groupId: gameGroup.id,
                },
              },
            }),
            prisma.group.update({
              data: { downloaded: true },
              where: {
                gameId_id: {
                  gameId: game.id,
                  id: gameGroup.id,
                },
              },
            }),
          ]);
        }
      }

      const image = await prisma.gameImage.findUnique({
        where: { gameId: game.id },
      });

      if (image) {
        await useStorage("images").setItemRaw(`games/${game.id}`, image.image);

        await Promise.all([
          prisma.gameImage.delete({ where: { gameId: game.id } }),
          prisma.game.update({
            data: { downloaded: true },
            where: { id: game.id },
          }),
        ]);
      }
    }

    return;
  } catch (e) {
    return console.error(e);
  }
};
