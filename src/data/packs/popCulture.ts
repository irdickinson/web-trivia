import { definePack } from '../authoring'

export const POP_CULTURE_PACK = definePack({
  id: 'pop-culture',
  name: 'Pop Culture',
  description:
    'Movies, video games, music, television, the internet, and superheroes — modern entertainment trivia.',
  categories: [
    {
      name: 'Movies',
      clues: [
        { clue: 'This 1997 James Cameron film about a doomed ocean liner won 11 Academy Awards.', answers: ['Titanic'], finalEligible: true },
        { clue: 'In Star Wars, this masked Sith Lord is revealed to be Luke Skywalker\'s father.', answers: ['Darth Vader', 'Vader', 'Anakin Skywalker'], finalEligible: true },
        { clue: 'Pixar\'s first feature film, released in 1995, starred a cowboy named Woody.', answers: ['Toy Story'], finalEligible: true },
        { clue: 'This Christopher Nolan film features dreams within dreams and a spinning-top totem.', answers: ['Inception'], finalEligible: true },
        { clue: 'The 2019 film in which the Avengers travel through time to undo the Snap.', answers: ['Avengers Endgame', 'Endgame'] },
        { clue: 'Bong Joon-ho\'s 2019 film was the first non-English movie to win Best Picture.', answers: ['Parasite'], finalEligible: true },
      ],
    },
    {
      name: 'Video Games',
      clues: [
        { clue: 'This blocky sandbox game by Mojang lets players mine and build with cubes.', answers: ['Minecraft'], finalEligible: true },
        { clue: 'The Italian plumber who rescues Princess Peach from Bowser.', answers: ['Mario', 'Super Mario'], finalEligible: true },
        { clue: 'In this battle-royale game by Epic, 100 players fight on a shrinking island.', answers: ['Fortnite'], finalEligible: true },
        { clue: 'The yellow, pellet-eating arcade character chased by four ghosts.', answers: ['Pac-Man', 'Pacman'], finalEligible: true },
        { clue: 'This green-clad hero wields the Master Sword in The Legend of Zelda.', answers: ['Link'] },
        { clue: 'Aerith dies in this 1997 Square RPG starring Cloud Strife and Sephiroth.', answers: ['Final Fantasy VII', 'Final Fantasy 7', 'FF7'], finalEligible: true },
      ],
    },
    {
      name: 'Music',
      clues: [
        { clue: 'This pop superstar released the record-breaking albums 1989 and Folklore.', answers: ['Taylor Swift', 'Taylor'], finalEligible: true },
        { clue: 'The Liverpool band whose members were John, Paul, George, and Ringo.', answers: ['the Beatles', 'Beatles'], finalEligible: true },
        { clue: 'Known as the "King of Pop," he moonwalked his way through Thriller.', answers: ['Michael Jackson'], finalEligible: true },
        { clue: 'This Queen anthem opens with "Is this the real life? Is this just fantasy?"', answers: ['Bohemian Rhapsody'], finalEligible: true },
        { clue: 'The four-stringed instrument Paul McCartney famously played in the Beatles.', answers: ['bass', 'bass guitar'] },
        { clue: 'This Puerto Rican artist became the most-streamed musician on Spotify in the early 2020s.', answers: ['Bad Bunny'], finalEligible: true },
      ],
    },
    {
      name: 'Television',
      clues: [
        { clue: 'In this sitcom, six friends hang out at a New York coffee shop called Central Perk.', answers: ['Friends'], finalEligible: true },
        { clue: 'The longest-running American animated sitcom, about a yellow family in Springfield.', answers: ['the Simpsons', 'Simpsons'], finalEligible: true },
        { clue: 'This HBO fantasy series was based on George R.R. Martin\'s A Song of Ice and Fire.', answers: ['Game of Thrones'], finalEligible: true },
        { clue: 'Walter White cooks meth under the alias "Heisenberg" in this AMC drama.', answers: ['Breaking Bad'], finalEligible: true },
        { clue: 'This Netflix series set in Hawkins, Indiana features a girl named Eleven.', answers: ['Stranger Things'] },
        { clue: 'The Korean survival-game series that became Netflix\'s most-watched show in 2021.', answers: ['Squid Game'], finalEligible: true },
      ],
    },
    {
      name: 'The Internet',
      clues: [
        { clue: 'This video platform, founded in 2005, uses the slogan "Broadcast Yourself."', answers: ['YouTube'], finalEligible: true },
        { clue: 'Mark Zuckerberg co-founded this social network in a Harvard dorm in 2004.', answers: ['Facebook'], finalEligible: true },
        { clue: 'The short-form video app, owned by ByteDance, that exploded in popularity around 2020.', answers: ['TikTok'], finalEligible: true },
        { clue: 'This site calls itself "the front page of the internet" and is organized into subreddits.', answers: ['Reddit'], finalEligible: true },
        { clue: 'A repeated, often humorous piece of internet content spread by users is called this.', answers: ['meme', 'a meme'] },
        { clue: 'The collaborative online encyclopedia anyone can edit, launched in 2001.', answers: ['Wikipedia'], finalEligible: true },
      ],
    },
    {
      name: 'Superheroes',
      clues: [
        { clue: 'This web-slinging hero is the alter ego of Peter Parker.', answers: ['Spider-Man', 'Spiderman'], finalEligible: true },
        { clue: 'The Amazonian warrior princess with a Lasso of Truth.', answers: ['Wonder Woman'], finalEligible: true },
        { clue: 'Bruce Wayne fights crime in Gotham City as this caped hero.', answers: ['Batman'], finalEligible: true },
        { clue: 'This Norse god of thunder wields the hammer Mjolnir in the Avengers.', answers: ['Thor'], finalEligible: true },
        { clue: 'The mutant with adamantium claws and a healing factor, played by Hugh Jackman.', answers: ['Wolverine', 'Logan'] },
        { clue: 'Kal-El, sent to Earth from the dying planet Krypton, is better known as this hero.', answers: ['Superman', 'Clark Kent'], finalEligible: true },
      ],
    },
  ],
})
