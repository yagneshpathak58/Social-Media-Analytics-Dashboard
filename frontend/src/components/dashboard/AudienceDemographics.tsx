import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface AgeGroup {
  age: string;
  percentage: number;
}

interface GenderData {
  name: string;
  value: number;
  color: string;
}

interface AudienceDemographicsProps {
  ageGroups: AgeGroup[];
  genderData: GenderData[];
}

export default function AudienceDemographics({ 
  ageGroups, 
  genderData 
}: AudienceDemographicsProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-md p-2">
          <p className="font-medium" style={{ color: payload[0].payload.color }}>
            {`${payload[0].name}: ${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Audience Demographics</h3>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <i className="ri-more-2-fill"></i>
        </button>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Age Distribution</h4>
        {ageGroups.map((group) => (
          <div className="mb-4" key={group.age}>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>{group.age}</span>
              <span>{group.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${group.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
      
      <div>
        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Gender</h4>
        <div className="flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 pl-2">
            {genderData.map((item) => (
              <div className="flex items-center mb-2" key={item.name}>
                <span 
                  className="h-3 w-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
