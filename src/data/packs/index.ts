// Question-pack registry.
//
// Every playable pack is listed in PACK_REGISTRY. The lobby reads this list to
// render its pack picker; the game resolves the host's chosen ids into a single
// merged pack via resolvePacks(). To add a pack: create a file beside this one
// (copy classic.ts), then import and append it here.

import { QuestionPack } from '../../types/question'
import { CLASSIC_PACK } from './classic'
import { POP_CULTURE_PACK } from './popCulture'
import { SCIENCE_NATURE_PACK } from './scienceNature'

export const PACK_REGISTRY: QuestionPack[] = [
  CLASSIC_PACK,
  POP_CULTURE_PACK,
  SCIENCE_NATURE_PACK,
]

// The default selection for a new room.
export const DEFAULT_PACK_IDS = [CLASSIC_PACK.id]

export function getPack(id: string): QuestionPack | undefined {
  return PACK_REGISTRY.find((p) => p.id === id)
}

// Lightweight metadata for rendering the lobby picker without shipping every
// question into the UI layer.
export interface PackSummary {
  id: string
  name: string
  description?: string
  categoryCount: number
  questionCount: number
}

export function packSummaries(): PackSummary[] {
  return PACK_REGISTRY.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    categoryCount: p.categories.length,
    questionCount: p.questions.length,
  }))
}

// Merge the chosen packs into one. Categories pool together (a category name
// shared across packs combines its questions), so the board can draw from all
// selected sets. Unknown / empty selections fall back to the classic pack.
export function resolvePacks(ids: string[]): QuestionPack {
  const packs = ids.map(getPack).filter((p): p is QuestionPack => !!p)
  const effective = packs.length > 0 ? packs : [CLASSIC_PACK]

  if (effective.length === 1) return effective[0]

  const categories: string[] = []
  for (const pack of effective) {
    for (const cat of pack.categories) {
      if (!categories.includes(cat)) categories.push(cat)
    }
  }

  return {
    id: effective.map((p) => p.id).join('+'),
    name: effective.map((p) => p.name).join(' + '),
    description: 'Combined pack',
    categories,
    questions: effective.flatMap((p) => p.questions),
  }
}

// Backwards-compatible alias for the original single built-in pack.
export const DEFAULT_PACK = CLASSIC_PACK
