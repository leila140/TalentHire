import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Legend,
} from "recharts";

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard = ({ title, children, className = "" }: ChartCardProps) => (
  <div className={`rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm ${className}`}>
    <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
    {children}
  </div>
);

interface BarChartProps {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
}

export const BarChart = ({ data, height = 250, color = "#8b5cf6" }: BarChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
      <Tooltip
        contentStyle={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
      <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
    </RechartsBarChart>
  </ResponsiveContainer>
);

interface LineChartProps {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
}

export const LineChart = ({ data, height = 250, color = "#8b5cf6" }: LineChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
      <Tooltip
        contentStyle={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} />
    </RechartsLineChart>
  </ResponsiveContainer>
);

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export const PieChart = ({ data, height = 250 }: PieChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsPieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={80}
        paddingAngle={3}
        dataKey="value"
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
    </RechartsPieChart>
  </ResponsiveContainer>
);
