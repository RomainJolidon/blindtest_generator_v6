interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  suffix?: string;
}

export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: Props) {
  function handleInput(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none shrink-0"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={(e) => handleInput(e.target.value)}
          className="w-16 text-center text-sm font-medium bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-1 py-1 text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none shrink-0"
        >
          +
        </button>
        {suffix && (
          <span className="text-sm text-[hsl(var(--muted-foreground))] ml-1">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
