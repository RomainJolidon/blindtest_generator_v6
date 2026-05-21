import type { PlaylistEntry } from '@/types/schema'

interface Props {
  playlist: PlaylistEntry[]
  guessDuration: number
  answerDuration: number
  onLaunch: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function SummaryBar({ playlist, guessDuration, answerDuration, onLaunch }: Props) {
  const trackCount = playlist.length
  const sourceCount = new Set(playlist.map((e) => e.sourceTitle)).size
  const totalSeconds = (guessDuration + answerDuration) * trackCount
  const disabled = trackCount === 0

  return (
    <div className="sticky bottom-0 w-full bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-[hsl(var(--foreground))]">
          <span className="font-bold">{trackCount} tracks</span>
          <span className="text-[hsl(var(--muted-foreground))]">
            {' '}· {sourceCount} sources · ~{formatDuration(totalSeconds)}
          </span>
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={onLaunch}
          className={
            disabled
              ? 'px-5 py-2 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
              : 'px-5 py-2 rounded-lg text-sm font-semibold bg-[hsl(var(--primary))] text-white hover:brightness-110 transition-filter'
          }
        >
          🚀 Launch Blindtest
        </button>
      </div>
    </div>
  )
}
