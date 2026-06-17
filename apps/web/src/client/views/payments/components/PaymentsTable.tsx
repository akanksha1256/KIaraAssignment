"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { PaymentListItem, PaymentsListSortCol as SortCol, SortDir } from "@repo/data";
import { Badge, LinkText, Caption, MutedText, Overline } from "@repo/ui";
import { EmptyState } from "@/client/views/EmptyScreen";
import { strings } from "@repo/tokens";
import { formatPeriod, formatDate } from "@/client/views/manager/util";
import { PaymentRowMenu } from "./PaymentRowMenu";
import { getStatusVariant, getStatusLabel } from "../helper";

const s = strings.manager.paymentsList;

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

const SortableHeader = ({
  col,
  label,
  align = "left",
  sortCol,
  sortDir,
  onSort,
}: {
  col: SortCol;
  label: string;
  align?: "left" | "right";
  sortCol: SortCol | null;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
}) => {
  const isActive = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-5 py-3 ${align === "right" ? "text-right" : "text-left"} cursor-pointer select-none transition-colors`}
    >
      <Overline
        className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end w-full" : ""} ${isActive ? "text-espresso-900" : "hover:text-espresso-700"}`}
      >
        {label} <SortIcon active={isActive} dir={sortDir} />
      </Overline>
    </th>
  );
};

interface PaymentsTableProps {
  items: PaymentListItem[];
  sortCol: SortCol | null;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  onRowClick: (tenantId: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}

export const PaymentsTable = ({
  items,
  sortCol,
  sortDir,
  onSort,
  onRowClick,
  emptyTitle,
  emptyDescription,
}: PaymentsTableProps) => {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex-1 min-h-0 rounded-xl border border-sand-400 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Mobile: card view */}
      <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-sand-200">
        {items.map((item) => (
          <div
            key={item.payment.id}
            onClick={() => onRowClick(item.tenant.id)}
            className="px-4 py-4 cursor-pointer active:bg-coral-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <LinkText className="font-semibold text-espresso-900 block truncate">
                  {item.tenant.name}
                </LinkText>
                <Caption className="truncate">{item.tenant.email}</Caption>
              </div>
              <Badge variant={getStatusVariant(item.payment.status)} size="sm">
                {getStatusLabel(item.payment.status)}
              </Badge>
            </div>
            <div className="text-[12.5px] text-espresso-700 mb-2">
              {item.property.name}
              <span className="text-muted-foreground font-mono ml-1">· {item.unit.label}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <MutedText className="text-espresso-900 font-semibold tabular-nums text-[14px]">
                ${item.payment.amountDue.toLocaleString()}
              </MutedText>
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <span>{formatPeriod(item.payment.periodMonth)}</span>
                {item.payment.paidDate && (
                  <span>· {formatDate(item.payment.paidDate)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table view */}
      <div className="hidden sm:flex flex-col flex-1 overflow-y-auto">
      <table className="w-full table-auto min-w-[700px]">
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "40px" }} />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="bg-sand-100 border-b border-sand-400">
            <th className="px-5 py-3 text-left">
              <Overline>{s.cols.tenant}</Overline>
            </th>
            <SortableHeader col="property" label={s.cols.propertyUnit} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortableHeader col="amount" label={s.cols.amount} align="right" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortableHeader col="period" label={s.cols.period} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortableHeader col="paidOn" label={s.cols.paidOn} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortableHeader col="status" label={s.cols.status} align="right" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.payment.id}
              onClick={() => onRowClick(item.tenant.id)}
              className="border-t border-sand-200 hover:bg-coral-50/50 cursor-pointer transition-colors group"
            >
              <td className="px-5 py-3.5">
                <LinkText className="text-espresso-900 font-semibold leading-tight block">
                  {item.tenant.name}
                </LinkText>
                <Caption>{item.tenant.email}</Caption>
              </td>
              <td className="px-5 py-3.5">
                <MutedText className="text-espresso-900 font-medium">{item.property.name}</MutedText>
                <Caption className="font-mono">{item.unit.label}</Caption>
              </td>
              <td className="px-5 py-3.5 text-right">
                <MutedText className="text-espresso-900 font-semibold tabular-nums">
                  ${item.payment.amountDue.toLocaleString()}
                </MutedText>
              </td>
              <td className="px-5 py-3.5">
                <MutedText className="text-espresso-700 font-medium">
                  {formatPeriod(item.payment.periodMonth)}
                </MutedText>
              </td>
              <td className="px-5 py-3.5">
                <MutedText className="text-espresso-700">
                  {formatDate(item.payment.paidDate)}
                </MutedText>
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex justify-end">
                  <Badge variant={getStatusVariant(item.payment.status)} size="sm">
                    {getStatusLabel(item.payment.status)}
                  </Badge>
                </div>
              </td>
              <td className="px-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                <PaymentRowMenu item={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};
