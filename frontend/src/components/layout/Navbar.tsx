import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "../../hooks/use-theme";

interface NavbarProps {
  toggleSidebar: () => void;
  showAuthModal: () => void;
  isAuthenticated: boolean;
  userData?: {
    name: string;
    avatar: string;
  };
}

export default function Navbar({ toggleSidebar, showAuthModal }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Read user data
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData") as string)
    : null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              id="sidebar-toggle"
              className="lg:hidden text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400"
              onClick={toggleSidebar}
            >
              <i className="ri-menu-line text-2xl"></i>
            </button>
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  SocialPulse
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search metrics, platforms..."
                className="w-full py-2 pl-10 pr-4 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-slate-400"></i>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme toggle */}

            <button
              onClick={toggleTheme}
              className="relative flex items-center h-8 w-16 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors"
            >
              <i className="ri-moon-line absolute left-2 text-slate-600 dark:text-slate-300 text-sm"></i>
              <i className="ri-sun-line absolute right-2 text-yellow-400 dark:text-slate-400 text-sm"></i>

              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-200 shadow-md transition-transform duration-300 ease-in-out ${
                  theme === "dark" ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>

            {/* Notifications */}
            {/* <div className="relative">
              <button
                className="p-2 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Notifications
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        New follower spike
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Your Instagram account gained 250+ followers today
                      </p>
                    </div>
                    <div className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Weekly report ready
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Your analytics report for last week is ready to view
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div> */}

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

            {/* Authenticated User */}
            {token && userData ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 hover:text-primary-600 dark:hover:text-primary-400"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <img
                    src={
                      userData.avatar ||
                      `https://ui-avatars.com/api/?name=${userData.name}`
                    }
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className="hidden md:block text-sm font-medium">
                    {userData.name}
                  </span>
                  <i className="ri-arrow-down-s-line hidden md:block"></i>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={showAuthModal}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
              >
                <i className="ri-login-box-line"></i>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
