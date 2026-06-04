import { definePack } from '../authoring'

export const VOCABULARY_LANGUAGE_TOOLS_PACK = definePack({
  id: 'vocabulary-language-tools',
  name: 'Vocabulary: Language Tools',
  description:
    'Word roots, prefixes, suffixes, figures of speech, rhetorical devices, and tricky usage pairs.',
  categories: [
    {
      name: 'Word Roots',
      clues: [
        {
          clue: 'The root meaning life, as in biology.',
          answers: ['bio'],
          finalEligible: true,
        },
        {
          clue: 'Which root means time?',
          answers: ['chrono'],
          finalEligible: true,
        },
        {
          clue: 'The root meaning earth, as in geology.',
          answers: ['geo'],
          finalEligible: true,
        },
        {
          clue: 'The root meaning light.',
          answers: ['photo'],
        },
        {
          clue: 'Which root means far or distant?',
          answers: ['tele'],
          finalEligible: true,
        },
        {
          clue: 'The root meaning write.',
          answers: ['script', 'scrib'],
        },
      ],
    },
    {
      name: 'Prefixes',
      clues: [
        {
          clue: 'This prefix means against or opposed to.',
          answers: ['anti'],
          finalEligible: true,
        },
        {
          clue: 'Which prefix means before?',
          answers: ['pre'],
          finalEligible: true,
        },
        {
          clue: 'This prefix means after.',
          answers: ['post'],
          finalEligible: true,
        },
        {
          clue: 'A prefix meaning under or below.',
          answers: ['sub'],
        },
        {
          clue: 'Which prefix means between or among?',
          answers: ['inter'],
          finalEligible: true,
        },
        {
          clue: 'This prefix means across or beyond.',
          answers: ['trans'],
        },
      ],
    },
    {
      name: 'Suffixes',
      clues: [
        {
          clue: 'This suffix means the study of something.',
          answers: ['ology', '-ology'],
          finalEligible: true,
        },
        {
          clue: 'Which suffix means fear of something?',
          answers: ['phobia', '-phobia'],
          finalEligible: true,
        },
        {
          clue: 'This suffix means lover of something.',
          answers: ['phile', '-phile'],
          finalEligible: true,
        },
        {
          clue: 'A suffix meaning fit for a stated purpose.',
          answers: ['able', '-able'],
        },
        {
          clue: 'Which suffix means full of?',
          answers: ['ful', '-ful'],
          finalEligible: true,
        },
        {
          clue: 'This suffix can mean a person who practices or believes something.',
          answers: ['ist', '-ist'],
        },
      ],
    },
    {
      name: 'Figurative Language',
      clues: [
        {
          clue: 'A comparison using like or as.',
          answers: ['simile'],
          finalEligible: true,
        },
        {
          clue: 'Which figure compares two things directly without like or as?',
          answers: ['metaphor'],
          finalEligible: true,
        },
        {
          clue: 'Deliberate exaggeration for effect.',
          answers: ['hyperbole'],
          finalEligible: true,
        },
        {
          clue: 'Giving human qualities to something nonhuman.',
          answers: ['personification'],
        },
        {
          clue: 'Which figure substitutes a related thing, such as crown for monarch?',
          answers: ['metonymy'],
          finalEligible: true,
        },
        {
          clue: 'Using a part to stand for a whole, such as hands for sailors.',
          answers: ['synecdoche'],
        },
      ],
    },
    {
      name: 'Rhetorical Devices',
      clues: [
        {
          clue: 'Repetition of initial sounds in nearby words.',
          answers: ['alliteration'],
          finalEligible: true,
        },
        {
          clue: 'Which device repeats a word or phrase at the beginning of successive clauses?',
          answers: ['anaphora'],
          finalEligible: true,
        },
        {
          clue: 'A balanced contrast of ideas in parallel structure.',
          answers: ['antithesis'],
          finalEligible: true,
        },
        {
          clue: 'A reversed parallel structure, often described as an ABBA pattern.',
          answers: ['chiasmus'],
        },
        {
          clue: 'Which device uses a mild expression in place of a harsh one?',
          answers: ['euphemism'],
          finalEligible: true,
        },
        {
          clue: 'A compact phrase combining contradictory terms.',
          answers: ['oxymoron'],
        },
      ],
    },
    {
      name: 'Confused Words',
      clues: [
        {
          clue: 'Usually the verb meaning to influence.',
          answers: ['affect'],
          finalEligible: true,
        },
        {
          clue: 'Which word is usually the noun meaning result?',
          answers: ['effect'],
          finalEligible: true,
        },
        {
          clue: 'Use this word with countable things: ___ cookies.',
          answers: ['fewer'],
          finalEligible: true,
        },
        {
          clue: 'Use this word with amounts not counted one by one: ___ water.',
          answers: ['less'],
        },
        {
          clue: 'Which word means to suggest something indirectly?',
          answers: ['imply'],
          finalEligible: true,
        },
        {
          clue: 'This word means to conclude from evidence.',
          answers: ['infer'],
        },
      ],
    },
    {
      name: 'Word Relationships',
      clues: [
        {
          clue: 'A word with the same or nearly the same meaning as another.',
          answers: ['synonym'],
          finalEligible: true,
        },
        {
          clue: 'Which word means a word with the opposite meaning?',
          answers: ['antonym'],
          finalEligible: true,
        },
        {
          clue: 'A word pronounced like another but different in meaning or spelling.',
          answers: ['homophone'],
          finalEligible: true,
        },
        {
          clue: 'A word spelled like another but with a different meaning.',
          answers: ['homograph'],
        },
        {
          clue: 'Which term describes words that sound and look alike but differ in meaning?',
          answers: ['homonym'],
          finalEligible: true,
        },
        {
          clue: 'A word borrowed from another language is called this.',
          answers: ['loanword'],
        },
      ],
    },
    {
      name: 'Word Origins',
      clues: [
        {
          clue: 'The history and origin of a word.',
          answers: ['etymology'],
          finalEligible: true,
        },
        {
          clue: 'Which term names a new word or expression?',
          answers: ['neologism'],
          finalEligible: true,
        },
        {
          clue: 'A word formed from the first letters of a phrase and pronounced as a word.',
          answers: ['acronym'],
          finalEligible: true,
        },
        {
          clue: 'A shortened form of a word or phrase.',
          answers: ['abbreviation'],
        },
        {
          clue: 'Which term names a word made by combining parts of two words, like brunch?',
          answers: ['blend', 'portmanteau'],
          finalEligible: true,
        },
        {
          clue: 'A name that comes from a person, such as sandwich from the Earl of Sandwich.',
          answers: ['eponym'],
        },
      ],
    },
    {
      name: 'Language Mistakes',
      clues: [
        {
          clue: 'The accidental misuse of a similar-sounding word, often with comic effect.',
          answers: ['malapropism'],
          finalEligible: true,
        },
        {
          clue: 'Which mistake swaps sounds between words, as in a blushing crow for a crushing blow?',
          answers: ['spoonerism'],
          finalEligible: true,
        },
        {
          clue: 'A mistake caused by using a word as if it came from a different root.',
          answers: ['folk etymology'],
          finalEligible: true,
        },
        {
          clue: 'An error in which a modifier seems to describe the wrong word.',
          answers: ['misplaced modifier'],
        },
        {
          clue: 'Which error leaves an introductory modifier without a clear word to modify?',
          answers: ['dangling modifier'],
          finalEligible: true,
        },
        {
          clue: 'Using more words than necessary, such as free gift, is called this.',
          answers: ['redundancy'],
        },
      ],
    },
  ],
})
