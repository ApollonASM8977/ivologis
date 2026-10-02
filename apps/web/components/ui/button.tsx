import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileHover={disabled || loading ? undefined : { scale: 1.015 }}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={clsx(
          "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {loading && (
            <motion.span
              key="spinner"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.span>
          )}
        </AnimatePresence>
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
