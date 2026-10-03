import { InputHTMLAttributes, forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

const baseClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 ease-out focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 focus:shadow-sm disabled:bg-gray-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={clsx(baseClass, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={clsx(baseClass, className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={clsx(baseClass, className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export function Label({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={clsx("mb-1.5 block text-sm font-medium text-ink", className)}>
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}
