import * as React from "react";
import { Card } from "@/client/commonComponents/Card";

export interface TableColumn {
  label:     string;
  align?:    "left" | "right";
  className?: string;
}

export interface TableCell {
  content: React.ReactNode;
  className?: string;
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

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full table-auto divide-y divide-neutral-200">
        <thead>
          <tr className="bg-neutral-50">
            {columns.map(({ label, align = "left", className }) => (
              <th
                key={label}
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 ${align === "right" ? "text-right" : "text-left"} ${className ?? ""}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map(({ key, onClick, cells }) => (
            <tr
              key={key}
              onClick={onClick}
              className={
                onClick
                  ? "cursor-pointer transition-colors hover:bg-neutral-50"
                  : undefined
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
