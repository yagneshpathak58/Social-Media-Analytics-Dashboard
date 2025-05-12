import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Analytics() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(true); // Assuming user is authenticated
  let isAuthenticated = true; // For demo purposes, set to true
  const [dateRange, setDateRange] = useState('30days');
  
  // User data for header
  const userData = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Sample data for analytics
  const reachData = [
    { name: 'Week 1', organic: 4000, paid: 2400 },
    { name: 'Week 2', organic: 3000, paid: 1398 },
    { name: 'Week 3', organic: 2000, paid: 9800 },
    { name: 'Week 4', organic: 2780, paid: 3908 },
    { name: 'Week 5', organic: 1890, paid: 4800 },
    { name: 'Week 6', organic: 2390, paid: 3800 },
    { name: 'Week 7', organic: 3490, paid: 4300 },
  ];
  
  const engagementRateData = [
    { name: 'Mon', instagram: 4.5, twitter: 2.3, facebook: 3.1, linkedin: 1.8 },
    { name: 'Tue', instagram: 5.1, twitter: 2.1, facebook: 3.3, linkedin: 2.0 },
    { name: 'Wed', instagram: 4.9, twitter: 2.6, facebook: 3.0, linkedin: 1.9 },
    { name: 'Thu', instagram: 5.2, twitter: 2.8, facebook: 3.5, linkedin: 2.2 },
    { name: 'Fri', instagram: 5.0, twitter: 3.0, facebook: 3.8, linkedin: 2.3 },
    { name: 'Sat', instagram: 4.8, twitter: 2.5, facebook: 3.2, linkedin: 1.7 },
    { name: 'Sun', instagram: 4.2, twitter: 2.2, facebook: 3.0, linkedin: 1.5 },
  ];
  
  const followerGrowthData = [
    { name: 'Jan', value: 240 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 280 },
    { name: 'Apr', value: 350 },
    { name: 'May', value: 410 },
    { name: 'Jun', value: 520 },
    { name: 'Jul', value: 580 },
    { name: 'Aug', value: 610 },
    { name: 'Sep', value: 670 },
    { name: 'Oct', value: 720 },
    { name: 'Nov', value: 800 },
    { name: 'Dec', value: 920 },
  ];
  
  const trafficSourceData = [
    { name: 'Direct', value: 35 },
    { name: 'Referral', value: 25 },
    { name: 'Social', value: 20 },
    { name: 'Organic', value: 15 },
    { name: 'Email', value: 5 },
  ];
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#9333EA'];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
        showAuthModal={() => {}}
        isAuthenticated={isAuthenticated}
        userData={userData}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isMobile={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Detailed performance metrics across all platforms
              </p>
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="12months">Last 12 months</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Audience Reach Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Audience Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reachData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="organic" name="Organic Reach" fill="#3B82F6" />
                      <Bar dataKey="paid" name="Paid Reach" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Engagement Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Engagement Rate by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={engagementRateData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="instagram" name="Instagram" stroke="#E11D48" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="twitter" name="Twitter" stroke="#1F2937" />
                      <Line type="monotone" dataKey="facebook" name="Facebook" stroke="#3B82F6" />
                      <Line type="monotone" dataKey="linkedin" name="LinkedIn" stroke="#0277B5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follower Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Follower Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={followerGrowthData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="New Followers" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Traffic Sources Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSourceData.map((entry, index) =>{
                          console.log("entry", entry)
                          return (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          )
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
