"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={{ boxShadow: focused ? "0 0 0 3px rgba(11,95,255,0.15)" : "0 0 0 0px rgba(11,95,255,0)" }}
      className={`relative w-full max-w-sm rounded-lg ${className}`}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:bg-gray-100 hover:text-ink"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
