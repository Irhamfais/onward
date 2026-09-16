import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndonesian(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTimeIndonesian(dateString: string | Date): string {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${formattedDate}, ${hours}:${minutes}`;
}
