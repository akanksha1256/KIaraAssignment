"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { strings } from "@repo/tokens";
import { FilterPopup, type GenericFilterRow } from "./FilterPopup";

const sf = strings.common.filter;

interface FilterAndSearchStrings {
  searchPlaceholder: string;
  results: (n: number, total: number) => string;
}

interface FilterAndSearchSectionProps {
  filterOpen: boolean;
  setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterContainerRef: React.RefObject<HTMLDivElement>;
  appliedFilterRows: GenericFilterRow[];
  setAppliedFilterRows: React.Dispatch<React.SetStateAction<GenericFilterRow[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  colLabels: Record<string, string>;
  getOptions: (col: string) => { value: string; label: string }[];
  defaultCol: string;
  resultCount: number;
  totalCount: number;
  strings: FilterAndSearchStrings;
}

export const FilterAndSearchSection = ({
  filterOpen,
  setFilterOpen,
  filterContainerRef,
  appliedFilterRows,
  setAppliedFilterRows,
  search,
  setSearch,
  colLabels,
  getOptions,
  defaultCol,
  resultCount,
  totalCount,
  strings: s,
}: FilterAndSearchSectionProps) => {
  const activeFilterCount = appliedFilterRows.filter((r) => r.value !== "").length;
  const hasActiveFilters = activeFilterCount > 0 || search.trim() !== "";

  return (
    <>
      {/* Toolbar: filter (left) + search (right) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-2">
        <div className="relative w-full sm:flex-none sm:w-auto" ref={filterContainerRef}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg border text-[13px] font-medium transition-colors w-full sm:w-auto justify-center sm:justify-start ${
              activeFilterCount > 0
                ? "border-coral-500 text-coral-500 bg-coral-50 hover:bg-coral-100"
                : "border-sand-400 text-espresso-700 bg-white hover:bg-sand-100"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {sf.filterButton}
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-coral-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <FilterPopup
              appliedRows={appliedFilterRows}
              onApply={(rows) => { setAppliedFilterRows(rows); setFilterOpen(false); }}
              onClear={() => { setAppliedFilterRows([]); setFilterOpen(false); }}
              colLabels={colLabels}
              defaultCol={defaultCol}
              getOptions={getOptions}
            />
          )}
        </div>

        <div className="hidden sm:flex flex-1" />

        <div className="relative w-full sm:flex-none sm:w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={s.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-sand-400 bg-white pl-8 pr-8 text-[13px] text-espresso-900 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral-500/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-espresso-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Applied filter chips row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {appliedFilterRows
            .filter((r) => r.value)
            .map((row) => {
              const label = getOptions(row.col).find((o) => o.value === row.value)?.label ?? row.value;
              return (
                <span
                  key={row.id}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-coral-50 border border-coral-200 text-[12px] font-medium text-coral-700"
                >
                  <span className="text-coral-400">{colLabels[row.col]}:</span> {label}
                  <button
                    onClick={() => setAppliedFilterRows((rs) => rs.filter((r) => r.id !== row.id))}
                    className="hover:text-coral-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          <span className="text-[12px] text-muted-foreground">
            {s.results(resultCount, totalCount)}
          </span>
        </div>
      )}
    </>
  );
};
