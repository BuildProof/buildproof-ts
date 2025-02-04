import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@0xintuition/buildproof_ui'
import { Button } from '@0xintuition/buildproof_ui'
import { Input } from '@0xintuition/buildproof_ui'
import { useBatchRedeemTriple } from '../../lib/hooks/useBatchRedeemTriple'
import { parseEther } from 'viem'
import { multivaultAbi } from '../../lib/abis/multivault'
import { calculateStakes } from '../../lib/utils/calculateStakes'

interface RedeemStakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  maxStake: number;
  contractAddress: string;
  userAddress: string;
}

export function RedeemStakeModal({
  isOpen,
  onClose,
  claimId,
  maxStake,
  contractAddress,
  userAddress
}: RedeemStakeModalProps) {
  const [amount, setAmount] = useState(maxStake)
  const { batchRedeemTriple, isPending } = useBatchRedeemTriple(contractAddress)

  useEffect(() => {
    if (isOpen && !userAddress) {
      console.error('Modal opened without user address')
      onClose()
    }
  }, [isOpen, userAddress, onClose])

  const handleRedeem = async () => {
    console.log('Starting redeem process...')
    console.log('User address:', userAddress)
    console.log('Claim ID:', claimId)
    console.log('Amount:', amount)

    if (!userAddress || userAddress === 'undefined') {
      console.error('No valid user address provided')
      return
    }

    try {
      const amountInWei = parseEther(amount.toString())
      console.log('Amount in Wei:', amountInWei)
      
      const attestorAddress = "0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36"
      console.log('Attestor address:', attestorAddress)

      const params = {
        values: [amountInWei],
        receiver: userAddress as `0x${string}`,
        ids: [BigInt(claimId)],
        attestorAddress: attestorAddress as `0x${string}`
      }
      console.log('Transaction params:', params)

      console.log('Calling batchRedeemTriple...')
      const tx = await batchRedeemTriple(params)
      console.log('Transaction response:', tx)

      onClose()
    } catch (error) {
      console.error('Detailed error in redeem process:', error)
      throw error
    }
  }

  const handlePercentageClick = (percentage: number) => {
    setAmount(maxStake * (percentage / 100))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= maxStake) {
      setAmount(value)
    }
  }

  // Disable the button if there's no valid user address
  const isDisabled = !userAddress || userAddress === 'undefined' || isPending || amount <= 0 || amount > maxStake

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem Stake</DialogTitle>
          <DialogDescription>
            Choose how much stake you want to redeem from this claim.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount to Redeem</label>
            <Input
              type="number"
              value={amount}
              onChange={handleInputChange}
              max={maxStake}
              min={0}
              step="any"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum available: {maxStake}
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(25)}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(50)}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(75)}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(100)}
              >
                Max
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={isDisabled}
            >
              {isPending ? 'Redeeming...' : 'Redeem Stake'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 