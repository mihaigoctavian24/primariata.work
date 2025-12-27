"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, FileText, CreditCard, Bell, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

/**
 * Dashboard Home Page
 *
 * Main dashboard with overview:
 * - Welcome message
 * - Quick stats
 * - Recent activity
 */

interface DashboardPageProps {
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

interface DashboardStats {
  cereriActive: number;
  cereriTotal: number;
  documenteTotal: number;
  platiPending: number;
  notificariUnread: number;
}

export default function DashboardPage({ params: _params }: DashboardPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; email: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    cereriActive: 0,
    cereriTotal: 0,
    documenteTotal: 0,
    platiPending: 0,
    notificariUnread: 0,
  });
  const [isBackHovered, setIsBackHovered] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          email: authUser.email || "",
          full_name: authUser.user_metadata?.full_name,
        });

        // Fetch stats (mock data for now - will be replaced with real queries)
        setStats({
          cereriActive: 2,
          cereriTotal: 5,
          documenteTotal: 8,
          platiPending: 1,
          notificariUnread: 3,
        });
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      icon: FileText,
      label: "Cereri Active",
      value: stats.cereriActive,
      total: stats.cereriTotal,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Home,
      label: "Documente",
      value: stats.documenteTotal,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: CreditCard,
      label: "Plăți Pending",
      value: stats.platiPending,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      icon: Bell,
      label: "Notificări Noi",
      value: stats.notificariUnread,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
  ];

  return (
    <>
      {/* Page Header - Fixed */}
      <div
        className="px-4 py-6 sm:px-6 lg:px-8"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%)",
        }}
      >
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Bine ai revenit{user?.full_name ? `, ${user.full_name}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Aici găsești toate serviciile primăriei tale
            </p>
          </motion.div>

          {/* Back Button */}
          <motion.button
            onClick={() => router.back()}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <motion.div
              animate={{ x: isBackHovered ? -8 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </motion.div>
            Înapoi
          </motion.button>
        </div>
      </div>

      {/* Page Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">{stat.value}</p>
                          {stat.total !== undefined && (
                            <p className="text-muted-foreground text-sm">/ {stat.total}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="mb-4 text-xl font-semibold">Acțiuni Rapide</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:border-primary cursor-pointer p-6 transition-colors">
                <h3 className="mb-2 font-semibold">Cerere Nouă</h3>
                <p className="text-muted-foreground text-sm">Trimite o cerere către primărie</p>
              </Card>
              <Card className="hover:border-primary cursor-pointer p-6 transition-colors">
                <h3 className="mb-2 font-semibold">Vezi Documente</h3>
                <p className="text-muted-foreground text-sm">Accesează documentele tale</p>
              </Card>
              <Card className="hover:border-primary cursor-pointer p-6 transition-colors">
                <h3 className="mb-2 font-semibold">Plătește Online</h3>
                <p className="text-muted-foreground text-sm">Achită taxele și impozitele</p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
