import { definePack } from '../authoring'

export const MIND_BENDERS_THOUGHT_EXPERIMENTS_RIDDLES_PACK = definePack({
  id: 'mind-benders-thought-experiments-riddles',
  name: 'Mind Benders: Thought Experiments & Riddles',
  description:
    'Classic thought experiments, paradoxes, game-theory puzzles, and original riddle clues.',
  categories: [
    {
      name: 'Famous Thought Experiments',
      clues: [
        {
          clue: 'A runaway rail dilemma about diverting harm from five people to one.',
          answers: ['trolley problem'],
          finalEligible: true,
        },
        {
          clue: 'Which puzzle asks whether a fully repaired ancient vessel remains the same object?',
          answers: ['Ship of Theseus'],
          finalEligible: true,
        },
        {
          clue: 'A skeptical scenario where a disembodied organ receives simulated experiences.',
          answers: ['brain in a vat'],
          finalEligible: true,
        },
        {
          clue: "Searle's room argument asks whether symbol manipulation is enough for understanding.",
          answers: ['Chinese room'],
        },
        {
          clue: 'Which scenario asks whether a color scientist learns something new on seeing red?',
          answers: ["Mary's room", 'Mary room'],
          finalEligible: true,
        },
        {
          clue: 'Nozick imagined this device that could provide any pleasurable life from the inside.',
          answers: ['experience machine'],
        },
      ],
    },
    {
      name: 'Ethics Dilemmas',
      clues: [
        {
          clue: "Plato's invisibility-ring story tests whether people act justly when unseen.",
          answers: ['Ring of Gyges'],
          finalEligible: true,
        },
        {
          clue: 'Which dialogue asks whether pious things are loved by the gods because they are pious?',
          answers: ['Euthyphro dilemma', 'Euthyphro'],
          finalEligible: true,
        },
        {
          clue: 'A lifeboat case about limited seats raises questions of this kind of ethics.',
          answers: ['survival ethics'],
          finalEligible: true,
        },
        {
          clue: 'A hidden lottery where one victim sustains social happiness is often called this kind of lottery.',
          answers: ['sacrificial lottery'],
        },
        {
          clue: 'Which dilemma asks whether lying is allowed to prevent a murder?',
          answers: ['murderer at the door'],
          finalEligible: true,
        },
        {
          clue: 'A medical dilemma about killing one healthy patient to save five is often called the transplant ___.',
          answers: ['scenario', 'case'],
        },
      ],
    },
    {
      name: 'Mind and Reality',
      clues: [
        {
          clue: 'Descartes imagined this deceiver who could make all experience seem false.',
          answers: ['evil demon', 'evil genius'],
          finalEligible: true,
        },
        {
          clue: 'Which Putnam scenario imagines a planet where water-like liquid is not H2O?',
          answers: ['Twin Earth'],
          finalEligible: true,
        },
        {
          clue: 'A person physically identical to us but lacking experience is a philosophical ___.',
          answers: ['zombie'],
          finalEligible: true,
        },
        {
          clue: "Davidson's lightning-created duplicate of a man is called this.",
          answers: ['Swampman'],
        },
        {
          clue: 'Which puzzle asks whether another creature really has inner experience?',
          answers: ['other minds'],
          finalEligible: true,
        },
        {
          clue: 'The hard problem is most closely about this feature of mind.',
          answers: ['consciousness'],
        },
      ],
    },
    {
      name: 'Game Theory Puzzles',
      clues: [
        {
          clue: 'Two suspects each do better by betraying, though mutual silence would help both.',
          answers: ["prisoner's dilemma", 'prisoners dilemma'],
          finalEligible: true,
        },
        {
          clue: 'Which bargaining game has one player propose a split and the other accept or reject?',
          answers: ['ultimatum game'],
          finalEligible: true,
        },
        {
          clue: 'A coordination game where two hunters choose stag or hare.',
          answers: ['stag hunt'],
          finalEligible: true,
        },
        {
          clue: 'This game models a contest where each side prefers not to swerve but disaster comes if neither does.',
          answers: ['chicken'],
        },
        {
          clue: 'Which paradox involves choosing one box or two boxes after a predictor has acted?',
          answers: ["Newcomb's problem", 'Newcomb problem'],
          finalEligible: true,
        },
        {
          clue: 'A hungry animal placed exactly between identical foods illustrates this indecision puzzle.',
          answers: ["Buridan's ass", 'Buridans ass'],
        },
      ],
    },
    {
      name: 'Classic Paradoxes',
      clues: [
        {
          clue: 'The statement "This sentence is false" names this paradox.',
          answers: ['liar paradox'],
          finalEligible: true,
        },
        {
          clue: 'Which paradox asks whether a barber shaves himself if he shaves all and only those who do not shave themselves?',
          answers: ['barber paradox'],
          finalEligible: true,
        },
        {
          clue: "Zeno's race where a hero can never seem to catch a tortoise.",
          answers: ['Achilles and the tortoise'],
          finalEligible: true,
        },
        {
          clue: 'A grain-by-grain puzzle asks when a pile stops being this.',
          answers: ['heap', 'sorites'],
        },
        {
          clue: 'Which paradox involves a set of all sets that are not members of themselves?',
          answers: ["Russell's paradox", 'Russells paradox'],
          finalEligible: true,
        },
        {
          clue: 'A surprise test puzzle is often called the unexpected ___ paradox.',
          answers: ['hanging', 'exam'],
        },
      ],
    },
    {
      name: 'Object Riddles',
      clues: [
        {
          clue: 'I have teeth but never bite, and I help tidy hair.',
          answers: ['comb'],
          finalEligible: true,
        },
        {
          clue: 'Which object has hands but cannot clap?',
          answers: ['clock'],
          finalEligible: true,
        },
        {
          clue: 'I have a spine but no bones, and I open to tell stories.',
          answers: ['book'],
          finalEligible: true,
        },
        {
          clue: 'I have keys but open no locks and can make music.',
          answers: ['piano'],
        },
        {
          clue: 'Which object gets sharper the more it is used to remove itself?',
          answers: ['pencil'],
          finalEligible: true,
        },
        {
          clue: 'I hold water though I am full of holes.',
          answers: ['sponge'],
        },
      ],
    },
    {
      name: 'Nature Riddles',
      clues: [
        {
          clue: 'I follow you in sunlight but disappear in darkness.',
          answers: ['shadow'],
          finalEligible: true,
        },
        {
          clue: 'Which natural thing falls but never climbs back up?',
          answers: ['rain'],
          finalEligible: true,
        },
        {
          clue: 'I speak without a mouth when cliffs return your sound.',
          answers: ['echo'],
          finalEligible: true,
        },
        {
          clue: 'I can be cracked, made, told, and played.',
          answers: ['joke'],
        },
        {
          clue: 'Which bright arc may appear after rain when sunlight returns?',
          answers: ['rainbow'],
          finalEligible: true,
        },
        {
          clue: 'I am white when dirty and black when clean in an old classroom.',
          answers: ['blackboard', 'chalkboard'],
        },
      ],
    },
    {
      name: 'Wordplay Riddles',
      clues: [
        {
          clue: 'What word names the result when er is added to short?',
          answers: ['shorter'],
          finalEligible: true,
        },
        {
          clue: 'Which five-letter word sounds the same after removing four letters?',
          answers: ['queue'],
          finalEligible: true,
        },
        {
          clue: 'What begins with T, ends with T, and has T inside?',
          answers: ['teapot'],
          finalEligible: true,
        },
        {
          clue: 'A word for a sound that also means correct.',
          answers: ['right'],
        },
        {
          clue: 'Which word contains a silent letter at the start and means a small cut?',
          answers: ['knife'],
          finalEligible: true,
        },
        {
          clue: 'What common word is pronounced like one letter and means vision organ?',
          answers: ['eye'],
        },
      ],
    },
    {
      name: 'Math Riddles',
      clues: [
        {
          clue: 'I am the only even prime number.',
          answers: ['2', 'two'],
          finalEligible: true,
        },
        {
          clue: 'Which number is neither positive nor negative?',
          answers: ['0', 'zero'],
          finalEligible: true,
        },
        {
          clue: 'I have three sides and three angles.',
          answers: ['triangle'],
          finalEligible: true,
        },
        {
          clue: 'A number multiplied by itself is called a ___.',
          answers: ['square'],
        },
        {
          clue: 'Which number is represented by the Roman numeral X?',
          answers: ['10', 'ten'],
          finalEligible: true,
        },
        {
          clue: 'The top number in a fraction is called this.',
          answers: ['numerator'],
        },
      ],
    },
  ],
})
