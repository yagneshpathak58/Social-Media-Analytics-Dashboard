import { useLocation } from 'wouter';
import { cn } from "../../lib/utils"

interface SidebarProps {
  isMobile: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'ri-dashboard-line' },
    { name: 'Analytics', href: '/analytics', icon: 'ri-line-chart-line' },
    { name: 'Sentiment', href: '/sentiment', icon: 'ri-emotion-line' },
    { name: 'Trends', href: '/trends', icon: 'ri-hashtag' },
  ];

  const platforms = [
    { name: 'Twitter', icon: 'ri-twitter-x-line' },
    { name: 'Instagram', icon: 'ri-instagram-line' },
    { name: 'Facebook', icon: 'ri-facebook-circle-line' },
    { name: 'LinkedIn', icon: 'ri-linkedin-box-line' },
  ];

  const reports = [
    { name: 'Weekly Report', icon: 'ri-file-chart-line' },
    { name: 'Audience Insights', icon: 'ri-file-user-line' },
    { name: 'Export Data', icon: 'ri-download-cloud-line' },
  ];

  const settings = [
    { name: 'Account Settings', icon: 'ri-settings-3-line' },
    { name: 'Help & Support', icon: 'ri-customer-service-2-line' },
  ];

  const sidebarClasses = cn(
    'bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700',
    'h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto',
    isMobile ? 'fixed inset-0 z-40 w-72' : 'w-64 md:w-72 hidden lg:block'
  );

  const handleNavigation = (href: string) => {
    if (isMobile && onClose) {
      onClose();
    }
    window.location.href = href;
  };

  const navLinkClasses = (href: string) => {
    return cn(
      'flex items-center space-x-3 px-3 py-2 rounded-md mt-1',
      href === location
        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
    );
  };

  return (
    <aside id="sidebar" className={sidebarClasses}>
      <nav className="p-4 space-y-1">
        <div className="pb-2 mb-2">
          <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 ml-2 mb-2">
            Main
          </p>
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.href);
              }}
              className={navLinkClasses(item.href)}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.name}</span>
            </a>
          ))}
        </div>

        <div className="pb-2 mb-2 border-t border-slate-200 dark:border-slate-700 pt-2">
          <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 ml-2 mb-2">
            Platforms
          </p>
          {platforms.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 px-3 py-2 rounded-md mt-1"
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.name}</span>
            </a>
          ))}
        </div>

        {/* <div className="pb-2 mb-2 border-t border-slate-200 dark:border-slate-700 pt-2">
          <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 ml-2 mb-2">
            Reports
          </p>
          {reports.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 px-3 py-2 rounded-md mt-1"
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.name}</span>
            </a>
          ))}
        </div> */}

        {/* <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
          <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 ml-2 mb-2">
            Settings
          </p>
          {settings.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 px-3 py-2 rounded-md mt-1"
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.name}</span>
            </a>
          ))}
        </div> */}
      </nav>
    </aside>
  );
}
