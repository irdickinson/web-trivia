import { definePack } from '../authoring'

export const SKYRIM_QUESTS_AND_LORE_PACK = definePack({
  id: 'skyrim-quests-and-lore',
  name: 'Skyrim: Quests and Lore',
  description:
    'Daedric artifacts, guild stories, creatures, Dragonborn and Dawnguard lore, and memorable Skyrim quests.',
  categories: [
    {
      name: 'Daedric Princes',
      clues: [
        {
          clue: 'This Prince offers a reusable soul gem through The Black Star.',
          answers: ['Azura'],
          finalEligible: true,
        },
        {
          clue: 'Which Prince of Destruction is linked to Pieces of the Past?',
          answers: ['Mehrunes Dagon'],
          finalEligible: true,
        },
        {
          clue: 'This Prince of light grants Dawnbreaker after The Break of Dawn.',
          answers: ['Meridia'],
          finalEligible: true,
        },
        {
          clue: 'The Wabbajack is associated with this Prince of madness.',
          answers: ['Sheogorath'],
        },
        {
          clue: 'Which hunt-focused Prince appears in Ill Met By Moonlight?',
          answers: ['Hircine'],
          finalEligible: true,
        },
        {
          clue: 'The abandoned house in Markarth leads to this Prince of domination.',
          answers: ['Molag Bal'],
        },
      ],
    },
    {
      name: 'Daedric Artifacts',
      clues: [
        {
          clue: 'Meridia rewards the player with this undead-burning sword.',
          answers: ['Dawnbreaker'],
          finalEligible: true,
        },
        {
          clue: 'Which chaotic staff is awarded in The Mind of Madness?',
          answers: ['Wabbajack'],
          finalEligible: true,
        },
        {
          clue: 'Boethiah rewards this shadowy heavy armor.',
          answers: ['Ebony Mail'],
          finalEligible: true,
        },
        {
          clue: 'The House of Horrors can reward this brutal one-handed weapon.',
          answers: ['Mace of Molag Bal'],
        },
        {
          clue: 'Which rose-shaped staff summons a Dremora to fight for the player?',
          answers: ['Sanguine Rose'],
          finalEligible: true,
        },
        {
          clue: 'Peryite rewards this magic-resistant shield.',
          answers: ['Spellbreaker'],
        },
      ],
    },
    {
      name: 'Guild Characters',
      clues: [
        {
          clue: 'This woman leads the Dark Brotherhood sanctuary near Falkreath.',
          answers: ['Astrid'],
          finalEligible: true,
        },
        {
          clue: 'Which jester obsessively guards the Night Mother?',
          answers: ['Cicero'],
          finalEligible: true,
        },
        {
          clue: 'This Thieves Guild leader betrays the guild during its main questline.',
          answers: ['Mercer Frey'],
          finalEligible: true,
        },
        {
          clue: 'The old warrior who leads the Companions as Harbinger at the start.',
          answers: ['Kodlak Whitemane'],
        },
        {
          clue: 'Which College mage becomes deeply involved with the Eye of Magnus?',
          answers: ['Ancano'],
          finalEligible: true,
        },
        {
          clue: 'This Riften power broker has major influence over the Black-Briar family.',
          answers: ['Maven Black-Briar', 'Maven'],
        },
      ],
    },
    {
      name: 'Questlines',
      clues: [
        {
          clue: 'Completing the Companions story eventually grants this leadership title.',
          answers: ['Harbinger'],
          finalEligible: true,
        },
        {
          clue: 'Which magical title can the player receive after the College story?',
          answers: ['Arch-Mage', 'Archmage'],
          finalEligible: true,
        },
        {
          clue: 'Restoring the Thieves Guild ends with this final management quest.',
          answers: ['Under New Management'],
          finalEligible: true,
        },
        {
          clue: 'The assassination of the emperor belongs to this faction questline.',
          answers: ['Dark Brotherhood'],
        },
        {
          clue: 'Which civil-war side attacks Solitude in one possible final battle?',
          answers: ['Stormcloaks'],
          finalEligible: true,
        },
        {
          clue: 'Joining General Tullius commits the player to this faction questline.',
          answers: ['Imperial Legion'],
        },
      ],
    },
    {
      name: 'Creatures and Enemies',
      clues: [
        {
          clue: 'These undead Nords fill many ancient barrows.',
          answers: ['draugr'],
          finalEligible: true,
        },
        {
          clue: 'Which blind cave-dwelling people often use chaurus and Dwemer ruins?',
          answers: ['Falmer'],
          finalEligible: true,
        },
        {
          clue: 'This giant frost spider type appears early in Bleak Falls Barrow.',
          answers: ['frostbite spider'],
          finalEligible: true,
        },
        {
          clue: 'A mammoth-herding humanoid enemy often carries a huge club.',
          answers: ['giant'],
        },
        {
          clue: "Which flying reptilian enemies use the Thu'um and return with Alduin?",
          answers: ['dragons', 'dragon'],
          finalEligible: true,
        },
        {
          clue: 'This ash-covered Solstheim undead enemy erupts from burial sites.',
          answers: ['ash spawn'],
        },
      ],
    },
    {
      name: 'Dragon Priests',
      clues: [
        {
          clue: 'This priest at Shearpoint wears a mask that improves lockpicking, archery, and alchemy.',
          answers: ['Krosis'],
          finalEligible: true,
        },
        {
          clue: 'Which priest in Labyrinthian is tied to the Staff of Magnus quest?',
          answers: ['Morokei'],
          finalEligible: true,
        },
        {
          clue: 'This priest in Volskygge wears a mask that improves barter and carrying capacity.',
          answers: ['Volsung'],
          finalEligible: true,
        },
        {
          clue: 'A priest in Ragnvald whose mask improves stamina.',
          answers: ['Otar'],
        },
        {
          clue: 'Which hidden mask is obtained after placing the eight base-game masks at Bromjunaar Sanctuary?',
          answers: ['Konahrik'],
          finalEligible: true,
        },
        {
          clue: "This Dragonborn-era priest is Miraak's servant in the Temple of Miraak.",
          answers: ['Vahlok'],
        },
      ],
    },
    {
      name: 'Dragonborn DLC',
      clues: [
        {
          clue: 'This island northeast of Skyrim is the main setting of the Dragonborn add-on.',
          answers: ['Solstheim'],
          finalEligible: true,
        },
        {
          clue: 'Which first Dragonborn serves Hermaeus Mora and opposes the player?',
          answers: ['Miraak'],
          finalEligible: true,
        },
        {
          clue: 'The main settlement on Solstheim is this Redoran town.',
          answers: ['Raven Rock'],
          finalEligible: true,
        },
        {
          clue: 'This Daedric realm of forbidden knowledge appears as black seas and stacks of books.',
          answers: ['Apocrypha'],
        },
        {
          clue: "Which Skaal shaman helps explain the island's magical stones?",
          answers: ['Storn Crag-Strider', 'Storn'],
          finalEligible: true,
        },
        {
          clue: 'The Dragonborn add-on introduces this large floating creature of the Solstheim coast.',
          answers: ['netch', 'netches'],
        },
      ],
    },
    {
      name: 'Dawnguard DLC',
      clues: [
        {
          clue: 'This faction hunts vampires from a fort in the Rift.',
          answers: ['Dawnguard'],
          finalEligible: true,
        },
        {
          clue: 'Which vampire companion carries an Elder Scroll when first found?',
          answers: ['Serana'],
          finalEligible: true,
        },
        {
          clue: 'This vampire lord rules Castle Volkihar.',
          answers: ['Harkon', 'Lord Harkon'],
          finalEligible: true,
        },
        {
          clue: 'A hidden valley tied to Auriel is called this.',
          answers: ['Forgotten Vale'],
        },
        {
          clue: 'Which legendary bow is central to the prophecy in the Dawnguard story?',
          answers: ["Auriel's Bow", 'Auriel Bow'],
          finalEligible: true,
        },
        {
          clue: 'This massive underground cavern system is home to the Soul Cairn portal route.',
          answers: ['Blackreach'],
        },
      ],
    },
    {
      name: 'Memorable Side Quests',
      clues: [
        {
          clue: 'This quest begins with a drinking contest against Sam Guevenne.',
          answers: ['A Night to Remember'],
          finalEligible: true,
        },
        {
          clue: 'Which Dawnstar quest deals with nightmares and Vaermina?',
          answers: ['Waking Nightmare'],
          finalEligible: true,
        },
        {
          clue: 'The Markarth abandoned house quest has this title.',
          answers: ['The House of Horrors'],
          finalEligible: true,
        },
        {
          clue: 'A dog named Barbas appears in this Clavicus Vile quest.',
          answers: ["A Daedra's Best Friend", 'A Daedras Best Friend'],
        },
        {
          clue: 'Which quest asks the player to investigate a murder in Windhelm?',
          answers: ['Blood on the Ice'],
          finalEligible: true,
        },
        {
          clue: 'This quest at Frostflow Lighthouse centers on a missing family and a chaurus threat.',
          answers: ['Frostflow Abyss'],
        },
      ],
    },
  ],
})
