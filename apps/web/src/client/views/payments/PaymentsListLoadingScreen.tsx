import { Skeleton } from "@repo/ui";

const TwoLineCell = ({ topCls, bottomCls }: { topCls: string; bottomCls: string }) => (
  <td className="px-5 py-3.5">
    <Skeleton className={topCls} />
    <Skeleton className={bottomCls} />
  </td>
);

export const PaymentsListSkeleton = () => (
  <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col overflow-hidden">
    {/* Static top section */}
    <div className="px-4 pt-4 pb-4 md:px-8 md:pt-8 flex-none">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-3.5 w-56 mt-2" />
      </div>

      {/* Summary cards — stacked on mobile, 3-col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[
          { val: "w-28", sub: "w-36" },
          { val: "w-32", sub: "w-36" },
          { val: "w-16", sub: "w-40" },
        ].map((w, i) => (
          <div key={i} className="rounded-xl border border-sand-400 bg-white px-5 py-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className={`h-7 ${w.val}`} />
            <Skeleton className={`h-3 ${w.sub}`} />
          </div>
        ))}
      </div>

      {/* Filter / search bar */}
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-48 sm:w-64 rounded-lg" />
      </div>
    </div>

    {/* Scrollable content */}
    <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 md:px-8 md:pb-8">
      <div className="flex-1 min-h-0 rounded-xl border border-sand-400 bg-white overflow-hidden shadow-sm flex flex-col">

        {/* Mobile: card skeletons */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-sand-200">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-4 py-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <Skeleton className="h-3.5 w-32 mb-1.5" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-44 mb-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table skeleton */}
        <div className="hidden sm:flex flex-col flex-1 overflow-y-auto">
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
            <thead>
              <tr className="bg-sand-100 border-b border-sand-400">
                <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-24" /></th>
                <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-14 ml-auto" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-14" /></th>
                <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-12 ml-auto" /></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <tr key={i} className="border-t border-sand-200">
                  <TwoLineCell topCls="h-3.5 w-28 mb-1.5" bottomCls="h-2.5 w-32" />
                  <TwoLineCell topCls="h-3.5 w-24 mb-1.5" bottomCls="h-2.5 w-12" />
                  <td className="px-5 py-3.5 text-right">
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </td>
                  <td className="px-5 py-3.5">
                    <Skeleton className="h-3 w-16" />
                  </td>
                  <td className="px-5 py-3.5">
                    <Skeleton className="h-3 w-20" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </td>
                  <td className="px-2 py-3.5">
                    <Skeleton className="h-5 w-5 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
);
