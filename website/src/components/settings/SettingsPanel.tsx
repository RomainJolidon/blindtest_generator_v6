import type { Settings } from "@/lib/settings";
import type { Category, PlaylistEntry } from "@/types/schema";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { CategorySelect } from "./CategorySelect";
import { DifficultySlider } from "./DifficultySlider";
import { Stepper } from "./Stepper";

interface Props {
  categories: Category[];
  availableSongCount: number;
  settings: Settings;
  playlist: PlaylistEntry[];
  onSetCategories(ids: string[]): void;
  onSetDifficulty(min: number, max: number): void;
  onSetTrackCount(n: number): void;
  onSetGuessDuration(n: number): void;
  onSetAnswerDuration(n: number): void;
  onSetAllowMultiple(v: boolean): void;
  onLaunch(): void;
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      {children}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function SettingsPanel({
  categories,
  availableSongCount,
  settings,
  playlist,
  onSetCategories,
  onSetDifficulty,
  onSetTrackCount,
  onSetGuessDuration,
  onSetAnswerDuration,
  onSetAllowMultiple,
  onLaunch,
}: Props) {
  const sourceCount = new Set(playlist.map((e) => e.sourceTitle)).size;
  const totalSeconds =
    (settings.guessDuration + settings.answerDuration) * playlist.length;
  const canLaunch = playlist.length > 0;

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

      {/* Three steppers in a row */}
      <div className="grid grid-cols-3 gap-4">
        <Stepper
          label="Tracks"
          value={settings.trackCount}
          min={1}
          max={availableSongCount || 1}
          onChange={onSetTrackCount}
          suffix="tracks"
        />
        <Stepper
          label="Guess time"
          value={settings.guessDuration}
          min={5}
          max={120}
          onChange={onSetGuessDuration}
          suffix="sec"
        />
        <Stepper
          label="Answer time"
          value={settings.answerDuration}
          min={3}
          max={60}
          onChange={onSetAnswerDuration}
          suffix="sec"
        />
      </div>

      <div className="h-px bg-[hsl(var(--border))]" />

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
          Allow multiple songs per source
        </LabelPrimitive.Root>
      </div>

      <div className="h-px bg-[hsl(var(--border))]" />

      {/* Summary + Launch */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[hsl(var(--foreground))]">
          <span className="font-bold">{playlist.length} tracks</span>
          <span className="text-[hsl(var(--muted-foreground))]">
            {" "}
            · {sourceCount} sources · ~{formatDuration(totalSeconds)}
          </span>
        </p>
        <button
          type="button"
          disabled={!canLaunch}
          onClick={onLaunch}
          className={
            canLaunch
              ? "px-5 py-2 rounded-lg text-sm font-semibold bg-[hsl(var(--primary))] text-white hover:brightness-110 transition-all cursor-pointer"
              : "px-5 py-2 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
          }
        >
          🚀 Launch Blindtest
        </button>
      </div>
    </div>
  );
}
