export interface TriviaQuestion {
  id: string
  category: string
  difficulty: number          // 1–6, maps to board row
  value: number               // dollar value (100, 200 … 600)
  clue: string                // statement form: "He was the first president…"
  acceptedAnswers: string[]   // pre-normalised lowercase variants
  tags?: string[]
  isFinalEligible?: boolean
}

export interface QuestionPack {
  id: string
  name: string
  description?: string
  categories: string[]
  questions: TriviaQuestion[]
}

export interface BoardQuestion extends TriviaQuestion {
  row: number
  col: number
  revealed: boolean
  answeredCorrectlyBy?: string | null
}
