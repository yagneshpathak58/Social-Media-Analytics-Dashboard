import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Sentiment() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(true); // Assuming user is authenticated
  let isAuthenticated = true; // For testing purposes, set to true
  const [dateRange, setDateRange] = useState('30days');
  const [platform, setPlatform] = useState('all');
  
  // User data for header
  const userData = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Sample data for sentiment analysis
  const sentimentOverTimeData = [
    { name: 'Jan', positive: 65, neutral: 25, negative: 10 },
    { name: 'Feb', positive: 60, neutral: 28, negative: 12 },
    { name: 'Mar', positive: 58, neutral: 30, negative: 12 },
    { name: 'Apr', positive: 62, neutral: 28, negative: 10 },
    { name: 'May', positive: 55, neutral: 32, negative: 13 },
    { name: 'Jun', positive: 68, neutral: 24, negative: 8 },
    { name: 'Jul', positive: 72, neutral: 20, negative: 8 },
    { name: 'Aug', positive: 70, neutral: 22, negative: 8 },
    { name: 'Sep', positive: 68, neutral: 24, negative: 8 },
    { name: 'Oct', positive: 64, neutral: 26, negative: 10 },
    { name: 'Nov', positive: 62, neutral: 28, negative: 10 },
    { name: 'Dec', positive: 66, neutral: 25, negative: 9 },
  ];
  
  const overallSentimentData = [
    { name: 'Positive', value: 65, color: '#10B981' },
    { name: 'Neutral', value: 26, color: '#F59E0B' },
    { name: 'Negative', value: 9, color: '#EF4444' },
  ];
  
  const keywordSentimentData = [
    { keyword: 'product', positive: 78, neutral: 18, negative: 4 },
    { keyword: 'service', positive: 65, neutral: 25, negative: 10 },
    { keyword: 'quality', positive: 82, neutral: 15, negative: 3 },
    { keyword: 'price', positive: 45, neutral: 35, negative: 20 },
    { keyword: 'delivery', positive: 58, neutral: 30, negative: 12 },
    { keyword: 'support', positive: 62, neutral: 28, negative: 10 },
    { keyword: 'experience', positive: 70, neutral: 22, negative: 8 },
  ];
  
  const sentimentByPlatformData = [
    { platform: 'Instagram', positive: 72, neutral: 20, negative: 8 },
    { platform: 'Twitter', positive: 60, neutral: 28, negative: 12 },
    { platform: 'Facebook', positive: 65, neutral: 25, negative: 10 },
    { platform: 'LinkedIn', positive: 75, neutral: 20, negative: 5 },
  ];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color || entry.fill }}>
              {`${entry.name}: ${entry.value}${entry.unit || '%'}`}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sentiment Analysis</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Analyzing user sentiment across your social media presence
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Overall Sentiment Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Overall Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overallSentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {overallSentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-4">
                  {overallSentimentData.map((item) => (
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
                        {item.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Sentiment by Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Sentiment by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sentimentByPlatformData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="platform" type="category" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="positive" name="Positive" stackId="a" fill="#10B981" />
                      <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="negative" name="Negative" stackId="a" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Sentiment Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Sentiment Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sentimentOverTimeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="positive" name="Positive" stroke="#10B981" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#F59E0B" />
                      <Line type="monotone" dataKey="negative" name="Negative" stroke="#EF4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Keyword Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Keyword Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Positive
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Neutral
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Negative
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Sentiment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {keywordSentimentData.map((keyword) => (
                      <tr key={keyword.keyword}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                          {keyword.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex items-center">
                            <span className="text-green-600 dark:text-green-400 font-medium">{keyword.positive}%</span>
                            <div className="ml-2 w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${keyword.positive}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex items-center">
                            <span className="text-amber-600 dark:text-amber-400 font-medium">{keyword.neutral}%</span>
                            <div className="ml-2 w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${keyword.neutral}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex items-center">
                            <span className="text-red-600 dark:text-red-400 font-medium">{keyword.negative}%</span>
                            <div className="ml-2 w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${keyword.negative}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              keyword.positive > 65 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                                : keyword.negative > 15
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                                  : 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400'
                            }`}
                          >
                            {keyword.positive > 65 
                              ? 'Very Positive' 
                              : keyword.negative > 15
                                ? 'Needs Attention'
                                : 'Moderate'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
