import fetch from "node-fetch";

export default defineOAuthTwitchEventHandler({
  async onSuccess(event, { user }) {
    const findUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!findUser) {
      const createUser = await prisma.user.create({
        data: {
          id: user.id,
          appId: "app",
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

          await prisma.userImage.create({
            data: {
              userId: createUser.id,
              image,
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
          isFounder: createUser.isFounder,
          isLinked: false,
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

    if (findUser.imageUrl !== user.profile_image_url) {
      try {
        const fetchImage = await fetch(user.profile_image_url);

        if (fetchImage.ok) {
          const image = new Uint8Array(await fetchImage.arrayBuffer());

          await prisma.userImage.update({
            where: {
              userId: findUser.id,
            },
            data: {
              image,
            },
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    await setUserSession(event, {
      user: {
        id: findUser.id,
        username: user.login,
        displayName: user.display_name,
        isAdmin: findUser.isAdmin,
        isFounder: findUser.isFounder,
        isLinked: findUser.isLinked,
      },
    });

    return sendRedirect(event, "/");
  },
});
