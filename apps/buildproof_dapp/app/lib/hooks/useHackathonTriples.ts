import { useEffect, useState } from 'react'
import {
  SubAtomDocument,
  useGetTriplesWithPositionsQuery,
} from '@0xintuition/graphql_bp'
import { createClient } from 'graphql-ws'

const wsClient = createClient({
  url: 'wss://dev.base-sepolia.intuition-api.com/v1/graphql',
})

interface UseHackathonTriplesProps {
  hackathonId: string | undefined
  userAddress?: string
}

export function useHackathonTriples({ hackathonId, userAddress }: UseHackathonTriplesProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchConditions, setSearchConditions] = useState<any[]>([])

  // Fetch triples data using GraphQL
  const {
    data: triplesData,
    isLoading: isLoadingTriples,
    error: triplesError,
  } = useGetTriplesWithPositionsQuery(
    {
      where: {
        _and: searchConditions,
      },
      address: userAddress?.toLowerCase(),
      orderBy: [
        {
          vault: {
            positions_aggregate: {
              count: 'desc_nulls_last',
            },
          },
        },
        {
          counter_vault: {
            positions_aggregate: {
              count: 'desc_nulls_last',
            },
          },
        },
        {
          vault: {
            total_shares: 'desc_nulls_last',
          },
        },
      ],
    },
    {
      queryKey: ['get-triples-with-positions', userAddress, searchConditions],
      enabled: true,
    },
  )

  useEffect(() => {
    let unsubscribe: () => void

    const fetchHackathonData = async () => {
      try {
        unsubscribe = wsClient.subscribe(
          {
            query: SubAtomDocument,
            variables: { id: Number(hackathonId) },
          },
          {
            next: async (data: any) => {
              const atomData = data?.data?.atom
              if (atomData?.data && atomData.data.startsWith('ipfs://')) {
                const ipfsHash = atomData.data.replace('ipfs://', '')
                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
                try {
                  const response = await fetch(ipfsUrl)
                  const ipfsData = await response.json()
                  // Mettre à jour les conditions de recherche avec le nom du hackathon
                  setSearchConditions([
                    {
                      _and: [{ subject: { label: { _eq: ipfsData.name } } }],
                    },
                  ])
                } catch (err) {
                  console.error('Error fetching IPFS data:', err)
                  setError(err instanceof Error ? err : new Error(String(err)))
                }
              }
              setLoading(false)
            },
            error: (err) => {
              console.error('Subscription error:', err)
              setError(err instanceof Error ? err : new Error(String(err)))
              setLoading(false)
            },
            complete: () => {
              setLoading(false)
            },
          },
        )
      } catch (err) {
        console.error('Failed to create subscription:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    if (hackathonId) {
      fetchHackathonData()
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [hackathonId])

  return {
    triplesData,
    loading: loading || isLoadingTriples,
    error: error || triplesError,
  }
} 