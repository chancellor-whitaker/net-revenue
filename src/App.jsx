import { useDeferredValue, useCallback, useState, useMemo } from "react";
import { themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import Calendar from "react-calendar";
import { csv } from "d3-fetch";

import { categoricalFormatter } from "./utils/categoricalFormatter";
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
import { getEveryValue } from "./utils/getEveryValue";
import { fieldsToShow } from "./utils/fieldsToShow";
import { autoSizeGrid } from "./utils/autoSizeGrid";
import { usePrevious } from "./hooks/usePrevious";
import { Dropdown } from "./components/Dropdown";
import { usePromise } from "./hooks/usePromise";
import { fixRowData } from "./utils/fixRowData";
import { NetRevenue } from "./utils/NetRevenue";
import { formatDate } from "./utils/formatDate";
import { filterRows } from "./utils/filterRows";
import { Popover } from "./components/Popover";
import { makeArray } from "./utils/makeArray";
import { makeDate } from "./utils/makeDate";

const myTheme = themeQuartz.withParams({
  headerRowBorder: false,
});

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

const dropdownFieldLabels = {
  EKU_ONLINE: "EKU Online",
  STYP: "Student type",
  RESD: "Residency",
  LEVL: "Level",
};

// * eku online filter
// * checkbox dropdown items
// * calendar popover (could put date on button)
// * select different parameters (lines) on line chart
// * numerical & categorical formatting in line chart
// * truncate y axis ticks/add margin to left of y axis
// * assign a color to each line
// * template
// * narrow row & remove "As of Date"
// ? fix slow down

const getRowHeight = (params) => {
  if (params?.data?.name === "As of Date") return 30;
};

// dropdown for x-axis values (categories)
// * fix "All" item on line chart
// * only include dropdown values based on what is found in data
// try to make calendar just one year backwards
// check year_dates object
// toggle most recent transaction date for every combination (passing a date way in the future will force as of date to today)

const dropdownFields = ["EKU_ONLINE", "LEVL", "RESD", "STYP"];

export default function App() {
  const datasets = usePromise(datasetsPromise);

  const dropdownLists = usePromise(dropdownsPromise);

  const [dropdowns, setDropdowns] = useState();

  const deferredDropdowns = useDeferredValue(dropdowns);

  const valueLabels = useMemo(() => {
    const dropdownValueLabels = Object.fromEntries(
      dropdownOrder.map((field) => [
        field.substring(dropdownKeyPrefix.length),
        {},
      ])
    );

    makeArray(dropdownLists).forEach((list, index) => {
      const field = dropdownOrder[index].substring(dropdownKeyPrefix.length);

      list.forEach((item) => {
        const [value, label] = [
          item[`${dropdownKeyPrefix}${field}_CODE`],
          item[`${dropdownKeyPrefix}${field}_DESC`],
        ];

        dropdownValueLabels[field][value] = label;
      });
    });

    return dropdownValueLabels;
  }, [dropdownLists]);

  const onDropdownItemClick = useCallback((params) => {
    const { field, value, list } = params;

    setDropdowns((currentState) => {
      const nextState = { ...currentState };

      nextState[field] = new Set(nextState[field]);

      if (!("value" in params)) {
        const allWereActive = nextState[field].size === list.length;

        nextState[field] = allWereActive
          ? new Set()
          : new Set(list.map(({ value }) => value));
      } else {
        if (nextState[field].has(value)) {
          nextState[field].delete(value);
        } else {
          nextState[field].add(value);
        }
      }

      return nextState;
    });
  }, []);

  const datasetsArray = useMemo(() => makeArray(datasets), [datasets]);

  const [accountingData, unofficialFte, officialFte] = datasetsArray;

  const everyValue = useMemo(
    () => getEveryValue(unofficialFte),
    [unofficialFte]
  );

  const [initialDropdowns, dropdownItems] = useMemo(() => {
    return [
      Object.fromEntries(
        Object.entries(everyValue)
          .map(([key, values]) => [key, new Set(values)])
          .filter(([key]) => dropdownFields.includes(key))
      ),
      Object.fromEntries(
        Object.entries(everyValue)
          .map(([key, values]) => [
            key,
            values.map((value) => ({
              label: valueLabels?.[key]?.[value]
                ? valueLabels[key][value]
                : value,
              value,
            })),
          ])
          .filter(([key]) => dropdownFields.includes(key))
      ),
    ];
  }, [everyValue, valueLabels]);

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

  const categories = useMemo(
    () => [
      ...new Set(
        chartData.map(({ [categoricalDataKey]: category }) => category)
      ),
    ],
    [chartData]
  );

  const {
    onDropdownChange: onYearsChange,
    dropdownList: yearsDropdownList,
    array: selectedCategories,
    set: activeYears,
  } = useGenericDropdown(categories, categoricalFormatter);

  const {
    array: selectedNumericalDataKeys,
    onDropdownChange: onLinesChange,
    dropdownList: linesDropdownList,
    set: activeLines,
  } = useGenericDropdown(numericalDataKeys);

  const bestColumnDefs = useMemo(
    () => columnDefs.filter(({ field }) => fieldsToShow.has(field)),
    [columnDefs]
  );

  // const palette = [
  //   "ff0029",
  //   "377eb8",
  //   "66a61e",
  //   "984ea3",
  //   "00d2d5",
  //   "ff7f00",
  //   "af8d00",
  //   "7f80cd",
  // ].map((string) => `#${string}`);

  // const colorPalette = Object.fromEntries(
  //   [
  //     "Institutional Aid less State Waivers and Foundation",
  //     "Institutional Grant/Scholarship Aid",
  //     "Revenue after external aid",
  //     "Total Student Credit Hours",
  //     "Total External Aid",
  //     "Tuition & Fees",
  //     "Net Revenue",
  //     "BookSmart",
  //   ].map((name, index) => [name, palette[index]])
  // );

  return (
    <>
      <div className="">
        <div className="d-flex gap-3 flex-wrap">
          <Popover
            label={
              <div className="icon-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="bi bi-calendar3"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height={16}
                  width={16}
                >
                  <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z" />
                  <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                </svg>
                {selectedDate?.toLocaleDateString()}
              </div>
            }
          >
            <Calendar onChange={setSelectedDate} value={selectedDate} />
          </Popover>
          {dropdowns &&
            Object.entries(dropdowns).map(([field, set]) => (
              <Dropdown
                onItemClick={onDropdownItemClick}
                list={dropdownItems[field]}
                field={field}
                active={set}
                key={field}
              >
                {dropdownFieldLabels[field]}
              </Dropdown>
            ))}
        </div>
      </div>
      <div className="">
        <div>
          <AgGridReact
            loading={
              deferredDropdowns !== dropdowns ||
              deferredSelectedDate !== selectedDate
            }
            onGridSizeChanged={autoSizeGrid}
            onRowDataUpdated={autoSizeGrid}
            defaultColDef={defaultColDef}
            getRowHeight={getRowHeight}
            columnDefs={bestColumnDefs}
            domLayout="autoHeight"
            rowData={bestRowData}
            tooltipShowDelay={0}
            theme={myTheme}
          />
        </div>
      </div>
      <div className="">
        <div className="d-flex gap-3 flex-wrap">
          <Dropdown
            onItemClick={onLinesChange}
            list={linesDropdownList}
            active={activeLines}
          >
            Lines
          </Dropdown>
          <Dropdown
            onItemClick={onYearsChange}
            list={yearsDropdownList}
            active={activeYears}
          >
            X axis
          </Dropdown>
        </div>
      </div>
      <div className="">
        <SimpleLineChart
          data={chartData.filter(({ [categoricalDataKey]: category }) =>
            selectedCategories.includes(category)
          )}
          numericalDataKeys={selectedNumericalDataKeys}
          categoricalDataKey={categoricalDataKey}
        ></SimpleLineChart>
      </div>
    </>
  );
}

const defaultValueFormatter = (value) => value;

const useGenericDropdown = (values, valueFormatter = defaultValueFormatter) => {
  const [options, setOptions] = useState({});

  const checkOptions = () => {
    const newOptions = makeArray(values).filter((key) => !(key in options));

    const newEntries = newOptions.map((key) => [key, true]);

    if (newOptions.length > 0) {
      setOptions((currentState) =>
        Object.fromEntries([...Object.entries(currentState), ...newEntries])
      );
    }
  };

  checkOptions();

  const set = new Set(
    Object.entries(options)
      .filter(([, condition]) => condition)
      .map(([key]) => key)
  );

  const dropdownList = Object.keys(options).map((value) => ({
    label: valueFormatter(value),
    value,
  }));

  const onDropdownChange = (params) => {
    const { value } = params;

    setOptions((currentState) => {
      if (!("value" in params)) {
        const notAllSelected = Object.entries(currentState).some(
          ([, value]) => !value
        );

        return Object.fromEntries(
          Object.entries(currentState).map(([key]) => [key, notAllSelected])
        );
      }

      return Object.fromEntries(
        Object.entries(currentState).map((entry) =>
          entry[0] === value ? [value, !entry[1]] : entry
        )
      );
    });
  };

  const array = [...set];

  return { onDropdownChange, dropdownList, array, set };
};
