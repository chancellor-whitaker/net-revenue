import { tooltipValueGetter } from "./tooltipValueGetter";
import { cellClassRules } from "./cellClassRules";
import { headerClass } from "./headerClass";

export const defaultColDef = {
  valueFormatter: ({ value }) =>
    `${value}`.startsWith("$") ? `${value}`.substring(1) : value,
  tooltipValueGetter,
  sortable: false,
  cellClassRules,
  headerClass,
};
