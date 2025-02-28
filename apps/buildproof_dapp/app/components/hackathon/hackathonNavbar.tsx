import { Link, useLocation, useParams } from '@remix-run/react'

export const HackathonNavbar = () => {
  const { id } = useParams()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname.includes(path)
  }

  return (
    <nav className="flex space-x-4 bg-gray-800 p-4 rounded-lg text-white">
      <Link
        to={`/app/hackathon/${id}/overview`}
        className={`${isActive('/overview') ? 'font-bold text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Overview
      </Link>
      <Link
        to={`/app/hackathon/${id}/vote`}
        className={`${isActive('/vote') ? 'font-bold text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Vote
      </Link>
      <Link
        to={`/app/hackathon/${id}/details`}
        className={`${isActive('/details') ? 'font-bold text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Details
      </Link>
      <Link
        to={`/app/hackathon/${id}/activity`}
        className={`${isActive('/activity') ? 'font-bold text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Activity Log
      </Link>
      <Link
        to={`/app/hackathon/${id}/graph`}
        className={`${isActive('/graph') ? 'font-bold text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Graph
      </Link>
    </nav>
  )
}
