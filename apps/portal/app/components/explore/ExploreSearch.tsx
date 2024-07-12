import * as React from 'react'

import { IdentityInput, Separator, Text } from '@0xintuition/1ui'

import { ExploreSearchInput } from './ExploreSearchInput'

export interface ExploreSearchProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'user' | 'identity' | 'claim' | 'tag'
}

const ExploreSearch = ({ variant, ...props }: ExploreSearchProps) => {
  return (
    <div className="min-w-96 flex flex-col items-center" {...props}>
      {['user', 'identity', 'tag'].includes(variant) && (
        // TODO: Alexander to adds the Tags component with ComboBox here ENG-2574
        <ExploreSearchInput searchParam={variant} />
      )}

      {variant === 'claim' && (
        <>
          <Text
            variant="bodyLarge"
            weight="regular"
            className="mb-2.5 text-secondary-foreground"
          >
            Select any combination of identities to find matching claims
          </Text>
          <Text
            variant="caption"
            weight="regular"
            className="mb-2.5 text-secondary-foreground"
          >
            Need help? Learn more about claims
          </Text>
          <Separator className="mb-7" />
          {/* TODO: Implement search in ENG-2575 */}
          <IdentityInput
            subject={{
              placeholder: 'Select an identity',
              selectedValue: {},
              onClick: () => {},
            }}
            predicate={{
              placeholder: 'Select an identity',
              selectedValue: {},
              onClick: () => {},
            }}
            object={{
              placeholder: 'Select an identity',
              selectedValue: {},
              onClick: () => {},
            }}
            showLabels
          />
        </>
      )}
    </div>
  )
}

export { ExploreSearch }