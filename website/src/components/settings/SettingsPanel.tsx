import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as LabelPrimitive from '@radix-ui/react-label'
import type { Category } from '@/types/schema'
import type { Settings } from '@/lib/settings'
import { CategorySelect } from './CategorySelect'
import { DifficultySlider } from './DifficultySlider'
import { Stepper } from './Stepper'

interface Props {
  categories: Category[]
  availableSongCount: number
  settings: Settings
  onSetCategories(ids: string[]): void
  onSetDifficulty(min: number, max: number): void
  onSetTrackCount(n: number): void
  onSetGuessDuration(n: number): void
  onSetAnswerDuration(n: number): void
  onSetAllowMultiple(v: boolean): void
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      {children}
    </div>
  )
}

export function SettingsPanel({
  categories,
  availableSongCount,
  settings,
  onSetCategories,
  onSetDifficulty,
  onSetTrackCount,
  onSetGuessDuration,
  onSetAnswerDuration,
  onSetAllowMultiple,
}: Props) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col gap-6">
      <Section label="Categories">
        <CategorySelect
          categories={categories}
          selected={settings.selectedCategories}
          onChange={onSetCategories}
        />
      </Section>

      <div className="h-px bg-[hsl(var(--border))]" />

      <Section label="Difficulty">
        <DifficultySlider
          min={settings.difficultyMin}
          max={settings.difficultyMax}
          onChange={onSetDifficulty}
        />
      </Section>

      <div className="h-px bg-[hsl(var(--border))]" />

      <Section label="Tracks">
        <Stepper
          value={settings.trackCount}
          min={1}
          max={availableSongCount}
          onChange={onSetTrackCount}
          suffix="tracks"
        />
      </Section>

      <div className="h-px bg-[hsl(var(--border))]" />

      <Section label="Guess time">
        <Stepper
          value={settings.guessDuration}
          min={5}
          max={120}
          onChange={onSetGuessDuration}
          suffix="sec"
        />
      </Section>

      <div className="h-px bg-[hsl(var(--border))]" />

      <Section label="Answer time">
        <Stepper
          value={settings.answerDuration}
          min={3}
          max={60}
          onChange={onSetAnswerDuration}
          suffix="sec"
        />
      </Section>

      <div className="h-px bg-[hsl(var(--border))]" />

      <Section label="Options">
        <div className="flex items-center gap-3">
          <SwitchPrimitive.Root
            id="allow-multiple"
            checked={settings.allowMultiplePerSource}
            onCheckedChange={onSetAllowMultiple}
            className="w-10 h-6 rounded-full transition-colors data-[state=checked]:bg-[hsl(var(--primary))] data-[state=unchecked]:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <SwitchPrimitive.Thumb className="block w-4 h-4 rounded-full bg-white shadow translate-x-1 data-[state=checked]:translate-x-5 transition-transform" />
          </SwitchPrimitive.Root>
          <LabelPrimitive.Root
            htmlFor="allow-multiple"
            className="text-sm text-[hsl(var(--foreground))] cursor-pointer"
          >
            One song per source
          </LabelPrimitive.Root>
        </div>
      </Section>
    </div>
  )
}
