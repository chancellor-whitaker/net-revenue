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

// name: year1, year2, ..., yearN
// ...rest: metric1: number, metric2: number, ..., metricN: number

const palette = {
  "Institutional Aid less State Waivers and Foundation": "#ff0029",
  "Institutional Grant/Scholarship Aid": "#377eb8",
  "Revenue after external aid": "#66a61e",
  "Total Student Credit Hours": "#984ea3",
  "Total External Aid": "#00d2d5",
  "Tuition & Fees": "#ff7f00",
  "Net Revenue": "#af8d00",
  BookSmart: "#7f80cd",
};

function splitStringAtIndex(str, index) {
  if (index < 0 || index > str.length) {
    return "Index is out of bounds";
  }
  const part1 = str.substring(0, index);
  const part2 = str.substring(index);
  return [part1, part2];
}

export const SimpleLineChart = ({
  numericalFormatter = (value) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      style: "currency",
      currency: "USD",
    }).format(value),
  categoricalFormatter = (value) => splitStringAtIndex(`${value}`, 2).join("-"),
  categoricalDataKey = "name",
  numericalDataKeys = [],
  colorPalette = palette,
  height = 500,
  data = [],
}) => {
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
        <YAxis tickFormatter={numericalFormatter} />
        <Tooltip
          labelFormatter={categoricalFormatter}
          formatter={numericalFormatter}
          wrapperClassName="shadow"
        />
        <Legend />
        {numericalDataKeys.map((dataKey) => (
          <Line
            stroke={colorPalette[dataKey]}
            activeDot={{ r: 8 }}
            dataKey={dataKey}
            type="monotone"
            strokeWidth={2}
            key={dataKey}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
