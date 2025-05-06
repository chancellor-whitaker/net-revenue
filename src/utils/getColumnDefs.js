import { fieldDefs } from "./fieldDefs";

export const getColumnDefs = (rowData) => {
  return [...new Set(rowData.map((row) => Object.keys(row)).flat())].map(
    (field) => ({ field, ...fieldDefs[field] })
  );
};
