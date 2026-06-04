import { definePack } from '../authoring'

export const MINECRAFT_SURVIVAL_WORLDS_PACK = definePack({
  id: 'minecraft-survival-worlds',
  name: 'Minecraft: Survival Worlds',
  description:
    'Core Minecraft survival trivia: blocks, mobs, food, biomes, structures, and dimensions.',
  categories: [
    {
      name: 'First Night Survival',
      clues: [
        {
          clue: 'This block is usually punched from tree trunks to begin a new survival world.',
          answers: ['wood', 'log', 'logs'],
          finalEligible: true,
        },
        {
          clue: 'Which placeable block opens the 3-by-3 crafting grid?',
          answers: ['crafting table', 'workbench'],
          finalEligible: true,
        },
        {
          clue: 'Players sleep in this block to skip night and set their spawn point.',
          answers: ['bed'],
          finalEligible: true,
        },
        {
          clue: 'This handheld item lights dark areas and helps prevent hostile mobs from spawning nearby.',
          answers: ['torch', 'torches'],
        },
        {
          clue: 'Which starter tool mines stone much faster than bare hands?',
          answers: ['wooden pickaxe', 'pickaxe'],
          finalEligible: true,
        },
        {
          clue: 'A vertical pillar of these blocks can mark your base from far away early in the game.',
          answers: ['dirt', 'dirt blocks'],
        },
      ],
    },
    {
      name: 'Basic Blocks',
      clues: [
        {
          clue: 'This green-topped block covers much of the Overworld surface.',
          answers: ['grass block', 'grass'],
          finalEligible: true,
        },
        {
          clue: 'Which loose block falls when unsupported and can be smelted into glass?',
          answers: ['sand'],
          finalEligible: true,
        },
        {
          clue: 'Breaking stone without Silk Touch usually drops this block instead.',
          answers: ['cobblestone'],
          finalEligible: true,
        },
        {
          clue: 'This red-brown block is the main terrain material of the Nether.',
          answers: ['netherrack'],
        },
        {
          clue: 'Which dark volcanic block is required to build a portal frame to the Nether?',
          answers: ['obsidian'],
          finalEligible: true,
        },
        {
          clue: 'This pale block makes up much of the main island in the final dimension.',
          answers: ['end stone'],
        },
      ],
    },
    {
      name: 'Tools and Gear',
      clues: [
        {
          clue: 'This tool is best for mining stone, ores, and many mineral blocks.',
          answers: ['pickaxe'],
          finalEligible: true,
        },
        {
          clue: 'Which tool quickly cuts trees, logs, and wooden blocks?',
          answers: ['axe'],
          finalEligible: true,
        },
        {
          clue: 'This tool tills dirt or grass into farmland.',
          answers: ['hoe'],
          finalEligible: true,
        },
        {
          clue: 'A ranged weapon that fires arrows after being drawn back.',
          answers: ['bow'],
        },
        {
          clue: 'Which defensive item can block many melee attacks and projectiles?',
          answers: ['shield'],
          finalEligible: true,
        },
        {
          clue: 'This rare wing item lets players glide after jumping from high places.',
          answers: ['elytra'],
        },
      ],
    },
    {
      name: 'Food and Farming',
      clues: [
        {
          clue: 'This grain crop is grown from seeds and crafted into bread.',
          answers: ['wheat'],
          finalEligible: true,
        },
        {
          clue: 'Which orange crop is commonly used to breed pigs and rabbits?',
          answers: ['carrot', 'carrots'],
          finalEligible: true,
        },
        {
          clue: 'This red fruit can be crafted with gold into a powerful healing item.',
          answers: ['apple', 'apples'],
          finalEligible: true,
        },
        {
          clue: 'A bucket can collect this white animal product from cows, goats, or mooshrooms.',
          answers: ['milk'],
        },
        {
          clue: 'Which block turns raw meat or ore into cooked food or ingots using fuel?',
          answers: ['furnace'],
          finalEligible: true,
        },
        {
          clue: 'This sweet item is crafted from wheat and cocoa beans but should not be fed to parrots.',
          answers: ['cookie', 'cookies'],
        },
      ],
    },
    {
      name: 'Friendly Mobs',
      clues: [
        {
          clue: 'This farm animal drops wool and mutton.',
          answers: ['sheep'],
          finalEligible: true,
        },
        {
          clue: 'Which animal can be milked and drops leather and beef?',
          answers: ['cow'],
          finalEligible: true,
        },
        {
          clue: 'This animal can be tamed with bones and attacks hostile mobs for its owner.',
          answers: ['wolf'],
          finalEligible: true,
        },
        {
          clue: 'A saddle lets players ride this animal, but it is controlled with a carrot on a stick.',
          answers: ['pig'],
        },
        {
          clue: 'Which desert village mob can carry two riders at once?',
          answers: ['camel'],
          finalEligible: true,
        },
        {
          clue: 'This mushroom-covered cow variant naturally appears in mushroom fields.',
          answers: ['mooshroom'],
        },
      ],
    },
    {
      name: 'Hostile Mobs',
      clues: [
        {
          clue: 'This green, silent mob explodes when it gets close to a player.',
          answers: ['creeper'],
          finalEligible: true,
        },
        {
          clue: 'Which undead mob burns in sunlight and attacks with bare hands?',
          answers: ['zombie'],
          finalEligible: true,
        },
        {
          clue: 'This tall, black mob can teleport and becomes angry when stared at.',
          answers: ['enderman'],
          finalEligible: true,
        },
        {
          clue: 'A flying Nether monster that shoots explosive fireballs.',
          answers: ['ghast'],
        },
        {
          clue: 'Which ranged undead mob attacks by shooting arrows?',
          answers: ['skeleton'],
          finalEligible: true,
        },
        {
          clue: 'This blind deep-dark monster is summoned by repeated shrieker warnings.',
          answers: ['warden'],
        },
      ],
    },
    {
      name: 'Overworld Biomes',
      clues: [
        {
          clue: 'This flat grassy biome often contains villages and farm animals.',
          answers: ['plains'],
          finalEligible: true,
        },
        {
          clue: 'Which sandy biome often contains cacti, husks, and pyramids?',
          answers: ['desert'],
          finalEligible: true,
        },
        {
          clue: 'This cold biome variant features tall pillars of packed ice.',
          answers: ['ice spikes', 'ice spike plains'],
          finalEligible: true,
        },
        {
          clue: 'A rare island biome with mycelium and mooshrooms.',
          answers: ['mushroom fields', 'mushroom field'],
        },
        {
          clue: 'Which dark underground biome contains sculk blocks and ancient cities?',
          answers: ['deep dark'],
          finalEligible: true,
        },
        {
          clue: 'This eerie forest is home to pale oak trees and the creaking.',
          answers: ['pale garden'],
        },
      ],
    },
    {
      name: 'Generated Structures',
      clues: [
        {
          clue: 'This settlement contains beds, job-site blocks, a bell, and trading NPCs.',
          answers: ['village'],
          finalEligible: true,
        },
        {
          clue: 'Which underground structure contains the portal room leading to the final dimension?',
          answers: ['stronghold'],
          finalEligible: true,
        },
        {
          clue: 'This desert structure hides treasure below a trapped floor.',
          answers: ['desert pyramid', 'desert temple'],
          finalEligible: true,
        },
        {
          clue: 'An underground rail-filled structure where cave spider spawners can appear.',
          answers: ['mineshaft', 'abandoned mineshaft'],
        },
        {
          clue: 'Which tall structure in the final dimension may contain a ship with elytra?',
          answers: ['end city'],
          finalEligible: true,
        },
        {
          clue: 'This huge deep-dark structure always generates around Y level -51.',
          answers: ['ancient city'],
        },
      ],
    },
    {
      name: 'Dimensions',
      clues: [
        {
          clue: 'Most players begin in this default dimension of forests, caves, oceans, and villages.',
          answers: ['Overworld', 'the Overworld'],
          finalEligible: true,
        },
        {
          clue: 'Which fiery dimension is reached through an obsidian portal?',
          answers: ['Nether', 'the Nether'],
          finalEligible: true,
        },
        {
          clue: 'This island-filled dimension is where players fight the dragon.',
          answers: ['End', 'the End'],
          finalEligible: true,
        },
        {
          clue: 'A ruined structure of obsidian blocks points toward this travel frame.',
          answers: ['nether portal'],
        },
        {
          clue: 'Which stronghold structure is completed with eyes and opens the route to the dragon fight?',
          answers: ['end portal'],
          finalEligible: true,
        },
        {
          clue: 'This small portal appears after the dragon fight and sends players toward the outer islands.',
          answers: ['end gateway', 'gateway'],
        },
      ],
    },
  ],
})
