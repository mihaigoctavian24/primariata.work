"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, FileText, CreditCard, AlertCircle } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "deadline" | "appointment" | "payment" | "reminder";
  description?: string;
  priority?: "high" | "medium" | "low";
  relatedId?: string; // ID of related cerere/plată
}

interface DashboardCalendarProps {
  /** Calendar events to display */
  events?: CalendarEvent[];
  /** Callback when event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Number of days to show (default 30) */
  daysToShow?: number;
}

/**
 * Dashboard Calendar Widget - 30-Day Mini Calendar
 *
 * Features:
 * - 30-day view with current month + next month
 * - Event markers on dates
 * - Hover tooltips with event details
 * - Click for full event details
 * - Different event types (deadlines, appointments, payments, reminders)
 * - Priority indicators (high, medium, low)
 * - Responsive grid layout
 */
export function DashboardCalendar({
  events = [],
  onEventClick,
  daysToShow = 30,
}: DashboardCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar days (30 days starting from today)
  const calendarDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{
      date: Date;
      isToday: boolean;
      isWeekend: boolean;
      events: CalendarEvent[];
    }> = [];

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === date.getTime();
      });

      days.push({
        date,
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        events: dayEvents,
      });
    }

    return days;
  }, [events, daysToShow]);

  // Get events for selected date
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selected.getTime();
    });
  }, [selectedDate, events]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick?.(event);
  };

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    return events
      .filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate <= sevenDaysLater;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  }, [events]);

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
      {/* Header */}
      <div className="border-border bg-muted/30 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary rounded-md p-2">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">Calendar</h3>
            <p className="text-muted-foreground text-xs">Următoarele {daysToShow} zile</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="text-muted-foreground mb-3 grid grid-cols-7 gap-1 text-center text-xs font-medium">
          <div>L</div>
          <div>M</div>
          <div>M</div>
          <div>J</div>
          <div>V</div>
          <div>S</div>
          <div>D</div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={index}
              day={day}
              isSelected={selectedDate?.toDateString() === day.date.toDateString()}
              onClick={() => handleDayClick(day.date)}
            />
          ))}
        </div>
      </div>

      {/* Selected Day Events */}
      <AnimatePresence>
        {selectedDate && selectedDayEvents.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-border overflow-hidden border-t"
          >
            <div className="bg-muted/30 p-3">
              <p className="text-foreground mb-2 text-xs font-medium">
                Evenimente pe {formatDate(selectedDate)}:
              </p>
              <div className="space-y-2">
                {selectedDayEvents.map((event) => (
                  <EventItem key={event.id} event={event} onClick={() => handleEventClick(event)} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="border-border border-t p-4">
          <h4 className="text-foreground mb-3 text-sm font-semibold">Următoarele 7 zile</h4>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <UpcomingEventItem
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="p-8 text-center">
          <CalendarIcon className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <p className="text-foreground mt-3 text-sm font-medium">Niciun eveniment programat</p>
          <p className="text-muted-foreground mt-1 text-xs">Evenimentele tale vor apărea aici</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual calendar day component
 */
function CalendarDay({
  day,
  isSelected,
  onClick,
}: {
  day: {
    date: Date;
    isToday: boolean;
    isWeekend: boolean;
    events: CalendarEvent[];
  };
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasEvents = day.events.length > 0;
  // Check for high priority events (for future styling)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _hasHighPriorityEvent = day.events.some((e) => e.priority === "high");

  return (
    <button
      onClick={onClick}
      className={`group hover:border-primary relative aspect-square rounded-md border text-sm transition-all hover:shadow-sm ${
        day.isToday
          ? "border-primary bg-primary/10 text-primary font-semibold"
          : isSelected
            ? "border-primary bg-primary/5 text-foreground"
            : day.isWeekend
              ? "border-border bg-muted/50 text-muted-foreground"
              : "border-border bg-background text-foreground"
      }`}
      title={
        hasEvents
          ? `${day.events.length} ${day.events.length === 1 ? "eveniment" : "evenimente"}`
          : undefined
      }
    >
      <span className="block">{day.date.getDate()}</span>

      {/* Event markers */}
      {hasEvents && (
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
          {day.events.slice(0, 3).map((event, idx) => (
            <div
              key={idx}
              className={`h-1 w-1 rounded-full ${
                event.priority === "high"
                  ? "bg-red-500"
                  : event.priority === "medium"
                    ? "bg-yellow-500"
                    : "bg-primary"
              }`}
            />
          ))}
        </div>
      )}

      {/* Tooltip on hover */}
      {hasEvents && (
        <div className="border-border bg-popover text-popover-foreground pointer-events-none absolute -top-2 left-1/2 z-10 w-48 -translate-x-1/2 -translate-y-full rounded-md border p-2 text-left text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <div className="space-y-1">
            {day.events.slice(0, 2).map((event) => (
              <div key={event.id} className="flex items-start gap-1">
                {getEventIcon(event.type)}
                <span className="flex-1 truncate">{event.title}</span>
              </div>
            ))}
            {day.events.length > 2 && (
              <p className="text-muted-foreground">+{day.events.length - 2} mai multe</p>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

/**
 * Event item in selected day list
 */
function EventItem({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border-border bg-background hover:bg-muted flex w-full items-start gap-2 rounded-md border p-2 text-left transition-colors"
    >
      <div
        className={`mt-0.5 flex-shrink-0 rounded-md p-1 ${
          event.type === "deadline"
            ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
            : event.type === "payment"
              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              : event.type === "appointment"
                ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                : "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
        }`}
      >
        {getEventIcon(event.type)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium">{event.title}</p>
          {event.priority === "high" && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
        {event.description && (
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{event.description}</p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">{getEventTypeLabel(event.type)}</p>
      </div>
    </button>
  );
}

/**
 * Upcoming event item in next 7 days list
 */
function UpcomingEventItem({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const daysUntil = Math.ceil(
    (event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <button
      onClick={onClick}
      className="border-border bg-background hover:bg-muted flex w-full items-center gap-3 rounded-md border p-2 text-left transition-colors"
    >
      <div className="flex flex-col items-center">
        <p className="text-muted-foreground text-xs font-medium">
          {event.date.toLocaleDateString("ro-RO", { month: "short" })}
        </p>
        <p className="text-foreground text-lg font-bold">{event.date.getDate()}</p>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium">{event.title}</p>
          {event.priority === "high" && <AlertCircle className="h-3 w-3 text-red-500" />}
        </div>
        <p className="text-muted-foreground text-xs">
          {daysUntil === 0 ? "Astăzi" : daysUntil === 1 ? "Mâine" : `Peste ${daysUntil} zile`}
        </p>
      </div>

      <div
        className={`flex-shrink-0 rounded-md p-1.5 ${
          event.type === "deadline"
            ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
            : event.type === "payment"
              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              : event.type === "appointment"
                ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                : "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
        }`}
      >
        {getEventIcon(event.type)}
      </div>
    </button>
  );
}

/**
 * Helper: Get icon for event type
 */
function getEventIcon(type: CalendarEvent["type"]) {
  switch (type) {
    case "deadline":
      return <Clock className="h-3 w-3" />;
    case "appointment":
      return <CalendarIcon className="h-3 w-3" />;
    case "payment":
      return <CreditCard className="h-3 w-3" />;
    case "reminder":
      return <FileText className="h-3 w-3" />;
  }
}

/**
 * Helper: Get label for event type
 */
function getEventTypeLabel(type: CalendarEvent["type"]) {
  switch (type) {
    case "deadline":
      return "Termen limită";
    case "appointment":
      return "Programare";
    case "payment":
      return "Plată";
    case "reminder":
      return "Reminder";
  }
}

/**
 * Helper: Format date
 */
function formatDate(date: Date) {
  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
