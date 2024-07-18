import { combineHeaders, invariant } from '@lib/utils/misc'
import { getRedirectToUrl } from '@lib/utils/redirect'
import { redirect } from '@remix-run/node'
import { RedirectTo } from 'types/navigation'

import { getPrivyUserById, verifyPrivyAccessToken } from './privy'

export async function getUserId(request: Request) {
  const verifiedClaims = await verifyPrivyAccessToken(request)
  if (!verifiedClaims) {
    return null
  }
  return verifiedClaims.userId
}

export async function getUser(
  request: Request,
  { redirectTo }: RedirectTo = {},
) {
  const userId = await getUserId(request)
  if (!userId) {
    const redirectUrl = await getRedirectToUrl(request, '/login', {
      redirectTo,
    })
    throw redirect(redirectUrl)
  }
  invariant(userId, 'No userId provided by Privy')
  return await getPrivyUserById(userId)
}

export async function getUserWallet(request: Request) {
  const user = await getUser(request)
  return user.wallet?.address
}

export async function requireUserId(
  request: Request,
  { redirectTo }: RedirectTo = {},
) {
  const userId = await getUserId(request)
  if (!userId) {
    const redirectUrl = await getRedirectToUrl(request, '/playground', {
      redirectTo,
    })
    throw redirect(redirectUrl)
  }
  return userId
}

export async function requireUser(
  request: Request,
  { redirectTo }: RedirectTo = {},
) {
  const user = await getUser(request)
  if (!user) {
    const redirectUrl = await getRedirectToUrl(request, '/playground', {
      redirectTo,
    })
    throw redirect(redirectUrl)
  }
  return user
}

export async function requireUserWallet(
  request: Request,
  { redirectTo }: RedirectTo = {},
) {
  const wallet = await getUserWallet(request)
  if (!wallet) {
    const redirectUrl = await getRedirectToUrl(request, '/playground', {
      redirectTo,
    })
    throw redirect(redirectUrl)
  }
  return wallet
}

export async function requireAnonymous(
  request: Request,
  { redirectTo }: RedirectTo = {},
) {
  const userId = await getUserId(request)
  if (userId) {
    const redirectUrl = await getRedirectToUrl(request, '/playground', {
      redirectTo,
    })
    throw redirect(redirectUrl)
  }
}

export async function logout(
  {
    redirectTo = '/',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit,
) {
  // TODO: ENG-0000: Clear any session/cookies + properly handle redirect
  throw redirect(redirectTo, {
    ...responseInit,
    headers: combineHeaders(responseInit?.headers),
  })
}