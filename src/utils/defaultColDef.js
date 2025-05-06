import { cellClassRules } from "./cellClassRules";
import { headerClass } from "./headerClass";

export const defaultColDef = {
  valueFormatter: ({ value }) =>
    `${value}`.startsWith("$") ? `${value}`.substring(1) : value,
  cellClassRules,
  headerClass,
};
