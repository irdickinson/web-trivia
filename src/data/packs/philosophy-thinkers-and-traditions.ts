import { definePack } from '../authoring'

export const PHILOSOPHY_THINKERS_AND_TRADITIONS_PACK = definePack({
  id: 'philosophy-thinkers-and-traditions',
  name: 'Philosophy: Thinkers and Traditions',
  description:
    'Major philosophers, schools, books, and traditions from ancient Greece to modern thought.',
  categories: [
    {
      name: 'Ancient Greek Thinkers',
      clues: [
        {
          clue: 'This Athenian philosopher wrote nothing and questioned citizens in public conversations.',
          answers: ['Socrates'],
          finalEligible: true,
        },
        {
          clue: 'Which student of Socrates wrote dialogues and founded the Academy?',
          answers: ['Plato'],
          finalEligible: true,
        },
        {
          clue: 'This student of Plato tutored Alexander the Great and wrote the Nicomachean Ethics.',
          answers: ['Aristotle'],
          finalEligible: true,
        },
        {
          clue: 'A theorem about right triangles is named for this early Greek thinker.',
          answers: ['Pythagoras'],
        },
        {
          clue: 'Which pre-Socratic philosopher said one cannot step into the same river twice?',
          answers: ['Heraclitus'],
          finalEligible: true,
        },
        {
          clue: 'This atomist is often paired with Leucippus as an early theorist of indivisible particles.',
          answers: ['Democritus'],
        },
      ],
    },
    {
      name: 'Modern Philosophers',
      clues: [
        {
          clue: 'This French rationalist wrote Meditations on First Philosophy.',
          answers: ['Descartes', 'Rene Descartes'],
          finalEligible: true,
        },
        {
          clue: 'Which Dutch philosopher defended a monist view of God or Nature?',
          answers: ['Spinoza', 'Baruch Spinoza'],
          finalEligible: true,
        },
        {
          clue: 'This German thinker argued for monads and pre-established harmony.',
          answers: ['Leibniz', 'Gottfried Leibniz'],
          finalEligible: true,
        },
        {
          clue: 'This Irish bishop argued that to be is to be perceived.',
          answers: ['Berkeley', 'George Berkeley'],
        },
        {
          clue: 'Which Scottish philosopher is famous for skeptical arguments about causation and induction?',
          answers: ['Hume', 'David Hume'],
          finalEligible: true,
        },
        {
          clue: 'This philosopher of Konigsberg wrote the Critique of Pure Reason.',
          answers: ['Kant', 'Immanuel Kant'],
        },
      ],
    },
    {
      name: 'Asian Philosophers',
      clues: [
        {
          clue: 'This Chinese teacher emphasized ritual, humane conduct, and moral cultivation.',
          answers: ['Confucius', 'Kongzi'],
          finalEligible: true,
        },
        {
          clue: 'Which traditional Daoist founder is associated with the Daodejing?',
          answers: ['Laozi', 'Lao Tzu'],
          finalEligible: true,
        },
        {
          clue: 'This wandering Daoist writer is known for butterfly-dream and free-wandering stories.',
          answers: ['Zhuangzi', 'Chuang Tzu'],
          finalEligible: true,
        },
        {
          clue: 'A Confucian thinker who argued that human nature is originally good.',
          answers: ['Mencius', 'Mengzi'],
        },
        {
          clue: 'Which Indian Buddhist philosopher developed the Madhyamaka school?',
          answers: ['Nagarjuna'],
          finalEligible: true,
        },
        {
          clue: 'This Chinese critic of aggressive war taught impartial care.',
          answers: ['Mozi'],
        },
      ],
    },
    {
      name: 'Ethical Theories',
      clues: [
        {
          clue: 'This theory judges actions by their overall consequences for happiness or welfare.',
          answers: ['utilitarianism'],
          finalEligible: true,
        },
        {
          clue: 'Which duty-centered approach is closely associated with Kant?',
          answers: ['deontology', 'deontological ethics'],
          finalEligible: true,
        },
        {
          clue: 'This approach emphasizes moral character rather than rules or consequences.',
          answers: ['virtue ethics'],
          finalEligible: true,
        },
        {
          clue: 'The view that moral rightness depends on cultural or individual standards.',
          answers: ['relativism', 'moral relativism'],
        },
        {
          clue: 'Which view says pleasure is the highest good or central value?',
          answers: ['hedonism'],
          finalEligible: true,
        },
        {
          clue: 'This family of theories says right action depends on producing the best outcomes.',
          answers: ['consequentialism'],
        },
      ],
    },
    {
      name: 'Political Philosophers',
      clues: [
        {
          clue: 'This author of Leviathan argued for a strong sovereign to escape the state of nature.',
          answers: ['Hobbes', 'Thomas Hobbes'],
          finalEligible: true,
        },
        {
          clue: 'Which thinker defended natural rights to life, liberty, and property?',
          answers: ['Locke', 'John Locke'],
          finalEligible: true,
        },
        {
          clue: 'This Genevan philosopher opened The Social Contract by saying man is born free.',
          answers: ['Rousseau', 'Jean-Jacques Rousseau'],
          finalEligible: true,
        },
        {
          clue: 'A Theory of Justice was written by this twentieth-century philosopher.',
          answers: ['Rawls', 'John Rawls'],
        },
        {
          clue: 'Which libertarian philosopher wrote Anarchy, State, and Utopia?',
          answers: ['Nozick', 'Robert Nozick'],
          finalEligible: true,
        },
        {
          clue: 'This nineteenth-century critic of capitalism co-authored The Communist Manifesto.',
          answers: ['Marx', 'Karl Marx'],
        },
      ],
    },
    {
      name: 'Existentialists and Critics',
      clues: [
        {
          clue: 'This Danish writer is often called a founder of existentialism.',
          answers: ['Kierkegaard', 'Soren Kierkegaard'],
          finalEligible: true,
        },
        {
          clue: 'Which German philosopher proclaimed the death of God and wrote Thus Spoke Zarathustra?',
          answers: ['Nietzsche', 'Friedrich Nietzsche'],
          finalEligible: true,
        },
        {
          clue: 'This French existentialist wrote Being and Nothingness.',
          answers: ['Sartre', 'Jean-Paul Sartre'],
          finalEligible: true,
        },
        {
          clue: 'The Second Sex was written by this French philosopher.',
          answers: ['Beauvoir', 'Simone de Beauvoir'],
        },
        {
          clue: 'Which author of The Myth of Sisyphus is associated with the absurd?',
          answers: ['Camus', 'Albert Camus'],
          finalEligible: true,
        },
        {
          clue: 'This German thinker analyzed Dasein in Being and Time.',
          answers: ['Heidegger', 'Martin Heidegger'],
        },
      ],
    },
    {
      name: 'Famous Works',
      clues: [
        {
          clue: 'Plato presents the cave allegory in this dialogue about justice.',
          answers: ['Republic', 'The Republic'],
          finalEligible: true,
        },
        {
          clue: 'Which Aristotle work gives a classic account of virtue and flourishing?',
          answers: ['Nicomachean Ethics'],
          finalEligible: true,
        },
        {
          clue: 'Kant develops his first major critical philosophy in this book.',
          answers: ['Critique of Pure Reason'],
          finalEligible: true,
        },
        {
          clue: 'Mill defends individual liberty against social tyranny in this short work.',
          answers: ['On Liberty'],
        },
        {
          clue: 'Which Hobbes book famously describes life without government as solitary, poor, nasty, brutish, and short?',
          answers: ['Leviathan'],
          finalEligible: true,
        },
        {
          clue: 'Nietzsche uses a prophetic literary style in this book centered on Zarathustra.',
          answers: ['Thus Spoke Zarathustra'],
        },
      ],
    },
    {
      name: 'Schools and Movements',
      clues: [
        {
          clue: 'This Hellenistic school taught living according to nature and accepting what one cannot control.',
          answers: ['Stoicism'],
          finalEligible: true,
        },
        {
          clue: 'Which ancient school treated tranquil pleasure and freedom from disturbance as central aims?',
          answers: ['Epicureanism'],
          finalEligible: true,
        },
        {
          clue: 'This movement doubts whether certain knowledge is possible.',
          answers: ['skepticism', 'scepticism'],
          finalEligible: true,
        },
        {
          clue: 'A twentieth-century movement associated with meaning, freedom, anxiety, and authenticity.',
          answers: ['existentialism'],
        },
        {
          clue: 'Which tradition seeks social harmony through ritual, virtue, and family roles?',
          answers: ['Confucianism'],
          finalEligible: true,
        },
        {
          clue: 'This Chinese tradition emphasizes the Way, spontaneity, and non-forcing action.',
          answers: ['Daoism', 'Taoism'],
        },
      ],
    },
    {
      name: 'Logic Terms',
      clues: [
        {
          clue: 'An argument with a conclusion that must be true if its premises are true has this property.',
          answers: ['validity', 'valid'],
          finalEligible: true,
        },
        {
          clue: 'Which property belongs to a valid argument whose premises are also true?',
          answers: ['soundness', 'sound'],
          finalEligible: true,
        },
        {
          clue: 'This form of reasoning moves from general premises to a necessary conclusion.',
          answers: ['deduction', 'deductive reasoning'],
          finalEligible: true,
        },
        {
          clue: 'Reasoning from observed cases toward a general pattern is called this.',
          answers: ['induction', 'inductive reasoning'],
        },
        {
          clue: 'Which Aristotelian argument form classically contains two premises and a conclusion?',
          answers: ['syllogism'],
          finalEligible: true,
        },
        {
          clue: 'This inferential move seeks the best explanation for surprising evidence.',
          answers: ['abduction', 'inference to the best explanation'],
        },
      ],
    },
  ],
})
