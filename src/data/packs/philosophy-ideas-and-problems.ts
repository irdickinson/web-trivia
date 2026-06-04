import { definePack } from '../authoring'

export const PHILOSOPHY_IDEAS_AND_PROBLEMS_PACK = definePack({
  id: 'philosophy-ideas-and-problems',
  name: 'Philosophy: Ideas and Problems',
  description:
    'Classic problems and concepts in knowledge, mind, ethics, politics, religion, science, and art.',
  categories: [
    {
      name: 'Knowledge Concepts',
      clues: [
        {
          clue: 'This branch of philosophy studies knowledge, justification, and belief.',
          answers: ['epistemology'],
          finalEligible: true,
        },
        {
          clue: 'Which position says important knowledge can be gained independently of sense experience?',
          answers: ['rationalism'],
          finalEligible: true,
        },
        {
          clue: 'This position treats sense experience as the ultimate source of knowledge.',
          answers: ['empiricism'],
          finalEligible: true,
        },
        {
          clue: 'A challenge to justified true belief was made famous by this philosopher in 1963.',
          answers: ['Gettier', 'Edmund Gettier'],
        },
        {
          clue: 'Which view doubts or denies that knowledge is possible in some domain?',
          answers: ['skepticism', 'scepticism'],
          finalEligible: true,
        },
        {
          clue: 'This term names the support or entitlement that turns mere belief toward knowledge.',
          answers: ['justification', 'warrant'],
        },
      ],
    },
    {
      name: 'Metaphysics Concepts',
      clues: [
        {
          clue: 'This branch asks what exists and what reality is like at the most general level.',
          answers: ['metaphysics'],
          finalEligible: true,
        },
        {
          clue: 'Which term refers to the study of being or what exists?',
          answers: ['ontology'],
          finalEligible: true,
        },
        {
          clue: 'The view that everything is ultimately one kind of substance or principle.',
          answers: ['monism'],
          finalEligible: true,
        },
        {
          clue: 'A view that reality contains two fundamentally different kinds of thing.',
          answers: ['dualism'],
        },
        {
          clue: 'Which concept concerns whether events are fixed by prior causes and laws?',
          answers: ['determinism'],
          finalEligible: true,
        },
        {
          clue: 'The problem of how something remains the same through change is called personal or object this.',
          answers: ['identity'],
        },
      ],
    },
    {
      name: 'Mind and Consciousness',
      clues: [
        {
          clue: 'This problem asks how mental states relate to physical bodies and brains.',
          answers: ['mind-body problem', 'mind body problem'],
          finalEligible: true,
        },
        {
          clue: 'Which view says mental states are defined by their causal roles in a system?',
          answers: ['functionalism'],
          finalEligible: true,
        },
        {
          clue: 'This view says everything mental is ultimately physical.',
          answers: ['physicalism', 'materialism'],
          finalEligible: true,
        },
        {
          clue: 'The subjective felt qualities of experience are often called this.',
          answers: ['qualia'],
        },
        {
          clue: 'Which thought experiment imagines a physically identical being without conscious experience?',
          answers: ['philosophical zombie', 'zombie'],
          finalEligible: true,
        },
        {
          clue: 'The aboutness or directedness of mental states is called this.',
          answers: ['intentionality'],
        },
      ],
    },
    {
      name: 'Ethical Problems',
      clues: [
        {
          clue: 'This thought experiment asks whether to divert a runaway rail vehicle to kill one instead of five.',
          answers: ['trolley problem'],
          finalEligible: true,
        },
        {
          clue: 'Which problem asks why one should be moral when wrongdoing might benefit oneself?',
          answers: ['Ring of Gyges', 'Gyges'],
          finalEligible: true,
        },
        {
          clue: 'This dilemma asks whether goodness is loved by the gods because it is good.',
          answers: ['Euthyphro dilemma', 'Euthyphro'],
          finalEligible: true,
        },
        {
          clue: 'The conflict between telling the truth and preventing harm is often framed as this kind of case.',
          answers: ['moral dilemma', 'ethical dilemma'],
        },
        {
          clue: 'Which challenge asks whether an action can be free if it is causally determined?',
          answers: ['free will problem', 'problem of free will'],
          finalEligible: true,
        },
        {
          clue: 'A moral rule that permits no exceptions is often described by this term.',
          answers: ['absolutism', 'moral absolutism'],
        },
      ],
    },
    {
      name: 'Political Concepts',
      clues: [
        {
          clue: 'This idea explains political authority as arising from agreement among persons.',
          answers: ['social contract'],
          finalEligible: true,
        },
        {
          clue: 'Which condition is imagined before government or civil society?',
          answers: ['state of nature'],
          finalEligible: true,
        },
        {
          clue: 'Rawls uses this device where people choose principles without knowing their social position.',
          answers: ['veil of ignorance'],
          finalEligible: true,
        },
        {
          clue: 'Nozick defends this limited form of political organization.',
          answers: ['minimal state'],
        },
        {
          clue: 'Which concept names freedom from outside interference?',
          answers: ['negative liberty'],
          finalEligible: true,
        },
        {
          clue: 'A government ruled by a king or queen is this form of rule.',
          answers: ['monarchy'],
        },
      ],
    },
    {
      name: 'Philosophy of Religion',
      clues: [
        {
          clue: 'This argument infers a first cause or necessary being from the existence of the universe.',
          answers: ['cosmological argument'],
          finalEligible: true,
        },
        {
          clue: 'Which argument infers a designer from order or apparent purpose in nature?',
          answers: ['teleological argument', 'design argument'],
          finalEligible: true,
        },
        {
          clue: 'This argument tries to prove God from the concept of a greatest conceivable being.',
          answers: ['ontological argument'],
          finalEligible: true,
        },
        {
          clue: 'The challenge of reconciling evil with an all-good, all-powerful deity is called this.',
          answers: ['problem of evil'],
        },
        {
          clue: 'Which position affirms belief in at least one god?',
          answers: ['theism'],
          finalEligible: true,
        },
        {
          clue: 'This position suspends judgment or claims uncertainty about divine existence.',
          answers: ['agnosticism'],
        },
      ],
    },
    {
      name: 'Philosophy of Science',
      clues: [
        {
          clue: 'This philosopher argued that scientific theories should be falsifiable.',
          answers: ['Popper', 'Karl Popper'],
          finalEligible: true,
        },
        {
          clue: 'Which historian of science popularized the idea of paradigm shifts?',
          answers: ['Kuhn', 'Thomas Kuhn'],
          finalEligible: true,
        },
        {
          clue: 'The criterion that a claim can in principle be refuted by evidence is called this.',
          answers: ['falsifiability'],
          finalEligible: true,
        },
        {
          clue: 'A broad framework of shared assumptions in normal science is called this.',
          answers: ['paradigm'],
        },
        {
          clue: 'Which problem asks how finite observations can justify universal scientific laws?',
          answers: ['problem of induction', 'induction problem'],
          finalEligible: true,
        },
        {
          clue: 'The idea that observations are influenced by background theory is often called theory this.',
          answers: ['ladenness', 'theory-ladenness'],
        },
      ],
    },
    {
      name: 'Aesthetics',
      clues: [
        {
          clue: 'This branch of philosophy studies art, beauty, and taste.',
          answers: ['aesthetics'],
          finalEligible: true,
        },
        {
          clue: 'Which concept names a judgment about beauty or artistic merit?',
          answers: ['taste'],
          finalEligible: true,
        },
        {
          clue: 'This theory judges art by how well it imitates or represents reality.',
          answers: ['mimesis', 'imitation theory'],
          finalEligible: true,
        },
        {
          clue: 'A response of awe before vastness or overwhelming power is called this.',
          answers: ['sublime', 'the sublime'],
        },
        {
          clue: 'Which term names the philosophical question of what counts as art?',
          answers: ['definition of art', 'art definition'],
          finalEligible: true,
        },
        {
          clue: 'The view that artistic value depends mainly on emotional expression is called this.',
          answers: ['expressionism', 'expressivism'],
        },
      ],
    },
    {
      name: 'Informal Fallacies',
      clues: [
        {
          clue: 'This fallacy attacks the person instead of the argument.',
          answers: ['ad hominem'],
          finalEligible: true,
        },
        {
          clue: 'Which fallacy misrepresents an opponent in order to refute an easier target?',
          answers: ['straw man', 'strawman'],
          finalEligible: true,
        },
        {
          clue: 'This fallacy assumes what it is trying to prove.',
          answers: ['begging the question', 'circular reasoning'],
          finalEligible: true,
        },
        {
          clue: 'A false choice between only two options is this fallacy.',
          answers: ['false dilemma', 'false dichotomy'],
        },
        {
          clue: 'Which fallacy says one step will inevitably lead to extreme consequences?',
          answers: ['slippery slope'],
          finalEligible: true,
        },
        {
          clue: 'Appealing to popularity as proof is often called this fallacy.',
          answers: ['ad populum', 'appeal to popularity'],
        },
      ],
    },
  ],
})
