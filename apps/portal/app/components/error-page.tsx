import { Button, Text } from '@0xintuition/1ui'

import derpFace1 from '@assets/derp-face-1.png'
import derpFace2 from '@assets/derp-face-2.png'
import derpFace3 from '@assets/derp-face-3.png'
import derpFace4 from '@assets/derp-face-4.png'
import derpFace5 from '@assets/derp-face-5.png'
import derpFace6 from '@assets/derp-face-6.png'
import derpFace7 from '@assets/derp-face-7.png'
import derpFace8 from '@assets/derp-face-8.png'
import derpFace9 from '@assets/derp-face-9.png'
import derpFace10 from '@assets/derp-face-10.png'
import derpFace11 from '@assets/derp-face-11.png'
import derpFace12 from '@assets/derp-face-12.jpg'
import logger from '@lib/utils/logger'
import { cn } from '@lib/utils/misc'
import { useRouteError } from '@remix-run/react'
import { captureRemixErrorBoundaryError } from '@sentry/remix'
import { PATHS, SUPPORT_EMAIL_ADDRESS } from 'app/consts'

import NavigationButton from './navigation-link'

const getDerpFace = () => {
  const numberOfDerpFaces = 12
  const randomNumber = Math.floor(Math.random() * numberOfDerpFaces) + 1
  const altText = 'error'
  const className = 'w-56 h-full rounded-lg mb-4'
  switch (randomNumber) {
    case 2:
      return <img src={derpFace2} alt={altText} className={className} />
    case 3:
      return <img src={derpFace3} alt={altText} className={className} />
    case 4:
      return <img src={derpFace4} alt={altText} className={className} />
    case 5:
      return <img src={derpFace5} alt={altText} className={className} />
    case 6:
      return <img src={derpFace6} alt={altText} className={className} />
    case 7:
      return <img src={derpFace7} alt={altText} className={className} />
    case 8:
      return <img src={derpFace8} alt={altText} className={className} />
    case 9:
      return <img src={derpFace9} alt={altText} className={className} />
    case 10:
      return <img src={derpFace10} alt={altText} className={className} />
    case 11:
      return <img src={derpFace11} alt={altText} className={className} />
    case 12:
      return <img src={derpFace12} alt={altText} className={className} />
    default:
      return <img src={derpFace1} alt={altText} className={className} />
  }
}

const StatusCode = ({ statusCode }: { statusCode: number }) => {
  return (
    <>
      <span className="max-sm:hidden">
        <Text variant="heading1" weight="bold" className="text-9xl">
          {statusCode}
        </Text>
      </span>
      <span className="sm:hidden">
        <Text variant="heading2" weight="bold" className="text-7xl">
          {statusCode}
        </Text>
      </span>
    </>
  )
}

const ErrorPageTitle = ({
  statusCode,
  title,
}: {
  statusCode?: number
  title?: string
}) => {
  if (!title) {
    return getDerpFace()
  }
  return (
    <>
      <span className="max-sm:hidden">
        <Text variant={statusCode ? 'heading1' : 'heading3'} weight="medium">
          {title}
        </Text>
      </span>
      <span className="sm:hidden">
        <Text variant="heading3" weight="medium">
          {title}
        </Text>
      </span>
    </>
  )
}

export const ErrorPage = ({
  isAtRoot,
  routeName,
  statusCode,
  title,
  description,
}: {
  isAtRoot?: boolean
  routeName: string
  statusCode?: number
  title?: string
  description?: string
}) => {
  const error = useRouteError()
  logger(`ERROR BOUNDARY (${routeName}):`, error)
  captureRemixErrorBoundaryError(error)

  const descriptionArray = description
    ? description.split('\n')
    : ['Oh no!  Something went wrong with our flux capacitor']
  return (
    <div className="flex h-[100vh] w-full items-center p-6 justify-center gap-12 max-lg:flex-col-reverse max-lg:gap-2 max-md:gap-0">
      <div
        className={cn(
          'flex flex-col max-w-[500px] gap-2 max-lg:items-center max-lg:text-center max-sm:gap-6',
          !statusCode && 'items-center [&>div]:text-center gap-4',
        )}
      >
        <ErrorPageTitle statusCode={statusCode} title={title} />
        <div className="flex flex-col max-lg:text-center">
          {descriptionArray?.map((content, index) => (
            <Text
              variant={statusCode ? 'bodyLarge' : 'headline'}
              className="text-secondary/50"
              key={index}
            >
              {content}
            </Text>
          ))}
        </div>
        <div className="flex gap-6 mt-5 max-sm:flex-col max-sm:w-full">
          <NavigationButton
            reloadDocument={!isAtRoot}
            variant="primary"
            size="lg"
            to={isAtRoot ? PATHS.ROOT : ''}
          >
            {isAtRoot ? 'Back to home' : 'Refresh'}
          </NavigationButton>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full"
            onClick={() =>
              (window.location.href = `mailto:${SUPPORT_EMAIL_ADDRESS}`)
            }
          >
            Contact Support
          </Button>
        </div>
      </div>
      {statusCode && <StatusCode statusCode={statusCode} />}
    </div>
  )
}
