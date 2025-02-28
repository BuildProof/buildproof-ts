import { HackathonNavbar } from '@components/hackathon/hackathonNavbar'
import { Outlet, useParams } from '@remix-run/react'
import { ErrorPage } from 'app/components/error-page'

export default function HackathonPage() {
  const { id } = useParams()

  if (!id) {
    return <div>Hackathon not found</div>
  }

  return (
    <div>
      <HackathonNavbar />
      <Outlet />
    </div>
  )
}

export function ErrorBoundary() {
  return <ErrorPage routeName="hackathon/$id" />
}
