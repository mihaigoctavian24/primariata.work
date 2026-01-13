"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, CheckCircle, Rocket, FileCheck, TrendingUp, Award } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-100 for achievements in progress
  requirement: string;
}

interface UserStats {
  totalPoints: number;
  cereriCount: number;
  cereriFinalized: number;
  platiOnTime: number;
  consecutiveMonthsOnTime: number;
  documentsOnTime: number;
  totalDocuments: number;
  averageRating: number;
}

interface CitizenBadgeWidgetProps {
  /** User statistics for achievement calculation */
  stats: UserStats;
  /** Compact mode - shows only current level */
  compact?: boolean;
}

// Level thresholds based on points
const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: "Începător", icon: "🌱" },
  { level: 2, points: 50, title: "Cetățean Activ", icon: "🏃" },
  { level: 3, points: 150, title: "Cetățean Model", icon: "⭐" },
  { level: 4, points: 300, title: "Expert Administrativ", icon: "🚀" },
  { level: 5, points: 500, title: "Legendă Locală", icon: "👑" },
];

/**
 * Citizen Badge Widget - Gamification System
 *
 * Features:
 * - User level progression based on points
 * - Achievement badges (4 types)
 * - Progress tracking toward next level
 * - Animated badge display
 * - Motivational feedback
 *
 * Achievements:
 * - ⭐ Prima cerere depusă (+10 pts)
 * - ✅ Plăți la zi 12 luni (+50 pts)
 * - 🚀 Expert în autorizații >5 cereri (+30 pts)
 * - 📄 Organizat - docs la timp (+20 pts)
 */
