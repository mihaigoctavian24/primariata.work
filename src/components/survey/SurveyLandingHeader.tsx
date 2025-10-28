"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

/**
 * SurveyLandingHeader Component
 *
 * Header for survey landing page with:
 * - Theme toggle
 * - Admin badge (link to dashboard)
 * - Sticky positioning with backdrop blur
 */
export function SurveyLandingHeader() {
  return (
    <motion.header
      className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-end px-4">
        {/* Theme Toggle + Admin Badge */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Link href="/auth/login?redirectTo=/admin/survey">
            <Badge
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground cursor-pointer gap-1.5 transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Badge>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
