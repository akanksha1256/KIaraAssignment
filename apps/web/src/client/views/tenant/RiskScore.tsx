import { Card, CardContent, CardHeader, CardTitle } from "@/client/commonComponents/Card";
import { strings } from "@/client/designSystems/strings";
import { Star } from "lucide-react";
import type { TenantStanding } from "@/client/stateManagement/managerDashboard/tenant/type";

const s = strings.manager.tenantProfile.standing;

export const RiskScore = ({ standing }: { standing: TenantStanding | null }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Star className="h-4 w-4 text-neutral-400" />
        {s.heading}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {standing ? (
        <>
          <div className="mb-4 flex items-end gap-2">
            <span className="text-4xl font-bold text-neutral-900">{standing.score}</span>
            <span className="mb-1 text-sm text-neutral-400">/ 100</span>
          </div>
          <div className="w-full rounded-full bg-neutral-100 h-2 mb-4">
            <div
              className={`h-2 rounded-full ${
                standing.score >= 90
                  ? "bg-success-500"
                  : standing.score >= 70
                    ? "bg-brand-500"
                    : standing.score >= 50
                      ? "bg-warning-500"
                      : "bg-danger-500"
              }`}
              style={{ width: `${standing.score}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">{s.onTime}</span>
            <span className="font-medium text-neutral-900">
              {standing.onTimePayments} / {standing.totalPayments}
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-neutral-400">{s.noData}</p>
      )}
    </CardContent>
  </Card>
);
