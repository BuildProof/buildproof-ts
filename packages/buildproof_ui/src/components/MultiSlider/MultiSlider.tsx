import React, { useState, useEffect } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../styles'

interface SliderItem {
  id: string
  value: number
  onChange: (value: number) => void
  onChangeEnd?: (value: number) => void
}

interface MultiSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  slider: SliderItem
}

const MultiSlider = ({ slider, className, ...props }: MultiSliderProps) => {

  const handleValueChange = (onChange: (value: number) => void, currentId: string) => (value: number[]) => {
    const newValue = value[0]
    onChange(newValue)
  }

  const handlePointerUp = (slider: SliderItem) => () => {
    // Call onChangeEnd if provided
    if (slider.onChangeEnd) {
      slider.onChangeEnd(slider.value);
    }
  };

  return (
    <div className={cn('flex flex-col gap-8', className)} {...props}>

      <div className="flex flex-col gap-4">
        <div key={slider.id} className="flex items-center gap-4 w-full">
          {/* Pourcentage avec input intégré */}
          <div className={cn(
            "min-w-[60px] text-center rounded px-2 py-1 flex items-center justify-center",
            slider.value === 0 ? 'bg-gray-700' :
              slider.value > 0 ? 'bg-for text-white' : 'bg-against text-white'
          )}>
            <div className="flex items-center">
              <input
                type="number"
                value={slider.value}
                onChange={(e) => {
                  // const value = Math.max(-100, Math.min(100, Number(e.target.value)));
                  slider.onChange(Number(e.target.value));
                }}
                onBlur={(e) => {
                  if (slider.onChangeEnd) {
                    slider.onChangeEnd(Number(e.target.value));
                  }
                }}
                className={cn(
                  "w-[40px] bg-transparent text-center text-sm font-medium",
                  "focus:outline-none",
                  "text-white placeholder-white/50"
                )}
                min="-100"
                max="100"
                placeholder="0"
              />
              <span className="text-sm font-medium">%</span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex-1 relative">
            <div className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-border/20" />
            <SliderPrimitive.Root
              className="relative flex items-center w-full h-5 touch-none"
              value={[slider.value]}
              max={100}
              min={-100}
              step={1}
              onValueChange={(value: number[]) => handleValueChange(slider.onChange, slider.id)(value)}
              onPointerUp={handlePointerUp(slider)}
            >
              <SliderPrimitive.Track className="relative h-[6px] grow rounded-full hover:cursor-grab active:cursor-grabbing">
                <div className="absolute w-full h-full rounded-full bg-border/20" />
                <SliderPrimitive.Range
                  className={cn(
                    'absolute h-full rounded-full  ',
                    slider.value === 0 ? 'bg-gray-700' :
                      slider.value >= 0 ? 'bg-for' : 'bg-against'
                  )}
                  style={{
                    left: slider.value < 0 ? `${50 + slider.value / 2}%` : '50%',
                    right: slider.value > 0 ? `${50 - slider.value / 2}%` : '50%',
                  }}
                />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb
                className={cn(
                  'block h-4 w-4 rounded-full border-2 bg-background ',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  'hover:cursor-grab active:cursor-grabbing',
                  slider.value === 0 ? 'bg-gray-700' :
                    slider.value >= 0 ? 'border-for' : 'border-against'
                )}
              />
            </SliderPrimitive.Root>
          </div>
        </div>
      </div>

    </div>
  )
}

export { MultiSlider }
export type { MultiSliderProps, SliderItem } 