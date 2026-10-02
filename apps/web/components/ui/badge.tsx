import clsx from "clsx";

const COLOR_MAP: Record<string, string> = {
  green: "bg-green-50 text-green-700 ring-green-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
};

export function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        COLOR_MAP[color] ?? COLOR_MAP.gray,
      )}
    >
      {children}
    </span>
  );
}
