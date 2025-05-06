export const fixRowData = (data) => {
  return [data]
    .filter((element) => element)
    .flat()
    .map(({ "": name, ...rest }) => ({ name, ...rest }));
};
