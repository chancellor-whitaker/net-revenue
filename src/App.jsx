import { AgGridReact } from "ag-grid-react";
import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import { csv } from "d3-fetch";

import { buildNetRevenueData } from "./utils/buildNetRevenueData";
import { SimpleLineChart } from "./components/SimpleLineChart";
import { addProperBlanks } from "./utils/addProperBlanks";
import { parseDateString } from "./utils/parseDateString";
import { splitIntoGroups } from "./utils/splitIntoGroups";
import { getColumnDefs } from "./utils/getColumnDefs";
import { defaultColDef } from "./utils/defaultColDef";
import { getDateByYear } from "./utils/getDateByYear";
import { fieldsToShow } from "./utils/fieldsToShow";
import { autoSizeGrid } from "./utils/autoSizeGrid";
import { usePrevious } from "./hooks/usePrevious";
import { usePromise } from "./hooks/usePromise";
import { fixRowData } from "./utils/fixRowData";
import { NetRevenue } from "./utils/NetRevenue";
import { formatDate } from "./utils/formatDate";
import { makeArray } from "./utils/makeArray";
import { makeDate } from "./utils/makeDate";

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

const constants = {
  datasetsPromise: Promise.all(
    ["NET_REV_STU_ACCT", "NET_REV_FTE", "NET_REV_OFF_FTE"].map((fileName) =>
      csv(`data/NET_REV/${fileName}.csv`)
    )
  ),
  dateKeys: { accounting: "TRANSACTION_DATE", fte: "EFFECTIVE_DATE" },
  groupBy: ["YEAR", "LEVL", "EKU_ONLINE", "RESD", "STYP"],
};

const { datasetsPromise, dateKeys, groupBy } = constants;

const sortFte = ({ [dateKeys.fte]: a }, { [dateKeys.fte]: b }) =>
  makeDate(parseDateString(b)) - makeDate(parseDateString(a));

const filterAccountingData = (data, dateLookup) =>
  makeArray(data).filter(
    ({ [dateKeys.accounting]: date, YEAR: year }) =>
      makeDate(parseDateString(date)) <= dateLookup[year]["Execution Date"]
  );

const filterFteData = (data, dateLookup) =>
  makeArray(data).filter(
    ({ [dateKeys.fte]: date, YEAR: year }) =>
      makeDate(parseDateString(date)) <= dateLookup[year]["Execution Date"]
  );

// ? change autosize behavior based on width of grid
// ! as of date as a row under column headers
// ! line chart  (all yellow above fte)
// ! filters for level, online, residency, & student type

export default function App() {
  const datasets = usePromise(datasetsPromise);

  const array = useMemo(
    () => [datasets].filter((element) => element).flat(),
    [datasets]
  );

  const [accountingData, unofficialFte, officialFte] = array;

  const [selectedDate, setSelectedDate] = useState();

  const dateLookup = useMemo(
    () =>
      Object.fromEntries(
        getDateByYear(makeArray(unofficialFte), formatDate(selectedDate)).map(
          (element) => [element.YEAR, element]
        )
      ),
    [selectedDate, unofficialFte]
  );

  const filteredAccountingData = useMemo(
    () => filterAccountingData(accountingData, dateLookup),
    [accountingData, dateLookup]
  );

  const filteredUnofficialFteData = useMemo(
    () =>
      splitIntoGroups(
        filterFteData(unofficialFte, dateLookup).sort(sortFte),
        groupBy
      ).map((group) => group[0]),
    [unofficialFte, dateLookup]
  );

  const netRevenueParams = [
    filteredAccountingData,
    filteredUnofficialFteData,
    officialFte,
    formatDate(selectedDate),
  ];

  const [netRevenue, setNetRevenue] = useState();

  const initializeCalendar = () => setSelectedDate(new Date());

  usePrevious(datasets, initializeCalendar);

  const rerunData = () => setNetRevenue(new NetRevenue(...netRevenueParams));

  usePrevious(selectedDate, rerunData);

  const formattedData = useMemo(
    () => buildNetRevenueData(netRevenue),
    [netRevenue]
  );

  const chartData = useMemo(
    () => Object.values(netRevenue?.value ? netRevenue.value : {}),
    [netRevenue]
  );

  const categoricalDataKey = "Year";

  const numericalDataKeys = useMemo(
    () => [
      ...new Set(
        chartData
          .map((row) =>
            Object.entries(row)
              .filter(([, value]) => typeof value === "number")
              .map(([key]) => key)
          )
          .flat()
      ),
    ],
    [chartData]
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
          {selectedDate?.toLocaleDateString()}
        </div>
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <Calendar onChange={setSelectedDate} value={selectedDate} />
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
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <SimpleLineChart
            categoricalDataKey={categoricalDataKey}
            numericalDataKeys={numericalDataKeys}
            data={chartData}
          ></SimpleLineChart>
        </div>
      </main>
    </>
  );
}
