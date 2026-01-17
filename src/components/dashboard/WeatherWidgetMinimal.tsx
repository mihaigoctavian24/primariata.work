"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun, Wind, Droplets, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  /** User's location (județ, localitate) for weather lookup */
  location?: string;
  /** WeatherAPI.com API key */
  apiKey?: string;
}

/**
 * Minimal Weather Widget - Dashboard Header Integration
 *
 * Features:
 * - Single line display: icon + temperature + city
 * - Hover tooltip with detailed weather info
 * - Compact size for header placement
 * - Dark mode optimized
 * - Smooth animations
 *
 * Usage:
 * <WeatherWidgetMinimal location="București" apiKey={process.env.NEXT_PUBLIC_WEATHER_API_KEY} />
 */
export function WeatherWidgetMinimal({
  location = "București",
  apiKey,
}: WeatherWidgetMinimalProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!apiKey) return;

    const fetchWeather = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)},Romania&lang=ro`
        );

        if (!response.ok) {
          throw new Error("Nu s-au putut obține datele meteo");
        }

        const data = await response.json();

        const weatherData: WeatherData = {
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          feelsLike: Math.round(data.current.feelslike_c),
          location: data.location.name,
        };

        setWeather(weatherData);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [location, apiKey]);

  // Don't render if no API key
  if (!apiKey) return null;

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2"
      >
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        <span className="text-muted-foreground text-sm">Se încarcă...</span>
      </motion.div>
    );
  }

  // No weather data
  if (!weather) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground hover:text-foreground group flex cursor-default items-center gap-2 transition-colors"
          >
            {/* Weather icon */}
            <div className="flex-shrink-0">{getWeatherIcon(weather.condition)}</div>

            {/* Temperature + Location */}
            <span className="text-sm font-medium">
              {weather.temperature}°C {weather.location}
            </span>
          </motion.div>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="end"
          className="bg-popover border-border w-64 border p-3 shadow-md"
        >
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground text-sm font-semibold">{weather.location}</p>
                <p className="text-muted-foreground text-xs capitalize">{weather.description}</p>
              </div>
              <div className="bg-muted/50 flex h-10 w-10 items-center justify-center rounded-full">
                {getWeatherIcon(weather.condition, "large")}
              </div>
            </div>

            {/* Temperature */}
            <div>
              <p className="text-foreground text-2xl font-bold">{weather.temperature}°C</p>
              <p className="text-muted-foreground text-xs">Se simte ca {weather.feelsLike}°C</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Humidity */}
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-muted-foreground text-xs">Umiditate</p>
                  <p className="text-foreground text-sm font-semibold">{weather.humidity}%</p>
                </div>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-cyan-500" />
                <div>
                  <p className="text-muted-foreground text-xs">Vânt</p>
                  <p className="text-foreground text-sm font-semibold">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Get weather icon based on condition (WeatherAPI.com Romanian text)
 */
function getWeatherIcon(condition: string, size: "normal" | "large" = "normal") {
  const iconSize = size === "large" ? "h-6 w-6" : "h-5 w-5";
  const iconClass = `${iconSize} text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors`;

  const cond = condition.toLowerCase();

  // Check for weather conditions in Romanian
  if (cond.includes("senin") || cond.includes("însorit")) {
    return <Sun className={iconClass} />;
  }
  if (cond.includes("acoperit") || cond.includes("nori") || cond.includes("înnorat")) {
    return <Cloud className={iconClass} />;
  }
  if (cond.includes("ploaie") || cond.includes("burniță")) {
    return <CloudRain className={iconClass} />;
  }
  if (cond.includes("zăpadă") || cond.includes("ninsoare")) {
    return <CloudSnow className={iconClass} />;
  }
  if (cond.includes("furtună") || cond.includes("tunet")) {
    return <CloudRain className={`${iconClass} animate-pulse`} />;
  }

  return <CloudSun className={iconClass} />;
}
