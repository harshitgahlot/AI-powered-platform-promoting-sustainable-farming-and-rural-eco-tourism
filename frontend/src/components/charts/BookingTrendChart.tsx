import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingData {
  date: string;
  bookings_count: number;
}

interface BookingTrendChartProps {
  data: BookingData[];
}

export const BookingTrendChart: React.FC<BookingTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="dark:stroke-slate-700" opacity={0.2} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line
            type="monotone"
            dataKey="bookings_count"
            name="Reservations"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default BookingTrendChart;
