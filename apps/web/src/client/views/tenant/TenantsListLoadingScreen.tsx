import { Skeleton } from "@repo/ui";

const TenantRowSkeleton = () => (
  <tr className="border-t border-sand-200">
    {/* Tenant: avatar + name/email */}
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-none" />
        <div>
          <Skeleton className="h-3.5 w-28 mb-1.5" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
    </td>
    {/* Property / Unit: 2-line */}
    <td className="px-5 py-3.5">
      <Skeleton className="h-3 w-24 mb-1.5" />
      <Skeleton className="h-2.5 w-10" />
    </td>
    {/* Rent */}
    <td className="px-5 py-3.5 text-right">
      <Skeleton className="h-3 w-16 ml-auto" />
    </td>
    {/* Payment badge */}
    <td className="px-5 py-3.5">
      <div className="flex justify-end">
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </td>
    {/* KYC badge */}
    <td className="px-5 py-3.5">
      <div className="flex justify-end">
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </td>
    {/* Chevron */}
    <td className="px-4 py-3.5">
      <Skeleton className="h-4 w-4 ml-auto rounded" />
    </td>
  </tr>
);

export const TenantsListSkeleton = () => (
  <div className="h-screen flex flex-col overflow-hidden">
    {/* Static top section */}
    <div className="px-8 pt-8 pb-4 flex-none">
      {/* Header: title + add button */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-3.5 w-48 mt-2" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Filter / search bar */}
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-[260px] rounded-lg" />
      </div>
    </div>

    {/* Scrollable table */}
    <div className="flex-1 min-h-0 flex flex-col px-8 pb-8">
      <div className="flex-1 min-h-0 rounded-xl border border-sand-400 bg-white overflow-hidden shadow-sm">
        <table className="w-full table-fixed min-w-[700px]">
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "40px" }} />
          </colgroup>
          <thead>
            <tr className="bg-sand-100 border-b border-sand-400">
              <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
              <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-24" /></th>
              <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-14 ml-auto" /></th>
              <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-16 ml-auto" /></th>
              <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-8 ml-auto" /></th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <TenantRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
