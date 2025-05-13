// pages/ProfilePage.tsx

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { apiRequest } from "../lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  socialMediaAccounts?: string[];
}

interface FormData {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        if (user?.id) {
          setUserId(user.id);
          setUserData(user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Invalid userData in localStorage");
      }
    }
  }, []);

  const { isLoading } = useQuery<User>({
    queryKey: ["userProfile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<User> => {
      const res = await apiRequest("GET", `/users/${userId}`, undefined, true);
      const data: User = await res.json();
      reset({ name: data.name, email: data.email });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: FormData): Promise<User> => {
      const res = await apiRequest(
        "PUT",
        `/users/${userId}`,
        updatedData,
        true
      );
      const result: User = await res.json();
      localStorage.setItem("userData", JSON.stringify(result));
      setUserData(result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      reset({ name: data.name, email: data.email });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<FormData> = (formData) => {
    updateMutation.mutate(formData);
  };

  if (isLoading || !userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        showAuthModal={() => setShowAuthModal(true)}
        isAuthenticated={isAuthenticated}
        // userData={userData}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isMobile={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Profile Form Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-6">
          <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
            <div className="flex items-center gap-4 mb-8">
              <img
                src="https://img.icons8.com/ios-filled/50/user-male-circle.png"
                alt="Profile avatar"
                className="w-16 h-16 rounded-full border"
              />
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Profile
                </h2>
                <p className="text-muted-foreground">
                  Manage your personal details
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>

              <Button
                type="submit"
                disabled={!isDirty || isSubmitting || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
