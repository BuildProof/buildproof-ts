import { Identity, IdentityPosition } from '@0xintuition/1ui'
import { PositionPresenter, PositionSortColumn } from '@0xintuition/api'

import { PaginationComponent } from '@components/pagination-component'
import { useSearchAndSortParamsHandler } from '@lib/hooks/useSearchAndSortParams'
import { formatBalance } from '@lib/utils/misc'
import { formatUnits } from 'viem'

import { SearchAndSort } from './search-and-sort'
import { SortOption } from './sort-select'

interface PaginationType {
  totalEntries: number | undefined
  currentPage: number
  totalPages: number
  limit: number
}

export function PositionsOnIdentity({
  positions,
  pagination,
}: {
  positions: PositionPresenter[]
  pagination: PaginationType
}) {
  const options: SortOption<PositionSortColumn>[] = [
    { value: 'Total ETH', sortBy: 'Assets' },
    { value: 'Updated At', sortBy: 'UpdatedAt' },
    { value: 'Created At', sortBy: 'CreatedAt' },
  ]

  const { handleSortChange, handleSearchChange, onPageChange, onLimitChange } =
    useSearchAndSortParamsHandler<PositionSortColumn>('positions')

  return (
    <>
      <SearchAndSort
        options={options}
        handleSortChange={handleSortChange}
        handleSearchChange={handleSearchChange}
      />
      <div className="mt-6 flex flex-col w-full">
        {positions?.map((position) => (
          <div
            key={position.id}
            className={`grow shrink basis-0 self-stretch p-6 bg-black first:rounded-t-xl last:rounded-b-xl border border-neutral-300/20 flex-col justify-start items-start gap-5 inline-flex`}
          >
            <IdentityPosition
              variant={Identity.user}
              avatarSrc={position.user?.image ?? ''}
              name={position.user?.display_name ?? ''}
              walletAddress={position.user?.wallet ?? ''}
              amount={+formatBalance(BigInt(position.assets), 18, 4)}
              feesAccrued={Number(
                formatUnits(BigInt(+position.assets - +position.value), 18),
              )}
              updatedAt={position.updated_at}
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