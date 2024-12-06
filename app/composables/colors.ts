export const useTrophyBackground = (trophy: string) => {
  if (trophy === "platinum") {
    return "bg-gradient-to-r from-white via-white to-sky-400 dark:from-gray-900 dark:via-slate-950 dark:to-sky-700";
  }

  if (trophy === "gold") {
    return "bg-gradient-to-r from-white via-white to-yellow-400 dark:from-gray-900 dark:via-slate-950 dark:to-yellow-700";
  }

  if (trophy === "silver") {
    return "bg-gradient-to-r from-white via-white to-cool-400 dark:from-gray-900 dark:via-slate-950 dark:to-slate-600";
  }

  if (trophy === "bronze") {
    return "bg-gradient-to-r from-white via-white to-orange-400 dark:from-gray-900 dark:via-slate-950 dark:to-orange-800";
  }
};
