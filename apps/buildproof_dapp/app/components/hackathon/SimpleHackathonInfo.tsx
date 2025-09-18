import { useEffect, useState } from 'react'

import { configureClient, SubAtomDocument } from '@0xintuition/graphql_bp'

import { createClient } from 'graphql-ws'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

const wsClient = createClient({
  url: 'wss://dev.base-sepolia.intuition-api.com/v1/graphql',
})

interface SimpleHackathonInfoProps {
  atomId: number
  isExpanded?: boolean
  onToggle?: () => void
}

export const SimpleHackathonInfo = ({
  atomId,
  isExpanded = false,
  onToggle,
}: SimpleHackathonInfoProps) => {
  const [ipfsData, setIpfsData] = useState<{
    name?: string
    description?: string
  }>()
  const [atomData, setAtomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let unsubscribe: () => void

    try {
      unsubscribe = wsClient.subscribe(
        {
          query: SubAtomDocument,
          variables: { id: atomId },
        },
        {
          next: (data) => {
            setAtomData(data.data?.atom)
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

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [atomId])

  useEffect(() => {
    const fetchIpfsData = async () => {
      if (atomData?.data && atomData.data.startsWith('ipfs://')) {
        const ipfsHash = atomData.data.replace('ipfs://', '')
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
        try {
          const response = await fetch(ipfsUrl)
          const data = await response.json()
          setIpfsData(data)
        } catch (err) {
          console.error('Error fetching IPFS data:', err)
        }
      }
    }

    fetchIpfsData()
  }, [atomData?.data])

  if (error) {
    console.error('Subscription error:', error)
    return <div>Error loading hackathon data</div>
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {!atomData
              ? 'Loading...'
              : ipfsData
                ? ipfsData.name || 'No name available'
                : 'Fetching name...'}
          </h2>
        </div>
          <div className="text-gray-300">
            {!atomData
              ? 'Loading...'
              : ipfsData
                ? ipfsData.description || 'No description available'
                : 'Fetching description...'}
          </div>
      </div>
    </div>
  )
}
