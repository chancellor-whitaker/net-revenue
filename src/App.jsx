import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { csv } from "d3-fetch";

import { buildNetRevenueData } from "./utils/buildNetRevenueData";
import { findRowWithName } from "./utils/findRowWithName";
import { getColumnDefs } from "./utils/getColumnDefs";
import { defaultColDef } from "./utils/defaultColDef";
import { shallowEqual } from "./utils/shallowEqual";
import { insertBefore } from "./utils/insertBefore";
import { fieldsToShow } from "./utils/fieldsToShow";
import { insertAfter } from "./utils/insertAfter";
import { usePromise } from "./hooks/usePromise";
import { fixRowData } from "./utils/fixRowData";
import { NetRevenue } from "./utils/NetRevenue";
import { promise } from "./utils/promise";

// ? try to make your table look as much like hers as possible
// ? showing definition/note on click popup icon by name (column A) in table
// filters for level, online, residency, & student type (filter on full date & year)
// change autosize behavior based on width of grid
// math formatting in definitions?
// * create table data using NetRevenue class
// * highlight specific rows (special rows)
// * maybe change color of empty rows (could just be white)
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

const netRevenueParamsPromise = Promise.all(
  ["NET_REV_STU_ACCT", "NET_REV_FTE", "NET_REV_OFF_FTE"].map((fileName) =>
    csv(`data/NET_REV/${fileName}.csv`)
  )
);

const filterDataPromise = Promise.all(
  ["STVLEVL", "STVRESD", "STVSTYP"].map((fileName) =>
    csv(`data/NET_REV/${fileName}.csv`)
  )
);

// console.log(netRevenueParamsPromise);

export default function App() {
  const netRevenueParams = usePromise(netRevenueParamsPromise);

  const filterData = usePromise(filterDataPromise);

  const [netRevenue, setNetRevenue] = useState();

  if (netRevenueParams && !netRevenue) {
    setNetRevenue(new NetRevenue(...netRevenueParams));
  }

  const formattedData = buildNetRevenueData(netRevenue);

  console.log("using class", formattedData);

  const data = usePromise(promise);

  console.log("original", data);

  const rowData = fixRowData(formattedData);

  const columnDefs = getColumnDefs(rowData);

  const makeEmptyRow = () =>
    Object.fromEntries(columnDefs.map(({ field }) => [field, ""]));

  const emptyRow = Object.fromEntries(
    columnDefs.map(({ field }) => [field, ""])
  );

  const filledRows = rowData.filter((row) => !shallowEqual(row, emptyRow));

  const addProperBlanks = () => {
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

  const bestRowData = addProperBlanks();

  const bestColumnDefs = columnDefs.filter(({ field }) =>
    fieldsToShow.has(field)
  );

  return (
    <>
      <main className="container">
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <div>
            <AgGridReact
              onGridSizeChanged={({ api }) => api.sizeColumnsToFit()}
              onRowDataUpdated={({ api }) => api.sizeColumnsToFit()}
              defaultColDef={defaultColDef}
              columnDefs={bestColumnDefs}
              domLayout="autoHeight"
              rowData={bestRowData}
              tooltipShowDelay={0}
            />
          </div>
        </div>
      </main>
    </>
  );
}
