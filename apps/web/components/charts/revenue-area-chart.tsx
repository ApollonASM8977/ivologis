"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatXOF } from "@ivologis/shared";

export default function RevenueAreaChart({
  data,
  gradientId = "revenue",
  color = "#0B5FFF",
}: {
  data: { month: string; revenue: number }[];
  gradientId?: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
        <Area type="monotone" dataKey="revenue" stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
