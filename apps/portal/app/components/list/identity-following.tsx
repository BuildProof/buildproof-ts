import { IdentityPosition } from '@0xintuition/1ui'
import { IdentityPresenter, SortColumn } from '@0xintuition/api'

import { PaginationComponent } from '@components/pagination-component'
import { SearchAndSort } from '@components/search-and-sort'
import { SortOption } from '@components/sort-select'
import { useSearchAndSortParamsHandler } from '@lib/hooks/useSearchAndSortParams'
import { formatBalance } from '@lib/utils/misc'

interface PaginationType {
  totalEntries: number | undefined
  currentPage: number
  totalPages: number
  limit: number
}

export function FollowingOnIdentity({
  following,
  pagination,
}: {
  following: IdentityPresenter[]
  pagination: PaginationType
}) {
  const options: SortOption<SortColumn>[] = [
    { value: 'Position Amount', sortBy: 'UserAssets' },
    { value: 'Total ETH', sortBy: 'AssetsSum' },
    { value: 'Updated At', sortBy: 'UpdatedAt' },
    { value: 'Created At', sortBy: 'CreatedAt' },
  ]

  const { handleSortChange, handleSearchChange, onPageChange, onLimitChange } =
    useSearchAndSortParamsHandler<SortColumn>('following')

  return (
    <>
      <SearchAndSort
        options={options}
        handleSortChange={handleSortChange}
        handleSearchChange={handleSearchChange}
      />
      <div className="mt-6 flex flex-col w-full">
        {following?.map((follower) => (
          <div
            key={follower.id}
            className={`grow shrink basis-0 self-stretch p-6 bg-black first:rounded-t-xl last:rounded-b-xl border border-neutral-300/20 flex-col justify-start items-start gap-5 inline-flex`}
          >
            <IdentityPosition
              variant={follower.is_user ? 'user' : 'non-user'}
              avatarSrc={follower.user?.image ?? follower.image ?? ''}
              name={follower.user?.display_name ?? follower.display_name ?? ''}
              walletAddress={
                follower.user?.wallet ?? follower.identity_id ?? ''
              }
              amount={+formatBalance(BigInt(follower.user_assets), 18, 4)}
              feesAccrued={
                follower.user_asset_delta
                  ? +formatBalance(
                      +follower.user_assets - +follower.user_asset_delta,
                      18,
                      5,
                    )
                  : 0
              }
              updatedAt={follower.updated_at}
            />
          </div>
        ))}
      </div>
      <PaginationComponent
        totalEntries={pagination.totalEntries ?? 0}
        currentPage={pagination.currentPage ?? 0}
        totalPages={pagination.totalPages ?? 0}
        limit={pagination.limit ?? 0}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        label="positions"
      />
    </>
  )
}