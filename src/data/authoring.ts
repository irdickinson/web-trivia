// Question-pack authoring helpers.
//
// Writing TriviaQuestion objects by hand is noisy: every entry repeats id,
// category, difficulty, value, and a lowercase answer array. `definePack` lets
// you author a pack as categories, each holding an ordered list of clues from
// easiest to hardest. Ids, difficulty (1..n), and board value are derived from
// position, and answers are lowercased for you.
//
// To add a pack: copy an existing file in data/packs/, fill in the clues, and
// register it in data/packs/index.ts. See data/packs/classic.ts for a template.

import { QuestionPack, TriviaQuestion } from '../types/question'

// One board tier within a category. Position in the category's `clues` array
// sets the difficulty (1 = easiest / top row) and the dollar value.
export interface ClueDraft {
  clue: string // statement form: "He was the first president…"
  answers: string[] // accepted answers; the first is treated as canonical
  finalEligible?: boolean // may appear in the Final Round (default false)
  tags?: string[]
}

export interface CategoryDraft {
  name: string
  clues: ClueDraft[] // ordered easiest → hardest
}

export interface PackDraft {
  id: string
  name: string
  description?: string
  categories: CategoryDraft[]
}

// Dollar value per board row. Row 0 → $100, row 1 → $200, …
const VALUE_STEP = 100

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeAuthored(answer: string): string {
  return answer.trim().toLowerCase()
}

export function definePack(draft: PackDraft): QuestionPack {
  const questions: TriviaQuestion[] = []

  for (const category of draft.categories) {
    category.clues.forEach((c, i) => {
      const difficulty = i + 1
      questions.push({
        id: `${draft.id}:${slug(category.name)}:${difficulty}`,
        category: category.name,
        difficulty,
        value: difficulty * VALUE_STEP,
        clue: c.clue,
        acceptedAnswers: c.answers.map(normalizeAuthored),
        tags: c.tags,
        isFinalEligible: c.finalEligible ?? false,
      })
    })
  }

  return {
    id: draft.id,
    name: draft.name,
    description: draft.description,
    categories: draft.categories.map((c) => c.name),
    questions,
  }
}
