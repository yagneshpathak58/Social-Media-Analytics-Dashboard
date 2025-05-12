import { cn } from "../../lib/utils"

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export default function MetricsCard({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconColor
}: MetricsCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-sm font-medium flex items-center",
              isPositive 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              <i className={cn(
                "mr-1",
                isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"
              )}></i> 
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">vs last period</span>
          </div>
        </div>
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <i className={cn(`${icon} text-xl`, iconColor)}></i>
        </div>
      </div>
    </div>
  );
}
