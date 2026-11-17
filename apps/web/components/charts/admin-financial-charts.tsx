"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";

const COLORS = ["#0B5FFF", "#16A34A", "#F59E0B", "#DC2626", "#0B1F3A", "#6B7280", "#a855f7"];

export default function AdminFinancialCharts({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Revenus par commune" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byCommune}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="commune" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
              <Bar dataKey="revenue" fill="#0B5FFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Revenus par type de bien" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.byType}
                dataKey="revenue"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: any) => PROPERTY_TYPE_LABELS[entry.type as keyof typeof PROPERTY_TYPE_LABELS] ?? entry.type}
              >
                {data.byType.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Évolution des revenus (12 mois)" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
              <Bar dataKey="revenue" fill="#16A34A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
