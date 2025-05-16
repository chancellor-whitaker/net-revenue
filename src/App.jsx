import { useDeferredValue, useCallback, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import Calendar from "react-calendar";
import { csv } from "d3-fetch";

import { buildNetRevenueData } from "./utils/buildNetRevenueData";
import { splitArrayAtElement } from "./utils/splitArrayAtElement";
import { handleAsOfDateField } from "./utils/handleAsOfDateField";
import { SimpleLineChart } from "./components/SimpleLineChart";
import { highlightedNames } from "./utils/highlightedNames";
import { addProperBlanks } from "./utils/addProperBlanks";
import { parseDateString } from "./utils/parseDateString";
import { splitIntoGroups } from "./utils/splitIntoGroups";
import { getColumnDefs } from "./utils/getColumnDefs";
import { defaultColDef } from "./utils/defaultColDef";
import { getDateByYear } from "./utils/getDateByYear";
import { fieldsToShow } from "./utils/fieldsToShow";
import { autoSizeGrid } from "./utils/autoSizeGrid";
import { usePrevious } from "./hooks/usePrevious";
import { Dropdown } from "./components/Dropdown";
import { usePromise } from "./hooks/usePromise";
import { fixRowData } from "./utils/fixRowData";
import { NetRevenue } from "./utils/NetRevenue";
import { formatDate } from "./utils/formatDate";
import { filterRows } from "./utils/filterRows";
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

const dropdownKeyPrefix = "STV";

const dropdownOrder = [
  `${dropdownKeyPrefix}LEVL`,
  `${dropdownKeyPrefix}RESD`,
  `${dropdownKeyPrefix}STYP`,
];

const constants = {
  datasetsPromise: Promise.all(
    ["NET_REV_STU_ACCT", "NET_REV_FTE", "NET_REV_OFF_FTE"].map((fileName) =>
      csv(`data/NET_REV/${fileName}.csv`)
    )
  ),
  dropdownsPromise: Promise.all(
    dropdownOrder.map((fileName) => csv(`data/NET_REV/${fileName}.csv`))
  ),
  dateKeys: { accounting: "TRANSACTION_DATE", fte: "EFFECTIVE_DATE" },
  groupBy: ["YEAR", "LEVL", "EKU_ONLINE", "RESD", "STYP"],
};

const { dropdownsPromise, datasetsPromise, dateKeys, groupBy } = constants;

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
// ! line chart  (all yellow above fte)
// ! filters for level, online, residency, & student type

const findIndexOfName = (rowData, string) =>
  rowData.filter((element) => element).findIndex(({ name }) => name === string);

export default function App() {
  const datasets = usePromise(datasetsPromise);

  const dropdownLists = usePromise(dropdownsPromise);

  const [dropdowns, setDropdowns] = useState();

  const deferredDropdowns = useDeferredValue(dropdowns);

  const [initialDropdowns, dropdownItems] = useMemo(() => {
    const initialDropdowns = Object.fromEntries(
      dropdownOrder.map((field) => [
        field.substring(dropdownKeyPrefix.length),
        new Set(),
      ])
    );

    const dropdownValueLabels = Object.fromEntries(
      dropdownOrder.map((field) => [
        field.substring(dropdownKeyPrefix.length),
        {},
      ])
    );

    const lists = makeArray(dropdownLists);

    lists.forEach((list, index) => {
      const field = dropdownOrder[index].substring(dropdownKeyPrefix.length);

      list.forEach((item) => {
        const [value, label] = [
          item[`${dropdownKeyPrefix}${field}_CODE`],
          item[`${dropdownKeyPrefix}${field}_DESC`],
        ];

        initialDropdowns[field].add(value);

        dropdownValueLabels[field][value] = label;
      });
    });

    const dropdownItems = Object.fromEntries(
      Object.entries(dropdownValueLabels).map(([field, pairs]) => [
        field,
        Object.entries(pairs).map(([value, label]) => ({ value, label })),
      ])
    );

    return [initialDropdowns, dropdownItems];
  }, [dropdownLists]);

  console.log(dropdownItems);

  const onDropdownItemClick = useCallback(({ field, value }) => {
    setDropdowns((currentState) => {
      const nextState = { ...currentState };

      nextState[field] = new Set(nextState[field]);

      if (nextState[field].has(value)) {
        nextState[field].delete(value);
      } else {
        nextState[field].add(value);
      }

      return nextState;
    });
  }, []);

  const datasetsArray = useMemo(() => makeArray(datasets), [datasets]);

  const [accountingData, unofficialFte, officialFte] = datasetsArray;

  const [selectedDate, setSelectedDate] = useState();

  const deferredSelectedDate = useDeferredValue(selectedDate);

  const dateLookup = useMemo(
    () =>
      Object.fromEntries(
        getDateByYear(
          makeArray(unofficialFte),
          formatDate(deferredSelectedDate)
        ).map((element) => [element.YEAR, element])
      ),
    [deferredSelectedDate, unofficialFte]
  );

  const filteredAccountingData = useMemo(
    () =>
      filterRows(
        filterAccountingData(accountingData, dateLookup),
        deferredDropdowns
      ),
    [accountingData, dateLookup, deferredDropdowns]
  );

  const filteredUnofficialFteData = useMemo(
    () =>
      filterRows(
        splitIntoGroups(
          filterFteData(unofficialFte, dateLookup).sort(sortFte),
          groupBy
        ).map((group) => group[0]),
        deferredDropdowns
      ),
    [unofficialFte, dateLookup, deferredDropdowns]
  );

  const netRevenueParams = [
    filteredAccountingData,
    filteredUnofficialFteData,
    officialFte,
    formatDate(deferredSelectedDate),
  ];

  const [netRevenue, setNetRevenue] = useState();

  const initializeCalendar = () => setSelectedDate(new Date());

  const initializeDropdowns = () => setDropdowns(initialDropdowns);

  usePrevious(initialDropdowns, initializeDropdowns);

  usePrevious(datasets, initializeCalendar);

  const rerunData = () =>
    datasets && setNetRevenue(new NetRevenue(...netRevenueParams));

  usePrevious(deferredSelectedDate, rerunData);

  usePrevious(deferredDropdowns, rerunData);

  const formattedData = useMemo(
    () => buildNetRevenueData(netRevenue),
    [netRevenue]
  );

  const chartData = useMemo(
    () => Object.values(netRevenue?.value ? netRevenue.value : {}),
    [netRevenue]
  );

  const categoricalDataKey = "Year";

  const rowData = useMemo(() => fixRowData(formattedData), [formattedData]);

  const columnDefs = useMemo(() => getColumnDefs(rowData), [rowData]);

  const bestRowData = useMemo(
    () => [
      Object.fromEntries(
        columnDefs.map(({ field }) => [
          field,
          handleAsOfDateField(field, dateLookup),
        ])
      ),
      ...addProperBlanks(rowData, columnDefs),
    ],
    [rowData, columnDefs, dateLookup]
  );

  const numericalDataKeys = useMemo(() => {
    const highlightedNamesSorted = [...highlightedNames].sort(
      (a, b) =>
        findIndexOfName(bestRowData, a) - findIndexOfName(bestRowData, b)
    );

    return splitArrayAtElement(highlightedNamesSorted, "FTE")[0];
  }, [bestRowData]);

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
          <div className="d-flex gap-3 flex-wrap">
            {dropdowns &&
              Object.entries(dropdowns).map(([field, set]) => (
                <Dropdown
                  onItemClick={onDropdownItemClick}
                  list={dropdownItems[field]}
                  field={field}
                  active={set}
                  key={field}
                ></Dropdown>
              ))}
          </div>
        </div>
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <div>
            <AgGridReact
              loading={
                deferredDropdowns !== dropdowns ||
                deferredSelectedDate !== selectedDate
              }
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
