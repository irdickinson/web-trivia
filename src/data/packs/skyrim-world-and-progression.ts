import { definePack } from '../authoring'

export const SKYRIM_WORLD_AND_PROGRESSION_PACK = definePack({
  id: 'skyrim-world-and-progression',
  name: 'Skyrim: World and Progression',
  description:
    'Holds, races, factions, shouts, skills, and main-story knowledge from The Elder Scrolls V: Skyrim.',
  categories: [
    {
      name: 'Hold Capitals',
      clues: [
        {
          clue: 'This central trade city is home to Dragonsreach and Jorrvaskr.',
          answers: ['Whiterun'],
          finalEligible: true,
        },
        {
          clue: 'Which northern city is the seat of Haafingar and home of the Blue Palace?',
          answers: ['Solitude'],
          finalEligible: true,
        },
        {
          clue: 'This ancient city in Eastmarch is the Stormcloak capital.',
          answers: ['Windhelm'],
          finalEligible: true,
        },
        {
          clue: 'The seat of the Rift is this canal-filled city tied to the Thieves Guild.',
          answers: ['Riften'],
        },
        {
          clue: 'Which Reach city is built partly into Dwemer ruins?',
          answers: ['Markarth'],
          finalEligible: true,
        },
        {
          clue: 'This small northern port is the capital of the Pale.',
          answers: ['Dawnstar'],
        },
      ],
    },
    {
      name: 'Playable Races',
      clues: [
        {
          clue: 'This human race is native to Skyrim.',
          answers: ['Nord', 'Nords'],
          finalEligible: true,
        },
        {
          clue: 'Which feline people often travel in caravans outside city gates?',
          answers: ['Khajiit'],
          finalEligible: true,
        },
        {
          clue: 'This reptilian race comes from Black Marsh.',
          answers: ['Argonian', 'Argonians'],
          finalEligible: true,
        },
        {
          clue: 'The ashland elves of Morrowind are known by this name.',
          answers: ['Dunmer'],
        },
        {
          clue: 'Which golden-skinned elven race is associated with the Summerset Isles?',
          answers: ['Altmer'],
          finalEligible: true,
        },
        {
          clue: 'The orcish people of Tamriel are also known by this name.',
          answers: ['Orsimer', 'Orc', 'Orcs'],
        },
      ],
    },
    {
      name: 'Major Factions',
      clues: [
        {
          clue: 'This warrior brotherhood is based in Jorrvaskr.',
          answers: ['Companions', 'the Companions'],
          finalEligible: true,
        },
        {
          clue: 'Which magical institution is based in the frozen city of Winterhold?',
          answers: ['College of Winterhold'],
          finalEligible: true,
        },
        {
          clue: 'This criminal organization operates from the Ratway beneath Riften.',
          answers: ['Thieves Guild'],
          finalEligible: true,
        },
        {
          clue: 'A secretive assassin group follows the Night Mother and Sithis.',
          answers: ['Dark Brotherhood'],
        },
        {
          clue: 'Which rebel side is led by Ulfric Stormcloak?',
          answers: ['Stormcloaks'],
          finalEligible: true,
        },
        {
          clue: 'This military side answers to General Tullius in Solitude.',
          answers: ['Imperial Legion', 'Legion', 'Imperials'],
        },
      ],
    },
    {
      name: 'Main Quest Figures',
      clues: [
        {
          clue: 'This black dragon is called the World-Eater.',
          answers: ['Alduin'],
          finalEligible: true,
        },
        {
          clue: 'Which ancient dragon teaches from the summit of the Throat of the World?',
          answers: ['Paarthurnax'],
          finalEligible: true,
        },
        {
          clue: 'This Blade runs the Sleeping Giant Inn under an alias.',
          answers: ['Delphine'],
          finalEligible: true,
        },
        {
          clue: 'An elderly Blade scholar is rescued from the Ratway in Riften.',
          answers: ['Esbern'],
        },
        {
          clue: 'Which Greybeard speaks for the order at High Hrothgar?',
          answers: ['Arngeir'],
          finalEligible: true,
        },
        {
          clue: 'The Jarl of Whiterun during the early dragon crisis is this man.',
          answers: ['Balgruuf', 'Jarl Balgruuf', 'Balgruuf the Greater'],
        },
      ],
    },
    {
      name: 'Dragon Shouts',
      clues: [
        {
          clue: 'This first shout blasts enemies backward with the words Fus Ro Dah.',
          answers: ['Unrelenting Force'],
          finalEligible: true,
        },
        {
          clue: 'Which shout launches the Dragonborn rapidly forward?',
          answers: ['Whirlwind Sprint'],
          finalEligible: true,
        },
        {
          clue: 'This shout forces dragons to land by making them experience mortality.',
          answers: ['Dragonrend'],
          finalEligible: true,
        },
        {
          clue: 'A shout that makes the user briefly invulnerable and ghostlike.',
          answers: ['Become Ethereal'],
        },
        {
          clue: 'Which shout is used to clear the storm blocking the path up the Throat of the World?',
          answers: ['Clear Skies'],
          finalEligible: true,
        },
        {
          clue: 'This Solstheim shout lets the Dragonborn command people, animals, and dragons.',
          answers: ['Bend Will'],
        },
      ],
    },
    {
      name: 'Skills',
      clues: [
        {
          clue: 'This skill governs creating potions and poisons from ingredients.',
          answers: ['Alchemy'],
          finalEligible: true,
        },
        {
          clue: 'Which skill improves crafting and tempering weapons and armor?',
          answers: ['Smithing'],
          finalEligible: true,
        },
        {
          clue: 'This skill places magical effects on gear using soul gems.',
          answers: ['Enchanting'],
          finalEligible: true,
        },
        {
          clue: 'Remaining unseen and dealing stealth attacks develops this skill.',
          answers: ['Sneak'],
        },
        {
          clue: 'Which skill improves opening locked doors and containers?',
          answers: ['Lockpicking'],
          finalEligible: true,
        },
        {
          clue: 'Better prices, persuasion, and intimidation checks use this skill.',
          answers: ['Speech'],
        },
      ],
    },
    {
      name: 'Main Quest Names',
      clues: [
        {
          clue: 'This early quest sends the player into a Nordic ruin to retrieve the Dragonstone.',
          answers: ['Bleak Falls Barrow'],
          finalEligible: true,
        },
        {
          clue: 'Which quest introduces the first dragon fight near Whiterun?',
          answers: ['Dragon Rising'],
          finalEligible: true,
        },
        {
          clue: 'This quest sends the player undercover into the Thalmor Embassy.',
          answers: ['Diplomatic Immunity'],
          finalEligible: true,
        },
        {
          clue: 'A quest with this name sends the player after an Elder Scroll.',
          answers: ['Elder Knowledge'],
        },
        {
          clue: 'Which quest takes the Dragonborn to the Nordic afterlife?',
          answers: ['Sovngarde'],
          finalEligible: true,
        },
        {
          clue: 'The final main quest has this title.',
          answers: ['Dragonslayer'],
        },
      ],
    },
    {
      name: 'Divines',
      clues: [
        {
          clue: 'This dragon god of time is traditionally chief among the Divines.',
          answers: ['Akatosh'],
          finalEligible: true,
        },
        {
          clue: 'Which goddess is associated with beauty and love?',
          answers: ['Dibella'],
          finalEligible: true,
        },
        {
          clue: 'This god of mercy is linked to healing temples.',
          answers: ['Stendarr'],
          finalEligible: true,
        },
        {
          clue: 'A god of wisdom and logic is represented by shrines in many cities.',
          answers: ['Julianos'],
        },
        {
          clue: 'Which missing Divine is central to the Empire-Stormcloak religious dispute?',
          answers: ['Talos'],
          finalEligible: true,
        },
        {
          clue: 'This goddess of the heavens is often associated with travelers and sailors.',
          answers: ['Kynareth'],
        },
      ],
    },
    {
      name: 'City Landmarks',
      clues: [
        {
          clue: 'This Whiterun palace sits in the Cloud District.',
          answers: ['Dragonsreach'],
          finalEligible: true,
        },
        {
          clue: 'Which Solitude palace is home to Elisif and the royal court?',
          answers: ['Blue Palace', 'the Blue Palace'],
          finalEligible: true,
        },
        {
          clue: 'This mead hall is the headquarters of the Companions.',
          answers: ['Jorrvaskr'],
          finalEligible: true,
        },
        {
          clue: 'The Thieves Guild tavern beneath Riften is called this.',
          answers: ['Ragged Flagon', 'the Ragged Flagon'],
        },
        {
          clue: 'Which Markarth museum is run by Calcelmo?',
          answers: ['Dwemer Museum'],
          finalEligible: true,
        },
        {
          clue: 'This mountain monastery is home to the Greybeards.',
          answers: ['High Hrothgar'],
        },
      ],
    },
  ],
})
