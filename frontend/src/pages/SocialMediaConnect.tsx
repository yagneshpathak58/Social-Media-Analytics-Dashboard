import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useMutation } from "@tanstack/react-query";

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
  const [isconnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({}) as any;
  console.log("userData", userData);

  useEffect(() => {
    const connected =
      localStorage.getItem(`connected_${activePlatform}`) === "true";
    setIsConnected(connected);
  }, [activePlatform]);

  const connectAccountMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      const response = await apiRequest(
        "POST",
        `/users/social-account`,
        {
          userId: userData?.id,
          platform: "Twitter",
        },
        true
      );
      return response.json(); // return parsed JSON
    },
    onSuccess: (data) => {
      console.log("data", data);
      if (data.oauthUrl) {
        // Redirect to the OAuth URL
        window.location.href = data.oauthUrl;
      } else {
        toast({
          title: `Error`,
          description: `Failed to connect to ${activePlatform}.`,
        });
      }
      setIsConnecting(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
      setIsConnecting(false);
    },
  });

  const fetchPostsMutation = useMutation({
    mutationFn: async () => {
      setIsFetchingPosts(true);
      const res = await apiRequest(
        "GET",
        `/posts/initiate-twitter-post?userId=${userData?.id}`,
        null,
        true
      );
      return res.json(); // return parsed JSON
    },
    onSuccess: (data) => {
      console.log("data", data);
      if (data.oauthUrl) {
        // Redirect to the OAuth URL
        window.location.href = data.oauthUrl;
      } else {
        console.log("Fetched Twitter posts:", data);
        toast({
          title: "Posts fetched",
          description: `Successfully fetched ${
            data?.length || 0
          } posts from Twitter.`,
        });
      }
      setIsFetchingPosts(false);
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: "Error",
        description: "Failed to fetch Twitter posts.",
        variant: "destructive",
      });
      setIsFetchingPosts(false);
    },
  });

  useEffect(() => {
    const storedAccounts = localStorage.getItem("socialMediaAccounts");
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUserData(JSON.parse(userData));
    }
    if (storedAccounts) {
      try {
        const accounts = JSON.parse(storedAccounts);
        const found = accounts.some(
          (acc: any) => acc.platform.toLowerCase() === activePlatform
        );
        setIsConnected(found);
      } catch (e) {
        console.error("Invalid socialMediaAccounts in localStorage");
      }
    } else {
      setIsConnected(false);
    }
  }, [activePlatform]);

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
              <div>
                <p className="text-green-600 dark:text-green-400 mb-4">
                  Your {activePlatform} account is connected.
                </p>
                {activePlatform === "twitter" && (
                  <Button onClick={() => fetchPostsMutation.mutate()}>
                    {isFetchingPosts
                      ? "Fetching Posts..."
                      : "Fetch Twitter Posts"}
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  You have not connected your {activePlatform} account yet.
                </p>
                <Button onClick={() => connectAccountMutation.mutate()}>
                  {isconnecting ? "Connecting..." : `Connect ${activePlatform}`}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
