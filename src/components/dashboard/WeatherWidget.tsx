"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  conditionCode: number;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
  recommendation?: string;
}

interface WeatherWidgetProps {
  /** User's location (județ, localitate) for weather lookup */
  location?: string;
  /** WeatherAPI.com API key */
  apiKey?: string;
  /** Show as compact banner */
  compact?: boolean;
  /** Allow dismissal */
  dismissible?: boolean;
}

/**
 * Weather Widget - Fun Factor Enhancement
 *
 * Features:
 * - Current weather conditions
 * - Temperature and humidity
 * - Weather-based activity recommendations
 * - Compact banner design
 * - WeatherAPI.com integration
 * - Dismissible
 *
 * Weather-based recommendations:
 * - Sunny → "Zi frumoasă pentru deplasări la primărie!"
 * - Rainy → "Folosește sistemul online pentru cereri"
 * - Cold → "Plătește taxele online din confortul casei"
 */
export function WeatherWidget({
  location = "București",
  apiKey,
  compact = true,
  dismissible = true,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in localStorage
    const dismissed = localStorage.getItem("weather-widget-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (isDismissed || !apiKey) return;

    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // WeatherAPI.com API call
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
          conditionCode: data.current.condition.code,
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          location: data.location.name,
          icon: data.current.condition.icon,
          recommendation: getRecommendation(data.current.condition.text, data.current.temp_c),
        };

        setWeather(weatherData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare necunoscută");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [location, apiKey, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("weather-widget-dismissed", "true");
  };

  // Don't render if dismissed or no API key
  if (isDismissed || !apiKey) return null;

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="border-border rounded-lg border bg-gradient-to-r from-blue-50 to-cyan-50 p-3 dark:from-blue-950/30 dark:to-cyan-950/30"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-muted-foreground text-sm">Se încarcă vremea...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="rounded-md p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
              aria-label="Închide"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // No weather data
  if (!weather) return null;

  // Compact banner mode
  if (compact) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-border overflow-hidden rounded-lg border bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 shadow-sm dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-blue-950/30"
        >
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              {/* Weather icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-black/20">
                {getWeatherIcon(weather.condition)}
              </div>

              {/* Weather info */}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-foreground text-lg font-bold">{weather.temperature}°C</p>
                  <span className="text-muted-foreground text-sm">{weather.location}</span>
                </div>
                <p className="text-muted-foreground text-xs capitalize">{weather.description}</p>
              </div>
            </div>

            {/* Recommendation */}
            {weather.recommendation && (
              <div className="hidden flex-1 md:block">
                <p className="text-sm text-blue-700 italic dark:text-blue-300">
                  💡 {weather.recommendation}
                </p>
              </div>
            )}

            {/* Dismiss button */}
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground flex-shrink-0 rounded-md p-1 hover:bg-white/50 dark:hover:bg-black/20"
                aria-label="Închide"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile recommendation */}
          {weather.recommendation && (
            <div className="border-border border-t bg-white/30 px-3 py-2 md:hidden dark:bg-black/10">
              <p className="text-xs text-blue-700 italic dark:text-blue-300">
                💡 {weather.recommendation}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Full widget mode (not compact)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="border-border bg-card overflow-hidden rounded-lg border shadow-sm"
      >
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-black/20">
                {getWeatherIcon(weather.condition, "large")}
              </div>
              <div>
                <p className="text-foreground text-3xl font-bold">{weather.temperature}°C</p>
                <p className="text-muted-foreground text-sm">{weather.location}</p>
              </div>
            </div>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 hover:bg-white/50 dark:hover:bg-black/20"
                aria-label="Închide"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-foreground mt-2 text-sm capitalize">{weather.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-muted-foreground text-xs">Umiditate</p>
              <p className="text-foreground text-sm font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-cyan-500" />
            <div>
              <p className="text-muted-foreground text-xs">Vânt</p>
              <p className="text-foreground text-sm font-semibold">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        {weather.recommendation && (
          <div className="border-border bg-muted/30 border-t p-3">
            <p className="text-sm text-blue-700 italic dark:text-blue-300">
              💡 {weather.recommendation}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get weather icon based on condition (WeatherAPI.com Romanian text)
 */
function getWeatherIcon(condition: string, size: "normal" | "large" = "normal") {
  const iconSize = size === "large" ? "h-7 w-7" : "h-5 w-5";
  const iconClass = `${iconSize} text-blue-600 dark:text-blue-400`;

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

/**
 * Get activity recommendation based on weather (WeatherAPI.com Romanian text)
 */
function getRecommendation(condition: string, temperature: number): string {
  const cond = condition.toLowerCase();

  if ((cond.includes("senin") || cond.includes("însorit")) && temperature > 15) {
    return "Zi frumoasă pentru deplasări la primărie!";
  }

  if (cond.includes("ploaie") || cond.includes("burniță")) {
    return "Folosește sistemul online pentru cereri";
  }

  if (cond.includes("zăpadă") || temperature < 5) {
    return "Plătește taxele online din confortul casei";
  }

  if (cond.includes("furtună") || cond.includes("tunet")) {
    return "Rămâi acasă! Gestionează cererile online";
  }

  if (temperature > 30) {
    return "Evită deplasările - rezolvă tot online!";
  }

  return "Platformă disponibilă 24/7 pentru cereri și plăți";
}
