import { useState, useEffect, useRef } from 'react'
import type { Category } from '../types/schema'

export interface Settings {
  selectedCategories: string[]
  difficultyMin: number
  difficultyMax: number
  trackCount: number
  guessDuration: number
  answerDuration: number
  allowMultiplePerSource: boolean
}

export function useSettings(categories: Category[]) {
  const [settings, setSettings] = useState<Settings>({
    selectedCategories: [],
    difficultyMin: 1,
    difficultyMax: 5,
    trackCount: 20,
    guessDuration: 30,
    answerDuration: 10,
    allowMultiplePerSource: false,
  })

  // When categories first load, select all of them
  const initialised = useRef(false)
  useEffect(() => {
    if (categories.length > 0 && !initialised.current) {
      initialised.current = true
      setSettings((prev) => ({ ...prev, selectedCategories: categories.map((c) => c.id) }))
    }
  }, [categories])

  function setSelectedCategories(ids: string[]) {
    setSettings((prev) => ({ ...prev, selectedCategories: ids }))
  }

  function setDifficultyRange(min: number, max: number) {
    setSettings((prev) => ({ ...prev, difficultyMin: min, difficultyMax: max }))
  }

  function setTrackCount(n: number) {
    setSettings((prev) => ({ ...prev, trackCount: n }))
  }

  function setGuessDuration(n: number) {
    setSettings((prev) => ({ ...prev, guessDuration: n }))
  }

  function setAnswerDuration(n: number) {
    setSettings((prev) => ({ ...prev, answerDuration: n }))
  }

  function setAllowMultiplePerSource(v: boolean) {
    setSettings((prev) => ({ ...prev, allowMultiplePerSource: v }))
  }

  return {
    settings,
    setSelectedCategories,
    setDifficultyRange,
    setTrackCount,
    setGuessDuration,
    setAnswerDuration,
    setAllowMultiplePerSource,
  }
}
