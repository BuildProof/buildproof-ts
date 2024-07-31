import React from 'react'

import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Text,
  TextVariant,
  TextWeight,
} from '@0xintuition/1ui'

import { useCopy } from '@lib/hooks/useCopy'

interface CopyComponentProps extends React.HTMLAttributes<HTMLButtonElement> {
  text: string
  disabled?: boolean
}

export const CopyComponent: React.FC<CopyComponentProps> = ({
  text,
  disabled = false,
  className,
  ...props
}) => {
  const { copied, copy } = useCopy()

  const handleCopy = () => {
    if (!disabled) {
      copy(text)
    }
  }

  return (
    <Button
      variant={ButtonVariant.text}
      className={`uppercase gap-2 pl-0 ${className}`}
      disabled={disabled}
      onClick={handleCopy}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      tabIndex={0}
      {...props}
    >
      <Text
        variant={TextVariant.body}
        weight={TextWeight.medium}
        className={`${disabled ? 'text-muted-foreground' : 'text-primary'}`}
      >
        {text}
      </Text>
      <Icon
        name={copied ? IconName.checkmark : IconName.copy}
        className={`h-4 w-4 ${copied ? 'text-success' : disabled ? 'text-muted-foreground' : 'text-primary'}`}
      />
    </Button>
  )
}