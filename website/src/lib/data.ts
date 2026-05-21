import { useState, useEffect } from 'react'
import type { BlindtestData, FlatSong } from '../types/schema'

const GITHUB_DATA_URL =
  'https://raw.githubusercontent.com/RomainJolidon/blindtest_generator_v6/master/assets/data.json'

interface UseDataResult {
  data: BlindtestData | null
  loading: boolean
  error: string | null
}

export function useData(): UseDataResult {
  const [data, setData] = useState<BlindtestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(GITHUB_DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<BlindtestData>
      })
      .then((json) => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

export function getAllSongs(data: BlindtestData): FlatSong[] {
  return data.categories.flatMap((category) =>
    category.sources.flatMap((source) =>
      source.songs.map((song) => ({
        id: song.id,
        name: song.name,
        youtubeId: song.youtubeId,
        startAt: song.startAt,
        effectiveDifficulty: song.difficulty ?? source.difficulty,
        sourceId: source.id,
        sourceTitle: source.title,
        categoryId: category.id,
      }))
    )
  )
}
