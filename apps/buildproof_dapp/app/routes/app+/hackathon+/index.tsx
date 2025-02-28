import { redirect } from '@remix-run/node'
import { PATHS } from 'app/config/paths'

export async function loader() {
  return redirect(PATHS.HACKATHON)
}
