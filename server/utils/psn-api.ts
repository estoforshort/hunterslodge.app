import { psnProfiles } from "./psn-api/profiles";
import { psnProjects } from "./psn-api/projects";
import { psnTokes } from "./psn-api/tokens";
import { psnGames } from "./psn-api/games";

export const psn = {
  exchangeNpsso: psnTokes.exchangeNpsso,
  findProfile: psnProfiles.findProfile,
  profile: psnProfiles.profile,
  projects: psnProjects.projects,
  projectGroups: psnProjects.projectGroups,
  projectGroupTrophies: psnProjects.projectGroupTrophies,
  gameGroups: psnGames.gameGroups,
  gameGroupTrophies: psnGames.gameGroupTrophies,
};
