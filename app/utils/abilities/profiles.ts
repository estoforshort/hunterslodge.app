import type { User } from "#auth-utils";

export const linkProfile = defineAbility((user: User) => {
  return user.isLinked === false;
});
