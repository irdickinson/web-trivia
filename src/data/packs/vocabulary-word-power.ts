import { definePack } from '../authoring'

export const VOCABULARY_WORD_POWER_PACK = definePack({
  id: 'vocabulary-word-power',
  name: 'Vocabulary: Word Power',
  description:
    'Precise words for traits, tone, action, quantity, time, movement, and everyday expression.',
  categories: [
    {
      name: 'Precise Adjectives',
      clues: [
        {
          clue: 'Which word means clear and easy to understand?',
          answers: ['lucid'],
          finalEligible: true,
        },
        {
          clue: 'Brief and direct, using very few words.',
          answers: ['terse'],
          finalEligible: true,
        },
        {
          clue: 'Which word means open, honest, and straightforward?',
          answers: ['candid'],
          finalEligible: true,
        },
        {
          clue: 'Elaborately decorated or highly detailed in style.',
          answers: ['ornate'],
        },
        {
          clue: 'Careful with money or resources.',
          answers: ['frugal'],
          finalEligible: true,
        },
        {
          clue: 'Likely to change suddenly or unpredictably.',
          answers: ['volatile'],
        },
      ],
    },
    {
      name: 'Precise Verbs',
      clues: [
        {
          clue: 'To support, strengthen, or boost something.',
          answers: ['bolster'],
          finalEligible: true,
        },
        {
          clue: 'Which verb means to examine very closely?',
          answers: ['scrutinize', 'scrutinise'],
          finalEligible: true,
        },
        {
          clue: 'To prove a statement or argument wrong.',
          answers: ['refute'],
          finalEligible: true,
        },
        {
          clue: 'To express grief, regret, or sorrow.',
          answers: ['lament'],
        },
        {
          clue: 'Which verb means to calm or satisfy someone by making concessions?',
          answers: ['appease'],
          finalEligible: true,
        },
        {
          clue: 'To confirm or support evidence with additional evidence.',
          answers: ['corroborate'],
        },
      ],
    },
    {
      name: 'People Words',
      clues: [
        {
          clue: 'A beginner or person new to a skill.',
          answers: ['novice'],
          finalEligible: true,
        },
        {
          clue: 'Which word means a trusted guide or teacher?',
          answers: ['mentor'],
          finalEligible: true,
        },
        {
          clue: 'A person inclined to question or doubt claims.',
          answers: ['skeptic', 'sceptic'],
          finalEligible: true,
        },
        {
          clue: 'A person who lives apart from others.',
          answers: ['recluse'],
        },
        {
          clue: 'Which word means a young person with exceptional talent?',
          answers: ['prodigy'],
          finalEligible: true,
        },
        {
          clue: 'A fraud who pretends to have special knowledge or skill.',
          answers: ['charlatan'],
        },
      ],
    },
    {
      name: 'Mood and Tone',
      clues: [
        {
          clue: 'Calm, peaceful, and untroubled.',
          answers: ['serene'],
          finalEligible: true,
        },
        {
          clue: 'Which word describes a serious, sad, or gloomy mood?',
          answers: ['somber', 'sombre'],
          finalEligible: true,
        },
        {
          clue: 'Mocking in a sharp, bitter, or scornful way.',
          answers: ['sardonic'],
          finalEligible: true,
        },
        {
          clue: 'Having a gentle sadness or longing for the past.',
          answers: ['wistful'],
        },
        {
          clue: 'Which word means angry because something seems unfair?',
          answers: ['indignant'],
          finalEligible: true,
        },
        {
          clue: 'Suggesting that something bad or threatening may happen.',
          answers: ['ominous'],
        },
      ],
    },
    {
      name: 'Amount and Degree',
      clues: [
        {
          clue: 'More than enough; plentiful.',
          answers: ['ample'],
          finalEligible: true,
        },
        {
          clue: 'Which word means in short supply or hard to find?',
          answers: ['scarce'],
          finalEligible: true,
        },
        {
          clue: 'Very many; countless.',
          answers: ['myriad'],
          finalEligible: true,
        },
        {
          clue: 'So small or unimportant as to be barely worth considering.',
          answers: ['negligible'],
        },
        {
          clue: 'Which word means unreasonably high in price or amount?',
          answers: ['exorbitant'],
          finalEligible: true,
        },
        {
          clue: 'Present or found everywhere.',
          answers: ['ubiquitous'],
        },
      ],
    },
    {
      name: 'Speech and Writing',
      clues: [
        {
          clue: 'To restate something in different words.',
          answers: ['paraphrase'],
          finalEligible: true,
        },
        {
          clue: 'Which verb means to add explanatory notes to a text?',
          answers: ['annotate'],
          finalEligible: true,
        },
        {
          clue: 'To change and improve a draft.',
          answers: ['revise'],
          finalEligible: true,
        },
        {
          clue: "To present another person's work as your own.",
          answers: ['plagiarize', 'plagiarise'],
        },
        {
          clue: 'Which verb means to wander away from the main topic?',
          answers: ['digress'],
          finalEligible: true,
        },
        {
          clue: 'To speak ambiguously in order to avoid a clear answer.',
          answers: ['equivocate'],
        },
      ],
    },
    {
      name: 'Character Traits',
      clues: [
        {
          clue: 'Careful, steady, and hardworking.',
          answers: ['diligent'],
          finalEligible: true,
        },
        {
          clue: 'Which word means modest and not overly proud?',
          answers: ['humble'],
          finalEligible: true,
        },
        {
          clue: 'Able to recover after difficulty or stress.',
          answers: ['resilient'],
          finalEligible: true,
        },
        {
          clue: 'Too easily fooled or persuaded.',
          answers: ['gullible'],
        },
        {
          clue: 'Which word means overly proud or self-important?',
          answers: ['arrogant'],
          finalEligible: true,
        },
        {
          clue: 'Having a strong desire to get revenge.',
          answers: ['vindictive'],
        },
      ],
    },
    {
      name: 'Time and Change',
      clues: [
        {
          clue: 'Very old or from the distant past.',
          answers: ['ancient'],
          finalEligible: true,
        },
        {
          clue: 'Which word means lasting for only a limited time?',
          answers: ['temporary'],
          finalEligible: true,
        },
        {
          clue: 'Happening slowly by degrees.',
          answers: ['gradual'],
          finalEligible: true,
        },
        {
          clue: 'Sudden and unexpected.',
          answers: ['abrupt'],
        },
        {
          clue: 'Which word describes something out of date or no longer used?',
          answers: ['obsolete'],
          finalEligible: true,
        },
        {
          clue: 'Continuing forever or for an indefinitely long time.',
          answers: ['perpetual'],
        },
      ],
    },
    {
      name: 'Movement Verbs',
      clues: [
        {
          clue: 'To move from one region or habitat to another.',
          answers: ['migrate'],
          finalEligible: true,
        },
        {
          clue: 'Which verb means to walk or move without a fixed route?',
          answers: ['wander'],
          finalEligible: true,
        },
        {
          clue: 'To climb or move upward.',
          answers: ['ascend'],
          finalEligible: true,
        },
        {
          clue: 'To move downward.',
          answers: ['descend'],
        },
        {
          clue: 'Which verb means to come together from different directions?',
          answers: ['converge'],
          finalEligible: true,
        },
        {
          clue: 'To scatter or spread widely.',
          answers: ['disperse'],
        },
      ],
    },
  ],
})
