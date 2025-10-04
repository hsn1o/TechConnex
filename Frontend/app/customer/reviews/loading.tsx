import { Skeleton } from "@/components/ui/skeleton"
import { CustomerLayout } from "@/components/customer-layout"

export default function CustomerReviewsLoading() {
  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="border rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        {/* Reviews List Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="w-4 h-4" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-5 w-64 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  )
}
