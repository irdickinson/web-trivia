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
import { ANCIENT_CIVILIZATIONS_PACK } from './ancient-civilizations'
import { WORLD_WAR_II_GLOBAL_CONFLICT_PACK } from './world-war-ii-global-conflict'
import { WORLD_WAR_II_HOME_FRONT_AND_AFTER_PACK } from './world-war-ii-home-front-and-aftermath'
import { PHILOSOPHY_THINKERS_AND_TRADITIONS_PACK } from './philosophy-thinkers-and-traditions'
import { PHILOSOPHY_IDEAS_AND_PROBLEMS_PACK } from './philosophy-ideas-and-problems'
import { VOCABULARY_WORD_POWER_PACK } from './vocabulary-word-power'
import { VOCABULARY_LANGUAGE_TOOLS_PACK } from './vocabulary-language-tools'
import { MINECRAFT_SURVIVAL_WORLDS_PACK } from './minecraft-survival-worlds'
import { MINECRAFT_ADVANCED_SYSTEMS_PACK } from './minecraft-advanced-systems'
import { SKYRIM_WORLD_AND_PROGRESSION_PACK } from './skyrim-world-and-progression'
import { SKYRIM_QUESTS_AND_LORE_PACK } from './skyrim-quests-and-lore'
import { MIND_BENDERS_LOGIC_IQ_PACK } from './mind-benders-logic-iq'
import { MIND_BENDERS_THOUGHT_EXPERIMENTS_RIDDLES_PACK } from './mind-benders-thought-experiments-riddles'
import { MENTAL_GYM_CRITICAL_THINKING_PACK } from './mental-gym-critical-thinking'
import { MENTAL_GYM_DEEP_PUZZLES_PACK } from './mental-gym-deep-puzzles'

export const PACK_REGISTRY: QuestionPack[] = [
  CLASSIC_PACK,
  POP_CULTURE_PACK,
  SCIENCE_NATURE_PACK,
  ANCIENT_CIVILIZATIONS_PACK,
  WORLD_WAR_II_GLOBAL_CONFLICT_PACK,
  WORLD_WAR_II_HOME_FRONT_AND_AFTER_PACK,
  PHILOSOPHY_THINKERS_AND_TRADITIONS_PACK,
  PHILOSOPHY_IDEAS_AND_PROBLEMS_PACK,
  VOCABULARY_WORD_POWER_PACK,
  VOCABULARY_LANGUAGE_TOOLS_PACK,
  MINECRAFT_SURVIVAL_WORLDS_PACK,
  MINECRAFT_ADVANCED_SYSTEMS_PACK,
  SKYRIM_WORLD_AND_PROGRESSION_PACK,
  SKYRIM_QUESTS_AND_LORE_PACK,
  MIND_BENDERS_LOGIC_IQ_PACK,
  MIND_BENDERS_THOUGHT_EXPERIMENTS_RIDDLES_PACK,
  MENTAL_GYM_CRITICAL_THINKING_PACK,
  MENTAL_GYM_DEEP_PUZZLES_PACK,
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
