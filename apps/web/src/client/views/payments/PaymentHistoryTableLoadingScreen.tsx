import { Skeleton } from "@repo/ui";

export const PaymentHistoryTableSkeleton = ({ withActions = false }: { withActions?: boolean }) => (
  <div className="rounded-xl border border-sand-400 bg-white overflow-hidden shadow-sm">
    <table className="w-full table-auto min-w-[600px]">
      <thead>
        <tr className="bg-sand-100 border-b border-sand-400">
          <th className="px-5 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
          <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-20 ml-auto" /></th>
          <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-16 ml-auto" /></th>
          <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-14 ml-auto" /></th>
          <th className="px-5 py-3 text-right"><Skeleton className="h-3 w-12 ml-auto" /></th>
          {withActions && <th className="px-5 py-3" />}
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="border-b border-sand-200 last:border-0">
            <td className="px-5 py-4">
              <Skeleton className="h-5 w-20 rounded" />
            </td>
            <td className="px-5 py-4 text-right">
              <Skeleton className="h-3 w-16 ml-auto" />
            </td>
            <td className="px-5 py-4 text-right">
              <Skeleton className="h-3 w-20 ml-auto" />
            </td>
            <td className="px-5 py-4 text-right">
              <Skeleton className="h-3 w-24 ml-auto" />
            </td>
            <td className="px-5 py-4">
              <div className="flex justify-end">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </td>
            {withActions && (
              <td className="px-5 py-4">
                <div className="flex justify-end">
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
