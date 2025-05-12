import { useDeferredValue, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { csv } from "d3-fetch";

import { buildNetRevenueData } from "./utils/buildNetRevenueData";
import { addProperBlanks } from "./utils/addProperBlanks";
import { parseDateString } from "./utils/parseDateString";
import { getColumnDefs } from "./utils/getColumnDefs";
import { defaultColDef } from "./utils/defaultColDef";
import { getEveryValue } from "./utils/getEveryValue";
import { fieldsToShow } from "./utils/fieldsToShow";
import { usePrevious } from "./hooks/usePrevious";
import { usePromise } from "./hooks/usePromise";
import { fixRowData } from "./utils/fixRowData";
import { NetRevenue } from "./utils/NetRevenue";
import { makeArray } from "./utils/makeArray";
// import { promise } from "./utils/promise";

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

const datasetsOrder = ["NET_REV_STU_ACCT", "NET_REV_FTE", "NET_REV_OFF_FTE"];

const datasetsPromise = Promise.all(
  datasetsOrder.map((fileName) => csv(`data/NET_REV/${fileName}.csv`))
);

// const filterDataPromise = Promise.all(
//   ["STVLEVL", "STVRESD", "STVSTYP"].map((fileName) =>
//     csv(`data/NET_REV/${fileName}.csv`)
//   )
// );

const dateKeys = { accounting: "TRANSACTION_DATE", fte: "EFFECTIVE_DATE" };

const makeDate = (param) => new Date(param);

export default function App() {
  const datasets = usePromise(datasetsPromise);

  const array = [datasets].filter((element) => element).flat();

  const [accountingData, unofficialFte, officialFte] = array;

  const everyValue = getEveryValue(accountingData);

  const everyDate = everyValue[dateKeys.accounting]
    ? everyValue[dateKeys.accounting].sort(
        (a, b) => makeDate(parseDateString(b)) - makeDate(parseDateString(a))
      )
    : null;

  const [selectedDate, setSelectedDate] = useState();

  const deferredSelectedDate = useDeferredValue(selectedDate);

  const selectedDateValue = makeDate(parseDateString(selectedDate));

  const filterAccountingData = (data) =>
    makeArray(data).filter(
      ({ [dateKeys.accounting]: date }) =>
        makeDate(parseDateString(date)) <= selectedDateValue
    );

  const filterFteData = (data) =>
    makeArray(data).filter(
      ({ [dateKeys.fte]: date }) =>
        makeDate(parseDateString(date)) <= selectedDateValue
    );

  const filteredAccountingData = filterAccountingData(accountingData);

  const filteredUnofficialFteData = filterFteData(unofficialFte);
  // perform group by & having clauses

  // pass these filtered datasets & official fte dataset to NetRevenue below

  console.log("accounting", filteredAccountingData);

  console.log("unofficial fte", filteredUnofficialFteData);

  if (everyDate && !selectedDate) setSelectedDate(everyDate[0]);

  // accoutingData - Should be filtered on SELECTED_DATE <= transaction_date

  /*
  unofficialFTE - Should be filtered like so....
  where effective_date <= SELECTED_DATE
  group by YEAR, LEVL, EKU_ONLINE, RESD, STYP
  having max(effective_date) = effective_date.
  */

  const [netRevenue, setNetRevenue] = useState();

  const rerunData = () => setNetRevenue(new NetRevenue(...datasets));

  usePrevious(deferredSelectedDate, rerunData);

  const formattedData = buildNetRevenueData(netRevenue);

  const rowData = fixRowData(formattedData);

  const columnDefs = getColumnDefs(rowData);

  const bestRowData = addProperBlanks(rowData, columnDefs);

  const bestColumnDefs = columnDefs.filter(({ field }) =>
    fieldsToShow.has(field)
  );

  return (
    <>
      <main className="container">
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          {parseDateString(selectedDate)}
        </div>
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <ul className="list-group overflow-y-scroll" style={{ height: 205 }}>
            {makeArray(everyDate).map((date) => (
              <li
                className={[
                  "list-group-item",
                  date === selectedDate ? "active" : "",
                ]
                  .filter((element) => element)
                  .join(" ")}
                onClick={() => setSelectedDate(date)}
                key={date}
              >
                {parseDateString(date)}
              </li>
            ))}
          </ul>
        </div>
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
