import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";
import Sentiment from "./pages/Sentiment";
import Trends from "./pages/Trends";
import { ThemeProvider } from "./hooks/use-theme";
import AuthModal from "./components/auth/AuthModal";
import ProfilePage from "./pages/ProfilePage";
import SocialMediaConnect from "./pages/SocialMediaConnect";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated && (
        <AuthModal onLogin={() => setIsAuthenticated(true)} />
      )}
      {isAuthenticated && (
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/sentiment" component={Sentiment} />
          <Route path="/trends" component={Trends} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/socialmedia" component={SocialMediaConnect} />
          <Route component={NotFound} />
        </Switch>
      )}
      {/* <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div> */}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
