import React from 'react'

import { render } from '@testing-library/react'

import { QuestHeaderCard } from './QuestHeaderCard'

describe('QuestHeaderCard', () => {
  it('should render appropriate element', () => {
    const { asFragment } = render(
      <QuestHeaderCard
        title="Primitive Island"
        subtitle="Continue your journey."
        numberOfCompletedQuests={1}
        totalNumberOfQuests={10}
        onButtonClick={() => null}
      />,
    )
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="flex flex-col gap-6 p-6 rounded-xl border border-border/30 bg-gradient-to-r from-against/30"
        >
          <div
            class="flex justify-between items-start"
          >
            <div
              class="flex-col gap-1"
            >
              <p
                class="text-primary text-xs font-normal"
              >
                Continue your journey.
              </p>
              <p
                class="text-primary text-lg font-normal"
              >
                Primitive Island
              </p>
            </div>
            <div
              class="flex gap-1 items-center"
            >
              <p
                class="text-primary text-lg font-normal"
              >
                1
              </p>
              <p
                class="text-lg font-normal text-muted-foreground"
              >
                /
              </p>
              <p
                class="text-lg font-normal text-muted-foreground"
              >
                10
              </p>
            </div>
          </div>
          <div
            class="flex justify-between items-end"
          >
            <p
              class="text-primary text-xs font-normal"
            >
              10% Complete
            </p>
            <button
              class="flex justify-center items-center gap-2 text-sm font-medium border disabled:bg-muted disabled:text-muted-foreground disabled:border-muted primary-gradient-subtle text-primary/60 border-primary/10 rounded-lg hover:text-primary disabled:from-muted disabled:to-muted shadow-md-subtle px-3 py-1"
            >
              View quests
            </button>
          </div>
        </div>
      </DocumentFragment>
    `)
  })
})