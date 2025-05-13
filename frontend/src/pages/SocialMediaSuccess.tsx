import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";

export default function SocialMediaSuccess() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const account = {
      platform: params.get("platform"),
      username: params.get("username"),
      accessToken: params.get("accessToken"),
      refreshToken: params.get("refreshToken"),
    };

    if (
      account.platform &&
      account.username &&
      account.accessToken &&
      account.refreshToken
    ) {
      localStorage.setItem("socialMediaAccounts", JSON.stringify([account]));

      toast({
        title: "Authentication Complete",
        description: "Social media account connected successfully",
      });

      setTimeout(() => {
        navigate("/socialmedia");
      }, 2000);
    } else {
      toast({
        title: "Error",
        description: "Missing data in authentication response",
        variant: "destructive",
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        showAuthModal={() => {}}
        isAuthenticated={isAuthenticated}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobile={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Authenticating...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we complete the connection.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
