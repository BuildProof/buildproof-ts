import { useEffect, useState } from 'react'

import { Button, cn } from '@0xintuition/1ui'

import { stakeModalAtom } from '@lib/state/store'
import { CURRENT_ENV } from '@lib/utils/constants'
import { getChainEnvConfig } from '@lib/utils/environment'
import { formatBalance } from '@lib/utils/misc'
import { Cookie } from '@remix-run/node'
import { useNavigation } from '@remix-run/react'
import { useSetAtom } from 'jotai'
import type {
  StakeTransactionAction,
  StakeTransactionState,
} from 'types/stake-transaction'
import { SessionUser } from 'types/user'
import { formatUnits } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'

interface FollowButtonProps {
  user: SessionUser
  tosCookie: Cookie
  val: string
  setMode: (mode: 'follow' | 'unfollow') => void
  handleAction: () => void
  handleClose: () => void
  dispatch: (action: StakeTransactionAction) => void
  state: StakeTransactionState
  min_deposit: string
  walletBalance: string
  setValidationErrors: (errors: string[]) => void
  setShowErrors: (show: boolean) => void
  conviction_price: string
  user_assets: string
  id?: string
  claimOrIdentity?: string
  className?: string
}

const FollowButton: React.FC<FollowButtonProps> = ({
  val,
  setMode,
  handleAction,
  handleClose,
  dispatch,
  state,
  min_deposit,
  walletBalance,
  setValidationErrors,
  setShowErrors,
  conviction_price,
  user_assets,
  className,
}) => {
  const { switchChain } = useSwitchChain()

  const handleSwitch = () => {
    if (switchChain) {
      switchChain({ chainId: getChainEnvConfig(CURRENT_ENV).chainId })
    }
  }

  const { address, chain } = useAccount()

  const formattedConvictionPrice = formatUnits(BigInt(conviction_price), 18)

  console.log('val', val)
  const getButtonText = () => {
    if (val === '') {
      return 'Enter an Amount'
    } else if (state.status === 'review') {
      return 'Confirm'
    } else if (state.status === 'confirm') {
      return 'Continue in Wallet'
    } else if (state.status === 'pending') {
      return 'Pending'
    } else if (state.status === 'confirmed' || state.status === 'complete') {
      return 'Go to Profile'
    } else if (state.status === 'error') {
      return 'Retry'
    } else if (chain?.id !== getChainEnvConfig(CURRENT_ENV).chainId) {
      return 'Wrong Network'
    } else {
      return `${user_assets > '0' ? 'Increase Follow' : 'Follow'}`
    }
  }

  const setStakeModalActive = useSetAtom(stakeModalAtom)

  const navigation = useNavigation()
  const [navigationStarted, setNavigationStarted] = useState(false)

  useEffect(() => {
    if (navigation.state !== 'idle') {
      setNavigationStarted(true)
    }
  }, [navigation.state])

  useEffect(() => {
    if (navigation.state === 'idle' && navigationStarted) {
      setStakeModalActive({
        isOpen: false,
        id: null,
        direction: null,
        modalType: null,
      })
      setNavigationStarted(false)
    }
  }, [navigation.state, navigationStarted])

  return (
    <Button
      variant="primary"
      onClick={(e) => {
        e.preventDefault()
        if (state.status === 'complete' || state.status === 'confirmed') {
          handleClose()
        } else if (state.status === 'review') {
          handleAction()
        } else {
          if (chain?.id !== getChainEnvConfig(CURRENT_ENV).chainId) {
            handleSwitch()
          } else if (val !== '') {
            const errors = []
            if (+val < +formatUnits(BigInt(min_deposit), 18)) {
              errors.push(
                `Minimum deposit is ${formatBalance(min_deposit, 18, 4)} ETH`,
              )
            }
            if (+val * +formattedConvictionPrice > +walletBalance) {
              errors.push('Insufficient funds')
            }

            if (errors.length > 0) {
              setValidationErrors(errors)
              setShowErrors(true)
            } else {
              setMode('follow')
              dispatch({ type: 'REVIEW_TRANSACTION' })
              setValidationErrors([])
            }
          }
        }
      }}
      disabled={
        !address ||
        val === '' ||
        state.status === 'confirm' ||
        state.status === 'pending'
      }
      className={cn(`w-[159px] m-auto mt-10`, className)}
    >
      {getButtonText()}
    </Button>
  )
}

export default FollowButton