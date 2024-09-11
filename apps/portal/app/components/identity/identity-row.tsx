import React, { useRef, useState } from 'react'

import {
  Avatar,
  cn,
  Copy,
  CurrencyType,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Identity,
  IdentityType,
  IdentityValueDisplay,
  ProfileCard,
  TagsContent,
  TagWithValue,
  TagWithValueProps,
  TextVariant,
  Trunctacular,
  useSidebarLayoutContext,
} from '@0xintuition/1ui'

import { useNavigate } from '@remix-run/react'

export interface IdentityRowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: IdentityType
  amount: number
  currency?: CurrencyType
  name: string
  description: string
  id: string
  claimLink?: string
  avatarSrc: string
  link: string
  ipfsLink: string
  totalFollowers: number
  tags?: TagWithValueProps[]
}

interface NameAndAddressProps {
  name: string
  id: string
  link: string
  ipfsLink: string
  hasTags: boolean
}

const NameAndAddress = ({
  name,
  id,
  link,
  ipfsLink,
  hasTags,
}: NameAndAddressProps) => {
  return (
    <div
      className={cn(
        'mb-1 flex',
        hasTags ? 'flex-row items-center' : 'flex-col',
      )}
    >
      <a href={link}>
        <Trunctacular
          value={name}
          variant={TextVariant.bodyLarge}
          className="mr-2"
          maxStringLength={42}
        />
      </a>
      <div className="hidden md:flex flex-row gap-1 items-center">
        <a href={ipfsLink} target="_blank" rel="noreferrer noreopener">
          <Trunctacular
            value={id}
            className="text-primary/60 hover:text-primary"
            maxStringLength={16}
          />
        </a>
        <Copy text={id} />
      </div>
    </div>
  )
}

const IdentityRow = ({
  variant = Identity.user,
  amount,
  currency,
  name,
  description,
  id,
  claimLink,
  avatarSrc,
  link,
  ipfsLink,
  totalFollowers,
  tags,
  children,
  className,
}: IdentityRowProps) => {
  const hasTags = !!(tags && tags.length > 0)

  const { isMobileView } = useSidebarLayoutContext()

  const navigate = useNavigate()
  const [isInteractiveElement, setIsInteractiveElement] = useState(false)
  const linkRef = useRef<HTMLDivElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractiveElement && link && event.target === linkRef.current) {
      navigate(link)
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    const interactiveElement = target.closest(
      'a, button, .identity-tag, .hover-card',
    )
    setIsInteractiveElement(!!interactiveElement)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !isInteractiveElement && link) {
      navigate(link)
    }
  }

  const content = (
    <div
      ref={linkRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      role={isInteractiveElement ? undefined : 'button'}
      tabIndex={isInteractiveElement ? undefined : 0}
      className={cn(
        `w-full flex justify-between items-center max-sm:flex-col max-sm:gap-3 p-6`,
        `hover:bg-secondary/10 transition-colors duration-200 group`,
        isInteractiveElement ? 'cursor-default' : 'cursor-pointer',
        className,
      )}
    >
      <div className="flex items-center">
        <HoverCard openDelay={150} closeDelay={150}>
          <HoverCardTrigger asChild>
            <a href={claimLink || link}>
              <Avatar
                variant={variant}
                src={avatarSrc}
                name={name}
                className="mr-4 w-[64px] h-[64px]"
              />
            </a>
          </HoverCardTrigger>
          <HoverCardContent side="right" className="w-max">
            <div className="flex flex-col gap-4 w-80 max-md:w-[80%]">
              <ProfileCard
                variant={variant}
                avatarSrc={avatarSrc ?? ''}
                name={name}
                id={id ?? ''}
                bio={description ?? ''}
                ipfsLink={ipfsLink}
                className="profile-card"
              />
              {/* {link && (
                <a href={link}>
                  <Button variant={ButtonVariant.secondary} className="w-full">
                    View Identity{' '}
                    <Icon name={'arrow-up-right'} className="h-3 w-3" />
                  </Button>
                </a>
              )} */}
            </div>
          </HoverCardContent>
        </HoverCard>
        <div className="flex flex-col">
          <NameAndAddress
            name={name}
            id={id}
            link={claimLink || link}
            ipfsLink={ipfsLink}
            hasTags={hasTags}
          />
          {hasTags && (
            <div className="flex gap-2 mt-1">
              <TagsContent numberOfTags={tags.length} link={link}>
                {tags.slice(0, 2).map((tag, index) => (
                  <TagWithValue
                    label={tag.label}
                    value={tag.value}
                    maxStringLength={isMobileView ? 12 : 24}
                    key={index}
                  />
                ))}
              </TagsContent>
            </div>
          )}
        </div>
      </div>

      <IdentityValueDisplay
        value={amount}
        currency={currency}
        followers={totalFollowers}
      />
    </div>
  )

  return (
    <div className="w-full">
      {content}
      {children}
    </div>
  )
}

export { IdentityRow }