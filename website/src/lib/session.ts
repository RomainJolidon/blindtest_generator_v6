import type { PlaylistEntry } from '@/types/schema'
import type { Settings } from '@/lib/settings'

interface SessionPayload {
  tracks: PlaylistEntry[]
  guessDuration: number
  answerDuration: number
}

export function encodeSession(playlist: PlaylistEntry[], settings: Settings): string {
  const payload: SessionPayload = {
    tracks: playlist,
    guessDuration: settings.guessDuration,
    answerDuration: settings.answerDuration,
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function buildLaunchUrl(playlist: PlaylistEntry[], settings: Settings): string {
  if (playlist.length === 0) return ''
  const first = playlist[0]
  const session = encodeSession(playlist, settings)
  return `https://www.youtube.com/watch?v=${first.youtubeId}&t=${first.startAt}#blindtest=${session}`
}
