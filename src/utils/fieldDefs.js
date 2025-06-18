export const fieldDefs = {
  name: {
    valueFormatter: ({ value }) =>
      value === "Institutional Aid less State Waivers and Foundation"
        ? `Adjusted Institutional Aid`
        : value,
  },
  Definition: { autoHeight: true, wrapText: true, maxWidth: 500 },
  Notes: { autoHeight: true, wrapText: true, maxWidth: 500 },
};
