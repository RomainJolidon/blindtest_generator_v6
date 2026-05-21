interface Props {
  value: number
  min: number
  max: number
  step?: number
  onChange: (n: number) => void
  suffix?: string
}

export function Stepper({ value, min, max, step = 1, onChange, suffix }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
      >
        −
      </button>
      <span className="min-w-[4rem] text-center text-sm font-medium text-[hsl(var(--foreground))]">
        {value}
        {suffix && <span className="text-[hsl(var(--muted-foreground))] ml-1">{suffix}</span>}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
      >
        +
      </button>
    </div>
  )
}
