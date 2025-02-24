import {
  Button,
  ButtonSize,
  ButtonVariant,
  Claim,
  ClaimPosition,
  ClaimRow,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Icon,
  IconName,
  Identity,
  IdentityRow,
  IdentityTag,
  ProfileCard,
  Text,
  Trunctacular,
  useSidebarLayoutContext,
} from '@0xintuition/1ui'
import {
  ActivityPresenter,
  IdentityPresenter,
  Redeemed,
  SortColumn,
} from '@0xintuition/api'

import RemixLink from '@components/remix-link'
import {
  formatBalance,
  getAtomDescription,
  getAtomImage,
  getAtomIpfsLink,
  getAtomLabel,
  getAtomLink,
  getClaimUrl,
} from '@lib/utils/misc'
import { Link } from '@remix-run/react'
import { BLOCK_EXPLORER_URL, PATHS } from 'app/consts'
import { PaginationType } from 'app/types/pagination'
import { formatDistance } from 'date-fns'

import { List } from './list'

export function ActivityList({
  activities,
  pagination,
  paramPrefix,
}: {
  activities: ActivityPresenter[]
  pagination: PaginationType
  paramPrefix?: string
}) {
  const eventMessages: EventMessages = {
    createAtom: 'created an identity',
    createTriple: 'created a claim',
    depositAtom: (value: string) =>
      `deposited ${formatBalance(value, 18)} ETH on an identity`,
    redeemAtom: (value: string) =>
      `redeemed ${formatBalance(value, 18)} ETH from an identity`,
    depositTriple: (value: string) =>
      `deposited ${formatBalance(value, 18)} ETH on a claim`,
    redeemTriple: (value: string) =>
      `redeemed ${formatBalance(value, 18)} ETH from a claim`,
  }

  return (
    <List<SortColumn>
      pagination={pagination}
      paginationLabel="activities"
      paramPrefix={paramPrefix}
      enableSearch={false}
      enableSort={false}
    >
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          eventMessages={eventMessages}
          index={index}
          totalItems={activities.length}
        />
      ))}
    </List>
  )
}

type EventMessages = {
  createAtom: string
  createTriple: string
  depositAtom: (value: string) => string
  redeemAtom: (value: string) => string
  depositTriple: (value: string) => string
  redeemTriple: (value: string) => string
}

