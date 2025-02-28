import { Suspense, useState } from 'react'

import { ClaimPosition, ClaimRow, Skeleton } from '@0xintuition/buildproof_ui'
import { configureClient } from '@0xintuition/graphql_bp'

import { SimpleHackathonInfo } from '@components/hackathon/SimpleHackathonInfo'
import { RedeemStakeModal } from '@components/vote/RedeemStakeModal'
import type { SupportedCurrency } from '@components/vote/types'
import { VotingPageView } from '@components/hackathon/VotingPageHackathon'
import { useBatchDepositTriple } from '@lib/hooks/useBatchDepositTriple'
import { useHackathonTriples } from '@lib/hooks/useHackathonTriples'
import { useVerifyAttestor } from '@lib/hooks/useVerifyAttestor'
import { getChainEnvConfig } from '@lib/utils/environment'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import {
  Link,
  useOutletContext,
  useParams,
} from '@remix-run/react'
import { CURRENT_ENV } from 'app/consts'
import { parseEther } from 'viem'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

export async function loader({ request }: LoaderFunctionArgs) {
  // Parent route handles authentication and common data
  return null
}

type HackathonContext = {
  userAddress: string
  atomId: number
}

export default function HackathonOverview() {
  const { id } = useParams()
  const { userAddress } = useOutletContext<HackathonContext>()
  const [isExpanded, setIsExpanded] = useState(false)
  const [ethAmount, setEthAmount] = useState('0.001')
  const [currency, setCurrency] = useState<SupportedCurrency>('ETH')
  const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>(
    {},
  )
  const [ethPrice, setEthPrice] = useState('2000')
  const [redeemModalState, setRedeemModalState] = useState<{
    isOpen: boolean
    claimId: string
    maxStake: number
  }>({
    isOpen: false,
    claimId: '',
    maxStake: 0,
  })

  const { triplesData, loading, error } = useHackathonTriples({
    hackathonId: id,
    userAddress,
  })

  const { batchDepositTriple } = useBatchDepositTriple()
  const { verifyAndApproveAttestor } = useVerifyAttestor()

  const handleRedeemClick = (claimId: string, maxStake: number) => {
    setRedeemModalState({
      isOpen: true,
      claimId,
      maxStake,
    })
  }

  const handleSubmit = async () => {
    if (!userAddress || !ethAmount || !triplesData?.triples) return

    try {
      const attestorAddress = '0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36'
      await verifyAndApproveAttestor()

      const triplesWithPercentages = triplesData.triples
        .map((triple: any) => {
          const percentage = sliderValues[triple.id] || 0
          if (percentage === 0) return null

          const amountToAdd = parseEther(
            ((Math.abs(percentage) / 100) * Number(ethAmount)).toString(),
          )

          return {
            vault_id: triple.vault_id,
            counter_vault_id: triple.counter_vault_id,
            percentage,
            amountToAdd,
          }
        })
        .filter((t): t is NonNullable<typeof t> => t !== null)

      const stakes = {
        ids: triplesWithPercentages.map((t) =>
          BigInt(t.percentage > 0 ? t.vault_id : t.counter_vault_id),
        ),
        values: triplesWithPercentages.map((t) => t.amountToAdd),
      }

      const totalValueToSend = stakes.values.reduce(
        (sum, value) => sum + value,
        0n,
      )

      if (stakes.ids.length > 0) {
        await batchDepositTriple(
          {
            receiver: userAddress as `0x${string}`,
            ids: stakes.ids,
            values: stakes.values,
            attestorAddress: attestorAddress as `0x${string}`,
          },
          { value: totalValueToSend },
        )
      }

      setSliderValues({})
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  if (!id || loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }

  // Transform triples data for the voting view
  const sortedItems = (triplesData?.triples || [])
    .slice(0, 3)
    .map((triple: any) => ({
      id: triple.id,
      subject: triple.subject?.label || '',
      predicate: triple.predicate?.label || '',
      object: triple.object?.label || '',
      numPositionsFor: triple.vault?.position_count || 0,
      numPositionsAgainst: triple.counter_vault?.position_count || 0,
      totalTVL: triple.vault?.total_shares || '0',
      tvlFor: triple.vault?.total_shares || '0',
      tvlAgainst: triple.counter_vault?.total_shares || '0',
      currency: currency,
      votesCount:
        (triple.vault?.position_count || 0) +
        (triple.counter_vault?.position_count || 0),
      totalEth:
        Number(triple.vault?.total_shares || '0') +
        Number(triple.counter_vault?.total_shares || '0'),
      userPosition:
        triple.vault?.positions?.[0]?.shares ||
        triple.counter_vault?.positions?.[0]?.shares,
      positionDirection: triple.vault?.positions?.[0]
        ? ClaimPosition.claimFor
        : triple.counter_vault?.positions?.[0]
          ? ClaimPosition.claimAgainst
          : undefined,
      vault: {
        current_share_price: triple.vault?.current_share_price || '0',
      },
      counter_vault: {
        current_share_price: triple.counter_vault?.current_share_price || '0',
      },
    }))

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
              <Link
                to={`/hackathon/${id}/details`}
                className="text-blue-400 hover:text-blue-300"
              >
                Full Details →
              </Link>
            </div>
          </div>
        </Suspense>
      </section>

      {/* Vote Preview using VotingPageView */}
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
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-12">
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
          }
        >
          <div className="overview-preview [&_.sticky]:hidden [&_select]:hidden [&_.mr-4:has(>span)]:hidden [&>div]:!min-h-0 [&>div]:h-auto [&_.relative]:!min-h-0 [&_.max-w-4xl]:!min-h-0 [&_.flex-1]:!h-auto">
            <VotingPageView
              tabs={[{ value: 'voting', label: 'Top Claims' }]}
              ethAmount={ethAmount}
              setEthAmount={setEthAmount}
              totalAbsoluteValue={Object.values(sliderValues).reduce(
                (sum, value) => sum + Math.abs(value),
                0,
              )}
              resetAllSliders={() => setSliderValues({})}
              sortedItems={sortedItems}
              sliderValues={sliderValues}
              resetSingleSlider={(id: string) => {
                const newValues = { ...sliderValues }
                delete newValues[id]
                setSliderValues(newValues)
              }}
              handleSliderChange={(id: string, value: number) => {
                setSliderValues({ ...sliderValues, [id]: value })
              }}
              handleSliderCommit={(id: string, value: number) => {
                setSliderValues({ ...sliderValues, [id]: value })
              }}
              canSubmit={Object.values(sliderValues).some(
                (value) => value !== 0,
              )}
              handleSubmit={handleSubmit}
              currentPage={1}
              totalPages={1}
              rowsPerPage="3"
              setRowsPerPage={() => {}}
              setCurrentPage={() => {}}
              data={sortedItems}
              currency={currency}
              onCurrencyToggle={() =>
                setCurrency(currency === 'ETH' ? '$' : 'ETH')
              }
              setDebouncedSliderValues={setSliderValues}
              userAddress={userAddress}
              triplesData={triplesData}
              ethPrice={ethPrice}
              onRedeemClick={handleRedeemClick}
            />
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              to={`/app/hackathon/${id}/vote`}
              className="px-8 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
            >
              View All Claims
            </Link>
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