export function CitizenBadgeWidget({ stats, compact = false }: CitizenBadgeWidgetProps) {
  // Calculate current level and progress
  const levelData = useMemo(() => {
    let currentLevel = LEVEL_THRESHOLDS[0]!;
    let nextLevel = LEVEL_THRESHOLDS[1]!;

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      const level = LEVEL_THRESHOLDS[i];
      if (level && stats.totalPoints >= level.points) {
        currentLevel = level;
        nextLevel = LEVEL_THRESHOLDS[i + 1] || currentLevel;
      }
    }

    const pointsInCurrentLevel = stats.totalPoints - currentLevel.points;
    const pointsNeededForNext = nextLevel.points - currentLevel.points;
    const progress =
      currentLevel.level === 5 ? 100 : (pointsInCurrentLevel / pointsNeededForNext) * 100;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(progress, 100),
      pointsToNext: Math.max(0, nextLevel.points - stats.totalPoints),
    };
  }, [stats.totalPoints]);

  // Calculate achievements based on user stats
  const achievements = useMemo<Achievement[]>(() => {
    return [
      {
        id: "first-cerere",
        name: "Prima Cerere",
        description: "Ai depus prima ta cerere",
        icon: <Star className="h-5 w-5" />,
        points: 10,
        unlocked: stats.cereriCount > 0,
        requirement: "Depune prima cerere",
      },
      {
        id: "plati-on-time",
        name: "Plăți la Zi",
        description: "12 luni consecutive de plăți la timp",
        icon: <CheckCircle className="h-5 w-5" />,
        points: 50,
        unlocked: stats.consecutiveMonthsOnTime >= 12,
        progress: (stats.consecutiveMonthsOnTime / 12) * 100,
        requirement: `${stats.consecutiveMonthsOnTime}/12 luni consecutive`,
      },
      {
        id: "expert-autorizatii",
        name: "Expert în Autorizații",
        description: "Ai finalizat peste 5 cereri cu succes",
        icon: <Rocket className="h-5 w-5" />,
        points: 30,
        unlocked: stats.cereriFinalized > 5,
        progress: (Math.min(stats.cereriFinalized, 5) / 5) * 100,
        requirement: `${stats.cereriFinalized}/5 cereri finalizate`,
      },
      {
        id: "organizat",
        name: "Cetățean Organizat",
        description: "Toate documentele uploadate la timp",
        icon: <FileCheck className="h-5 w-5" />,
        points: 20,
        unlocked: stats.totalDocuments > 0 && stats.documentsOnTime === stats.totalDocuments,
        progress:
          stats.totalDocuments > 0 ? (stats.documentsOnTime / stats.totalDocuments) * 100 : 0,
        requirement: `${stats.documentsOnTime}/${stats.totalDocuments} documente la timp`,
      },
    ];
  }, [stats]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  if (compact) {
    return (
      <div className="border-border from-primary/5 to-primary/10 rounded-lg border bg-gradient-to-br p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
            {levelData.current.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-foreground font-semibold">Nivel {levelData.current.level}</h4>
              <span className="text-muted-foreground text-sm">{levelData.current.title}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelData.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="from-primary to-primary/60 h-full bg-gradient-to-r"
                />
              </div>
              <span className="text-muted-foreground text-xs font-medium">
                {levelData.current.level === 5 ? "MAX" : `${levelData.pointsToNext} pts`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
      {/* Header with Level Info */}
      <div className="border-border from-primary/10 to-primary/5 border-b bg-gradient-to-br p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-inner">
              {levelData.current.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-lg font-bold">
                  Nivel {levelData.current.level}
                </h3>
                <Trophy className="text-primary h-4 w-4" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">{levelData.current.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary text-2xl font-bold">{stats.totalPoints}</p>
            <p className="text-muted-foreground text-xs">puncte totale</p>
          </div>
        </div>

        {/* Progress Bar to Next Level */}
        {levelData.current.level < 5 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progres către {levelData.next.title}</span>
              <span className="text-foreground font-medium">{Math.round(levelData.progress)}%</span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelData.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="from-primary via-primary/80 to-primary/60 h-full bg-gradient-to-r"
              />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Încă {levelData.pointsToNext} puncte până la nivelul următor
            </p>
          </div>
        )}

        {levelData.current.level === 5 && (
          <div className="mt-4 text-center">
            <div className="bg-primary/20 inline-flex items-center gap-2 rounded-full px-4 py-2">
              <Award className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-semibold">Nivel Maxim Atins! 🎉</span>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-foreground text-sm font-semibold">Realizări</h4>
          <span className="text-muted-foreground text-xs">
            {unlockedCount}/{totalAchievements} deblocate
          </span>
        </div>

        <div className="space-y-3">
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="border-border bg-muted/30 border-t p-3">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <TrendingUp className="text-primary h-4 w-4" />
          <span>
            {unlockedCount === totalAchievements
              ? "Felicitări! Ai deblocat toate realizările! 🎉"
              : `Continuă așa! Mai ai ${totalAchievements - unlockedCount} realizări de deblocat.`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual achievement badge component
 */
function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
        achievement.unlocked
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-border bg-muted/30"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          achievement.unlocked
            ? "bg-primary/20 text-primary shadow-inner"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {achievement.icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5
              className={`text-sm font-semibold ${
                achievement.unlocked ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {achievement.name}
            </h5>
            <p className="text-muted-foreground mt-0.5 text-xs">{achievement.description}</p>
          </div>
          {achievement.unlocked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex-shrink-0"
            >
              <div className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                +{achievement.points}
              </div>
            </motion.div>
          )}
        </div>

        {/* Progress bar for partially unlocked achievements */}
        {!achievement.unlocked && achievement.progress !== undefined && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{achievement.requirement}</span>
              <span className="text-foreground font-medium">
                {Math.round(achievement.progress)}%
              </span>
            </div>
            <div className="bg-muted h-1 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="from-primary/60 to-primary/40 h-full bg-gradient-to-r"
              />
            </div>
          </div>
        )}

        {!achievement.unlocked && achievement.progress === undefined && (
          <p className="text-muted-foreground mt-1 text-xs">{achievement.requirement}</p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Helper function to get category icon
 */
function getCategoryIcon(category: string) {
  switch (category) {
    case "cereri":
      return <FileCheck className="h-3 w-3" />;
    case "plati":
      return <CheckCircle className="h-3 w-3" />;
    case "general":
      return <Trophy className="h-3 w-3" />;
    default:
      return <Star className="h-3 w-3" />;
  }
}
