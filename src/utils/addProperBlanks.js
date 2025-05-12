import { findRowWithName } from "./findRowWithName";
import { insertBefore } from "./insertBefore";
import { shallowEqual } from "./shallowEqual";
import { insertAfter } from "./insertAfter";

export const addProperBlanks = (rowData, columnDefs) => {
  const makeEmptyRow = () =>
    Object.fromEntries(columnDefs.map(({ field }) => [field, ""]));

  const emptyRow = Object.fromEntries(
    columnDefs.map(({ field }) => [field, ""])
  );

  const filledRows = rowData.filter((row) => !shallowEqual(row, emptyRow));

  const array1 = filledRows;

  const totalExternalAidRow = findRowWithName(array1, "Total External Aid");

  const tuitionAndFeesRow = findRowWithName(array1, "Tuition & Fees");

  const revenueAfterExternalAidRow = findRowWithName(
    array1,
    "Revenue after external aid"
  );

  const netRevenueRow = findRowWithName(array1, "Net Revenue");

  const discountRateRow = findRowWithName(array1, "Discount Rate");

  const fteRow = findRowWithName(array1, "FTE");

  const booksmartRow = findRowWithName(array1, "BookSmart");

  const studentRow = findRowWithName(array1, "Student");

  const array2 = array1.filter((element) => element !== totalExternalAidRow);

  // move total external aid to after tuition & fees
  const array3 = insertAfter(array2, tuitionAndFeesRow, totalExternalAidRow);

  // empty row after tuition & fees
  const array4 = insertAfter(array3, tuitionAndFeesRow, makeEmptyRow());

  // empty row before revenue after external aid
  const array5 = insertBefore(
    array4,
    revenueAfterExternalAidRow,
    makeEmptyRow()
  );

  // empty row after revenue after external aid
  const array6 = insertAfter(
    array5,
    revenueAfterExternalAidRow,
    makeEmptyRow()
  );

  // empty row before net revenue
  const array7 = insertBefore(array6, netRevenueRow, makeEmptyRow());

  // empty row after discount rate
  const array8 = insertAfter(array7, discountRateRow, makeEmptyRow());

  // empty row after fte
  const array9 = insertAfter(array8, fteRow, makeEmptyRow());

  // empty row after student
  const array10 = insertAfter(array9, studentRow, makeEmptyRow());

  // empty row before booksmart
  const array11 = insertBefore(array10, booksmartRow, makeEmptyRow());

  return array11;
};
