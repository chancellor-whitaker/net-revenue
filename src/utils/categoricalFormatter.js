function splitStringAtIndex(str, index) {
  if (index < 0 || index > str.length) {
    return "Index is out of bounds";
  }
  const part1 = str.substring(0, index);
  const part2 = str.substring(index);
  return [part1, part2];
}

export const categoricalFormatter = (value) =>
  splitStringAtIndex(`${value}`, 2).join("-");
