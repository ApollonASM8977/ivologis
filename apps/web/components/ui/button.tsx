import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-blue-700 focus-visible:ring-primary shadow-sm shadow-primary/20",
  secondary: "bg-white text-ink border border-gray-200 hover:bg-gray-50 focus-visible:ring-gray-300",
  ghost: "bg-transparent text-ink hover:bg-gray-100 focus-visible:ring-gray-300",
  danger: "bg-danger text-white hover:bg-red-700 focus-visible:ring-danger shadow-sm shadow-danger/20",
};

const sizes: Record<string, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
};

/** Bouton : grossit légèrement au survol, s'enfonce à l'appui (CSS `ivo-press`, sans bibliothèque d'animation). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={clsx(
          "ivo-press relative inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="ivo-fade-in inline-flex">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          </span>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
