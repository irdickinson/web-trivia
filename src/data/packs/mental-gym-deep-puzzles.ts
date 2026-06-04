import { definePack } from '../authoring'

export const MENTAL_GYM_DEEP_PUZZLES_PACK = definePack({
  id: 'mental-gym-deep-puzzles',
  name: 'Mental Gym: Deep Puzzles',
  description:
    'Harder word bridges, mini logic grids, transformations, weighing puzzles, and language traps.',
  categories: [
    {
      name: 'Word Bridges',
      clues: [
        {
          clue: 'Flower, rise, day, and set can all pair with which word?',
          answers: ['sun'],
          finalEligible: true,
        },
        {
          clue: 'Note, mark, shelf, and worm can all pair with which word?',
          answers: ['book'],
          finalEligible: true,
        },
        {
          clue: 'Fly, place, works, and light can all pair with which word?',
          answers: ['fire'],
          finalEligible: true,
        },
        {
          clue: 'Back, barn, school, and court can all pair with which word?',
          answers: ['yard'],
        },
        {
          clue: 'Cake, storm, flake, and man can all pair with which word?',
          answers: ['snow'],
          finalEligible: true,
        },
        {
          clue: 'Brush, ache, paste, and pick can all pair with which word?',
          answers: ['tooth'],
        },
      ],
    },
    {
      name: 'Harder Sequences',
      clues: [
        {
          clue: 'What comes next: tiny, small, medium, large, ___?',
          answers: ['huge'],
          finalEligible: true,
        },
        {
          clue: 'What comes next: A, B, D, G, K, ___?',
          answers: ['P'],
          finalEligible: true,
        },
        {
          clue: 'Ace, two, three, four, ___.',
          answers: ['five'],
          finalEligible: true,
        },
        {
          clue: 'Carbon, nitrogen, oxygen, fluorine, ___.',
          answers: ['neon'],
        },
        {
          clue: 'January, March, May, July, ___.',
          answers: ['September'],
          finalEligible: true,
        },
        {
          clue: 'Copper, silver, gold, platinum, ___.',
          answers: ['palladium'],
        },
      ],
    },
    {
      name: 'Mini Logic Grids',
      clues: [
        {
          clue: 'Rooms A, B, and C are in a row. A is left of B, and C is right of B. Which room is in the middle?',
          answers: ['B'],
          finalEligible: true,
        },
        {
          clue: 'Boxes A, B, and C are compared. The heavy box is not A, and B is lighter than C. Which box is heavy?',
          answers: ['C'],
          finalEligible: true,
        },
        {
          clue: 'Files A, B, C, and D are ordered low to high. A is before B, B before C, and C before D. Which file is highest?',
          answers: ['D'],
          finalEligible: true,
        },
        {
          clue: 'Three switches A, B, and C exist. Only the first switch controls the lamp. Which switch works?',
          answers: ['A'],
        },
        {
          clue: 'Five lockers A through E exist. The prize is not in A, B, C, or D. Which locker has it?',
          answers: ['E'],
          finalEligible: true,
        },
        {
          clue: 'Six gates A through F exist. Every gate except the last one is closed. Which gate is open?',
          answers: ['F'],
        },
      ],
    },
    {
      name: 'Pick the Rule',
      clues: [
        {
          clue: 'Which option fits: 2, 4, 8, 16, ___? A=18, B=20, C=24, D=32?',
          answers: ['option D', 'D'],
          finalEligible: true,
        },
        {
          clue: 'Which option fits: cat, act, tac, ___? A=dog, B=cta, C=cart, D=coat?',
          answers: ['option B', 'B'],
          finalEligible: true,
        },
        {
          clue: 'The group is oak, pine, cedar. Which option belongs? A=rose, B=maple, C=fern, D=moss',
          answers: ['option B: maple', 'B'],
          finalEligible: true,
        },
        {
          clue: 'The group is square, cube, octagon. Which option belongs? A=sphere, B=line, C=triangle, D=circle',
          answers: ['option C: triangle', 'C'],
        },
        {
          clue: 'Which option completes the pattern: AB, CD, EF, ___? A=GH, B=GI, C=HI, D=FG',
          answers: ['option A: GH', 'A'],
          finalEligible: true,
        },
        {
          clue: 'Which option is the odd one out: 11, 13, 15, 17? A=11, B=13, C=15, D=17',
          answers: ['option C: 15', 'C'],
        },
      ],
    },
    {
      name: 'Longer Riddles',
      clues: [
        {
          clue: 'I get shorter while giving light. What am I?',
          answers: ['candle'],
          finalEligible: true,
        },
        {
          clue: 'I show roads and cities but never travel. What am I?',
          answers: ['map'],
          finalEligible: true,
        },
        {
          clue: 'I copy your face while reversing left and right.',
          answers: ['mirror'],
          finalEligible: true,
        },
        {
          clue: 'I carry a message while sealed shut.',
          answers: ['envelope'],
        },
        {
          clue: 'I can be broken without being touched.',
          answers: ['promise'],
          finalEligible: true,
        },
        {
          clue: 'The more you say my name, the less of me remains.',
          answers: ['silence'],
        },
      ],
    },
    {
      name: 'Operation Choice',
      clues: [
        {
          clue: 'A machine turns 3 into 9 and 5 into 25. What operation is it using?',
          answers: ['squaring'],
          finalEligible: true,
        },
        {
          clue: 'A machine turns 10 into 5 and 8 into 4. What operation is it using?',
          answers: ['halving'],
          finalEligible: true,
        },
        {
          clue: 'CAT becomes DBU, and DOG becomes EPH. The operation is ___.',
          answers: ['shift one'],
          finalEligible: true,
        },
        {
          clue: 'STOP becomes POTS. The operation is ___.',
          answers: ['reverse'],
        },
        {
          clue: 'LISTEN becomes SILENT. The operation is a letter ___.',
          answers: ['rearrangement'],
          finalEligible: true,
        },
        {
          clue: 'The machine turns 2 and 3 into 5, then 6 and 7 into 13. The operation is ___.',
          answers: ['addition'],
        },
      ],
    },
    {
      name: 'Weighing Puzzles',
      clues: [
        {
          clue: 'A and B balance. B and C balance. How does A compare with C?',
          answers: ['equal'],
          finalEligible: true,
        },
        {
          clue: 'A outweighs B, and B outweighs C. Compared with C, A is ___.',
          answers: ['heavier'],
          finalEligible: true,
        },
        {
          clue: 'A is less heavy than B, and C equals A. Compared with B, C is ___.',
          answers: ['lighter'],
          finalEligible: true,
        },
        {
          clue: 'One fake coin is light among 9 coins. Minimum balance-scale tests needed?',
          answers: ['2 weighings', 'two weighings', '2'],
        },
        {
          clue: 'If A plus B balances C plus D, and A equals C, then B and D must ___.',
          answers: ['match'],
          finalEligible: true,
        },
        {
          clue: 'If a scale tips left, which side has more mass?',
          answers: ['left side'],
        },
      ],
    },
    {
      name: 'Hidden Categories',
      clues: [
        {
          clue: 'Level, radar, and civic share what property?',
          answers: ['palindrome'],
          finalEligible: true,
        },
        {
          clue: 'Sea/see, flour/flower, and pair/pear share what sound relation?',
          answers: ['homophone'],
          finalEligible: true,
        },
        {
          clue: 'Listen/silent and evil/vile are examples of what relation?',
          answers: ['anagram'],
          finalEligible: true,
        },
        {
          clue: 'NASA, scuba, and laser are formed from initials or parts; this type is ___.',
          answers: ['acronym'],
        },
        {
          clue: 'Toothbrush, snowman, and sunflower share this word-building type.',
          answers: ['compound word', 'compound'],
          finalEligible: true,
        },
        {
          clue: 'Knight, wrist, and gnome start with a written-but-unheard character: a ___.',
          answers: ['silent letter'],
        },
      ],
    },
    {
      name: 'Careful Language',
      clues: [
        {
          clue: 'If every marble in the bag is blue, how many drawn marbles will be blue?',
          answers: ['all'],
          finalEligible: true,
        },
        {
          clue: 'At least one means this many or more.',
          answers: ['one', '1'],
          finalEligible: true,
        },
        {
          clue: 'Not every lamp is on. This guarantees at least one lamp is ___.',
          answers: ['off'],
          finalEligible: true,
        },
        {
          clue: 'No tickets are valid. How many can admit you?',
          answers: ['none', 'zero', '0'],
        },
        {
          clue: 'A rule says entry requires a badge. Mira has no badge. Mira ___ enter.',
          answers: ['cannot', "can't", 'can not'],
          finalEligible: true,
        },
        {
          clue: 'A sign says a shop is usually closed Mondays. Exceptions are therefore ___.',
          answers: ['possible'],
        },
      ],
    },
  ],
})
