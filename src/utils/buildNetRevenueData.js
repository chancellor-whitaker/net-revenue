import { formatCurrencyNoDecimals } from "./formatCurrencyNoDecimals";
import { definitionByName } from "./definitionByName";
import { formatterByName } from "./formatterByName";

export const buildNetRevenueData = (netRevenue) => {
  const unformattedData = netRevenue?.value ? netRevenue.value : {};

  const rows = Object.values(unformattedData);

  const store = {};

  rows.forEach(
    ({
      ["Display Year"]: displayYear,
      ["As of Date"]: asOfDate,
      Year: year,
      ...metrics
    }) => {
      const displayYearKey = displayYear.replaceAll(" ", "");

      Object.entries(metrics).forEach(([key, value]) => {
        if (!(key in store)) store[key] = { "": key, ...definitionByName[key] };

        const formatter =
          key in formatterByName
            ? formatterByName[key]
            : formatCurrencyNoDecimals;

        store[key][displayYearKey] = formatter(value);
      });
    }
  );

  return Object.values(store);
};
