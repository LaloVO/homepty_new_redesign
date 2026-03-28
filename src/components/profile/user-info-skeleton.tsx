import { Skeleton } from "@/components/ui/skeleton";

export function UserInfoSkeleton() {
  return (
    <div className="glass-card rounded-3xl overflow-hidden relative mb-8 border border-gray-200/50 shadow-sm bg-white/40 backdrop-blur-md animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-44 w-full bg-gray-100" />

      <div className="px-8 pb-8 relative">
        <div className="flex justify-between items-end -mt-12 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg shadow-gray-200/50">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-60" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-14 w-20 rounded-xl" />
            <Skeleton className="h-14 w-20 rounded-xl" />
            <Skeleton className="h-14 w-20 rounded-xl" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100/80">
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
