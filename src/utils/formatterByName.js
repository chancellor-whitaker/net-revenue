import { formatNumberWithCommas } from "./formatNumberWithCommas";
import { formatPercentage } from "./formatPercentage";

export const formatterByName = {
  "Discount Rate including BookSmart": formatPercentage,
  "Total Student Credit Hours": formatNumberWithCommas,
  "Discount Rate": formatPercentage,
  FTE: formatNumberWithCommas,
};
