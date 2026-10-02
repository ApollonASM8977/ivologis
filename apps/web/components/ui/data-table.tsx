"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingState } from "./empty-state";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  emptyMessage = "Aucune donnée pour le moment.",
  page,
  limit,
  total,
  onPageChange,
  onRowClick,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
}) {
  const totalPages = page && limit && total ? Math.max(1, Math.ceil(total / limit)) : 1;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="whitespace-nowrap px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-gray-50/60 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <LoadingState />}
      {!loading && rows.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-ink-muted">{emptyMessage}</div>
      )}

      {onPageChange && total !== undefined && total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-ink-muted">
          <span>
            {total} résultat{total > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={(page ?? 1) <= 1}
              onClick={() => onPageChange((page ?? 1) - 1)}
              className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={(page ?? 1) >= totalPages}
              onClick={() => onPageChange((page ?? 1) + 1)}
              className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
