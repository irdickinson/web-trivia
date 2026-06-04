import { definePack } from '../authoring'

export const MINECRAFT_ADVANCED_SYSTEMS_PACK = definePack({
  id: 'minecraft-advanced-systems',
  name: 'Minecraft: Advanced Systems',
  description:
    'Redstone, enchanting, brewing, villagers, Nether travel, End progression, and late-game Minecraft.',
  categories: [
    {
      name: 'Redstone Components',
      clues: [
        {
          clue: 'This dust carries a signal across blocks and powers simple circuits.',
          answers: ['redstone dust', 'redstone'],
          finalEligible: true,
        },
        {
          clue: 'Which block strengthens a signal and can add a delay?',
          answers: ['repeater', 'redstone repeater'],
          finalEligible: true,
        },
        {
          clue: 'This circuit block compares signal strengths and can subtract one input from another.',
          answers: ['comparator', 'redstone comparator'],
          finalEligible: true,
        },
        {
          clue: 'A sticky version of this block can push and pull an attached block.',
          answers: ['piston', 'sticky piston'],
        },
        {
          clue: 'Which block releases stored items when powered?',
          answers: ['dropper'],
          finalEligible: true,
        },
        {
          clue: 'This container-like component moves items into inventories below it.',
          answers: ['hopper'],
        },
      ],
    },
    {
      name: 'Enchanting',
      clues: [
        {
          clue: 'This block applies magical upgrades using levels and lapis lazuli.',
          answers: ['enchanting table', 'enchantment table'],
          finalEligible: true,
        },
        {
          clue: 'Which blue item is spent when enchanting at the table?',
          answers: ['lapis lazuli', 'lapis'],
          finalEligible: true,
        },
        {
          clue: 'This enchantment repairs durability when the player collects experience orbs.',
          answers: ['Mending'],
          finalEligible: true,
        },
        {
          clue: 'A tool with this enchantment can collect many blocks in their original form.',
          answers: ['Silk Touch'],
        },
        {
          clue: 'Which enchantment increases mining speed on tools?',
          answers: ['Efficiency'],
          finalEligible: true,
        },
        {
          clue: 'This enchantment increases certain drops from blocks such as ores.',
          answers: ['Fortune'],
        },
      ],
    },
    {
      name: 'Brewing',
      clues: [
        {
          clue: 'This block is used to brew potions from bottles and ingredients.',
          answers: ['brewing stand'],
          finalEligible: true,
        },
        {
          clue: 'Which Nether ingredient turns water bottles into awkward potions?',
          answers: ['nether wart'],
          finalEligible: true,
        },
        {
          clue: 'This powder fuels brewing stands.',
          answers: ['blaze powder'],
          finalEligible: true,
        },
        {
          clue: 'This crafted ingredient often changes a potion into a harmful or inverted effect.',
          answers: ['fermented spider eye'],
        },
        {
          clue: 'Which ingredient turns many drinkable potions into throwable splash potions?',
          answers: ['gunpowder'],
          finalEligible: true,
        },
        {
          clue: 'This dragon-related ingredient can turn splash potions into lingering potions.',
          answers: ['dragon breath', "dragon's breath"],
        },
      ],
    },
    {
      name: 'Villager Jobs',
      clues: [
        {
          clue: 'A lectern gives this book-trading profession to an unemployed villager.',
          answers: ['librarian'],
          finalEligible: true,
        },
        {
          clue: 'Which profession uses a blast furnace as its job-site block?',
          answers: ['armorer', 'armourer'],
          finalEligible: true,
        },
        {
          clue: 'A brewing stand is the job-site block for this villager profession.',
          answers: ['cleric'],
          finalEligible: true,
        },
        {
          clue: 'The cartography table belongs to this map-selling profession.',
          answers: ['cartographer'],
        },
        {
          clue: 'Which villager profession uses a composter?',
          answers: ['farmer'],
          finalEligible: true,
        },
        {
          clue: 'A smithing table gives this diamond-tool-selling profession.',
          answers: ['toolsmith'],
        },
      ],
    },
    {
      name: 'Nether Places',
      clues: [
        {
          clue: 'This default Nether biome is red, rocky, and filled with netherrack.',
          answers: ['nether wastes'],
          finalEligible: true,
        },
        {
          clue: 'Which blue-green fungus biome commonly contains endermen and few other mobs?',
          answers: ['warped forest'],
          finalEligible: true,
        },
        {
          clue: 'This biome is rich in soul sand, soul soil, fossils, and blue fire.',
          answers: ['soul sand valley'],
          finalEligible: true,
        },
        {
          clue: 'A blackstone-heavy volcanic biome where bastion remnants do not generate.',
          answers: ['basalt deltas', 'basalt delta'],
        },
        {
          clue: 'Which red fungus biome is home to piglins and hoglins?',
          answers: ['crimson forest'],
          finalEligible: true,
        },
        {
          clue: 'This large Nether structure contains blaze spawners and wart rooms.',
          answers: ['nether fortress'],
        },
      ],
    },
    {
      name: 'End Progression',
      clues: [
        {
          clue: 'This item is thrown to locate strongholds and inserted into portal frames.',
          answers: ['eye of ender', 'eyes of ender'],
          finalEligible: true,
        },
        {
          clue: 'Which teleportation item combines with blaze powder to make an eye of ender?',
          answers: ['ender pearl'],
          finalEligible: true,
        },
        {
          clue: 'The main boss of the final dimension is this flying creature.',
          answers: ['ender dragon', 'dragon'],
          finalEligible: true,
        },
        {
          clue: 'These healing objects sit on obsidian pillars during the dragon fight.',
          answers: ['end crystals', 'end crystal'],
        },
        {
          clue: 'Which purple plant grows on the outer islands?',
          answers: ['chorus plant', 'chorus plants'],
          finalEligible: true,
        },
        {
          clue: 'This floating ship structure can hold elytra in an item frame.',
          answers: ['end ship'],
        },
      ],
    },
    {
      name: 'Mining and Ores',
      clues: [
        {
          clue: 'This common ore is smelted into ingots used for buckets, shears, and many tools.',
          answers: ['iron ore', 'iron'],
          finalEligible: true,
        },
        {
          clue: 'Which ore drops experience and a blue dye ingredient?',
          answers: ['lapis lazuli ore', 'lapis ore'],
          finalEligible: true,
        },
        {
          clue: 'This ore drops a green gem used for villager trading.',
          answers: ['emerald ore', 'emerald'],
          finalEligible: true,
        },
        {
          clue: 'A reddish ore that can be crafted into lightning rods and spyglasses.',
          answers: ['copper ore', 'copper'],
        },
        {
          clue: 'Which rare ore provides the gem used for enchanting tables and high-tier gear?',
          answers: ['diamond ore', 'diamond'],
          finalEligible: true,
        },
        {
          clue: 'This ancient debris-derived material upgrades diamond gear at a smithing table.',
          answers: ['netherite', 'netherite ingot'],
        },
      ],
    },
    {
      name: 'Bosses and Raids',
      clues: [
        {
          clue: 'This ocean monument miniboss inflicts Mining Fatigue on nearby players.',
          answers: ['elder guardian'],
          finalEligible: true,
        },
        {
          clue: 'Which three-headed boss is summoned with soul sand or soul soil and skulls?',
          answers: ['wither'],
          finalEligible: true,
        },
        {
          clue: 'This illager spellcaster summons vexes and attacks with fangs.',
          answers: ['evoker'],
          finalEligible: true,
        },
        {
          clue: 'A huge illager beast that charges during raids.',
          answers: ['ravager'],
        },
        {
          clue: 'Which status effect can trigger a village raid when a player enters a settlement?',
          answers: ['Bad Omen'],
          finalEligible: true,
        },
        {
          clue: 'This small flying mob is summoned by evokers.',
          answers: ['vex'],
        },
      ],
    },
    {
      name: 'Game Modes',
      clues: [
        {
          clue: 'This mode has health, hunger, crafting, mining, and hostile danger.',
          answers: ['Survival'],
          finalEligible: true,
        },
        {
          clue: 'Which mode gives unlimited blocks, flight, and no normal survival damage?',
          answers: ['Creative'],
          finalEligible: true,
        },
        {
          clue: 'This mode locks difficulty to hard and deletes or locks the world after death.',
          answers: ['Hardcore'],
          finalEligible: true,
        },
        {
          clue: 'A map-maker mode where players can interact only with allowed blocks and entities.',
          answers: ['Adventure'],
        },
        {
          clue: 'Which mode lets a player fly through blocks invisibly after dying or joining as an observer?',
          answers: ['Spectator'],
          finalEligible: true,
        },
        {
          clue: 'A local or online world shared with other players uses this broad play style.',
          answers: ['multiplayer'],
        },
      ],
    },
  ],
})
