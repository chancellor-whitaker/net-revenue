export const getEveryValue = (rows) => {
  const store = {};

  const array = [rows].filter((element) => element).flat();

  array.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const value = row[key];

      if (!(key in store)) store[key] = new Set();

      store[key].add(value);
    });
  });

  return Object.fromEntries(
    Object.entries(store).map(([key, set]) => [key, [...set].sort()])
  );
};
