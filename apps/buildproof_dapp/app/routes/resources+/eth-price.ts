import { json } from '@remix-run/node'
import { getEthPrice } from '@lib/services/pricefeeds'

export async function loader() {
  try {
    const price = await getEthPrice()
    return json({ price })
  } catch (error) {
    console.error('Error fetching ETH price:', error)
    return json(
      { error: 'Failed to fetch ETH price' },
      { status: 500 }
    )
  }
} 