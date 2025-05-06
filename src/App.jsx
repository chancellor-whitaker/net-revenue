import { AgGridReact } from "ag-grid-react";

import { getColumnDefs } from "./utils/getColumnDefs";
import { defaultColDef } from "./utils/defaultColDef";
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

/*
- no sorting values
- dress up rows as Bethany has done in her file and possibly add blank rows between rows
- some column values are right-aligned vs left-aligned
- filters for level, online, residency, & student type (filter on full date & year)
- try to make your table look as much like hers as possible
- showing definition/note on hovering name (column A) in table
*/

export default function App() {
  const data = usePromise(promise);

  const rowData = fixRowData(data);

  const columnDefs = getColumnDefs(rowData);

  const autoSizeStrategy = { type: "fitCellContents" };

  // const chartData = createChartData({ rowData });

  return (
    <>
      <main className="container">
        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <div style={{ height: 500 }}>
            <AgGridReact
              autoSizeStrategy={autoSizeStrategy}
              defaultColDef={defaultColDef}
              columnDefs={columnDefs}
              rowData={rowData}
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
