export const Identity = {
  user: 'user',
  nonUser: 'non-user',
} as const
export type IdentityType = (typeof Identity)[keyof typeof Identity]

export const ClaimPosition = {
  claimFor: 'claimFor',
  claimAgainst: 'claimAgainst',
} as const
export type ClaimPositionType =
  (typeof ClaimPosition)[keyof typeof ClaimPosition]