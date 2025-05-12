import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface HashtagItem {
  name: string;
  count: number;
  percentage: number;
}

interface KeywordItem {
  name: string;
  count: number;
}

interface PlatformData {
  name: string;
  value: number;
  color: string;
}

interface TrendingTopicsProps {
  hashtags: HashtagItem[];
  keywords: KeywordItem[];
  platformDistribution: PlatformData[];
  timeframe: '7days' | '30days';
  onTimeframeChange: (value: '7days' | '30days') => void;
}

export default function TrendingTopics({
  hashtags,
  keywords,
  platformDistribution,
  timeframe,
  onTimeframeChange
}: TrendingTopicsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-md p-2">
          <p className="text-slate-900 dark:text-white font-medium">{`${label}`}</p>
          <p style={{ color: payload[0].fill }}>
            {`Posts: ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Trending Topics & Hashtags</h3>
        <Select defaultValue={timeframe} onValueChange={(value: any) => onTimeframeChange(value)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Most Used Hashtags */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Top Hashtags</h4>
          <div className="space-y-2">
            {hashtags.map((hashtag) => (
              <div className="flex items-center" key={hashtag.name}>
                <div className="w-full">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>#{hashtag.name}</span>
                    <span>{hashtag.count} posts</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${hashtag.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trending Keywords */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Trending Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span 
                key={keyword.name}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
              >
                {keyword.name} ({keyword.count})
              </span>
            ))}
          </div>
        </div>
        
        {/* Platform Distribution */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Content Distribution</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformDistribution}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
