import * as SliderPrimitive from '@radix-ui/react-slider'

const LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
}

interface Props {
  min: number
  max: number
  onChange: (min: number, max: number) => void
}

export function DifficultySlider({ min, max, onChange }: Props) {
  const isAll = min === 1 && max === 5
  const rangeLabel = isAll
    ? 'All difficulties'
    : min === max
      ? LABELS[min]
      : `${LABELS[min]} → ${LABELS[max]}`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{rangeLabel}</span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {min} – {max}
        </span>
      </div>
      <SliderPrimitive.Root
        min={1}
        max={5}
        step={1}
        value={[min, max]}
        onValueChange={([newMin, newMax]) => onChange(newMin, newMax)}
        className="relative flex items-center w-full h-5 select-none touch-none"
      >
        <SliderPrimitive.Track className="relative h-1.5 flex-1 rounded-full bg-[hsl(var(--muted))]">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-[hsl(var(--primary))]" />
        </SliderPrimitive.Track>
        {[min, max].map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block w-4 h-4 rounded-full bg-[hsl(var(--primary))] border-2 border-[hsl(var(--primary-foreground)/0.2)] shadow focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors cursor-pointer"
          />
        ))}
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
        {Object.entries(LABELS).map(([k, v]) => (
          <span key={k}>{v}</span>
        ))}
      </div>
    </div>
  )
}
