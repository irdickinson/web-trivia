// Template pack — copy this file's shape to author a new pack, then register it
// in ./index.ts. Each category lists six clues ordered easiest → hardest; the
// authoring helper assigns ids, difficulty, and board value automatically.

import { definePack } from '../authoring'

export const CLASSIC_PACK = definePack({
  id: 'built-in',
  name: 'Classic Trivia',
  description:
    'A broad starter pack covering History, Science, Geography, Literature, Entertainment, and Sports.',
  categories: [
    {
      name: 'History',
      clues: [
        { clue: 'He was the first president of the United States.', answers: ['George Washington', 'Washington'], finalEligible: true },
        { clue: 'This French emperor is known for the Napoleonic Code and the Battle of Waterloo.', answers: ['Napoleon', 'Napoleon Bonaparte'], finalEligible: true },
        { clue: 'The Roman general who crossed the Rubicon in 49 BC, triggering a civil war.', answers: ['Caesar', 'Julius Caesar'], finalEligible: true },
        { clue: 'This charter, signed in 1215, placed limits on the power of the English king.', answers: ['Magna Carta'], finalEligible: true },
        { clue: 'The year the Berlin Wall fell.', answers: ['1989'] },
        { clue: 'This Babylonian king created one of the earliest surviving written law codes.', answers: ['Hammurabi'], finalEligible: true },
      ],
    },
    {
      name: 'Science',
      clues: [
        { clue: 'The planet in our solar system known as the Red Planet.', answers: ['Mars'], finalEligible: true },
        { clue: 'The chemical symbol for gold on the periodic table.', answers: ['Au'], finalEligible: true },
        { clue: 'Often called the powerhouse of the cell, this organelle produces ATP.', answers: ['mitochondria', 'mitochondrion'], finalEligible: true },
        { clue: 'This physicist developed the theory of general relativity in 1915.', answers: ['Einstein', 'Albert Einstein'], finalEligible: true },
        { clue: 'The hardest naturally occurring substance found on Earth.', answers: ['diamond'] },
        { clue: "Making up roughly 78% of Earth's atmosphere, it is the most abundant gas.", answers: ['nitrogen'], finalEligible: true },
      ],
    },
    {
      name: 'Geography',
      clues: [
        { clue: 'The capital city of Japan.', answers: ['Tokyo'], finalEligible: true },
        { clue: 'The largest ocean on Earth by surface area.', answers: ['Pacific', 'Pacific Ocean'], finalEligible: true },
        { clue: 'This river flows through Egypt and empties into the Mediterranean Sea.', answers: ['Nile', 'Nile River', 'the Nile'], finalEligible: true },
        { clue: 'The mountain range that forms a natural boundary between Europe and Asia in Russia.', answers: ['Urals', 'Ural Mountains'], finalEligible: true },
        { clue: 'This vast desert dominates northern Africa.', answers: ['Sahara', 'Sahara Desert'] },
        { clue: 'The narrow strait separating Alaska from eastern Russia.', answers: ['Bering', 'Bering Strait'], finalEligible: true },
      ],
    },
    {
      name: 'Literature',
      clues: [
        { clue: 'The English playwright who wrote Hamlet, Macbeth, and Romeo and Juliet.', answers: ['Shakespeare', 'William Shakespeare'], finalEligible: true },
        { clue: 'The hobbit who carries the One Ring to Mordor in The Lord of the Rings.', answers: ['Frodo', 'Frodo Baggins'], finalEligible: true },
        { clue: 'The English author who wrote the dystopian novels 1984 and Animal Farm.', answers: ['Orwell', 'George Orwell'], finalEligible: true },
        { clue: 'The ancient Mesopotamian epic hero and legendary king of Uruk.', answers: ['Gilgamesh'], finalEligible: true },
        { clue: 'The obsessive sea captain who hunts the white whale Moby-Dick.', answers: ['Ahab', 'Captain Ahab'] },
        { clue: 'The Italian poet who wrote the Divine Comedy, featuring Inferno, Purgatorio, and Paradiso.', answers: ['Dante', 'Dante Alighieri'], finalEligible: true },
      ],
    },
    {
      name: 'Entertainment',
      clues: [
        { clue: 'The boy wizard with a lightning-bolt scar who attends Hogwarts School.', answers: ['Harry Potter', 'Harry'], finalEligible: true },
        { clue: "The red-hatted plumber who is Nintendo's most iconic character.", answers: ['Mario'], finalEligible: true },
        { clue: "Tony Stark's armoured superhero identity in the Marvel Cinematic Universe.", answers: ['Iron Man'], finalEligible: true },
        { clue: "The desert planet at the heart of Frank Herbert's Dune saga.", answers: ['Arrakis'], finalEligible: true },
        { clue: 'The fictional city in which Batman operates as its protector.', answers: ['Gotham', 'Gotham City'] },
        { clue: 'Jean-Luc Picard commands this starship in Star Trek: The Next Generation.', answers: ['Enterprise', 'Enterprise D', 'Enterprise-D', 'USS Enterprise'], finalEligible: true },
      ],
    },
    {
      name: 'Sports',
      clues: [
        { clue: 'The number of players from each team on a basketball court at one time.', answers: ['5', 'five'], finalEligible: true },
        { clue: 'Michael Phelps holds the all-time record for Olympic gold medals in this sport.', answers: ['swimming'], finalEligible: true },
        { clue: 'The country where the modern Olympic Games were revived in 1896.', answers: ['Greece'], finalEligible: true },
        { clue: 'The number of innings in a standard professional baseball game.', answers: ['9', 'nine'], finalEligible: true },
        { clue: 'Knocking down all ten pins with your first ball in bowling is called this.', answers: ['strike'] },
        { clue: 'In tennis, winning six games with at least a two-game lead takes this.', answers: ['set', 'a set'], finalEligible: true },
      ],
    },
  ],
})
