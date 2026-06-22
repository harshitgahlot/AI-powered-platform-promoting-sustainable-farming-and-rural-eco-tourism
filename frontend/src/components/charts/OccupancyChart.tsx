import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OccupancyItem {
  name: string;
  value: number;
}

interface OccupancyChartProps {
  data: OccupancyItem[];
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => {
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6']; // Emerald, Amber, Blue

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default OccupancyChart;
