import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
}

export default function EngagementChart({ 
  data, 
  timeframe, 
  onTimeframeChange 
}: EngagementChartProps) {
  const [chartData, setChartData] = useState<EngagementData[]>([]);
  
  useEffect(() => {
    setChartData(data);
  }, [data]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-md p-2">
          <p className="text-slate-900 dark:text-white font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.stroke }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Engagement Over Time</h3>
        <div className="flex items-center space-x-2">
          <button 
            className={`text-xs px-2 py-1 rounded-md ${
              timeframe === 'daily' 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            onClick={() => onTimeframeChange('daily')}
          >
            Daily
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded-md ${
              timeframe === 'weekly' 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            onClick={() => onTimeframeChange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded-md ${
              timeframe === 'monthly' 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            onClick={() => onTimeframeChange('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="likes"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="comments"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="shares"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center mt-2 space-x-6">
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-primary-500 mr-2"></span>
          <span className="text-xs text-slate-700 dark:text-slate-300">Likes</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></span>
          <span className="text-xs text-slate-700 dark:text-slate-300">Comments</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-amber-500 mr-2"></span>
          <span className="text-xs text-slate-700 dark:text-slate-300">Shares</span>
        </div>
      </div>
    </div>
  );
}
