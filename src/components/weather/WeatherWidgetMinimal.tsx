"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun, Wind, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * WeatherWidgetMinimal Component
 *
 * Minimal weather display for dashboard header with hover tooltip
 * - Single line: icon + temperature + city
 * - Hover tooltip: full details (condition, humidity, wind, feels like)
 * - Responsive: hidden on mobile (<768px), shown on tablet+
 * - Dark mode optimized
 * - Uses WeatherAPI.com (same as original WeatherWidget)
 */

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  location: string;
}

interface WeatherWidgetMinimalProps {
  location?: string;
  className?: string;
}

export function WeatherWidgetMinimal({
  location = "București",
  className,
}: WeatherWidgetMinimalProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check user preference for weather widget visibility
  useEffect(() => {
    const checkVisibility = () => {
      const weatherDismissed = localStorage.getItem("weather-widget-dismissed") === "true";
      setIsVisible(!weatherDismissed);
    };

    // Check initially
    checkVisibility();

    // Listen for storage changes (when user toggles in settings)
    window.addEventListener("storage", checkVisibility);

    // Also listen for custom event when settings change in same tab
    const handleSettingsChange = () => checkVisibility();
    window.addEventListener("weather-widget-settings-changed", handleSettingsChange);

    return () => {
      window.removeEventListener("storage", checkVisibility);
      window.removeEventListener("weather-widget-settings-changed", handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      if (!location) {
        setLoading(false);
        return;
      }

      try {
        // Use WeatherAPI.com (same as original WeatherWidget)
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          console.warn("⚠️ WeatherAPI.com API key not configured");
          setError(true);
          setLoading(false);
          return;
        }

        // WeatherAPI.com endpoint (same as WeatherWidget.tsx)
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)},Romania&lang=ro`
        );

        if (!response.ok) {
          throw new Error("Weather API request failed");
        }

        const data = await response.json();

        setWeather({
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          feelsLike: Math.round(data.current.feelslike_c),
          location: data.location.name,
        });
        setLoading(false);
      } catch (err) {
        console.error("❌ Weather fetch error:", err);
        setError(true);
        setLoading(false);
      }
    }

    fetchWeather();
  }, [location]);

  // Get weather icon based on condition text (WeatherAPI.com format)
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();

    if (
      conditionLower.includes("senin") ||
      conditionLower.includes("sunny") ||
      conditionLower.includes("clear")
    ) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    }
    if (
      conditionLower.includes("înnorat") ||
      conditionLower.includes("cloud") ||
      conditionLower.includes("overcast")
    ) {
      return <Cloud className="h-4 w-4 text-gray-500" />;
    }
    if (conditionLower.includes("ploaie") || conditionLower.includes("rain")) {
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    }
    if (conditionLower.includes("ninsoare") || conditionLower.includes("snow")) {
      return <CloudSnow className="h-4 w-4 text-blue-300" />;
    }
    if (conditionLower.includes("parțial") || conditionLower.includes("partly")) {
      return <CloudSun className="h-4 w-4 text-yellow-400" />;
    }

    return <Wind className="h-4 w-4 text-gray-400" />;
  };

  // Don't render if user has disabled the widget in settings
  if (!isVisible) {
    return null;
  }

  // Don't render if error
  if (error) {
    return null;
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("hidden items-center gap-1.5 px-2 py-1.5 md:flex", className)}>
        <div className="bg-muted h-4 w-4 animate-pulse rounded-full" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>
    );
  }

  // Don't render if no weather data
  if (!weather) {
    return null;
  }

  // Weather display with tooltip
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "hidden cursor-default items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors md:flex",
              "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              className
            )}
          >
            {getWeatherIcon(weather.condition)}
            <span className="font-medium tabular-nums">{weather.temperature}°C</span>
            <span className="text-xs">{weather.location}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
          <div className="space-y-1.5 text-sm">
            <div className="font-medium">{weather.condition}</div>
            <div className="text-muted-foreground flex items-center gap-2">
              <span>Se simte ca {weather.feelsLike}°C</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {weather.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                {weather.windSpeed} km/h
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
