"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, User, Bell } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";

/**
 * CommandLiveSearch
 *
 * Debounced Supabase search across cereri, profiles, and notifications.
 * Only fetches when query has 2+ characters. Results rendered as CommandItem groups.
 */

interface CommandLiveSearchProps {
  query: string;
  role: string;
  basePath: string;
  onSelect: (href: string) => void;
}

interface CerereResult {
  id: string;
  numar_inregistrare: string;
  status: string;
  tipuri_cereri: { nume: string } | null;
}

interface SearchResults {
  cereri: CerereResult[];
  users: Array<{ id: string; nume: string; prenume: string; email: string }>;
  notifications: Array<{ id: string; title: string }>;
}

export function CommandLiveSearch({ query, role, basePath, onSelect }: CommandLiveSearchProps) {
  const [results, setResults] = useState<SearchResults>({
    cereri: [],
    users: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ cereri: [], users: [], notifications: [] });
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        const searchPattern = `%${query}%`;

        const cereriQuery = supabase
          .from("cereri")
          .select("id, numar_inregistrare, status, tipuri_cereri(nume)")
          .ilike("numar_inregistrare", searchPattern)
          .limit(5);

        const usersQuery =
          role === "admin"
            ? supabase
                .from("utilizatori")
                .select("id, nume, prenume, email")
                .or(
                  `nume.ilike.${searchPattern},prenume.ilike.${searchPattern},email.ilike.${searchPattern}`
                )
                .limit(5)
            : null;

        const notifsQuery = supabase
          .from("notifications")
          .select("id, title")
          .ilike("title", searchPattern)
          .limit(3);

        const [cereriRes, usersRes, notifsRes] = await Promise.all([
          cereriQuery,
          usersQuery ?? Promise.resolve({ data: [] as SearchResults["users"], error: null }),
          notifsQuery,
        ]);

        setResults({
          cereri: cereriRes.data ?? [],
          users: usersRes.data ?? [],
          notifications: notifsRes.data ?? [],
        });
      } catch (error) {
        console.error("Command palette live search error:", error);
        setResults({ cereri: [], users: [], notifications: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, role, basePath]);

  if (query.length < 2) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        <span className="text-muted-foreground ml-2 text-sm">Se cauta...</span>
      </div>
    );
  }

  const hasResults =
    results.cereri.length > 0 || results.users.length > 0 || results.notifications.length > 0;

  if (!hasResults) return null;

  return (
    <>
      {results.cereri.length > 0 && (
        <CommandGroup heading="Cereri">
          {results.cereri.map((cerere) => {
            const tipNume = cerere.tipuri_cereri?.nume ?? "Cerere";
            return (
              <CommandItem
                key={`cerere-${cerere.id}`}
                value={`cerere-${tipNume}-${cerere.numar_inregistrare}`}
                onSelect={() => onSelect(`${basePath}/cereri/${cerere.id}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{tipNume}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  #{cerere.numar_inregistrare}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}

      {results.users.length > 0 && (
        <CommandGroup heading="Utilizatori">
          {results.users.map((u) => {
            const displayName = `${u.prenume} ${u.nume}`.trim() || u.email;
            return (
              <CommandItem
                key={`user-${u.id}`}
                value={`user-${displayName}`}
                onSelect={() => onSelect(`${basePath}/users/${u.id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{displayName}</span>
                {displayName !== u.email && (
                  <span className="text-muted-foreground ml-auto text-xs">{u.email}</span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}

      {results.notifications.length > 0 && (
        <CommandGroup heading="Notificari">
          {results.notifications.map((n) => (
            <CommandItem
              key={`notif-${n.id}`}
              value={`notif-${n.title}`}
              onSelect={() => onSelect(`${basePath}/notificari`)}
            >
              <Bell className="mr-2 h-4 w-4" />
              <span>{n.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
}
