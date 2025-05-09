export const findRowWithName = (rows, givenName) =>
  rows.find(({ name }) => name === givenName);
