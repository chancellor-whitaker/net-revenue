export const promise = fetch("data/data.json").then((response) =>
  response.json()
);
