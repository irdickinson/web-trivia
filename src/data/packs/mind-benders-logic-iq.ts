import { definePack } from '../authoring'

export const MIND_BENDERS_LOGIC_IQ_PACK = definePack({
  id: 'mind-benders-logic-iq',
  name: 'Mind Benders: Logic & IQ',
  description:
    'Number sequences, letter patterns, analogies, odd-one-out puzzles, and quick reasoning challenges.',
  categories: [
    {
      name: 'Number Sequences',
      clues: [
        {
          clue: 'What comes next: 2, 4, 6, 8, ___?',
          answers: ['10', 'ten'],
          finalEligible: true,
        },
        {
          clue: 'What comes next: 3, 6, 12, 24, ___?',
          answers: ['48', 'forty-eight', 'forty eight'],
          finalEligible: true,
        },
        {
          clue: '1, 1, 2, 3, 5, 8, ___',
          answers: ['13', 'thirteen'],
          finalEligible: true,
        },
        {
          clue: '100, 81, 64, 49, ___',
          answers: ['36', 'thirty-six', 'thirty six'],
        },
        {
          clue: '2, 3, 5, 8, 12, 17, ___',
          answers: ['23', 'twenty-three', 'twenty three'],
          finalEligible: true,
        },
        {
          clue: '4, 9, 19, 39, 79, ___',
          answers: ['159', 'one hundred fifty-nine', 'one hundred fifty nine'],
        },
      ],
    },
    {
      name: 'Letter Patterns',
      clues: [
        {
          clue: 'What comes next: A, C, E, G, ___?',
          answers: ['I'],
          finalEligible: true,
        },
        {
          clue: 'What comes next: B, D, G, K, ___?',
          answers: ['P'],
          finalEligible: true,
        },
        {
          clue: 'Z, Y, X, W, ___',
          answers: ['V'],
          finalEligible: true,
        },
        {
          clue: 'A, D, H, M, ___',
          answers: ['S'],
        },
        {
          clue: 'C, F, I, L, ___',
          answers: ['O'],
          finalEligible: true,
        },
        {
          clue: 'B, E, H, K, N, ___',
          answers: ['Q'],
        },
      ],
    },
    {
      name: 'Word Analogies',
      clues: [
        {
          clue: 'What completes the analogy: bird is to nest as bee is to ___?',
          answers: ['hive'],
          finalEligible: true,
        },
        {
          clue: 'What completes the analogy: pencil is to write as scissors are to ___?',
          answers: ['cut'],
          finalEligible: true,
        },
        {
          clue: 'Doctor is to hospital as teacher is to ___.',
          answers: ['school'],
          finalEligible: true,
        },
        {
          clue: 'Seed is to tree as egg is to ___.',
          answers: ['bird', 'chick'],
        },
        {
          clue: 'Wheel is to bicycle as key is to ___.',
          answers: ['lock'],
          finalEligible: true,
        },
        {
          clue: 'Author is to novel as composer is to ___.',
          answers: ['symphony', 'music'],
        },
      ],
    },
    {
      name: 'Odd One Out',
      clues: [
        {
          clue: 'In triangle, square, circle, carrot, what kind of thing is the odd item?',
          answers: ['vegetable'],
          finalEligible: true,
        },
        {
          clue: 'In red, blue, seven, green, what kind of thing is the odd item?',
          answers: ['number'],
          finalEligible: true,
        },
        {
          clue: 'In copper, iron, oak, gold, the odd item is the only ___.',
          answers: ['tree'],
          finalEligible: true,
        },
        {
          clue: 'In whisper, shout, speak, apple, the odd item is the only ___.',
          answers: ['fruit'],
        },
        {
          clue: 'In violin, trumpet, piano, thunder, the odd item is the only natural ___.',
          answers: ['sound'],
          finalEligible: true,
        },
        {
          clue: 'In north, south, purple, east, the odd item is the only ___.',
          answers: ['color', 'colour'],
        },
      ],
    },
    {
      name: 'Mental Math',
      clues: [
        {
          clue: 'Half of 50 plus 5 equals ___.',
          answers: ['30', 'thirty'],
          finalEligible: true,
        },
        {
          clue: 'Which number is three squared plus four squared?',
          answers: ['25', 'twenty-five', 'twenty five'],
          finalEligible: true,
        },
        {
          clue: 'A dozen plus a score equals ___.',
          answers: ['32', 'thirty-two', 'thirty two'],
          finalEligible: true,
        },
        {
          clue: 'If six boxes hold seven coins each, the total is ___.',
          answers: ['42', 'forty-two', 'forty two'],
        },
        {
          clue: 'Which number is 20 percent of 175?',
          answers: ['35', 'thirty-five', 'thirty five'],
          finalEligible: true,
        },
        {
          clue: 'The next square after 121 is ___.',
          answers: ['144', 'one hundred forty-four', 'one hundred forty four'],
        },
      ],
    },
    {
      name: 'Shape Reasoning',
      clues: [
        {
          clue: 'A three-sided polygon.',
          answers: ['triangle'],
          finalEligible: true,
        },
        {
          clue: 'Which shape has four equal sides and four right angles?',
          answers: ['square'],
          finalEligible: true,
        },
        {
          clue: 'A perfectly round two-dimensional shape.',
          answers: ['circle'],
          finalEligible: true,
        },
        {
          clue: 'A solid with six equal square faces.',
          answers: ['cube'],
        },
        {
          clue: 'Which solid has one circular base and a single point?',
          answers: ['cone'],
          finalEligible: true,
        },
        {
          clue: 'A four-sided polygon with only one pair of parallel sides.',
          answers: ['trapezoid', 'trapezium'],
        },
      ],
    },
    {
      name: 'Code Breaking',
      clues: [
        {
          clue: 'What total does DOG make if A=1, B=2, and C=3?',
          answers: ['26', 'twenty-six', 'twenty six'],
          finalEligible: true,
        },
        {
          clue: 'What total does CAT make if A=1, B=2, and C=3?',
          answers: ['24', 'twenty-four', 'twenty four'],
          finalEligible: true,
        },
        {
          clue: 'In a Caesar shift of +1, CAT becomes ___.',
          answers: ['DBU'],
          finalEligible: true,
        },
        {
          clue: 'In a Caesar shift of -1, DOG becomes ___.',
          answers: ['CNF'],
        },
        {
          clue: 'If each letter moves one step forward, Z becomes ___.',
          answers: ['A'],
          finalEligible: true,
        },
        {
          clue: 'Using A1Z26, the code 8-5-12-12-15 spells ___.',
          answers: ['HELLO'],
        },
      ],
    },
    {
      name: 'Deduction Puzzles',
      clues: [
        {
          clue: 'All cats belong to the class of milk-feeding animals. Luna is a cat. Luna is a what?',
          answers: ['mammal'],
          finalEligible: true,
        },
        {
          clue: 'No squares have smooth circular edges. This shape is a square. It is not ___.',
          answers: ['curved'],
          finalEligible: true,
        },
        {
          clue: 'Every raven in the room has the same dark color. This bird is one of them. It is ___.',
          answers: ['black'],
          finalEligible: true,
        },
        {
          clue: 'All keys on the hook share the same shiny metal color. This key is on the hook. It is ___.',
          answers: ['silver'],
        },
        {
          clue: 'If every zorp is a blin, and no blin is red, then no zorp is ___.',
          answers: ['red'],
          finalEligible: true,
        },
        {
          clue: 'If only flight captains may enter, and Mara entered, what must Mara be?',
          answers: ['pilot'],
        },
      ],
    },
    {
      name: 'Pattern Rules',
      clues: [
        {
          clue: 'A rule that repeats every third item is called a ___ pattern.',
          answers: ['cycle', 'cyclic'],
          finalEligible: true,
        },
        {
          clue: 'Which rule adds the same amount each step?',
          answers: ['arithmetic'],
          finalEligible: true,
        },
        {
          clue: 'A rule that multiplies by the same amount each step is ___.',
          answers: ['geometric'],
          finalEligible: true,
        },
        {
          clue: 'A sequence that mirrors around a center has this kind of symmetry.',
          answers: ['reflection', 'reflective'],
        },
        {
          clue: 'Which word describes a pattern that alternates between two items?',
          answers: ['alternating'],
          finalEligible: true,
        },
        {
          clue: 'A pattern that grows by adding one more dot each row is ___.',
          answers: ['increasing', 'growing'],
        },
      ],
    },
  ],
})
