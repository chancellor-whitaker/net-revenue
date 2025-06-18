import { formatNumberWithCommas } from "./formatNumberWithCommas";
import { formatPercentage } from "./formatPercentage";

export const formatterByName = {
  "Discount Rate including BookSmart": formatPercentage,
  "Total Student Credit Hours": formatNumberWithCommas,
  FTE: formatNumberWithCommasNoDecimals,
  "Discount Rate": formatPercentage,
};

function formatNumberWithCommasNoDecimals(number) {
  return number.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    useGrouping: true,
  });
}
