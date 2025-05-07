import { AgGridReact } from "ag-grid-react";

import { getColumnDefs } from "./utils/getColumnDefs";
import { defaultColDef } from "./utils/defaultColDef";
import { shallowEqual } from "./utils/shallowEqual";
import { insertBefore } from "./utils/insertBefore";
import { insertAfter } from "./utils/insertAfter";
// import { SimpleLineChart } from "./SimpleLineChart";
import { usePromise } from "./hooks/usePromise";
import { fixRowData } from "./utils/fixRowData";
import { promise } from "./utils/promise";

// const createChartData = ({
//   categories = ["2021-2022", "2022-2023", "2023-2024"],
//   rowData = [],
// }) => {
//   const object = Object.fromEntries(
//     categories.map((category) => [category, {}])
//   );

//   rowData.forEach(({ name: lineDataKey, ...rest }) => {
//     categories.forEach((category) => {
//       object[category][lineDataKey] = rest[category];
//     });
//   });

//   return Object.entries(object).map(([name, values]) => ({ name, ...values }));
// };

// ? try to make your table look as much like hers as possible
// showing definition/note on click popup icon by name (column A) in table
// filters for level, online, residency, & student type (filter on full date & year)
// * highlight total external rev. row
// * no sorting values
// * some column values are right-aligned vs left-aligned
// * empty row after tuition & fees
// * total external aid before federal grant/...
// * empty row before & after total external rev.
// * empty row under institutional aid less state...
// * net revenue & discount rate should be surrounded with empty rows
// * make table minimally scrollable (no y scroll)
// * surround with empty rows--net rev per fte through fte

export default function App() {
  const data = usePromise(promise);

  console.log(data);

  const rowData = fixRowData(data);

  const columnDefs = getColumnDefs(rowData);

  const makeEmptyRow = () =>
    Object.fromEntries(columnDefs.map(({ field }) => [field, ""]));

  const emptyRow = Object.fromEntries(
    columnDefs.map(({ field }) => [field, ""])
  );

  const filledRows = rowData.filter((row) => !shallowEqual(row, emptyRow));

  const findRowWithName = (rows, givenName) =>
    rows.find(({ name }) => name === givenName);

  const addProperBlanks = () => {
    const array1 = filledRows;

    const totalExternalAid = findRowWithName(array1, "Total External Aid");

    const tuitionAndFees = findRowWithName(array1, "Tuition & Fees");

    const revenueAfterExternalAid = findRowWithName(
      array1,
      "Revenue after external aid"
    );

    const netRevenue = findRowWithName(array1, "Net Revenue");

    const discountRate = findRowWithName(array1, "Discount Rate");

    const fte = findRowWithName(array1, "FTE");

    const student = findRowWithName(array1, "Student");

    const array2 = array1.filter((element) => element !== totalExternalAid);

    // move total external aid to after tuition & fees
    const array3 = insertAfter(array2, tuitionAndFees, totalExternalAid);

    // empty row after tuition & fees
    const array4 = insertAfter(array3, tuitionAndFees, makeEmptyRow());

    // empty row before revenue after external aid
    const array5 = insertBefore(
      array4,
      revenueAfterExternalAid,
      makeEmptyRow()
    );

    // empty row after revenue after external aid
    const array6 = insertAfter(array5, revenueAfterExternalAid, makeEmptyRow());

    // empty row before net revenue
    const array7 = insertBefore(array6, netRevenue, makeEmptyRow());

    // empty row after discount rate
    const array8 = insertAfter(array7, discountRate, makeEmptyRow());

    // empty row after fte
    const array9 = insertAfter(array8, fte, makeEmptyRow());

    // empty row after student
    const array10 = insertAfter(array9, student, makeEmptyRow());

    return array10;
  };

  const bestRowData = addProperBlanks();

  console.log(bestRowData);

  const autoSizeStrategy = { type: "fitCellContents" };

  const domLayout = "autoHeight";

  // const chartData = createChartData({ rowData });

  return (
    <>
      <main className="container">
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <div>
            <AgGridReact
              autoSizeStrategy={autoSizeStrategy}
              defaultColDef={defaultColDef}
              columnDefs={columnDefs}
              domLayout={domLayout}
              rowData={bestRowData}
            />
          </div>
        </div>
        {/* <div className="my-3 p-3 bg-body rounded shadow-sm">
          <SimpleLineChart></SimpleLineChart>
        </div> */}
      </main>
    </>
  );
}
