import { Skeleton } from "@repo/ui";

const TwoLineCell = ({ topWidth, bottomWidth }: { topWidth: string; bottomWidth: string }) => (
  <td className="px-5 py-3.5">
    <Skeleton className={`h-3.5 ${topWidth} mb-1.5`} />
    <Skeleton className={`h-2.5 ${bottomWidth}`} />
  </td>
);

export const PaymentsListSkeleton = () => (
  <div className="h-screen flex flex-col overflow-hidden">
    {/* Static top section */}
    <div className="px-8 pt-8 pb-4 flex-none">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-3.5 w-56 mt-2" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[["w-28", "w-36"], ["w-32", "w-36"], ["w-16", "w-40"]].map(([valW, subW], i) => (
          <div key={i} className="rounded-xl border border-sand-400 bg-white px-5 py-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className={`h-7 ${valW}`} />
            <Skeleton className={`h-3 ${subW}`} />
          </div>
        ))}
      </div>

      {/* Filter / search bar */}
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-[260px] rounded-lg" />
      </div>
    </div>

    {/* Scrollable table */}
    <div className="flex-1 min-h-0 px-8 pb-8">
      <div className="rounded-xl border border-sand-400 bg-white overflow-hidden shadow-sm h-full">
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
                <TwoLineCell topWidth="w-28" bottomWidth="w-32" />
                <TwoLineCell topWidth="w-24" bottomWidth="w-12" />
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
);
