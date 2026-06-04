import { definePack } from '../authoring'

export const MENTAL_GYM_CRITICAL_THINKING_PACK = definePack({
  id: 'mental-gym-critical-thinking',
  name: 'Mental Gym: Critical Thinking',
  description:
    'Common-link clues, logic traps, ordering puzzles, categorization, and careful reasoning challenges.',
  categories: [
    {
      name: 'Common Links',
      clues: [
        {
          clue: 'Space, tab, shift, and enter are all found on what object?',
          answers: ['keyboard'],
          finalEligible: true,
        },
        {
          clue: 'Hearts, spades, diamonds, and clubs belong to what set?',
          answers: ['deck'],
          finalEligible: true,
        },
        {
          clue: 'Eye, point, thread, and haystack all point toward what object?',
          answers: ['needle'],
          finalEligible: true,
        },
        {
          clue: 'Arch, suspension, draw, and covered can all describe what structure?',
          answers: ['bridge'],
        },
        {
          clue: 'River, memory, blood, and savings can all precede which word?',
          answers: ['bank'],
          finalEligible: true,
        },
        {
          clue: 'Tooth, royal, paper, and bottle can all pair with which word?',
          answers: ['crown'],
        },
      ],
    },
    {
      name: 'Word Sequences',
      clues: [
        {
          clue: 'What comes next: Monday, Wednesday, Friday, ___?',
          answers: ['Sunday'],
          finalEligible: true,
        },
        {
          clue: 'What comes next: Mercury, Venus, Earth, ___?',
          answers: ['Mars'],
          finalEligible: true,
        },
        {
          clue: 'Alpha, beta, gamma, ___.',
          answers: ['delta'],
          finalEligible: true,
        },
        {
          clue: 'Spring, summer, autumn, ___.',
          answers: ['winter'],
        },
        {
          clue: 'One, two, four, eight, ___.',
          answers: ['sixteen', '16'],
          finalEligible: true,
        },
        {
          clue: 'Which word comes next: infant, child, teenager, adult, ___?',
          answers: ['senior', 'elder'],
        },
      ],
    },
    {
      name: 'Order Logic',
      clues: [
        {
          clue: 'Nina, Omar, and Priya stand in that order. What position is Omar?',
          answers: ['middle'],
          finalEligible: true,
        },
        {
          clue: 'A chime happens after the flash and before the door opens. What numbered event is the chime?',
          answers: ['second'],
          finalEligible: true,
        },
        {
          clue: 'Ava arrived before Bo, and Bo arrived before Cy. Relative to Ava, Cy arrived ___.',
          answers: ['later'],
          finalEligible: true,
        },
        {
          clue: 'Four files are sorted red, blue, green, gold. The gold file is in the ___ position.',
          answers: ['fourth'],
        },
        {
          clue: 'Kay is older than Lee, and Lee is older than Mo. Kay is the ___.',
          answers: ['oldest'],
          finalEligible: true,
        },
        {
          clue: 'A route visits Lima, Oslo, Cairo, Perth. Cairo is the ___ stop.',
          answers: ['third'],
        },
      ],
    },
    {
      name: 'Must Follow?',
      clues: [
        {
          clue: 'All glims are plors. Niv is a glim. Is Niv definitely a plor?',
          answers: ['yes'],
          finalEligible: true,
        },
        {
          clue: 'All glims are plors. Niv is a plor. Is Niv definitely a glim?',
          answers: ['no'],
          finalEligible: true,
        },
        {
          clue: 'Some daxes are wugs. Can every dax still be a wug?',
          answers: ['possible'],
          finalEligible: true,
        },
        {
          clue: 'No crimson tokens float. A token is floating. For it to be crimson is ___.',
          answers: ['impossible'],
        },
        {
          clue: 'Every zog is a shape. This mark is not a shape. It cannot be a ___.',
          answers: ['zog'],
          finalEligible: true,
        },
        {
          clue: 'If at least one lantern is lit, the room is bright. The room is dark. Lit lantern count is ___.',
          answers: ['zero', '0'],
        },
      ],
    },
    {
      name: 'Critical Counts',
      clues: [
        {
          clue: 'A drawer has only red and blue socks. How many blind pulls guarantee a matching pair?',
          answers: ['3 socks', 'three socks', '3'],
          finalEligible: true,
        },
        {
          clue: 'Birthdays are sorted only by weekday. How many people guarantee a shared weekday?',
          answers: ['8 people', 'eight people', '8'],
          finalEligible: true,
        },
        {
          clue: 'In a race, you pass the person just behind first. Your new place is ___.',
          answers: ['runner-up'],
          finalEligible: true,
        },
        {
          clue: 'Three straight cuts through a round pizza can make at most how many pieces?',
          answers: ['7 pieces', 'seven pieces', '7'],
        },
        {
          clue: 'Two parents and two children are in a photo, but only this many people are pictured.',
          answers: ['3 people', 'three people', '3'],
          finalEligible: true,
        },
        {
          clue: 'In a single-elimination event with 16 players, how many contests identify one winner?',
          answers: ['15 matches', 'fifteen matches', '15'],
        },
      ],
    },
    {
      name: 'Category Rules',
      clues: [
        {
          clue: 'Bat, whale, mole, and seal all belong to what animal class?',
          answers: ['mammal'],
          finalEligible: true,
        },
        {
          clue: 'Iron, copper, tin, and lead all belong to what material group?',
          answers: ['metal'],
          finalEligible: true,
        },
        {
          clue: 'Triangle, pentagon, and hexagon are all examples of what shape family?',
          answers: ['polygon'],
          finalEligible: true,
        },
        {
          clue: 'Mercury, Venus, Earth, and Mars are all examples of what kind of object?',
          answers: ['planet'],
        },
        {
          clue: 'Red, cyan, violet, and amber are all examples of what property?',
          answers: ['color', 'colour'],
          finalEligible: true,
        },
        {
          clue: 'Mercury, Hermes, Odin, and Ra share what broad mythic role?',
          answers: ['deity', 'god'],
        },
      ],
    },
    {
      name: 'Transform Steps',
      clues: [
        {
          clue: 'Start with STAR. Move the first letter to the end: TARS. Reverse it to get what?',
          answers: ['SRAT'],
          finalEligible: true,
        },
        {
          clue: 'Start with PLANE. Remove the first and last letters, then reverse what remains. What appears?',
          answers: ['NAL'],
          finalEligible: true,
        },
        {
          clue: 'Start with TRACE. Alphabetize its letters to make ___.',
          answers: ['ACERT'],
          finalEligible: true,
        },
        {
          clue: 'Start with CLOUD. Remove vowels, then reverse the result: ___.',
          answers: ['DLC'],
        },
        {
          clue: 'Start with MANGO. Shift each letter one step forward in the alphabet: ___.',
          answers: ['NBOHP'],
          finalEligible: true,
        },
        {
          clue: 'Start with BRICK. Move the last letter to the front, then shift vowels one vowel forward: ___.',
          answers: ['KBROC'],
        },
      ],
    },
    {
      name: 'Direction Puzzles',
      clues: [
        {
          clue: 'You face north and turn right. Which direction do you face?',
          answers: ['east'],
          finalEligible: true,
        },
        {
          clue: 'You face east and turn left. Which direction do you face?',
          answers: ['north'],
          finalEligible: true,
        },
        {
          clue: 'A path goes north, then east, then south by equal lengths. Net movement from start is ___.',
          answers: ['one block east', 'eastward'],
          finalEligible: true,
        },
        {
          clue: 'Face west and make a U-turn. You now face ___.',
          answers: ['eastward'],
        },
        {
          clue: 'On a map, move two units up and two units left from the origin. Which quadrant are you in?',
          answers: ['second quadrant', 'quadrant two'],
          finalEligible: true,
        },
        {
          clue: 'A compass bearing of 225 degrees points between south and west: ___.',
          answers: ['southwest', 'south west'],
        },
      ],
    },
    {
      name: 'Assumption Traps',
      clues: [
        {
          clue: 'A plane crashes on a border. Where do you bury survivors?',
          answers: ['nowhere', 'you do not'],
          finalEligible: true,
        },
        {
          clue: 'How many months have 28 days?',
          answers: ['12 months', 'all of them', '12'],
          finalEligible: true,
        },
        {
          clue: 'A rooster lays an egg on a roof ridge. Which side does it roll down?',
          answers: ['neither'],
          finalEligible: true,
        },
        {
          clue: 'A doctor gives three pills, one every half hour. Total time from first to last is ___.',
          answers: ['one hour', '1 hour'],
        },
        {
          clue: 'A room has a locked door and no windows. How many windows can someone inside open?',
          answers: ['none', '0', 'zero'],
          finalEligible: true,
        },
        {
          clue: 'A bus driver goes the wrong way on a one-way street and is not stopped because the driver is ___.',
          answers: ['walking', 'on foot'],
        },
      ],
    },
  ],
})
