"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Card } from "./Card";

export interface TableColumn {
  label: string;
  align?: "left" | "right";
  className?: string;
  sortable?: boolean;
}

export interface TableCell {
  content: React.ReactNode;
  className?: string;
  sortValue?: string | number;
}

export interface TableRow {
  key: string;
  onClick?: () => void;
  cells: TableCell[];
}

interface DataTableProps {
  columns: TableColumn[];
  rows: TableRow[];
}

type SortDir = "asc" | "desc";

export function DataTable({ columns, rows }: DataTableProps) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (i: number) => {
    if (sortCol === i) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(i);
      setSortDir("asc");
    }
  };

  const sortedRows = React.useMemo(() => {
    if (sortCol === null) return rows;
    return [...rows].sort((a, b) => {
      let av = a.cells[sortCol]?.sortValue ?? "";
      let bv = b.cells[sortCol]?.sortValue ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortCol, sortDir]);

  return (
    <Card className="overflow-hidden">
      <table className="w-full table-auto divide-y divide-neutral-200">
        <thead>
          <tr className="bg-neutral-50">
            {columns.map(({ label, align = "left", className, sortable }, i) => (
              <th
                key={label || i}
                onClick={sortable ? () => handleSort(i) : undefined}
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400
                  ${align === "right" ? "text-right" : "text-left"}
                  ${sortable ? "cursor-pointer select-none hover:text-neutral-600" : ""}
                  ${className ?? ""}`}
              >
                {sortable ? (
                  <span
                    className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}
                  >
                    {label}
                    {sortCol === i ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                ) : (
                  label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {sortedRows.map(({ key, onClick, cells }) => (
            <tr
              key={key}
              onClick={onClick}
              className={
                onClick ? "cursor-pointer transition-colors hover:bg-neutral-50" : undefined
              }
            >
              {cells.map((cell, i) => (
                <td key={i} className={cell.className}>
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