function ActivityItem({
  activity,
  eventMessages,
  index,
  totalItems,
}: {
  activity: ActivityPresenter
  eventMessages: EventMessages
  index: number
  totalItems: number
}) {
  const eventMessage = eventMessages[activity.event_type as keyof EventMessages]
  const isRedeemEvent = activity.event_type.startsWith('redeem')
  const value = isRedeemEvent
    ? (activity.logs?.[0] as { Redeemed: Redeemed }).Redeemed
        .assets_for_receiver
    : activity.value
  const message = eventMessage
    ? typeof eventMessage === 'function'
      ? (eventMessage as (value: string) => string)(value).toString()
      : eventMessage.toString()
    : ''

  const { isMobileView } = useSidebarLayoutContext()

  return (
    <div
      key={activity.id}
      className="grow shrink basis-0 self-stretch bg-background first:border-t-px first:rounded-t-xl last:rounded-b-xl theme-border border-t-0 flex-col justify-start inline-flex"
    >
      <div className="flex flex-row items-center px-4 py-3 justify-between min-w-full max-md:flex-col max-md:gap-3">
        <div className="flex flex-row items-center gap-2 max-md:flex-col">
          <HoverCard openDelay={150} closeDelay={150}>
            <HoverCardTrigger asChild>
              <Link
                to={
                  activity.creator
                    ? `${PATHS.PROFILE}/${activity.creator?.wallet}`
                    : `${BLOCK_EXPLORER_URL}/address/${activity.identity?.creator_address}`
                }
                prefetch="intent"
              >
                <IdentityTag
                  variant={Identity.user}
                  size="lg"
                  imgSrc={activity.creator?.image ?? ''}
                >
                  <Trunctacular
                    value={
                      activity.creator?.display_name ??
                      activity.creator?.wallet ??
                      activity.identity?.creator_address ??
                      '?'
                    }
                    maxStringLength={32}
                  />
                </IdentityTag>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-max">
              <div className="w-80 max-md:w-[80%]">
                {activity.creator ? (
                  <ProfileCard
                    variant={Identity.user}
                    avatarSrc={activity.creator?.image ?? ''}
                    name={activity.creator?.display_name ?? ''}
                    id={activity.creator?.wallet}
                    bio={activity.creator?.description ?? ''}
                    ipfsLink={`${BLOCK_EXPLORER_URL}/address/${activity.creator?.wallet}`}
                    className="w-80"
                  />
                ) : (
                  <ProfileCard
                    variant={Identity.user}
                    avatarSrc={''}
                    name={activity.identity?.creator_address ?? ''}
                    id={activity.identity?.creator_address}
                    bio={
                      'There is no user associated with this wallet. This data was created on-chain, outside of the Intuition Portal.'
                    }
                    ipfsLink={`${BLOCK_EXPLORER_URL}/address/${activity.identity?.creator_address}`}
                    className="w-80"
                  />
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
          <Text>{message}</Text>
        </div>
        <div className="flex gap-2 items-center">
          <Text className="text-secondary-foreground">
            {formatDistance(new Date(activity.timestamp), new Date())} ago
          </Text>
          <a
            href={`${BLOCK_EXPLORER_URL}/tx/${activity.transaction_hash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button
              variant={ButtonVariant.secondary}
              size={ButtonSize.md}
              className="w-max h-fit"
            >
              View on Explorer{' '}
              <Icon name={IconName.squareArrowTopRight} className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
      <div className="flex w-full px-5 pb-4">
        {activity.identity !== null && activity.identity !== undefined && (
          <IdentityRow
            variant={
              activity.identity.is_user ? Identity.user : Identity.nonUser
            }
            avatarSrc={getAtomImage(activity.identity)}
            name={getAtomLabel(activity.identity)}
            description={getAtomDescription(activity.identity)}
            id={activity.identity.user?.wallet ?? activity.identity.identity_id}
            totalTVL={formatBalance(
              BigInt(activity.identity.assets_sum ?? '0'),
              18,
            )}
            numPositions={activity.identity.num_positions}
            link={getAtomLink(activity.identity)}
            ipfsLink={getAtomIpfsLink(activity.identity)}
            tags={
              activity.identity.tags?.map((tag) => ({
                label: tag.display_name,
                value: tag.num_tagged_identities,
              })) ?? undefined
            }
            isFirst={index === 0}
            isLast={index === totalItems - 1}
            className="border-none rounded-xl bg-primary/5"
          />
        )}
        {activity.claim && (
          <ClaimRow
            numPositionsFor={activity.claim.for_num_positions}
            numPositionsAgainst={activity.claim.against_num_positions}
            tvlFor={formatBalance(activity.claim.for_assets_sum, 18)}
            tvlAgainst={formatBalance(activity.claim.against_assets_sum, 18)}
            totalTVL={formatBalance(activity.claim.assets_sum, 18)}
            userPosition={formatBalance(activity.claim.user_assets, 18)}
            positionDirection={
              +activity.claim.user_assets_for > 0
                ? ClaimPosition.claimFor
                : +activity.claim.user_assets_against > 0
                  ? ClaimPosition.claimAgainst
                  : undefined
            }
            isFirst={index === 0}
            isLast={index === totalItems - 1}
            className="border-none rounded-xl bg-primary/5"
          >
            <Link to={getClaimUrl(activity.claim.vault_id)} prefetch="intent">
              <Claim
                size="md"
                subject={{
                  variant: activity.claim.subject?.is_user
                    ? Identity.user
                    : Identity.nonUser,
                  label: getAtomLabel(
                    activity.claim.subject as IdentityPresenter,
                  ),
                  imgSrc: getAtomImage(
                    activity.claim.subject as IdentityPresenter,
                  ),
                  id: activity.claim.subject?.identity_id,
                  description: getAtomDescription(
                    activity.claim.subject as IdentityPresenter,
                  ),
                  ipfsLink: getAtomIpfsLink(
                    activity.claim.subject as IdentityPresenter,
                  ),
                  link: getAtomLink(
                    activity.claim.subject as IdentityPresenter,
                  ),
                  linkComponent: RemixLink,
                }}
                predicate={{
                  variant: activity.claim.predicate?.is_user
                    ? Identity.user
                    : Identity.nonUser,
                  label: getAtomLabel(
                    activity.claim.predicate as IdentityPresenter,
                  ),
                  imgSrc: getAtomImage(
                    activity.claim.predicate as IdentityPresenter,
                  ),
                  id: activity.claim.predicate?.identity_id,
                  description: getAtomDescription(
                    activity.claim.predicate as IdentityPresenter,
                  ),
                  ipfsLink: getAtomIpfsLink(
                    activity.claim.predicate as IdentityPresenter,
                  ),
                  link: getAtomLink(
                    activity.claim.predicate as IdentityPresenter,
                  ),
                  linkComponent: RemixLink,
                }}
                object={{
                  variant: activity.claim.object?.is_user
                    ? Identity.user
                    : Identity.nonUser,
                  label: getAtomLabel(
                    activity.claim.object as IdentityPresenter,
                  ),
                  imgSrc: getAtomImage(
                    activity.claim.object as IdentityPresenter,
                  ),
                  id: activity.claim.object?.identity_id,
                  description: getAtomDescription(
                    activity.claim.object as IdentityPresenter,
                  ),
                  ipfsLink: getAtomIpfsLink(
                    activity.claim.object as IdentityPresenter,
                  ),
                  link: getAtomLink(activity.claim.object as IdentityPresenter),
                  linkComponent: RemixLink,
                }}
                isClickable={true}
                orientation={isMobileView ? 'vertical' : 'horizontal'}
              />
            </Link>
          </ClaimRow>
        )}
      </div>
    </div>
  )
}
