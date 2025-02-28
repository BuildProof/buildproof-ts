import { useState } from 'react'

import { ClaimRow } from '@0xintuition/buildproof_ui'
import { configureClient } from '@0xintuition/graphql_bp'

import { SimpleHackathonInfo } from '@components/hackathon/SimpleHackathonInfo'
import { RedeemStakeModal } from '@components/vote/RedeemStakeModal'
import { useHackathonTriples } from '@lib/hooks/useHackathonTriples'
import { getChainEnvConfig } from '@lib/utils/environment'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Link, useLoaderData, useParams } from '@remix-run/react'
import { requireUser } from '@server/auth'
import { PATHS } from 'app/config/paths'
import { CURRENT_ENV } from 'app/consts'
import { formatUnits } from 'viem'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request)
    if (!user || !user.wallet?.address) {
      return redirect(PATHS.LOGIN)
    }
    return json({
      userAddress: user.wallet.address,
    })
  } catch (error) {
    console.error('Error in overview loader:', error)
    return redirect(PATHS.LOGIN)
  }
}

export default function HackathonOverview() {
  const { id } = useParams()
  const { userAddress } = useLoaderData<typeof loader>()
  const [isExpanded, setIsExpanded] = useState(false)
  const [redeemModalState, setRedeemModalState] = useState<{
    isOpen: boolean
    claimId: string
    maxStake: number
  }>({
    isOpen: false,
    claimId: '',
    maxStake: 0,
  })
  const [ethPrice, setEthPrice] = useState('2000')

  const { triplesData, loading, error } = useHackathonTriples({
    hackathonId: id,
    userAddress,
  })

  const handleRedeemClick = (triple: any) => {
    const userPosition =
      triple.vault?.positions?.[0] || triple.counter_vault?.positions?.[0]
    const sharePrice = triple.vault?.positions?.[0]
      ? triple.vault.current_share_price
      : triple.counter_vault?.current_share_price

    if (userPosition && sharePrice) {
      setRedeemModalState({
        isOpen: true,
        claimId: triple.vault?.positions?.[0]
          ? triple.vault_id
          : triple.counter_vault_id,
        maxStake: Number(formatUnits(BigInt(userPosition.shares), 18)),
      })
    }
  }

  if (!id || loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }

  // Get only the top 3 claims
  const topClaims = (triplesData?.triples || []).slice(0, 3)

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Hackathon Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white p-6">
        <div className="space-y-4">
          <SimpleHackathonInfo
            atomId={parseInt(id)}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
          <div className="flex justify-end">
            <Link
              to={`/hackathon/${id}/details`}
              className="text-blue-400 hover:text-blue-300"
            >
              Full Details →
            </Link>
          </div>
        </div>
      </section>

      {/* Vote Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white p-6">
        <div className="space-y-6">
          {/* Total Stakes Input */}
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">
                  Your Total stakes for this hackathon
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue="0.001"
                    className="bg-transparent w-24 text-right"
                  />
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    <button className="px-2 rounded text-sm bg-blue-500">
                      ETH
                    </button>
                    <button className="px-2 text-sm">USD</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-1 max-w-md bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Stakes placed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full">
                    <div className="w-3/5 h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span>60/100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div className="space-y-4">
            {topClaims.map((triple: any) => (
              <ClaimRow
                key={triple.id}
                numPositionsFor={triple.vault?.position_count || 0}
                numPositionsAgainst={triple.counter_vault?.position_count || 0}
                totalTVL={triple.vault?.total_shares || '0'}
                tvlFor={triple.vault?.total_shares || '0'}
                tvlAgainst={triple.counter_vault?.total_shares || '0'}
                currency="ETH"
                onStakeForClick={() => {}}
                onStakeAgainstClick={() => {}}
              >
                <div className="flex flex-col w-full gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{triple.subject?.label}</span>
                      <span className="text-gray-500">has tag</span>
                      <span className="text-sm">{triple.object?.label}</span>
                    </div>
                    {(triple.vault?.positions?.[0] ||
                      triple.counter_vault?.positions?.[0]) && (
                      <button
                        onClick={() => handleRedeemClick(triple)}
                        className="px-2 py-1 bg-gray-800 text-sm rounded hover:bg-gray-700"
                      >
                        Redeem Stake
                      </button>
                    )}
                  </div>
                </div>
              </ClaimRow>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to={`/hackathon/${id}/vote`}
              className="px-8 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
            >
              View All Claims
            </Link>
          </div>
        </div>
      </section>

      {/* Activity Log Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Activity Log</h2>
          <div className="text-gray-400 text-center py-8">
            Activity Log coming soon...
          </div>
        </div>
      </section>

      {/* Graph Preview */}
      <section className="bg-gray-800 rounded-lg shadow text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Graph Visualization</h2>
          <div className="text-gray-400 text-center py-8">
            Graph visualization coming soon...
          </div>
        </div>
      </section>

      <RedeemStakeModal
        isOpen={redeemModalState.isOpen}
        onClose={() =>
          setRedeemModalState({ isOpen: false, claimId: '', maxStake: 0 })
        }
        claimId={redeemModalState.claimId}
        maxStake={redeemModalState.maxStake}
        contractAddress={getChainEnvConfig(CURRENT_ENV).contractAddress}
        userAddress={userAddress}
        totalShares={
          triplesData?.triples.find(
            (t) =>
              t.vault_id === redeemModalState.claimId ||
              t.counter_vault_id === redeemModalState.claimId,
          )?.vault?.positions?.[0]?.shares ||
          triplesData?.triples.find(
            (t) =>
              t.vault_id === redeemModalState.claimId ||
              t.counter_vault_id === redeemModalState.claimId,
          )?.counter_vault?.positions?.[0]?.shares ||
          '0'
        }
      />
    </div>
  )
}
