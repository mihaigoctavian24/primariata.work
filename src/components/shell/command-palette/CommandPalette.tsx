"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";
import { getCommandsForRole } from "./command-config";
import { CommandLiveSearch } from "./CommandLiveSearch";

/**
 * CommandPalette
 *
 * Cmd+K searchable command palette. Renders role-specific static commands
 * plus live Supabase search results when the user types 2+ characters.
 */

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
  basePath: string;
}

export function CommandPalette({ open, onOpenChange, role, basePath }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const commandGroups = getCommandsForRole(role, basePath);

  const handleSelect = useCallback(
    (item: { action: "navigate" | "function"; href?: string; fn?: string }): void => {
      if (item.action === "navigate" && item.href) {
        router.push(item.href);
        onOpenChange(false);
        setSearchQuery("");
        return;
      }

      if (item.action === "function" && item.fn) {
        switch (item.fn) {
          case "toggle-theme":
            setTheme(theme === "dark" ? "light" : "dark");
            break;
          case "logout": {
            const supabase = createClient();
            supabase.auth.signOut().then(() => {
              router.push("/");
            });
            break;
          }
          case "invite-user":
            router.push(`${basePath}/users?action=invite`);
            break;
          case "help":
            router.push("/ajutor");
            break;
        }
        onOpenChange(false);
        setSearchQuery("");
      }
    },
    [router, onOpenChange, theme, setTheme, basePath]
  );

  const handleLiveSelect = useCallback(
    (href: string): void => {
      router.push(href);
      onOpenChange(false);
      setSearchQuery("");
    },
    [router, onOpenChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setSearchQuery("");
      }}
    >
      <CommandInput
        placeholder="Cauta pagini, actiuni, cereri..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>Nu s-au gasit rezultate.</CommandEmpty>

        {commandGroups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem key={item.id} value={item.label} onSelect={() => handleSelect(item)}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {searchQuery.length >= 2 && <CommandSeparator />}

        <CommandLiveSearch
          query={searchQuery}
          role={role}
          basePath={basePath}
          onSelect={handleLiveSelect}
        />
      </CommandList>
    </CommandDialog>
  );
}
