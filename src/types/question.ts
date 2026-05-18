export type Difficulty = 'easy' | 'medium' | 'hard'

export interface TypedQuestion {
  id: string
  text: string
  answer: string
  acceptableAnswers: string[]
  category: string
  difficulty: Difficulty
  timeLimit: number
}

export interface MultipleChoiceQuestion {
  id: string
  text: string
  answer: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  category: string
  difficulty: Difficulty
  timeLimit: number
}

export type Question = TypedQuestion | MultipleChoiceQuestion

export function isMultipleChoice(q: Question): q is MultipleChoiceQuestion {
  return 'options' in q
}

export interface QuestionSet {
  id: string
  ownerId: string | null
  title: string
  description: string
  isPublic: boolean
  isBuiltIn: boolean
  compatibleModes: string[]
  questions: Question[]
  createdAt: number
}
