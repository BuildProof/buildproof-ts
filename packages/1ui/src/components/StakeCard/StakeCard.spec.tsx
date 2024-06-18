import React from 'react'

import { render } from '@testing-library/react'

import { StakeCard } from './StakeCard'

describe('StakeCard', () => {
  it('should render appropriate element', () => {
    const { asFragment } = render(
      <StakeCard
        tvl="4.928 ETH"
        holders={69}
        onBuyClick={() => null}
        onViewAllClick={() => null}
      />,
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="flex flex-col gap-2 w-full border border-border/30 px-6 py-4 rounded-lg"
        >
          <p
            class="text-primary text-lg font-normal"
          >
            Stake
          </p>
          <div
            class="flex justify-between items-center"
          >
            <div>
              <p
                class="text-sm font-normal text-muted-foreground"
              >
                TVL
              </p>
              <p
                class="text-primary text-base font-normal"
              >
                4.928 ETH
              </p>
            </div>
            <div>
              <p
                class="text-sm font-normal text-muted-foreground"
              >
                Holders
              </p>
              <p
                class="text-primary text-base font-normal"
              >
                69
              </p>
            </div>
          </div>
          <button
            class="flex justify-center items-center gap-2 text-sm font-medium border disabled:bg-muted disabled:text-muted-foreground disabled:border-muted bg-primary text-primary-foreground border-primary hover:bg-primary/80 rounded-full shadow-md-subtle px-3 py-1 w-full mt-4"
          >
            Buy
          </button>
          <button
            class="flex justify-center items-center gap-2 text-sm font-medium border disabled:text-muted-foreground bg-transparent text-primary/70 border-transparent hover:text-primary disabled:border-transparent disabled:bg-transparent shadow-md-subtle px-3 py-1 w-full"
          >
            View all positions
          </button>
        </div>
      </DocumentFragment>
    `)
  })
})