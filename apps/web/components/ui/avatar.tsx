"use client";

import { useState } from "react";
import clsx from "clsx";
import { fileUrl } from "@/lib/api";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-3xl",
} as const;

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = src && !failed ? fileUrl(src) : undefined;

  return (
    <span
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white",
        "bg-gradient-to-br from-primary to-primary-dark shadow-sm ring-2 ring-white",
        SIZES[size],
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name ?? ""} onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
