import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { cn, socialPlatformColors, socialPlatformIcons } from "../../lib/utils";

interface Post {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin';
  timestamp: Date;
  image: string;
  content: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  performancePercent: number;
}

interface TopPostsProps {
  posts: Post[];
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function TopPosts({ posts, sortBy, onSortChange }: TopPostsProps) {
  const formatTimeDifference = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Top Performing Posts</h3>
        <Select defaultValue={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engagement">By Engagement</SelectItem>
            <SelectItem value="reach">By Reach</SelectItem>
            <SelectItem value="shares">By Shares</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className={cn(
              "flex items-start space-x-4",
              index < posts.length - 1 ? "pb-4 border-b border-slate-200 dark:border-slate-700" : ""
            )}
          >
            <img 
              src={post.image} 
              alt="Post thumbnail" 
              className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <i className={cn(
                  socialPlatformIcons[post.platform],
                  socialPlatformColors[post.platform]
                )}></i>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} • {formatTimeDifference(post.timestamp)}
                </span>
              </div>
              <p className="text-sm text-slate-900 dark:text-white font-medium truncate">
                {post.content}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <i className="ri-heart-line mr-1 text-xs"></i>
                  <span className="text-xs">{post.engagement.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <i className="ri-chat-1-line mr-1 text-xs"></i>
                  <span className="text-xs">{post.engagement.comments.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <i className="ri-share-forward-line mr-1 text-xs"></i>
                  <span className="text-xs">{post.engagement.shares.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="inline-flex items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                +{post.performancePercent}% avg
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
          View All Posts
        </button>
      </div>
    </div>
  );
}
