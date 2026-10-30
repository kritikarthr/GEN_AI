
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

interface ShareItineraryButtonProps {
  destination: string
}

export default function ShareItineraryButton({
  destination,
}: ShareItineraryButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `My ${destination} Itinerary`,
          text: `Check out my travel itinerary for ${destination}!`,
          url,
        })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return
      }

      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2500)
      } catch {
        window.prompt("Copy your itinerary link:", url)
      }
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleShare}>
      {copied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Share2 className="mr-2 h-4 w-4" />
      )}
      {copied ? "Link Copied!" : "Share"}
    </Button>
  )
}
