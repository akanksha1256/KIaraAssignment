"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

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
  urgent?: boolean; // overdue row — gets left-edge accent
  vacant?: boolean; // vacant row — gets subtle stripe
  flashState?: "success" | "error" | null;
}

export interface RowGroup {
  label: string;
  count: number;
  urgency: "overdue" | "outstanding" | "paid" | "vacant";
  rows: TableRow[];
}

interface DataTableProps {
  columns: TableColumn[];
  rows?: TableRow[];
  groups?: RowGroup[];
}

type SortDir = "asc" | "desc";

const groupDotColor: Record<RowGroup["urgency"], string> = {
  overdue: "bg-destructive",
  outstanding: "bg-warning",
  paid: "bg-teal-600",
  vacant: "bg-espresso-300",
};

function renderRows(rows: TableRow[]) {
  return rows.map(({ key, onClick, cells, urgent, vacant, flashState }) => (
    <tr
      key={key}
      onClick={onClick}
      className={[
        "transition-colors duration-fast",
        onClick ? "cursor-pointer" : "",
        urgent ? "relative" : "",
        vacant
          ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_10px,rgba(184,167,164,.06)_10px,rgba(184,167,164,.06)_20px)]"
          : "",
        flashState === "success" ? "flash-success" : "",
        flashState === "error" ? "flash-error" : "",
        onClick && !flashState ? "hover:bg-coral-50 focus-within:bg-coral-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {cells.map((cell, i) => (
        <td
          key={i}
          className={[
            "px-5 py-4 text-[14px] align-middle border-b border-sand-200",
            i === 0 && urgent ? "border-l-[3px] border-l-destructive pl-[calc(20px-3px)]" : "",
            cell.className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {cell.content}
        </td>
      ))}
    </tr>
  ));
}

export function DataTable({ columns, rows = [], groups }: DataTableProps) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (i: number) => {
    if (sortCol === i) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(i);
      setSortDir("asc");
    }
  };

  const sortedRows = React.useMemo(() => {
    if (sortCol === null || groups) return rows;
    return [...rows].sort((a, b) => {
      let av = a.cells[sortCol]?.sortValue ?? "";
      let bv = b.cells[sortCol]?.sortValue ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, groups, sortCol, sortDir]);

  return (
    <div className="rounded-xl border border-sand-400 bg-white overflow-x-auto shadow-sm">
      <table className="w-full table-auto min-w-[600px]">
        <thead>
          <tr className="bg-sand-100 border-b border-sand-400">
            {columns.map(({ label, align = "left", className, sortable }, i) => (
              <th
                key={label || i}
                onClick={sortable ? () => handleSort(i) : undefined}
                className={[
                  "px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
                  align === "right" ? "text-right" : "text-left",
                  sortable ? "cursor-pointer select-none hover:text-espresso-700" : "",
                  className ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {sortable ? (
                  <span className="inline-flex items-center gap-1">
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
        <tbody>
          {groups
            ? groups.map((group) => (
                <React.Fragment key={group.label}>
                  <tr className="bg-sand-100 border-b border-sand-400">
                    <td colSpan={columns.length} className="px-5 py-2">
                      <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-maroon-600">
                        <span
                          className={`w-2 h-2 rounded-full flex-none ${groupDotColor[group.urgency]}`}
                        />
                        {group.label}
                        <span className="text-muted-foreground font-medium normal-case tracking-normal">
                          · {group.count}
                        </span>
                      </span>
                    </td>
                  </tr>
                  {renderRows(group.rows)}
                </React.Fragment>
              ))
            : renderRows(sortedRows)}
        </tbody>
      </table>
    </div>
  );
}
