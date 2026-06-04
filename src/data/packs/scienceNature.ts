import { definePack } from '../authoring'

export const SCIENCE_NATURE_PACK = definePack({
  id: 'science-nature',
  name: 'Science & Nature',
  description:
    'Animals, the human body, space, chemistry, Earth, and great inventions — a deeper dive into the natural world.',
  categories: [
    {
      name: 'Animals',
      clues: [
        { clue: 'The tallest living animal, native to the African savanna.', answers: ['giraffe'], finalEligible: true },
        { clue: 'This is the only mammal capable of true, sustained flight.', answers: ['bat', 'bats'], finalEligible: true },
        { clue: 'A group of these big cats is called a pride.', answers: ['lion', 'lions'], finalEligible: true },
        { clue: 'This fast land animal can sprint at around 70 mph in short bursts.', answers: ['cheetah'], finalEligible: true },
        { clue: 'The largest animal ever known to have lived, bigger than any dinosaur.', answers: ['blue whale'] },
        { clue: 'This egg-laying mammal with a duck-like bill is native to Australia.', answers: ['platypus'], finalEligible: true },
      ],
    },
    {
      name: 'The Human Body',
      clues: [
        { clue: 'This organ pumps blood throughout the body.', answers: ['heart'], finalEligible: true },
        { clue: 'The body\'s largest organ, which also serves as its outer covering.', answers: ['skin'], finalEligible: true },
        { clue: 'The red protein in blood that carries oxygen from the lungs.', answers: ['hemoglobin', 'haemoglobin'], finalEligible: true },
        { clue: 'The number of bones in the adult human body.', answers: ['206'], finalEligible: true },
        { clue: 'This bone, the longest in the body, runs through the thigh.', answers: ['femur'] },
        { clue: 'The part of the brain responsible for balance and coordination, at the back of the skull.', answers: ['cerebellum'], finalEligible: true },
      ],
    },
    {
      name: 'Space',
      clues: [
        { clue: 'The star at the center of our solar system.', answers: ['the Sun', 'Sun'], finalEligible: true },
        { clue: 'This planet, famous for its rings, is the second largest in the solar system.', answers: ['Saturn'], finalEligible: true },
        { clue: 'Earth\'s only natural satellite.', answers: ['the Moon', 'Moon'], finalEligible: true },
        { clue: 'The galaxy that contains our solar system.', answers: ['Milky Way', 'the Milky Way'], finalEligible: true },
        { clue: 'This NASA telescope, launched in 2021, succeeded Hubble as a deep-space observatory.', answers: ['James Webb', 'James Webb Space Telescope', 'JWST', 'Webb'] },
        { clue: 'The collapsed star whose gravity is so strong that not even light escapes.', answers: ['black hole'], finalEligible: true },
      ],
    },
    {
      name: 'Chemistry',
      clues: [
        { clue: 'The chemical formula H2O refers to this everyday substance.', answers: ['water'], finalEligible: true },
        { clue: 'The lightest and most abundant element in the universe.', answers: ['hydrogen'], finalEligible: true },
        { clue: 'On the pH scale, this value is considered neutral.', answers: ['7', 'seven'], finalEligible: true },
        { clue: 'This noble gas, used in glowing signs, gives them a reddish-orange light.', answers: ['neon'], finalEligible: true },
        { clue: 'The number of protons in an atom is known as its atomic this.', answers: ['number', 'atomic number'] },
        { clue: 'This element with symbol Na is a soft, highly reactive metal found in table salt.', answers: ['sodium'], finalEligible: true },
      ],
    },
    {
      name: 'Earth & Weather',
      clues: [
        { clue: 'The frozen form of precipitation that falls in white flakes.', answers: ['snow'], finalEligible: true },
        { clue: 'This scale, from 0 to 5, rates the intensity of hurricanes by wind speed.', answers: ['Saffir-Simpson', 'Saffir Simpson'], finalEligible: false },
        { clue: 'The violently rotating column of air that touches the ground, common in "Tornado Alley."', answers: ['tornado'], finalEligible: true },
        { clue: 'This layer of the atmosphere absorbs most of the Sun\'s ultraviolet radiation.', answers: ['ozone layer', 'ozone'], finalEligible: true },
        { clue: 'The deepest oceanic trench on Earth, in the western Pacific.', answers: ['Mariana Trench', 'Marianas Trench'] },
        { clue: 'The boundary between two tectonic plates where earthquakes commonly occur is called a fault this.', answers: ['line', 'fault line'], finalEligible: false },
      ],
    },
    {
      name: 'Inventions',
      clues: [
        { clue: 'This American inventor is credited with the practical incandescent light bulb.', answers: ['Edison', 'Thomas Edison'], finalEligible: true },
        { clue: 'Alexander Graham Bell is credited with inventing this communication device in 1876.', answers: ['telephone', 'the telephone'], finalEligible: true },
        { clue: 'The Wright brothers achieved the first powered flight with this kind of machine.', answers: ['airplane', 'aeroplane', 'plane'], finalEligible: true },
        { clue: 'Johannes Gutenberg revolutionized books with this mechanical device around 1440.', answers: ['printing press', 'the printing press'], finalEligible: true },
        { clue: 'This Scottish scientist discovered penicillin in 1928.', answers: ['Fleming', 'Alexander Fleming'] },
        { clue: 'Tim Berners-Lee invented this information system of linked hypertext documents in 1989.', answers: ['World Wide Web', 'the web', 'web', 'www'], finalEligible: true },
      ],
    },
  ],
})
