import { definePack } from '../authoring'

export const ANCIENT_CIVILIZATIONS_PACK = definePack({
  id: 'ancient-civilizations',
  name: 'Ancient Civilizations',
  description:
    'Pharaohs, empires, lost cities, sacred texts, and wonders from the ancient world.',
  categories: [
    {
      name: 'Pharaohs of Egypt',
      clues: [
        {
          clue: "Howard Carter discovered this boy king's nearly intact tomb in 1922.",
          answers: ['Tutankhamun', 'King Tut', 'Tut'],
          finalEligible: true,
        },
        {
          clue: 'Which female pharaoh built a grand mortuary temple at Deir el-Bahri?',
          answers: ['Hatshepsut'],
          finalEligible: true,
        },
        {
          clue: 'The Great Pyramid at Giza was built as the tomb of this Fourth Dynasty ruler.',
          answers: ['Khufu', 'Cheops'],
          finalEligible: true,
        },
        {
          clue: 'He promoted worship of the Aten and moved the royal court to Akhetaten.',
          answers: ['Akhenaten', 'Amenhotep IV'],
          finalEligible: true,
        },
        {
          clue: 'Which ruler commissioned the Step Pyramid at Saqqara, designed by Imhotep?',
          answers: ['Djoser', 'Zoser'],
        },
        {
          clue: 'This Twentieth Dynasty ruler repelled the Sea Peoples and recorded his victories at Medinet Habu.',
          answers: ['Ramesses III', 'Ramses III', 'Rameses III'],
        },
      ],
    },
    {
      name: 'Cities of Ancient Greece',
      clues: [
        {
          clue: 'The Parthenon crowns the Acropolis of this city.',
          answers: ['Athens'],
          finalEligible: true,
        },
        {
          clue: 'Which militarized polis dominated the region of Laconia?',
          answers: ['Sparta', 'Lacedaemon'],
          finalEligible: true,
        },
        {
          clue: "Pilgrims visited this sanctuary to consult the Pythia, Apollo's famous oracle.",
          answers: ['Delphi'],
          finalEligible: true,
        },
        {
          clue: 'This wealthy polis controlled the isthmus linking mainland Greece with the Peloponnese.',
          answers: ['Corinth'],
        },
        {
          clue: 'Which city defeated Sparta at the Battle of Leuctra in 371 BCE?',
          answers: ['Thebes'],
          finalEligible: true,
        },
        {
          clue: 'Home to Thales, this Ionian city founded dozens of colonies around the Black Sea.',
          answers: ['Miletus'],
        },
      ],
    },
    {
      name: 'Roman Emperors',
      clues: [
        {
          clue: "He became Rome's first emperor after defeating Mark Antony and Cleopatra.",
          answers: ['Augustus', 'Octavian', 'Caesar Augustus'],
          finalEligible: true,
        },
        {
          clue: 'Which emperor founded Constantinople and became the first Roman emperor to profess Christianity?',
          answers: ['Constantine I', 'Constantine the Great', 'Constantine'],
          finalEligible: true,
        },
        {
          clue: 'The philosophical work Meditations was written by this emperor.',
          answers: ['Marcus Aurelius', 'Aurelius'],
          finalEligible: true,
        },
        {
          clue: 'Under this ruler, the Roman Empire reached its greatest territorial extent.',
          answers: ['Trajan'],
          finalEligible: true,
        },
        {
          clue: 'Which Flavian emperor opened the Colosseum with inaugural games in 80 CE?',
          answers: ['Titus'],
        },
        {
          clue: 'This emperor was the last to rule both the eastern and western halves of the Roman Empire.',
          answers: ['Theodosius I', 'Theodosius the Great', 'Theodosius'],
        },
      ],
    },
    {
      name: 'Rulers of Mesopotamia',
      clues: [
        {
          clue: "Around 2300 BCE, this conqueror united much of Mesopotamia into one of history's earliest empires.",
          answers: ['Sargon of Akkad', 'Sargon', 'Sargon the Great'],
          finalEligible: true,
        },
        {
          clue: 'Which Neo-Babylonian king rebuilt Babylon and constructed its Ishtar Gate?',
          answers: ['Nebuchadnezzar II', 'Nebuchadrezzar II', 'Nebuchadnezzar'],
          finalEligible: true,
        },
        {
          clue: 'He assembled a celebrated royal library at Nineveh.',
          answers: ['Ashurbanipal', 'Assurbanipal', 'Asurbanipal'],
          finalEligible: true,
        },
        {
          clue: 'This Sumerian ruler issued the oldest known surviving law code.',
          answers: ['Ur-Nammu', 'Ur Nammu'],
          finalEligible: true,
        },
        {
          clue: 'Numerous seated diorite statues preserve the image of this ruler of Lagash.',
          answers: ['Gudea'],
        },
        {
          clue: 'Which Assyrian king reorganized the army and provinces while greatly expanding the empire in the eighth century BCE?',
          answers: ['Tiglath-Pileser III', 'Tiglath Pileser III'],
        },
      ],
    },
    {
      name: 'Wonders of the Ancient World',
      clues: [
        {
          clue: 'Which Egyptian monument is the only ancient wonder still substantially standing?',
          answers: ['Great Pyramid of Giza', 'Great Pyramid', 'Pyramid of Khufu'],
          finalEligible: true,
        },
        {
          clue: 'Tradition describes this wonder as a series of lush, elevated terraces.',
          answers: ['Hanging Gardens of Babylon', 'Hanging Gardens'],
          finalEligible: true,
        },
        {
          clue: 'A towering bronze statue of Helios gave this island wonder its name.',
          answers: ['Colossus of Rhodes', 'Colossus'],
          finalEligible: true,
        },
        {
          clue: "Built on an island off Egypt's great Mediterranean port, this wonder guided ships to safety.",
          answers: ['Lighthouse of Alexandria', 'Pharos of Alexandria', 'Pharos'],
          finalEligible: true,
        },
        {
          clue: 'Which wonder, built at modern Bodrum for a Carian ruler, gave English a word for grand tombs?',
          answers: ['Mausoleum at Halicarnassus', 'Mausoleum of Halicarnassus'],
        },
        {
          clue: 'Herostratus notoriously burned this enormous sanctuary in 356 BCE.',
          answers: ['Temple of Artemis at Ephesus', 'Temple of Artemis'],
        },
      ],
    },
    {
      name: 'Archaeological Sites',
      clues: [
        {
          clue: 'Mount Vesuvius buried this Roman city in 79 CE.',
          answers: ['Pompeii', 'Pompei'],
          finalEligible: true,
        },
        {
          clue: 'Which Nabataean caravan city in Jordan is famous for buildings carved into rose-red rock?',
          answers: ['Petra'],
          finalEligible: true,
        },
        {
          clue: 'This palace complex on Crete is associated with King Minos and the labyrinth legend.',
          answers: ['Knossos', 'Cnossos'],
          finalEligible: true,
        },
        {
          clue: 'Which planned Indus Valley city is famous for a structure called the Great Bath?',
          answers: ['Mohenjo-daro', 'Mohenjo Daro', 'Moenjodaro'],
          finalEligible: true,
        },
        {
          clue: "Thousands of life-sized clay soldiers guard the tomb complex of China's first emperor at this site.",
          answers: ['Qin mausoleum', 'Mausoleum of the First Qin Emperor', 'Qin Shi Huang mausoleum'],
        },
        {
          clue: 'Residents of this Neolithic Anatolian settlement entered tightly packed homes through their roofs.',
          answers: ['Catalhoyuk', 'Catal Hoyuk'],
        },
      ],
    },
    {
      name: 'Ancient Writing Systems',
      clues: [
        {
          clue: 'English and most Western European languages use this writing system.',
          answers: ['Latin alphabet', 'Roman alphabet'],
          finalEligible: true,
        },
        {
          clue: 'Picture-like signs carved on monuments are the best-known form of this Egyptian writing system.',
          answers: ['hieroglyphs', 'Egyptian hieroglyphs', 'hieroglyphics'],
          finalEligible: true,
        },
        {
          clue: 'Which ancient writing system was impressed into clay with wedge-shaped marks?',
          answers: ['cuneiform'],
          finalEligible: true,
        },
        {
          clue: 'Deciphered by Michael Ventris, this script records the oldest known form of Greek.',
          answers: ['Linear B'],
          finalEligible: true,
        },
        {
          clue: 'Which still-undeciphered script was used by the Minoans before its better-understood successor?',
          answers: ['Linear A'],
        },
        {
          clue: 'A 30-sign alphabetic cuneiform system used on the ancient Syrian coast bears this name.',
          answers: ['Ugaritic alphabet', 'Ugaritic'],
        },
      ],
    },
    {
      name: 'Gods of the Ancient World',
      clues: [
        {
          clue: 'This thunderbolt-wielding deity ruled the Greek gods from Mount Olympus.',
          answers: ['Zeus'],
          finalEligible: true,
        },
        {
          clue: 'Which jackal-headed Egyptian deity watched over embalming and the dead?',
          answers: ['Anubis'],
          finalEligible: true,
        },
        {
          clue: 'The Feathered Serpent of several Mesoamerican traditions is known by this name.',
          answers: ['Quetzalcoatl'],
          finalEligible: true,
        },
        {
          clue: 'This Sumerian goddess of love and war was later identified with Ishtar.',
          answers: ['Inanna'],
          finalEligible: true,
        },
        {
          clue: 'Which patron god of Babylon defeats Tiamat in the Enuma Elish?',
          answers: ['Marduk'],
        },
        {
          clue: 'This Aztec sun and war god guided the Mexica to the site of Tenochtitlan.',
          answers: ['Huitzilopochtli', 'Uitzilopochtli'],
        },
      ],
    },
    {
      name: 'Texts of Antiquity',
      clues: [
        {
          clue: "Homer's epic about the Trojan War and the wrath of Achilles.",
          answers: ['Iliad', 'The Iliad'],
          finalEligible: true,
        },
        {
          clue: 'This Egyptian collection of funerary spells was placed in tombs to aid the dead.',
          answers: ['Book of the Dead', 'Egyptian Book of the Dead'],
          finalEligible: true,
        },
        {
          clue: 'Which Mesopotamian epic follows a king of Uruk and his companion Enkidu?',
          answers: ['Epic of Gilgamesh', 'Gilgamesh Epic'],
          finalEligible: true,
        },
        {
          clue: 'A dialogue between Krishna and Arjuna forms this section of the Mahabharata.',
          answers: ['Bhagavad Gita', 'Bhagavadgita', 'Gita'],
          finalEligible: true,
        },
        {
          clue: 'This ancient Chinese classic uses hexagrams for divination.',
          answers: ['I Ching', 'Yijing', 'Book of Changes'],
        },
        {
          clue: "Which K'iche Maya creation narrative recounts the adventures of the Hero Twins?",
          answers: ['Popol Vuh', 'Popol Wuj'],
        },
      ],
    },
    {
      name: 'Empires and Dynasties',
      clues: [
        {
          clue: 'This Chinese dynasty followed the Qin and helped establish the Silk Road.',
          answers: ['Han dynasty', 'Han'],
          finalEligible: true,
        },
        {
          clue: 'Cyrus the Great founded this vast Persian empire.',
          answers: ['Achaemenid Empire', 'Achaemenian Empire', 'Achaemenid'],
          finalEligible: true,
        },
        {
          clue: 'Which Indian empire reached its height under Ashoka?',
          answers: ['Mauryan Empire', 'Maurya Empire', 'Mauryan'],
          finalEligible: true,
        },
        {
          clue: 'With its capital at Hattusa, this Bronze Age Anatolian power rivaled Egypt.',
          answers: ['Hittite Empire', 'Hittites'],
          finalEligible: true,
        },
        {
          clue: 'This Iranian empire repeatedly challenged Rome and became famous for mounted archers.',
          answers: ['Parthian Empire', 'Parthia', 'Parthians'],
        },
        {
          clue: 'Which Yuezhi-descended Central Asian dynasty helped spread Buddhism along the Silk Road?',
          answers: ['Kushan Empire', 'Kushan dynasty', 'Kushans'],
        },
      ],
    },
  ],
})
