export const createChartData = ({
  categories = ["2021-2022", "2022-2023", "2023-2024"],
  rowData = [],
}) => {
  const object = Object.fromEntries(
    categories.map((category) => [category, {}])
  );

  rowData.forEach(({ name: lineDataKey, ...rest }) => {
    categories.forEach((category) => {
      object[category][lineDataKey] = rest[category];
    });
  });

  return Object.entries(object).map(([name, values]) => ({ name, ...values }));
};
