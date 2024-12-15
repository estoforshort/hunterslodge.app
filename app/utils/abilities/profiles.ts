import type { User } from "#auth-utils";

export const linkProfile = defineAbility((user: User) => {
  return user.profileId ? true : false;
});
