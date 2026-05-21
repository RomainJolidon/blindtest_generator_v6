export interface Song {
  id: string
  name: string
  youtubeId: string
  startAt: number
  difficulty?: number
}

export interface Source {
  id: string
  title: string
  difficulty: number
  tags?: string[]
  songs: Song[]
}

export interface Category {
  id: string
  label: string
  sources: Source[]
}

export interface BlindtestData {
  categories: Category[]
}

export interface FlatSong {
  id: string
  name: string
  youtubeId: string
  startAt: number
  effectiveDifficulty: number
  sourceId: string
  sourceTitle: string
  categoryId: string
}

export interface PlaylistEntry {
  youtubeId: string
  startAt: number
  name: string
  sourceTitle: string
  categoryId: string
}
