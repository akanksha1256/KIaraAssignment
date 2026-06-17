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
    <div className="flex-1 min-h-0 rounded-xl border border-sand-400 bg-white overflow-y-auto shadow-sm">
      <table className="w-full table-fixed min-w-[700px]">
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
            <th className="px-5 py-3 text-left">
              <Overline>{s.cols.propertyUnit}</Overline>
            </th>
            <SortableHeader col="period" label={s.cols.period} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortableHeader col="amount" label={s.cols.amount} align="right" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
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
              <td className="px-5 py-3.5">
                <MutedText className="text-espresso-700 font-medium">
                  {formatPeriod(item.payment.periodMonth)}
                </MutedText>
              </td>
              <td className="px-5 py-3.5 text-right">
                <MutedText className="text-espresso-900 font-semibold tabular-nums">
                  ${item.payment.amountDue.toLocaleString()}
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
  );
};
