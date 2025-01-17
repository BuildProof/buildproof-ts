import { Suspense } from 'react'

import { ErrorStateCard, IconName } from '@0xintuition/1ui'
import { ActivityPresenter } from '@0xintuition/api'

import { ErrorPage } from '@components/error-page'
import ExploreHeader from '@components/explore/ExploreHeader'
import { ActivityList } from '@components/list/activity'
import { RevalidateButton } from '@components/revalidate-button'
import { ActivitySkeleton } from '@components/skeleton'
import { useLiveLoader } from '@lib/hooks/useLiveLoader'
import { getActivity } from '@lib/services/activity'
import { invariant } from '@lib/utils/misc'
import { defer, LoaderFunctionArgs } from '@remix-run/node'
import { Await } from '@remix-run/react'
import { requireUserWallet } from '@server/auth'
import { HEADER_BANNER_ACTIVITY, NO_WALLET_ERROR } from 'app/consts'
import { PaginationType } from 'app/types/pagination'

export async function loader({ request }: LoaderFunctionArgs) {
  const wallet = await requireUserWallet(request)
  invariant(wallet, NO_WALLET_ERROR)

  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)

  return defer({
    activity: getActivity({ request, searchParams }),
  })
}

export default function GlobalActivityFeed() {
  const { activity } = useLiveLoader<typeof loader>(['attest', 'create'])

  return (
    <>
      <ExploreHeader
        title="Activity"
        content="The pulse of the collective conscious. Watch the Intuition knowledge graph come to life."
        icon={IconName.lightningBolt}
        bgImage={HEADER_BANNER_ACTIVITY}
      />
      <Suspense fallback={<ActivitySkeleton />}>
        <Await
          resolve={activity}
          errorElement={
            <ErrorStateCard>
              <RevalidateButton />
            </ErrorStateCard>
          }
        >
          {(resolvedActivity) => (
            <ActivityList
              activities={resolvedActivity.activity as ActivityPresenter[]}
              pagination={resolvedActivity.pagination as PaginationType}
            />
          )}
        </Await>
      </Suspense>
    </>
  )
}
export function ErrorBoundary() {
  return <ErrorPage routeName="activity/global" />
}
