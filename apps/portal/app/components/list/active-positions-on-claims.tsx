import { ClaimPositionRow } from '@0xintuition/1ui'
import { ClaimPresenter, SortColumn } from '@0xintuition/api'

import { PaginationComponent } from '@components/pagination-component'
import { useSearchAndSortParamsHandler } from '@lib/hooks/useSearchAndSortParams'
import { formatBalance } from '@lib/utils/misc'

import { SearchAndSort } from '../search-and-sort'
import { SortOption } from '../sort-select'

interface PaginationType {
  totalEntries: number | undefined
  currentPage: number
  totalPages: number
  limit: number
}

export function ActivePositionsOnClaims({
  claims,
  pagination,
}: {
  claims: ClaimPresenter[]
  pagination: PaginationType
}) {
  const options: SortOption<SortColumn>[] = [
    { value: 'Position Amount', sortBy: 'UserAssets' },
    { value: 'Total ETH', sortBy: 'AssetsSum' },
    { value: 'Updated At', sortBy: 'UpdatedAt' },
    { value: 'Created At', sortBy: 'CreatedAt' },
  ]

  const { handleSortChange, handleSearchChange, onPageChange, onLimitChange } =
    useSearchAndSortParamsHandler<SortColumn>('claims')

  return (
    <>
      <SearchAndSort
        options={options}
        handleSortChange={handleSortChange}
        handleSearchChange={handleSearchChange}
      />
      <div className="mt-6 flex flex-col w-full">
        {claims?.map((claim) => (
          <div
            key={claim.claim_id}
            className={`grow shrink basis-0 self-stretch p-6 bg-black first:rounded-t-xl last:rounded-b-xl border border-neutral-300/20 flex-col justify-start items-start gap-5 inline-flex`}
          >
            <ClaimPositionRow
              variant="claim"
              position={
                claim.user_assets_for > '0' ? 'claimFor' : 'claimAgainst'
              }
              claimsFor={claim.for_num_positions}
              claimsAgainst={claim.against_num_positions}
              amount={
                +formatBalance(
                  claim.user_assets_for > '0'
                    ? claim.user_assets_for
                    : claim.user_assets_against,
                  18,
                  5,
                )
              }
              feesAccrued={0} // TODO: Update once BE adds deltas to the data output
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