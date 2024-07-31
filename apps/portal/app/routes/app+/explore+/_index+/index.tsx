import logger from '@lib/utils/logger'
import { redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { PATHS } from 'consts'

export async function loader() {
  console.log('[EXPLORE INDEX] -- START')
  console.log('[EXPLORE INDEX] -- END')
  return redirect(PATHS.EXPLORE_USERS)
}

export default function ExploreClaims() {
  const { message } = useLoaderData<typeof loader>()
  logger('message from profile overview loader', message)

  return (
    <div className="m-8 flex flex-col items-center gap-6">
      <div className="flex flex-col">Explore Index Route</div>
      <pre>This is a placeholder for the Explore Index route</pre>
      <pre>route loader: {message}</pre>
    </div>
  )
}
