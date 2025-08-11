import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a proper document download URL without double slashes
 * @param fileUrl - The file URL from the database (e.g., "/uploads/filename.pdf")
 * @returns Properly formatted download URL
 */
export function getDocumentUrl(fileUrl: string): string {
  if (!fileUrl) return ""
  
  // Remove leading slash if present to avoid double slashes
  const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl
  
  return `/api/documents/download/${cleanFileUrl}`
}

export function formatDate(dateString: string | Date | null | undefined) {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    // Use a consistent format that works on both server and client
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "-"
  }
}

