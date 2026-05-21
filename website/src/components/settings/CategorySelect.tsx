import { cn } from '@/lib/utils'
import type { Category } from '@/types/schema'

interface Props {
  categories: Category[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export function CategorySelect({ categories, selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      if (selected.length === 1) return // keep at least one selected
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const active = selected.includes(cat.id)
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggle(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
              active
                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--muted-foreground))]',
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
