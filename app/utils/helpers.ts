export const ordinal = (i: number) => {
  let j = i;

  if (j > 13) {
    j = j % 10;
  }

  switch (j) {
    case 1:
      return i + "st";
    case 2:
      return i + "nd";
    case 3:
      return i + "rd";
    default:
      return i + "th";
  }
};
