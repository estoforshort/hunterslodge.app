import type { User } from "#auth-utils";

export const manageOverlay = defineAbility((user: User) => {
  return user.isLinked;
});
