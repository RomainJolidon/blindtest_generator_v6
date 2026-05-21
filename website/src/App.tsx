import type { ReactNode } from 'react'
import { useData } from './lib/data'
import { useSettings } from './lib/settings'
import { generatePlaylist, countAvailableSongs } from './lib/playlist'
import { buildLaunchUrl } from './lib/session'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { SummaryBar } from './components/SummaryBar'
import { ExtensionBanner } from './components/ExtensionBanner'

function App() {
  const { data, loading, error } = useData()
  const {
    settings,
    setSelectedCategories,
    setDifficultyRange,
    setTrackCount,
    setGuessDuration,
    setAnswerDuration,
    setAllowMultiplePerSource,
  } = useSettings(data?.categories ?? [])

  let content: ReactNode
  let playlist = generatePlaylist(data ?? { categories: [] }, settings)
  let availableCount = data ? countAvailableSongs(data, settings) : 0

  if (loading) {
    content = <p className="text-[hsl(var(--muted-foreground))]">Loading data…</p>
  } else if (error) {
    content = <p className="text-red-500">Failed to load data: {error}</p>
  } else if (data) {
    content = (
      <SettingsPanel
        categories={data.categories}
        availableSongCount={availableCount}
        settings={settings}
        onSetCategories={setSelectedCategories}
        onSetDifficulty={setDifficultyRange}
        onSetTrackCount={setTrackCount}
        onSetGuessDuration={setGuessDuration}
        onSetAnswerDuration={setAnswerDuration}
        onSetAllowMultiple={setAllowMultiplePerSource}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🎵</span>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Blindtest V6
          </h1>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Session Config
          </span>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <ExtensionBanner />
        {content}
      </main>
      <SummaryBar
        playlist={playlist}
        guessDuration={settings.guessDuration}
        answerDuration={settings.answerDuration}
        onLaunch={() => {
          const url = buildLaunchUrl(playlist, settings)
          if (url) window.open(url, '_blank')
        }}
      />
    </div>
  )
}

export default App
