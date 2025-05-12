import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from 'recharts';

interface SentimentData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface SentimentAnalysisProps {
  data: SentimentData[];
}

export default function SentimentAnalysis({ data }: SentimentAnalysisProps) {
  // const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-md p-2">
          <p className="font-medium" style={{ color: payload[0].payload.color }}>
            {`${payload[0].name}: ${payload[0].value.toLocaleString()} (${payload[0].payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Sentiment Analysis</h3>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <i className="ri-information-line"></i>
        </button>
      </div>
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-4">
        {data.map((item) => (
          <div 
            key={item.name}
            className={`text-center p-2 rounded-md ${
              item.name === 'Positive' 
                ? 'bg-green-50 dark:bg-green-900/20' 
                : item.name === 'Neutral' 
                  ? 'bg-amber-50 dark:bg-amber-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <p className="text-xs text-slate-600 dark:text-slate-400">{item.name}</p>
            <p 
              className={`text-lg font-bold ${
                item.name === 'Positive' 
                  ? 'text-green-600 dark:text-green-400' 
                  : item.name === 'Neutral' 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-red-600 dark:text-red-400'
              }`}
            >
              {item.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
