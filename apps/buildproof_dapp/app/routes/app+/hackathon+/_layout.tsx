// import { HackathonNavbar } from '@components/hackathon/hackathonNavbar'
// import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
// import { Outlet, useLoaderData, useParams } from '@remix-run/react'
// import { requireUser } from '@server/auth'
// import { ErrorPage } from 'app/components/error-page'
// import { PATHS } from 'app/config/paths'

// export async function loader({ request, params }: LoaderFunctionArgs) {
//   try {
//     const user = await requireUser(request)
//     const { id } = params

//     if (!id) {
//       throw new Error('Hackathon ID is required')
//     }

//     if (!user || !user.wallet?.address) {
//       return redirect(PATHS.LOGIN)
//     }

//     return json({
//       userAddress: user.wallet.address,
//       atomId: parseInt(id),
//     })
//   } catch (error) {
//     console.error('Error in hackathon loader:', error)
//     return redirect(PATHS.LOGIN)
//   }
// }

// export default function HackathonLayout() {
//   const { id } = useParams()
//   const loaderData = useLoaderData<typeof loader>()

//   if (!id) {
//     return <div>Hackathon not found</div>
//   }

//   return (
//     <div className="flex flex-col items-center w-full">
//       <div className="w-full max-w-[1200px] mx-auto px-4">
//         <HackathonNavbar />
//         <div className="w-full mt-4">
//           <Outlet context={loaderData} />
//         </div>
//       </div>
//     </div>
//   )
// }

// export function ErrorBoundary() {
//   return <ErrorPage routeName="hackathon/_layout" />
// }
