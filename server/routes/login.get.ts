import fetch from "node-fetch";

export default defineOAuthTwitchEventHandler({
  async onSuccess(event, { user }) {
    const findUser = await prisma.user.findUnique({
      select: {
        id: true,
        username: true,
        displayName: true,
        imageUrl: true,
        downloaded: true,
        isAdmin: true,
        profile: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: user.id,
      },
    });

    if (!findUser) {
      const createUser = await prisma.user.create({
        data: {
          id: user.id,
          username: user.login,
          displayName: user.display_name,
          imageUrl: user.profile_image_url,
          isAdmin: user.id === "423142326" ? true : false,
          isFounder: foundersList.includes(user.id) ? true : false,
        },
      });

      try {
        const fetchImage = await fetch(createUser.imageUrl);

        if (fetchImage.ok) {
          const image = new Uint8Array(await fetchImage.arrayBuffer());

          await useStorage("images").setItemRaw(
            `users/${createUser.id}`,
            image,
          );

          await prisma.user.update({
            data: {
              downloaded: true,
            },
            where: {
              id: createUser.id,
            },
          });
        }
      } catch (error) {
        console.error(error);
      }

      await setUserSession(event, {
        user: {
          id: createUser.id,
          username: createUser.username,
          displayName: createUser.displayName,
          isAdmin: createUser.isAdmin,
          profileId: null,
        },
      });

      return sendRedirect(event, "/");
    }

    if (
      findUser.username !== user.login ||
      findUser.displayName !== user.display_name
    ) {
      await prisma.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          username: user.login,
          displayName: user.display_name,
        },
      });
    }

    if (!findUser.downloaded || findUser.imageUrl !== user.profile_image_url) {
      try {
        const fetchImage = await fetch(user.profile_image_url);

        if (fetchImage.ok) {
          const image = new Uint8Array(await fetchImage.arrayBuffer());

          await useStorage("images").setItemRaw(`users/${findUser.id}`, image);

          await prisma.user.update({
            data: {
              downloaded: true,
            },
            where: {
              id: findUser.id,
            },
          });
        }
      } catch (error) {
        await prisma.user.update({
          data: {
            downloaded: false,
          },
          where: {
            id: findUser.id,
          },
        });

        console.error(error);
      }
    }

    await setUserSession(event, {
      user: {
        id: findUser.id,
        username: user.login,
        displayName: user.display_name,
        isAdmin: findUser.isAdmin,
        profileId: findUser.profile ? findUser.profile.id : null,
      },
    });

    return sendRedirect(event, "/");
  },
});
