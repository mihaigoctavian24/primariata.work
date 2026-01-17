"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import {
  Search,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "cerere" | "plata" | "document";
  title: string;
  subtitle: string;
  status?: string;
  date?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

interface GlobalSearchBarProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  maxResults?: number;
}

/**
 * Global Search Bar - Fuzzy Search Across Dashboard
 *
 * Features:
 * - Fuzzy search with fuse.js
 * - Search across cereri, plăți, documents
 * - Real-time results as you type
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Recent searches memory with clear history button
 * - Result categorization
 * - Loading states
 * - Empty states
 *
 * Searches:
 * - Cerere number, type, status
 * - Payment amounts, status
 * - Document names, types
 */
export function GlobalSearchBar({
  onResultClick,
  placeholder = "Caută cereri, plăți sau documente...",
  maxResults = 8,
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch and search data
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      setIsOpen(true);

      try {
        // Fetch data from all sources in parallel
        const [cereriRes, platiRes, docsRes] = await Promise.all([
          fetch("/api/dashboard/search/cereri?q=" + encodeURIComponent(query)),
          fetch("/api/dashboard/search/plati?q=" + encodeURIComponent(query)),
          fetch("/api/dashboard/search/documents?q=" + encodeURIComponent(query)),
        ]);

        const [cereriData, platiData, docsData] = await Promise.all([
          cereriRes.json(),
          platiRes.json(),
          docsRes.json(),
        ]);

        const allResults: SearchResult[] = [];

        // Process cereri results
        if (cereriData.success && cereriData.data) {
          allResults.push(
            ...cereriData.data.map(
              (c: {
                id: string;
                numar_cerere: string;
                tip_cerere_nume: string;
                status: string;
                created_at: string;
              }) => ({
                id: c.id,
                type: "cerere" as const,
                title: c.numar_cerere,
                subtitle: c.tip_cerere_nume,
                status: c.status,
                date: c.created_at,
                url: `/cereri/${c.id}`,
                metadata: c,
              })
            )
          );
        }

        // Process plăți results
        if (platiData.success && platiData.data) {
          allResults.push(
            ...platiData.data.map(
              (p: {
                id: string;
                suma: number;
                descriere?: string;
                status: string;
                created_at: string;
              }) => ({
                id: p.id,
                type: "plata" as const,
                title: `${p.suma} RON`,
                subtitle: p.descriere || "Plată taxă locală",
                status: p.status,
                date: p.created_at,
                url: `/plati/${p.id}`,
                metadata: p,
              })
            )
          );
        }

        // Process documents results
        if (docsData.success && docsData.data) {
          allResults.push(
            ...docsData.data.map(
              (d: {
                id: string;
                nume: string;
                tip_document?: string;
                status?: string;
                uploaded_at: string;
              }) => ({
                id: d.id,
                type: "document" as const,
                title: d.nume,
                subtitle: d.tip_document || "Document",
                status: d.status,
                date: d.uploaded_at,
                url: `/documents/${d.id}`,
                metadata: d,
              })
            )
          );
        }

        // Apply fuzzy search with fuse.js for better ranking
        const fuse = new Fuse(allResults, {
          keys: ["title", "subtitle", "status"],
          threshold: 0.3,
          includeScore: true,
        });

        const fuzzyResults = fuse.search(query);
        const rankedResults = fuzzyResults.map((r) => r.item).slice(0, maxResults);

        setResults(rankedResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, maxResults]);

  // Handle result click - defined before keyboard navigation useEffect
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("dashboard-recent-searches", JSON.stringify(updated));

      // Navigate
      onResultClick?.(result);
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    },
    [query, recentSearches, onResultClick]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("dashboard-recent-searches");
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary h-11 w-full rounded-lg border pr-10 pl-10 text-sm focus:ring-1 focus:outline-none"
        />
        {isLoading && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-border bg-card absolute z-50 mt-2 w-full overflow-hidden rounded-lg border shadow-lg"
          >
            {results.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <Search className="text-muted-foreground/50 mx-auto h-12 w-12" />
                <p className="text-foreground mt-3 text-sm font-medium">Niciun rezultat</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Încearcă cu alți termeni de căutare
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto">
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleResultClick(result)}
                  />
                ))}
              </div>
            )}

            {/* Recent searches footer */}
            {recentSearches.length > 0 && !query && (
              <div className="border-border bg-muted/30 border-t p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">Căutări recente</p>
                  <button
                    onClick={handleClearHistory}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                    title="Șterge istoric"
                  >
                    <X className="h-3 w-3" />
                    Șterge
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 3).map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(search)}
                      className="bg-background text-foreground hover:bg-muted rounded-md px-2 py-1 text-xs"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual search result item
 */
function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const icon = getIconForType(result.type);
  const statusConfig = result.status ? getStatusConfig(result.status) : null;

  return (
    <button
      onClick={onClick}
      className={`border-border flex w-full items-center gap-3 border-b p-3 text-left transition-colors last:border-b-0 ${
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      }`}
    >
      {/* Icon */}
      <div className="bg-primary/10 text-primary flex-shrink-0 rounded-md p-2">{icon}</div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium">{result.title}</p>
          {statusConfig && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusConfig.badgeClass}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          )}
        </div>
        <p className="text-muted-foreground truncate text-xs">{result.subtitle}</p>
        {result.date && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {new Date(result.date).toLocaleDateString("ro-RO")}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
    </button>
  );
}

/**
 * Get icon for result type
 */
function getIconForType(type: "cerere" | "plata" | "document") {
  switch (type) {
    case "cerere":
      return <FileText className="h-4 w-4" />;
    case "plata":
      return <CreditCard className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
  }
}

/**
 * Get status configuration
 */
function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
    pending: {
      label: "În așteptare",
      badgeClass: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
      icon: <Clock className="h-3 w-3" />,
    },
    success: {
      label: "Procesată",
      badgeClass: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    failed: {
      label: "Eșuată",
      badgeClass: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
      icon: <XCircle className="h-3 w-3" />,
    },
    aprobat: {
      label: "Aprobată",
      badgeClass: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      icon: <CheckCircle className="h-3 w-3" />,
    },
  };

  return configs[status];
}
