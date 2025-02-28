import { Suspense } from 'react'

import { Skeleton } from '@0xintuition/buildproof_ui'
import { configureClient } from '@0xintuition/graphql_bp'

import { StakeDistribution } from '@components/vote/StakeDistribution'
import { useHackathonTriples } from '@lib/hooks/useHackathonTriples'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'
import { requireUser } from '@server/auth'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request)
    if (!user.wallet?.address) {
      throw new Error('User wallet not found')
    }

    return json({
      userAddress: user.wallet.address,
    })
  } catch (error) {
    console.error('Error in vote loader:', error)
    throw error
  }
}

export default function VotePage() {
  const { userAddress } = useLoaderData<typeof loader>()
  const { id } = useParams()
  const { triplesData, loading, error } = useHackathonTriples({
    hackathonId: id,
    userAddress,
  })

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

  return (
    <div className="flex flex-col gap-4 mt-2">
      <StakeDistribution triplesData={triplesData} userAddress={userAddress} />
    </div>
  )
}
