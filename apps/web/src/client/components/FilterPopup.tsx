"use client";

import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Select } from "@repo/ui";
import { strings } from "@repo/tokens";

const sf = strings.common.filter;

export interface GenericFilterRow {
  id: number;
  col: string;
  value: string;
}

interface FilterPopupProps {
  appliedRows: GenericFilterRow[];
  onApply: (rows: GenericFilterRow[]) => void;
  onClear: () => void;
  colLabels: Record<string, string>;
  getOptions: (col: string) => { value: string; label: string }[];
  defaultCol: string;
}

export const FilterPopup = ({
  appliedRows,
  onApply,
  onClear,
  colLabels,
  getOptions,
  defaultCol,
}: FilterPopupProps) => {
  const nextId = useRef(1);

  const [draftRows, setDraftRows] = useState<GenericFilterRow[]>(
    appliedRows.length > 0
      ? appliedRows
      : [{ id: nextId.current++, col: defaultCol, value: "" }],
  );

  const colOptions = (Object.keys(colLabels) as string[]).map((k) => ({
    value: k,
    label: colLabels[k],
  }));

  const addRow = () =>
    setDraftRows((prev) => [...prev, { id: nextId.current++, col: defaultCol, value: "" }]);

  const removeRow = (id: number) =>
    setDraftRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: number, patch: Partial<GenericFilterRow>) =>
    setDraftRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...patch, ...(patch.col ? { value: "" } : {}) } : r,
      ),
    );

  const hasAny = draftRows.length > 0 || appliedRows.length > 0;

  return (
    <div className="absolute left-0 top-full mt-1.5 z-50 w-[380px] bg-white rounded-xl border border-sand-400 shadow-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-sand-200">
        <span className="text-[13.5px] font-semibold text-espresso-900">{sf.filtersTitle}</span>
      </div>

      <div className="px-4 py-4 space-y-3 max-h-[360px] overflow-y-auto">
        {draftRows.map((row) => (
          <div key={row.id} className="flex gap-2 items-center">
            <div className="flex-1">
              <Select
                value={row.col}
                onChange={(val) => updateRow(row.id, { col: val })}
                options={colOptions}
              />
            </div>
            <div className="flex-1">
              <Select
                value={row.value}
                onChange={(val) => updateRow(row.id, { value: val })}
                options={getOptions(row.col)}
                placeholder={`Select ${colLabels[row.col]?.toLowerCase()}…`}
              />
            </div>
            <button
              onClick={() => removeRow(row.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-none"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-coral-500 hover:text-coral-600 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> {sf.addFilter}
        </button>
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-sand-200">
        {hasAny && (
          <button
            onClick={() => { setDraftRows([]); onClear(); }}
            className="flex-1 h-9 rounded-lg border border-sand-400 text-[13px] font-medium text-espresso-700 hover:bg-sand-100 transition-colors"
          >
            {sf.clearAllFilters}
          </button>
        )}
        <button
          onClick={() => onApply(draftRows.filter((r) => r.value))}
          className="flex-1 h-9 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-[13px] font-semibold transition-colors"
        >
          {sf.applyFilter}
        </button>
      </div>
    </div>
  );
};
