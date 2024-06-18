import * as React from 'react'

import { Badge, BadgeProps, Button, Icon, IconName } from '..'
import { cn } from '../../styles'

export interface SocialLinksProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SocialLinks = ({ className, ...props }: SocialLinksProps) => {
  return (
    <div
      className={cn('flex flex-col gap-4 w-full', className)}
      {...props}
    ></div>
  )
}

export interface SocialLinksBadgesProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SocialLinksBadges = ({ className, ...props }: SocialLinksBadgesProps) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}></div>
  )
}

export interface SocialLinksBadgeProps extends BadgeProps {
  platform:
    | 'x'
    | 'discord'
    | 'lens'
    | 'farcaster'
    | 'calendly'
    | 'medium'
    | 'github'
  isVerified?: boolean
  username: string
}

const SocialLinksBadge = ({
  className,
  platform,
  isVerified,
  username,
  ...props
}: SocialLinksBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn('flex gap-2 w-min text-sm font-normal', className)}
      {...props}
    >
      <Icon className="h-3 w-3" name={platform as IconName} />
      {username}
      {isVerified && (
        <Icon name="circle-check" className="h-4 w-4 text-accent" />
      )}
    </Badge>
  )
}

export interface SocialLinksButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

const SocialLinksButton = ({ ...props }: SocialLinksButtonProps) => {
  return (
    <Button variant="secondary" {...props}>
      Edit Social Links
    </Button>
  )
}

export { SocialLinks, SocialLinksBadges, SocialLinksBadge, SocialLinksButton }