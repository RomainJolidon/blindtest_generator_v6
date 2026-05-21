import type { BlindtestData, PlaylistEntry } from '../types/schema'
import type { Settings } from './settings'
import { getAllSongs } from './data'

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function getFilteredAndShuffled(data: BlindtestData, settings: Settings) {
  const { selectedCategories, difficultyMin, difficultyMax, allowMultiplePerSource } = settings

  const filtered = getAllSongs(data).filter(
    (s) =>
      selectedCategories.includes(s.categoryId) &&
      s.effectiveDifficulty >= difficultyMin &&
      s.effectiveDifficulty <= difficultyMax,
  )

  const shuffled = fisherYatesShuffle(filtered)

  if (!allowMultiplePerSource) {
    const seen = new Set<string>()
    return shuffled.filter((s) => {
      if (seen.has(s.sourceId)) return false
      seen.add(s.sourceId)
      return true
    })
  }

  return shuffled
}

export function generatePlaylist(data: BlindtestData, settings: Settings): PlaylistEntry[] {
  return getFilteredAndShuffled(data, settings)
    .slice(0, settings.trackCount)
    .map(({ youtubeId, startAt, name, sourceTitle, categoryId }) => ({
      youtubeId,
      startAt,
      name,
      sourceTitle,
      categoryId,
    }))
}

export function countAvailableSongs(data: BlindtestData, settings: Settings): number {
  return getFilteredAndShuffled(data, settings).length
}
