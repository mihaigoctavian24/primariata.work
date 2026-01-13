import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/plati-monthly?months=6
 *
 * Returns monthly aggregated payments for Plăți Overview Chart
 *
 * Query params:
 * - months: number of months to retrieve (default: 6, max: 12)
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     monthly: [
 *       {
 *         month: string (YYYY-MM),
 *         month_label: string (Ian 2025),
 *         total_suma: number,
 *         total_plati: number,
 *         success_count: number,
 *         pending_count: number,
 *         success_suma: number,
 *         pending_suma: number
 *       }
 *     ],
 *     summary: {
 *       total_year: number,
 *       total_month_current: number,
 *       upcoming_payments: number
 *     }
 *   }
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get("months");
    const months = Math.min(Math.max(parseInt(monthsParam || "6"), 1), 12);

    // Calculate date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Fetch plăți in date range
    const { data: plati, error: platiError } = await supabase
      .from("plati")
      .select("suma, status, created_at")
      .eq("utilizator_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (platiError) {
      console.error("Error fetching plati monthly:", platiError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch payments data" },
        { status: 500 }
      );
    }

    // Group by month
    const monthlyData = new Map<string, MonthlyPayment>();

    // Initialize all months in range with zero values
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const monthKey = formatMonthKey(date);
      const monthLabel = formatMonthLabel(date);

      monthlyData.set(monthKey, {
        month: monthKey,
        month_label: monthLabel,
        total_suma: 0,
        total_plati: 0,
        success_count: 0,
        pending_count: 0,
        success_suma: 0,
        pending_suma: 0,
      });
    }

    // Aggregate plăți data
    plati.forEach((plata) => {
      const date = new Date(plata.created_at);
      const monthKey = formatMonthKey(date);

      const monthData = monthlyData.get(monthKey);
      if (monthData) {
        monthData.total_plati += 1;

        // Track sums separately by status
        if (plata.status === "success") {
          monthData.success_suma += plata.suma;
          monthData.success_count += 1;
        } else if (plata.status === "pending" || plata.status === "processing") {
          monthData.pending_suma += plata.suma;
          monthData.pending_count += 1;
        }

        // Total suma = success + pending
        monthData.total_suma = monthData.success_suma + monthData.pending_suma;
      }
    });

    // Convert to array and sort by month
    const monthly = Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate summary stats
    const currentYear = new Date().getFullYear();
    const currentMonth = formatMonthKey(new Date());

    const totalYear = plati
      .filter((p) => p.status === "success" && new Date(p.created_at).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.suma, 0);

    const totalMonthCurrent = plati
      .filter(
        (p) => p.status === "success" && formatMonthKey(new Date(p.created_at)) === currentMonth
      )
      .reduce((sum, p) => sum + p.suma, 0);

    const upcomingPayments = plati.filter(
      (p) => p.status === "pending" || p.status === "processing"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        monthly,
        summary: {
          total_year: totalYear,
          total_month_current: totalMonthCurrent,
          upcoming_payments: upcomingPayments,
        },
      },
    });
  } catch (error) {
    console.error("Unexpected error in plati-monthly:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Format date to month key (YYYY-MM)
 */
function formatMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Format date to month label (Ian 2025)
 */
function formatMonthLabel(date: Date): string {
  const monthNames = [
    "Ian",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Iun",
    "Iul",
    "Aug",
    "Sep",
    "Oct",
    "Noi",
    "Dec",
  ];
  const monthName = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${monthName} ${year}`;
}

/**
 * TypeScript interface for monthly payment data
 */
interface MonthlyPayment {
  month: string;
  month_label: string;
  total_suma: number;
  total_plati: number;
  success_count: number;
  pending_count: number;
  success_suma: number;
  pending_suma: number;
}
