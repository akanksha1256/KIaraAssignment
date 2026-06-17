"use client";

import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { strings } from "@repo/tokens";
import { formatDate } from "@repo/ui";
import { colors } from "@repo/tokens";
import { User, ExternalLink, ShieldCheck, Clock, ShieldOff } from "lucide-react";
import type { Tenant, KycStatus, TenantStanding } from "@repo/data";

const s = strings.manager.tenantProfile.info;
const ss = strings.manager.tenantProfile.standing;

const kycConfig: Record<KycStatus, { icon: React.ReactNode; label: string; className: string }> = {
  verified: {
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    label: "KYC Verified",
    className: "bg-success-bg text-success",
  },
  pending: {
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "KYC Pending",
    className: "bg-warning-bg text-warning",
  },
  not_submitted: {
    icon: <ShieldOff className="h-3.5 w-3.5" />,
    label: "Not Submitted",
    className: "bg-sand-200 text-espresso-500",
  },
};

const scoreColor = (score: number): string =>
  score >= 90 ? colors.chart.paid
  : score >= 70 ? colors.chart.collected
  : score >= 50 ? colors.chart.outstanding
  : colors.chart.overdue;

const scoreLabel = (score: number) =>
  score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "At risk";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-sand-200 last:border-0">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className="text-[13px] font-medium text-espresso-900">{children}</span>
  </div>
);

interface Props {
  tenant: Tenant;
  standing: TenantStanding | null;
}

export const TenantInfoCard = ({ tenant, standing }: Props) => {
  const kyc = kycConfig[tenant.kycStatus];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-none">
            <User className="h-4 w-4 text-teal-700" />
          </div>
          {s.heading}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Personal details */}
          <div className="lg:col-span-3">
            <Row label={s.name}>{tenant.name}</Row>
            <Row label={s.email}>{tenant.email}</Row>
            <Row label={s.contact}>{tenant.contact}</Row>
            <Row label={s.kycStatus}>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${kyc.className}`}>
                  {kyc.icon}
                  {kyc.label}
                </span>
                {tenant.kycVerifiedOn && (
                  <span className="text-[11.5px] text-muted-foreground">
                    Verified {formatDate(tenant.kycVerifiedOn)}
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
                  className="inline-flex items-center gap-1 text-maroon-600 hover:underline transition-colors text-[13px] font-medium"
                >
                  {s.kycDocumentLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">{s.kycDocumentNone}</span>
              )}
            </Row>
          </div>

          {/* Score ring */}
          {standing && (
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2">
              <div className="relative">
                <PieChart width={120} height={120}>
                  <Pie
                    data={[{ value: standing.score }, { value: 100 - standing.score }]}
                    cx={55}
                    cy={55}
                    innerRadius={38}
                    outerRadius={52}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill={scoreColor(standing.score)} />
                    <Cell fill="#EBECDC" />
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[15px] font-semibold text-espresso-900">{scoreLabel(standing.score)}</span>
                  <span className="text-[12px] text-muted-foreground">{standing.score}/100</span>
                </div>
              </div>
              <p className="text-[12.5px] text-muted-foreground text-center">
                <span className="font-semibold text-espresso-900">
                  {standing.onTimePayments}/{standing.totalPayments}
                </span>{" "}
                {ss.onTime}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
