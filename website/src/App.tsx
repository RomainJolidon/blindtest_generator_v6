import type { ReactNode } from "react";
import { ExtensionBanner } from "./components/ExtensionBanner";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { useData } from "./lib/data";
import { countAvailableSongs, generatePlaylist } from "./lib/playlist";
import { buildLaunchUrl } from "./lib/session";
import { useSettings } from "./lib/settings";

function App() {
  const { data, loading, error } = useData();
  const {
    settings,
    setSelectedCategories,
    setDifficultyRange,
    setTrackCount,
    setGuessDuration,
    setAnswerDuration,
    setAllowMultiplePerSource,
  } = useSettings(data?.categories ?? []);

  const playlist = generatePlaylist(data ?? { categories: [] }, settings);
  const availableCount = data ? countAvailableSongs(data, settings) : 0;

  function handleLaunch() {
    const url = buildLaunchUrl(playlist, settings);
    if (url) window.open(url, "_blank");
  }

  let content: ReactNode;
  if (loading) {
    content = (
      <p className="text-[hsl(var(--muted-foreground))]">Loading data…</p>
    );
  } else if (error) {
    content = <p className="text-red-500">Failed to load data: {error}</p>;
  } else if (data) {
    content = (
      <SettingsPanel
        categories={data.categories}
        availableSongCount={availableCount}
        settings={settings}
        playlist={playlist}
        onSetCategories={setSelectedCategories}
        onSetDifficulty={setDifficultyRange}
        onSetTrackCount={setTrackCount}
        onSetGuessDuration={setGuessDuration}
        onSetAnswerDuration={setAnswerDuration}
        onSetAllowMultiple={setAllowMultiplePerSource}
        onLaunch={handleLaunch}
      />
    );
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-4">
        <ExtensionBanner />
        {content}
      </main>
    </div>
  );
}

export default App;
