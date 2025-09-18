import { Suspense, useState } from 'react'

import { Skeleton } from '@0xintuition/buildproof_ui'
import { configureClient } from '@0xintuition/graphql_bp'

import { SimpleHackathonInfo } from '@components/hackathon/SimpleHackathonInfo'
import { StakeDistribution } from '@components/vote/StakeDistribution'
import { useHackathonTriples } from '@lib/hooks/useHackathonTriples'
import { Link, useOutletContext, useParams } from '@remix-run/react'

type HackathonContext = {
  userAddress: string
  atomId: number
}

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

export default function Overview() {
  const { id } = useParams()
  const { userAddress } = useOutletContext<HackathonContext>()
  const [isExpanded, setIsExpanded] = useState(false)

  const { triplesData, loading, error } = useHackathonTriples({
    hackathonId: id || '',
    userAddress,
  })

  if (!id) {
    return <div className="p-4">Hackathon ID is required</div>
  }

  if (loading) {
    return <div className="p-4">Loading triples data...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading triples: {String(error)}
      </div>
    )
  }

  // Take only first 3 triples
  const previewTriplesData = triplesData
    ? {
        ...triplesData,
        triples: triplesData.triples.slice(0, 3),
      }
    : undefined

  return (
    <div className="w-full space-y-8">
      {/* Hackathon Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white p-6 w-full">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-[600px]" />
                  <Skeleton className="h-6 w-[400px]" />
                  <Skeleton className="h-6 w-[300px]" />
                </div>
                <Skeleton className="h-12 w-40" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <SimpleHackathonInfo
              atomId={parseInt(id)}
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
            <div className="flex justify-end">
              <Link to="details" className="text-blue-400 hover:text-blue-300">
                Full Details →
              </Link>
            </div>
          </div>
        </Suspense>
      </section>

      {/* Vote Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white p-6">
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-16 w-64" />
                  <Skeleton className="h-16 w-48" />
                </div>
                <Skeleton className="h-16 w-48" />
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-700 p-8 rounded-lg space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="space-y-6 flex-1 mr-8">
                      <Skeleton className="h-12 w-full max-w-4xl" />
                      <div className="flex gap-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-48" />
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <Skeleton className="h-16 w-48" />
                      <Skeleton className="h-16 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          }
        >
          <div className="overview-preview [&_.sticky]:hidden [&_select]:hidden [&_.mr-4:has(>span)]:hidden [&>div]:!min-h-0 [&>div]:h-auto [&_.relative]:!min-h-0 [&_.max-w-4xl]:!min-h-0 [&_.flex-1]:!h-auto">
            <h2 className="text-xl font-bold mb-6">Top Claims</h2>
            <StakeDistribution
              triplesData={previewTriplesData}
              userAddress={userAddress}
            />
            <div className="mt-6 flex justify-center">
              <Link
                to={`/app/hackathon/${id}/vote`}
                className="px-8 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
              >
                View All Claims
              </Link>
            </div>
          </div>
        </Suspense>
      </section>

      {/* Activity Log Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white">
        <div className="p-6">
          <Suspense
            fallback={
              <div className="space-y-6">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <h2 className="text-xl font-bold mb-4">Activity Log</h2>
            <div className="text-gray-400 text-center py-8">
              Activity Log coming soon...
            </div>
          </Suspense>
        </div>
      </section>

      {/* Graph Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white">
        <div className="p-6">
          <Suspense
            fallback={
              <div className="space-y-6">
                <Skeleton className="h-10 w-48 mb-8" />
                <Skeleton className="h-[500px] w-full rounded-lg bg-gray-700" />
              </div>
            }
          >
            <h2 className="text-xl font-bold mb-4">Graph Visualization</h2>
            <div className="text-gray-400 text-center py-8">
              Graph visualization coming soon...
            </div>
          </Suspense>
        </div>
      </section>
    </div>
  )
}
