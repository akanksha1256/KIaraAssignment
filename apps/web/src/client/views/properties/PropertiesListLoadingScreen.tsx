import { Skeleton } from "@repo/ui";

export const UnitRowsSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <tr key={i} className="border-t border-sand-200 bg-sand-100/50">
        <td />
        <td className="px-4 py-2.5">
          <Skeleton className="h-3 w-14" />
        </td>
        <td className="px-4 py-2.5">
          <Skeleton className="h-3 w-28" />
        </td>
        <td className="px-4 py-2.5 text-right">
          <Skeleton className="h-3 w-16 ml-auto" />
        </td>
        <td className="px-4 py-2.5 text-right">
          <Skeleton className="h-5 w-20 ml-auto rounded-full" />
        </td>
        <td className="px-4 py-2.5">
          <div className="flex justify-end">
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const PropertiesListSkeleton = () => (
  <div className="p-8 max-w-[1180px] space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="rounded-xl border border-sand-400 bg-white overflow-hidden">
      <div className="bg-sand-100 px-5 py-3 flex gap-4">
        {[200, 80, 80, 120, 40].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-[${w}px]`} />
        ))}
      </div>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="px-5 py-4 border-t border-sand-200 flex gap-4 items-center">
          {[160, 80, 80, 110, 24].map((w, j) => (
            <Skeleton key={j} className={`h-3 w-[${w}px]`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
