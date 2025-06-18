import {
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  Line,
} from "recharts";

import { categoricalFormatter as defaultCatFormatter } from "../utils/categoricalFormatter";

// name: year1, year2, ..., yearN
// ...rest: metric1: number, metric2: number, ..., metricN: number

const colors = [
  "#bbcf77",
  "#da0062",
  "#4cb5ff",
  "#c77b00",
  "#ff9ac6",
  "#97c311",
  "#4144b4",
  "#305d1a",
  "#8c3904",
];

const keys = [
  "Institutional Aid less State Waivers and Foundation",
  "Institutional Grant/Scholarship Aid",
  "Revenue after external aid",
  "Total Student Credit Hours",
  "Total External Aid",
  "Tuition & Fees",
  "Net Revenue",
  "BookSmart",
  "FTE",
];

const palette = Object.fromEntries(keys.map((key, i) => [key, colors[i]]));

export const SimpleLineChart = ({
  numericalFormatter = (value) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      style: "currency",
      currency: "USD",
    }).format(value),
  rightNumericalFormatter = (value) => value.toLocaleString(),
  leftNumericalFormatter = numericalFormatter,
  categoricalFormatter = defaultCatFormatter,
  numericalDataKeys = [],
  leftNumericalDataKeys = numericalDataKeys,
  categoricalDataKey = "name",
  rightNumericalDataKeys = [],
  colorPalette = palette,
  height = 500,
  data = [],
}) => {
  // console.log(leftNumericalDataKeys);
  return (
    <ResponsiveContainer height={height} width="100%">
      <LineChart
        margin={{ right: 30, bottom: 5, left: 40, top: 5 }}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          tickFormatter={categoricalFormatter}
          padding={{ right: 30, left: 30 }}
          dataKey={categoricalDataKey}
        />
        <YAxis tickFormatter={leftNumericalFormatter} yAxisId="left" />
        <YAxis
          tickFormatter={rightNumericalFormatter}
          orientation="right"
          yAxisId="right"
        />
        <Tooltip
          formatter={(value, name) =>
            rightNumericalDataKeys.includes(name)
              ? rightNumericalFormatter(value)
              : leftNumericalFormatter(value)
          }
          labelFormatter={categoricalFormatter}
          wrapperClassName="shadow"
        />
        <Legend />
        {leftNumericalDataKeys
          .filter((key) => !rightNumericalDataKeys.includes(key))
          .map((dataKey) => (
            <Line
              stroke={colorPalette[dataKey]}
              activeDot={{ r: 8 }}
              dataKey={dataKey}
              type="monotone"
              strokeWidth={2}
              yAxisId="left"
              key={dataKey}
            />
          ))}
        {rightNumericalDataKeys.map((dataKey) => (
          <Line
            stroke={colorPalette[dataKey]}
            activeDot={{ r: 8 }}
            dataKey={dataKey}
            yAxisId="right"
            type="monotone"
            strokeWidth={2}
            key={dataKey}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
