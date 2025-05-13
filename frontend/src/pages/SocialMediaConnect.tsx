import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const platforms = ["twitter", "facebook", "linkedin"] as const;
type Platform = (typeof platforms)[number];

const platformIcons: Record<Platform, string> = {
  twitter: "https://img.icons8.com/ios-filled/50/twitterx--v1.png",
  facebook: "https://img.icons8.com/color/48/facebook-new.png",
  linkedin: "https://img.icons8.com/fluency/48/linkedin.png",
};

export default function SocialMediaConnectPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>("twitter");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({}) as any; // Replace with actual user data if needed

  useEffect(() => {
    const connected =
      localStorage.getItem(`connected_${activePlatform}`) === "true";
    setIsConnected(connected);
  }, [activePlatform]);

  const handleConnect = async () => {
    try {
      const res = (await apiRequest(
        "POST",
        `/users/social-account`,
        {
          userId: userData?.id,
          platform: "Twitter",
        },
        true
      )) as any;

      if (res.success) {
        localStorage.setItem(`connected_${activePlatform}`, "true");
        setIsConnected(true);
        toast({
          title: `Success`,
          description: `Your ${activePlatform} is now connected.`,
        });
      } else {
        toast({
          title: `Error`,
          description: `Failed to connect to ${activePlatform}.`,
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong." });
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const user: any = JSON.parse(stored);
        if (user?.id) {
          setUserData(user);
        }
      } catch (e) {
        console.error("Invalid userData in localStorage");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        // isAuthenticated={isAuthenticated}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobile={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Connect Your Social Media
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and connect your social media accounts.
            </p>
          </div>

          {/* Top Tabs */}
          <div className="flex space-x-3 mb-6 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {platforms.map((platform) => {
              const isActive = activePlatform === platform;
              return (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 whitespace-nowrap
          ${
            !isActive
              ? "bg-primary-300 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
              : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          }
        `}
                >
                  <img
                    src={platformIcons[platform]}
                    alt={`${platform} icon`}
                    className="w-4 h-4 mr-2"
                  />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-md shadow-md border border-slate-200 dark:border-slate-700">
            {isConnected ? (
              <p className="text-green-600 dark:text-green-400">
                Your {activePlatform} account is connected.
              </p>
            ) : (
              <div>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  You have not connected your {activePlatform} account yet.
                </p>
                <Button onClick={handleConnect}>
                  Connect {activePlatform}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
