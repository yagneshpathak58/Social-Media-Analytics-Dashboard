import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

interface AuthModalProps {
  onLogin: () => void;
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/users/login", data);
      return response.json(); // returning parsed response
    },
    onSuccess: (data) => {
      console.log("Login success response:", data);

      // Save token and userData to localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      toast({
        title: "Login successful",
        description: "You've been logged in successfully",
      });
      onLogin();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description:
          error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      const response = await apiRequest("POST", "/users/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now login",
      });
      setIsSignUp(false);
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description:
          error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (isSignUp) {
      signupMutation.mutate(data);
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isSignUp ? "Create an Account" : "Sign In to SocialPulse"}
          </DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Create an account to access your social media analytics dashboard"
              : "Enter your credentials to access your dashboard"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name", { required: isSignUp })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">Name is required</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
            />
            {errors.email?.type === "required" && (
              <p className="text-sm text-red-500">Email is required</p>
            )}
            {errors.email?.type === "pattern" && (
              <p className="text-sm text-red-500">Please enter a valid email</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {!isSignUp && (
                <a
                  href="#"
                  className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: true,
                minLength: isSignUp ? 8 : undefined,
              })}
            />
            {errors.password?.type === "required" && (
              <p className="text-sm text-red-500">Password is required</p>
            )}
            {errors.password?.type === "minLength" && (
              <p className="text-sm text-red-500">
                Password must be at least 8 characters
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending || signupMutation.isPending}
          >
            {loginMutation.isPending || signupMutation.isPending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary-600 dark:text-primary-400"
                onClick={() => setIsSignUp(false)}
              >
                Sign in
              </Button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary-600 dark:text-primary-400"
                onClick={() => setIsSignUp(true)}
              >
                Create one
              </Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
