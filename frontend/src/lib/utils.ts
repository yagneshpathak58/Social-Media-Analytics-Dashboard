import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function formatDateRange(days: number): string {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - days);
  
  return `${pastDate.toLocaleDateString()} - ${today.toLocaleDateString()}`;
}

export const socialPlatformIcons = {
  twitter: "ri-twitter-x-line",
  instagram: "ri-instagram-line",
  facebook: "ri-facebook-circle-line",
  linkedin: "ri-linkedin-box-line"
};

export const socialPlatformColors = {
  twitter: "text-slate-800 dark:text-white",
  instagram: "text-pink-500",
  facebook: "text-blue-600",
  linkedin: "text-blue-700"
};
