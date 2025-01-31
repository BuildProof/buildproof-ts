import React from 'react'

import { Input } from '@0xintuition/buildproof_ui'
import { Button, ButtonVariant, ButtonSize } from '@0xintuition/buildproof_ui'
import PrizeDistribution from './prize-distribution'
import type { Prize } from './prize-distribution'

interface PrizeSectionProps {
  totalCashPrize: number
  prizes: Prize[]
  onTotalCashPrizeChange: (value: number) => void
  onPrizesChange: (prizes: Prize[]) => void
}

export function PrizeSection({
  totalCashPrize,
  prizes,
  onTotalCashPrizeChange,
  onPrizesChange,
}: PrizeSectionProps) {
  const addPrize = () => {
    const prizeOrder = ['Second Place', 'Third Place', 'Other']
    const nextPrize = prizeOrder[prizes.length - 1] || 'Other'
    onPrizesChange([...prizes, { name: nextPrize, amount: 0, percent: 0 }])
  }

  const removePrize = (index: number) => {
    const newPrizes = prizes.filter((_, i) => i !== index)
    onPrizesChange(newPrizes)
  }

  const updatePrize = (index: number, updatedPrize: Prize) => {
    const newPrizes = [...prizes]
    newPrizes[index] = updatedPrize

    // Recalculate percentages for all prizes
    const updatedPrizesWithPercentages = newPrizes.map((prize) => ({
      ...prize,
      percent: totalCashPrize > 0 ? (prize.amount / totalCashPrize) * 100 : 0,
    }))

    onPrizesChange(updatedPrizesWithPercentages)
  }

  const handleTotalPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseInt(e.target.value) || 0
    onTotalCashPrizeChange(newTotal)

    // Update all prize percentages
    const updatedPrizes = prizes.map((prize) => ({
      ...prize,
      percent: newTotal > 0 ? (prize.amount / newTotal) * 100 : 0,
    }))
    onPrizesChange(updatedPrizes)
  }

  const totalPrizeAmount = prizes.reduce(
    (total, prize) => total + (prize.amount || 0),
    0,
  )
  const difference = totalCashPrize - totalPrizeAmount

  return (
    <div className="space-y-4">
      <Input
        startAdornment="Total Cash Prize"
        type="number"
        value={totalCashPrize.toString()}
        onChange={handleTotalPrizeChange}
        placeholder="Enter total cash prize amount"
        required
        endAdornment="$"
      />

      {prizes.map((prize, index) => (
        <PrizeDistribution
          key={index}
          prize={prize}
          index={index}
          removePrize={removePrize}
          updatePrize={updatePrize}
          availableOptions={[
            { value: 'First Place', label: 'First Place' },
            { value: 'Second Place', label: 'Second Place' },
            { value: 'Third Place', label: 'Third Place' },
            { value: 'Other', label: 'Other' },
          ]}
          totalCashPrize={totalCashPrize}
          prizes={prizes}
          prizesNumber={prizes.length}
        />
      ))}

      {difference !== 0 && (
        <div
          className={`text-sm ${difference < 0 ? 'text-red-500' : 'text-yellow-500'}`}
        >
          {difference < 0
            ? `Total prize amounts exceed the total cash prize by $${Math.abs(difference)}`
            : `Remaining to distribute: $${difference}`}
        </div>
      )}

      <Button
        variant={ButtonVariant.successOutline}
        size={ButtonSize.md}
        type="button"
        onClick={addPrize}
        className="px-4 py-2"
      >
        Add Prize
      </Button>
    </div>
  )
}
