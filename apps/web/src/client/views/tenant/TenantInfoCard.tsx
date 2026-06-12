"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/commonComponents/Card";
import { strings } from "@/client/designSystems/strings";
import { colors } from "@/client/designSystems/colors";
import { User, ExternalLink } from "lucide-react";
import type {
  Tenant,
  KycStatus,
  TenantStanding,
} from "@/client/stateManagement/tenant/type";

const s = strings.manager.tenantProfile.info;
const ss = strings.manager.tenantProfile.standing;

const kycBadgeStyle: Record<KycStatus, { bg: string; text: string }> = {
  verified: { bg: "bg-success-50", text: "text-success-700" },
  pending: { bg: "bg-warning-50", text: "text-warning-700" },
  not_submitted: { bg: "bg-neutral-100", text: "text-neutral-500" },
};

const scoreColor = (score: number): string =>
  score >= 90
    ? colors.chart.paid
    : score >= 70
      ? colors.chart.collected
      : score >= 50
        ? colors.chart.outstanding
        : colors.chart.overdue;

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
    <span className="text-sm text-neutral-500">{label}</span>
    <span className="text-sm font-medium text-neutral-900">{children}</span>
  </div>
);

interface Props {
  tenant: Tenant;
  standing: TenantStanding | null;
}

export const TenantInfoCard = ({ tenant, standing }: Props) => {
  const { bg, text } = kycBadgeStyle[tenant.kycStatus];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-neutral-400" />
          {s.heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Left: personal details — 60% */}
          <div className="lg:col-span-3">
            <Row label={s.name}>{tenant.name}</Row>
            <Row label={s.email}>{tenant.email}</Row>
            <Row label={s.contact}>{tenant.contact}</Row>
            <Row label={s.kycStatus}>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
                >
                  {s.kycStatusLabels[tenant.kycStatus]}
                </span>
                {tenant.kycVerifiedOn && (
                  <span className="text-xs text-neutral-400">
                    {s.kycVerifiedOn}: {tenant.kycVerifiedOn}
                  </span>
                )}
              </div>
            </Row>
            <Row label={s.kycDocument}>
              {tenant.kycDocument ? (
                <a
                  href={tenant.kycDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 transition-colors"
                >
                  {s.kycDocumentLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-neutral-400">{s.kycDocumentNone}</span>
              )}
            </Row>
          </div>

          {/* Right: risk score donut + on-time — 40% */}
          <div className="lg:col-span-2 flex items-center justify-center">
            {standing && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <PieChart width={110} height={110}>
                    <Pie
                      data={[
                        { value: standing.score },
                        { value: 100 - standing.score },
                      ]}
                      cx={50}
                      cy={50}
                      innerRadius={34}
                      outerRadius={48}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill={scoreColor(standing.score)} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-bold text-neutral-900">
                      {standing.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {standing.score}%
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-800">
                    {standing.onTimePayments}/{standing.totalPayments}
                  </span>{" "}
                  {ss.onTime}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
