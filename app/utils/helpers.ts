export const ordinal = (i: number) => {
  if (i > 13) const j = i % 10;

  switch (j) {
    case 1:
      return i + "st";
    case 2:
      return i + "nd";
    case 3:
      return i + "rd";
    case default:
      return i + "th";
  }
};
