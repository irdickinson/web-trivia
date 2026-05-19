import fs from 'node:fs';
import path from 'node:path';
import type { QuestionPack, QuestionPackMeta } from '@jeopardy/shared';

export function loadQuestionPacks(): QuestionPack[] {
  const root = path.resolve(process.cwd(), '../../data/question-packs');
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = fs.readdirSync(root).filter((file) => file.endsWith('.json'));
  return files.map((file) => {
    const fullPath = path.join(root, file);
    const contents = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(contents) as QuestionPack;
  });
}

export function toPackMeta(packs: QuestionPack[]): QuestionPackMeta[] {
  return packs.map((pack) => ({
    id: pack.id,
    name: pack.name,
    description: pack.description,
    categoryCount: pack.categories.length,
    questionCount: pack.questions.length,
  }));
}
