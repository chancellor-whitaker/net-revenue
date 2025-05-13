import { useDeferredValue, useState, useMemo, memo } from "react";
import { AgGridReact } from "ag-grid-react";
import { csv } from "d3-fetch";

import { buildNetRevenueData } from "./utils/buildNetRevenueData";
import { addProperBlanks } from "./utils/addProperBlanks";
import { parseDateString } from "./utils/parseDateString";
import { splitIntoGroups } from "./utils/splitIntoGroups";
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

const groupBy = ["YEAR", "LEVL", "EKU_ONLINE", "RESD", "STYP"];

const sortFte = ({ [dateKeys.fte]: a }, { [dateKeys.fte]: b }) =>
  makeDate(parseDateString(b)) - makeDate(parseDateString(a));

const filterAccountingData = (data, dateValue) =>
  makeArray(data).filter(
    ({ [dateKeys.accounting]: date }) =>
      makeDate(parseDateString(date)) <= dateValue
  );

const filterFteData = (data, dateValue) =>
  makeArray(data).filter(
    ({ [dateKeys.fte]: date }) => makeDate(parseDateString(date)) <= dateValue
  );

const autoSizeGrid = ({ api }) => api.sizeColumnsToFit();

const ListGroupItem = memo(({ formatter, onClick, active, value }) => {
  return (
    <li
      className={["list-group-item", active ? "active" : ""]
        .filter((element) => element)
        .join(" ")}
      onClick={() => onClick(value)}
    >
      {formatter(value)}
    </li>
  );
});

export default function App() {
  const datasets = usePromise(datasetsPromise);

  const array = useMemo(
    () => [datasets].filter((element) => element).flat(),
    [datasets]
  );

  const [accountingData, unofficialFte, officialFte] = array;

  const everyValue = useMemo(
    () => getEveryValue(accountingData),
    [accountingData]
  );

  const everyDate = useMemo(
    () =>
      everyValue[dateKeys.accounting]
        ? everyValue[dateKeys.accounting].sort(
            (a, b) =>
              makeDate(parseDateString(b)) - makeDate(parseDateString(a))
          )
        : null,
    [everyValue]
  );

  const [selectedDate, setSelectedDate] = useState();

  const deferredSelectedDate = useDeferredValue(selectedDate);

  const selectedDateValue = useMemo(
    () => makeDate(parseDateString(selectedDate)),
    [selectedDate]
  );

  const filteredAccountingData = useMemo(
    () => filterAccountingData(accountingData, selectedDateValue),
    [accountingData, selectedDateValue]
  );

  const filteredUnofficialFteData = useMemo(
    () =>
      splitIntoGroups(
        filterFteData(unofficialFte, selectedDateValue).sort(sortFte),
        groupBy
      ).map((group) => group[0]),
    [unofficialFte, selectedDateValue]
  );

  const netRevenueParams = [
    filteredAccountingData,
    filteredUnofficialFteData,
    officialFte,
  ];
  // perform group by & having clauses

  // pass these filtered datasets & official fte dataset to NetRevenue below

  // create example for chad to use

  console.log("accounting", filteredAccountingData);

  console.log("unofficial fte", filteredUnofficialFteData);

  if (everyDate && !selectedDate) setSelectedDate(everyDate[0]);

  // accoutingData - Should be filtered on <= transaction_date

  /*
  unofficialFTE - Should be filtered like so....
  where effective_date <= SELECTED_DATE
  group by YEAR, LEVL, EKU_ONLINE, RESD, STYP
  having max(effective_date) = effective_date.
  */

  // what if you sorted first, and then mapped each array to its first element?

  const [netRevenue, setNetRevenue] = useState();

  const rerunData = () => setNetRevenue(new NetRevenue(...netRevenueParams));

  usePrevious(deferredSelectedDate, rerunData);

  const formattedData = useMemo(
    () => buildNetRevenueData(netRevenue),
    [netRevenue]
  );

  const rowData = useMemo(() => fixRowData(formattedData), [formattedData]);

  const columnDefs = useMemo(() => getColumnDefs(rowData), [rowData]);

  const bestRowData = useMemo(
    () => addProperBlanks(rowData, columnDefs),
    [rowData, columnDefs]
  );

  const bestColumnDefs = useMemo(
    () => columnDefs.filter(({ field }) => fieldsToShow.has(field)),
    [columnDefs]
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
              <ListGroupItem
                active={date === selectedDate}
                formatter={parseDateString}
                onClick={setSelectedDate}
                value={date}
                key={date}
              ></ListGroupItem>
            ))}
          </ul>
        </div>
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <div>
            <AgGridReact
              onGridSizeChanged={autoSizeGrid}
              onRowDataUpdated={autoSizeGrid}
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
