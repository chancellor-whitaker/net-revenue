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

export const SimpleLineChart = ({
  categoricalDataKey = "name",
  numericalDataKeys = [],
  height = 500,
  data = [],
}) => {
  return (
    <ResponsiveContainer height={height} width="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={categoricalDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {numericalDataKeys.map((dataKey) => (
          <Line
            activeDot={{ r: 8 }}
            dataKey={dataKey}
            stroke="#8884d8"
            type="monotone"
            key={dataKey}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
