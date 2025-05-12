import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '../components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Trends() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(true); // Assuming user is authenticated
  let isAuthenticated = true; // For demo purposes, set to true
  const [dateRange, setDateRange] = useState('30days');
  const [platform, setPlatform] = useState('all');
  
  // User data for header
  const userData = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  // Sample data for trends
  const topHashtagsData = [
    { name: 'sustainability', count: 42, percentage: 85 },
    { name: 'innovation', count: 36, percentage: 72 },
    { name: 'techfuture', count: 28, percentage: 56 },
    { name: 'greentech', count: 22, percentage: 44 },
    { name: 'teamwork', count: 18, percentage: 36 }
  ];
  
  const topKeywordsData = [
    { name: 'sustainable', count: 126 },
    { name: 'technology', count: 98 },
    { name: 'innovation', count: 87 },
    { name: 'future', count: 72 },
    { name: 'community', count: 65 },
    { name: 'growth', count: 61 },
    { name: 'environment', count: 58 },
    { name: 'partnership', count: 52 },
    { name: 'leadership', count: 49 },
    { name: 'digital', count: 46 },
    { name: 'development', count: 45 },
    { name: 'team', count: 43 }
  ];
  
  const platformDistributionData = [
    { name: 'Instagram', value: 182, color: '#EC4899' },
    { name: 'Twitter', value: 145, color: '#1F2937' },
    { name: 'Facebook', value: 94, color: '#3B82F6' },
    { name: 'LinkedIn', value: 66, color: '#0277B5' }
  ];
  
  const trendingTopicsOverTimeData = [
    { date: 'Jan 1', sustainability: 12, innovation: 8, future: 5 },
    { date: 'Jan 5', sustainability: 15, innovation: 10, future: 7 },
    { date: 'Jan 10', sustainability: 18, innovation: 12, future: 9 },
    { date: 'Jan 15', sustainability: 22, innovation: 15, future: 10 },
    { date: 'Jan 20', sustainability: 26, innovation: 16, future: 11 },
    { date: 'Jan 25', sustainability: 28, innovation: 18, future: 12 },
    { date: 'Jan 30', sustainability: 32, innovation: 20, future: 15 }
  ];
  
  const engagementByHashtagData = [
    { name: 'sustainability', likes: 2450, comments: 540, shares: 380 },
    { name: 'innovation', likes: 1980, comments: 420, shares: 310 },
    { name: 'techfuture', likes: 1540, comments: 320, shares: 240 },
    { name: 'greentech', likes: 1240, comments: 280, shares: 190 },
    { name: 'teamwork', likes: 980, comments: 210, shares: 150 }
  ];
  
  const trendingContentTypes = [
    { name: 'Images', value: 45, color: '#3B82F6' },
    { name: 'Videos', value: 30, color: '#F59E0B' },
    { name: 'Text', value: 15, color: '#10B981' },
    { name: 'Links', value: 10, color: '#6366F1' }
  ];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color || entry.fill || entry.stroke }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trending Topics & Hashtags</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track what's trending across your social media platforms
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
              
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <i className="ri-refresh-line"></i>
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Top Trending Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Top Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Top Hashtags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topHashtagsData.map((hashtag) => (
                    <div key={hashtag.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">#{hashtag.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">{hashtag.count} posts</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${hashtag.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Trending Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Trending Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topKeywordsData.map((keyword) => (
                    <span 
                      key={keyword.name}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                    >
                      {keyword.name} ({keyword.count})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Content Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={platformDistributionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Posts" radius={[4, 4, 0, 0]}>
                        {platformDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Trending Topics Over Time */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Trending Topics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendingTopicsOverTimeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sustainability" 
                      stroke="#3B82F6" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="innovation" 
                      stroke="#10B981" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="future" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Engagement Metrics & Content Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement by Hashtag */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Engagement by Hashtag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={engagementByHashtagData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="likes" name="Likes" fill="#3B82F6" />
                      <Bar dataKey="comments" name="Comments" fill="#10B981" />
                      <Bar dataKey="shares" name="Shares" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Trending Content Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Trending Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trendingContentTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {trendingContentTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Hashtag Explorer */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">Hashtag Explorer</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search hashtags..."
                      className="w-full py-2 pl-10 pr-4 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <i className="ri-search-line absolute left-3 top-2.5 text-slate-400"></i>
                  </div>
                  <Button size="sm">Search</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="related">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="related">Related Hashtags</TabsTrigger>
                  <TabsTrigger value="growth">Fastest Growing</TabsTrigger>
                  <TabsTrigger value="engagement">Highest Engagement</TabsTrigger>
                </TabsList>
                
                <TabsContent value="related" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['sustainability', 'sustainable', 'ecofriendly', 'green', 'climateaction', 'sustainableliving', 'zerowaste', 'environment'].map((tag) => (
                      <div key={tag} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-primary-600 dark:text-primary-400 font-medium">#{tag}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {Math.floor(Math.random() * 1000)} posts
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="growth" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['techfuture', 'innovation', 'ai', 'machinelearning', 'tech', 'digital', 'future', 'smarttech'].map((tag) => (
                      <div key={tag} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-primary-600 dark:text-primary-400 font-medium">#{tag}</p>
                        <div className="flex items-center justify-center mt-1">
                          <i className="ri-arrow-up-line text-emerald-500 mr-1"></i>
                          <span className="text-xs text-emerald-500">+{Math.floor(Math.random() * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['community', 'teamwork', 'leadership', 'success', 'motivation', 'growth', 'business', 'startup'].map((tag) => (
                      <div key={tag} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-primary-600 dark:text-primary-400 font-medium">#{tag}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {(Math.random() * 10).toFixed(1)}% engagement
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
