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

const data = [
  {
    name: "Page A",
    amt: 2400,
    uv: 4000,
    pv: 2400,
  },
  {
    name: "Page B",
    amt: 2210,
    uv: 3000,
    pv: 1398,
  },
  {
    name: "Page C",
    amt: 2290,
    uv: 2000,
    pv: 9800,
  },
  {
    name: "Page D",
    amt: 2000,
    uv: 2780,
    pv: 3908,
  },
  {
    name: "Page E",
    amt: 2181,
    uv: 1890,
    pv: 4800,
  },
  {
    name: "Page F",
    amt: 2500,
    uv: 2390,
    pv: 3800,
  },
  {
    name: "Page G",
    amt: 2100,
    uv: 3490,
    pv: 4300,
  },
];

export const SimpleLineChart = ({ height = 500 }) => {
  return (
    <ResponsiveContainer height={height} width="100%">
      <LineChart
        margin={{
          right: 30,
          bottom: 5,
          left: 20,
          top: 5,
        }}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          activeDot={{ r: 8 }}
          stroke="#8884d8"
          type="monotone"
          dataKey="pv"
        />
        <Line stroke="#82ca9d" type="monotone" dataKey="uv" />
      </LineChart>
    </ResponsiveContainer>
  );
};
