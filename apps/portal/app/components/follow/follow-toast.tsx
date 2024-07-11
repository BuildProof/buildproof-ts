import { Icon, Text } from '@0xintuition/1ui'

import { BLOCK_EXPLORER_URL } from '@lib/utils/constants'
import { cn, formatBalance } from '@lib/utils/misc'
import { Link } from '@remix-run/react'

interface ToastProps {
  action: string
  assets: string
  txHash: string
}
export default function FollowToast({ action, assets, txHash }: ToastProps) {
  return (
    <div
      className={cn(
        'z-[999999] m-0 h-full w-[300px] bg-background-primary border rounded-md border-primary/30 py-4 pl-4 pr-4',
      )}
    >
      <div className="flex h-full w-full items-center justify-start gap-4">
        <div className="flex flex-shrink-0">
          <Icon name="circle-check" className="h-6 w-6 text-success" />
        </div>
        <div className="flex w-full flex-1">
          <div className="space-y-0">
            <Text variant="base" weight="bold">
              Transaction Successful
            </Text>
            <Text
              variant="footnote"
              weight="semibold"
              className="text-white/50 inline"
            >
              {action}{' '}
              <Text variant="footnote" weight="bold">
                {formatBalance(BigInt(assets), 18, 6)}
              </Text>{' '}
              ETH
            </Text>
            <Link
              to={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              className="flex flex-row items-center gap-1 text-sm text-blue-500 transition-colors duration-300 hover:text-blue-400"
            >
              View on Explorer{' '}
              <Icon name="square-arrow-top-right" className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
