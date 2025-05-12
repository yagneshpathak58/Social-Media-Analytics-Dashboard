import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import MetricsCard from '../components/dashboard/MetricsCard';
import EngagementChart from '../components/dashboard/EngagementChart';
import SentimentAnalysis from '../components/dashboard/SentimentAnalysis';
import AudienceDemographics from '../components/dashboard/AudienceDemographics';
import TopPosts from '../components/dashboard/TopPosts';
import TrendingTopics from '../components/dashboard/TrendingTopics';
import AuthModal from '../components/auth/AuthModal';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
// import { formatDateRange } from '@/lib/utils';

export default function Dashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [activePlatform, setActivePlatform] = useState('all');
  const [engagementTimeframe, setEngagementTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [postSortBy, setPostSortBy] = useState('engagement');
  const [trendingTimeframe, setTrendingTimeframe] = useState<'7days' | '30days'>('7days');
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  // Fetch dashboard data
  // const { data: dashboardData, isLoading, error } = useQuery({
  //   queryKey: ['/api/dashboard', dateRange, activePlatform],
  //   enabled: isAuthenticated,
  // });

  const exportData = () => {
    toast({
      title: "Export started",
      description: "Your data is being prepared for download",
    });
    
    // Actual export logic would call an API to generate the report
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your data has been exported successfully",
      });
    }, 2000);
  };

  // Mock data for demonstration, in production this would come from API
  const metricsCards = [
    {
      title: "Total Followers",
      value: "24,563",
      change: 12.5,
      icon: "ri-user-follow-line",
      iconBgColor: "bg-primary-50 dark:bg-primary-900/20",
      iconColor: "text-primary-600 dark:text-primary-400"
    },
    {
      title: "Engagement Rate",
      value: "4.7%",
      change: -0.8,
      icon: "ri-bar-chart-box-line",
      iconBgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Total Posts",
      value: "487",
      change: 8.2,
      icon: "ri-file-list-3-line",
      iconBgColor: "bg-violet-50 dark:bg-violet-900/20",
      iconColor: "text-violet-600 dark:text-violet-400"
    },
    {
      title: "Sentiment Score",
      value: "7.3/10",
      change: 2.1,
      icon: "ri-emotion-happy-line",
      iconBgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    }
  ];

  // Placeholder engagement data
  const engagementData = [
    { date: "Jan 1", likes: 1200, comments: 500, shares: 300 },
    { date: "Jan 2", likes: 1900, comments: 700, shares: 400 },
    { date: "Jan 3", likes: 1700, comments: 650, shares: 350 },
    { date: "Jan 4", likes: 2400, comments: 800, shares: 500 },
    { date: "Jan 5", likes: 2200, comments: 750, shares: 450 },
    { date: "Jan 6", likes: 2600, comments: 850, shares: 550 },
    { date: "Jan 7", likes: 2300, comments: 800, shares: 500 },
    { date: "Jan 8", likes: 2900, comments: 900, shares: 600 },
    { date: "Jan 9", likes: 3100, comments: 950, shares: 650 },
    { date: "Jan 10", likes: 3300, comments: 1000, shares: 700 },
    { date: "Jan 11", likes: 3200, comments: 1100, shares: 750 },
    { date: "Jan 12", likes: 3500, comments: 1050, shares: 800 }
  ];

  // Sentiment data
  const sentimentData = [
    { name: "Positive", value: 62, color: "#10B981", percentage: 62 },
    { name: "Neutral", value: 28, color: "#F59E0B", percentage: 28 },
    { name: "Negative", value: 10, color: "#EF4444", percentage: 10 }
  ];

  // Audience data
  const ageGroups = [
    { age: "18-24", percentage: 28 },
    { age: "25-34", percentage: 42 },
    { age: "35-44", percentage: 18 },
    { age: "45+", percentage: 12 }
  ];

  const genderData = [
    { name: "Male", value: 54, color: "#3B82F6" },
    { name: "Female", value: 42, color: "#EC4899" },
    { name: "Other", value: 4, color: "#94A3B8" }
  ];

  // Top posts data
  const topPosts = [
    {
      id: "post1",
      platform: "instagram" as const,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1471897488648-5eae4ac6686b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80",
      content: "New product launch! Check out our latest innovation in sustainable technology...",
      engagement: {
        likes: 2456,
        comments: 145,
        shares: 78
      },
      performancePercent: 125
    },
    {
      id: "post2",
      platform: "twitter" as const,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80",
      content: "We're excited to announce our partnership with @EcoTech to advance green initiatives...",
      engagement: {
        likes: 1982,
        comments: 87,
        shares: 248
      },
      performancePercent: 89
    },
    {
      id: "post3",
      platform: "facebook" as const,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80",
      content: "Meet our team! The incredible people behind our success story and vision...",
      engagement: {
        likes: 843,
        comments: 52,
        shares: 26
      },
      performancePercent: 42
    }
  ];

  // Trending data
  const hashtags = [
    { name: "sustainability", count: 42, percentage: 85 },
    { name: "innovation", count: 36, percentage: 72 },
    { name: "techfuture", count: 28, percentage: 56 },
    { name: "greentech", count: 22, percentage: 44 },
    { name: "teamwork", count: 18, percentage: 36 }
  ];

  const keywords = [
    { name: "sustainable", count: 126 },
    { name: "technology", count: 98 },
    { name: "innovation", count: 87 },
    { name: "future", count: 72 },
    { name: "community", count: 65 },
    { name: "growth", count: 61 },
    { name: "environment", count: 58 },
    { name: "partnership", count: 52 },
    { name: "leadership", count: 49 },
    { name: "digital", count: 46 },
    { name: "development", count: 45 },
    { name: "team", count: 43 }
  ];

  const platformDistribution = [
    { name: "Instagram", value: 182, color: "#EC4899" },
    { name: "Twitter", value: 145, color: "#1F2937" },
    { name: "Facebook", value: 94, color: "#3B82F6" },
    { name: "LinkedIn", value: 66, color: "#0277B5" }
  ];

  // Fake user data for demonstration
  const userData = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show auth modal when needed */}
      {showAuthModal && <AuthModal onLogin={handleLogin} />}
      
      <Navbar 
        toggleSidebar={toggleSidebar} 
        showAuthModal={() => setShowAuthModal(true)}
        isAuthenticated={isAuthenticated}
        userData={userData}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isMobile={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Social Media Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get insights on your social media performance</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap items-center space-x-2">
              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
              >
                <i className="ri-refresh-line"></i>
                <span>Refresh</span>
              </Button>
              
              <Button 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={exportData}
              >
                <i className="ri-download-line"></i>
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          {/* Platform Selection Tabs */}
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1 flex overflow-x-auto">
            <button 
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium ${
                activePlatform === 'all' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              onClick={() => setActivePlatform('all')}
            >
              All Platforms
            </button>
            <button 
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium ${
                activePlatform === 'twitter' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              onClick={() => setActivePlatform('twitter')}
            >
              Twitter
            </button>
            <button 
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium ${
                activePlatform === 'instagram' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              onClick={() => setActivePlatform('instagram')}
            >
              Instagram
            </button>
            <button 
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium ${
                activePlatform === 'facebook' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              onClick={() => setActivePlatform('facebook')}
            >
              Facebook
            </button>
            <button 
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium ${
                activePlatform === 'linkedin' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              onClick={() => setActivePlatform('linkedin')}
            >
              LinkedIn
            </button>
          </div>
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricsCards.map((card, index) => (
              <MetricsCard 
                key={index}
                title={card.title}
                value={card.value}
                change={card.change}
                icon={card.icon}
                iconBgColor={card.iconBgColor}
                iconColor={card.iconColor}
              />
            ))}
          </div>
          
          {/* Engagement Overview & Sentiment Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <EngagementChart 
              data={engagementData}
              timeframe={engagementTimeframe}
              onTimeframeChange={setEngagementTimeframe}
            />
            
            <SentimentAnalysis data={sentimentData} />
          </div>
          
          {/* Audience Insights & Top Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AudienceDemographics 
              ageGroups={ageGroups}
              genderData={genderData}
            />
            
            <TopPosts 
              posts={topPosts}
              sortBy={postSortBy}
              onSortChange={setPostSortBy}
            />
          </div>
          
          {/* Trends & Hashtags */}
          <TrendingTopics 
            hashtags={hashtags}
            keywords={keywords}
            platformDistribution={platformDistribution}
            timeframe={trendingTimeframe}
            onTimeframeChange={setTrendingTimeframe}
          />
        </main>
      </div>
    </div>
  );
}
