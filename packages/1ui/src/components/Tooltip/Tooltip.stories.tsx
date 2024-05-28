import React from 'react'

import { Button } from '@components/Button'
import { Text } from '@components/Text'
import type { Meta, StoryObj } from '@storybook/react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
      },
    },
  },
  argTypes: {
    // eslint-disable-next-line
    // @ts-ignore
    TooltipTrigger: {
      description: 'TooltipTrigger child',
      table: {
        type: { summary: 'Node' },
      },
      control: false,
    },
    TooltipContent: {
      description: 'TooltipContent child',
      table: {
        type: { summary: 'Node' },
      },
      control: false,
    },
  },
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const BasicUsage: Story = {
  render: (args) => (
    <TooltipProvider {...args}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="lg">
            Hover
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <Text variant="body">Some text</Text>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}