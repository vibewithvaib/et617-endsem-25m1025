import type {
  ChapterDefinition,
  ChapterProgress,
  ChapterStatus,
  LearnerState,
  LearningStepId,
} from './types';

export const ROBOT_MASCOT_URL =
  '/src/assets/images/robot_tutor_mascot_1795007694031.jpg';
export const RECIPE_ILLUSTRATION_URL =
  '/src/assets/images/recipe_scaling_illustration_1795007694845.jpg';
export const MAP_ILLUSTRATION_URL =
  '/src/assets/images/map_scale_illustration_1795007695309.jpg';

export const LEARNING_STEPS: { id: LearningStepId; number: number; label: string }[] = [
  { id: 'intro', number: 1, label: 'Introduction' },
  { id: 'examples', number: 2, label: 'Worked Examples' },
  { id: 'explore', number: 3, label: 'Explore & Interact' },
  { id: 'guided', number: 4, label: 'Guided Practice' },
  { id: 'independent', number: 5, label: 'Independent Practice' },
  { id: 'mastery', number: 6, label: 'Mastery Check' },
];

export const MASTERY_PASS_SCORE = 4;
export const MASTERY_TOTAL_QUESTIONS = 5;
export const SESSION_TARGET_SECONDS = 600; // 10 minutes

export const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'Understanding Ratios',
    shortSubtitle: 'Compare quantities, write ratios clearly, and simplify them.',
    introTitle: 'What is a ratio?',
    introParagraphs: [
      'A ratio compares two amounts side by side to show how much of one thing there is compared to another.',
      'Order always matters. If a fruit bowl has 3 red apples and 4 green apples, red to green is 3 : 4, while green to red is 4 : 3.',
      'You can write a ratio with a colon (3 : 4), with the word "to" (3 to 4), or simplify it by dividing both numbers by the same factor.',
    ],
    everydayConnection:
      'Think of mixing cordial and water: 1 cup of syrup to 4 cups of water (1 : 4) tastes very different from 4 cups of syrup to 1 cup of water (4 : 1).',
    examples: [
      {
        title: 'Example 1: Comparing and writing forms',
        summary: 'A pencil case holds 4 blue pens and 6 black pens.',
        steps: [
          'Read what is asked first: "blue pens to black pens".',
          'Put blue pens (4) on the left and black pens (6) on the right: 4 : 6.',
          'You can also write this as "4 to 6".',
        ],
        takeaway: 'Match the order of words in the question to the order of numbers.',
      },
      {
        title: 'Example 2: Simplifying a ratio',
        summary: 'Simplify 4 : 6 to its simplest form.',
        steps: [
          'Find a whole number that divides evenly into both 4 and 6. Here, 2 divides both.',
          'Divide the left side: 4 / 2 = 2.',
          'Divide the right side: 6 / 2 = 3. The simplest ratio is 2 : 3.',
        ],
        takeaway: 'Always divide both numbers by the same factor so the comparison stays equal.',
      },
    ],
    explorePrompt:
      'Adjust the lemons and water below, switch the comparison order, and try simplifying a ratio.',
    interactiveKind: 'ratio_compare',
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Equivalent Ratios',
    shortSubtitle: 'Scale ratios by multiplying or dividing both sides equally.',
    introTitle: 'When are two ratios equivalent?',
    introParagraphs: [
      'Two ratios are equivalent when they describe the exact same balance, even though the numbers are larger or smaller.',
      'To make an equivalent ratio, multiply or divide both numbers by the same non-zero number.',
      'Adding the same number to both sides changes the balance, so proportional relationships always use multiplication or division.',
    ],
    everydayConnection:
      'If 1 batch of trail mix uses 2 cups of oats and 3 handfuls of raisins (2 : 3), then 2 batches use 4 : 6 and 3 batches use 6 : 9. Every batch tastes the same.',
    examples: [
      {
        title: 'Example 1: Multiplying and dividing ratios',
        summary: 'Find ratios equivalent to 3 : 5 and 12 : 20.',
        steps: [
          'Multiply both sides of 3 : 5 by 2 to get 6 : 10, or by 3 to get 9 : 15.',
          'Divide both sides of 12 : 20 by 4: 12 / 4 = 3 and 20 / 4 = 5.',
          'Notice 3 : 5, 6 : 10, and 12 : 20 all represent the same proportional relationship.',
        ],
        takeaway: 'Multiplying or dividing both parts by the same number keeps ratios equivalent.',
      },
      {
        title: 'Example 2: Finding a missing value',
        summary: 'Find the missing number in 2 : 7 = 8 : ____.',
        steps: [
          'Compare the known left numbers: 2 multiplied by 4 equals 8.',
          'Use that exact same multiplier (4) on the right number: 7 x 4 = 28.',
          'So 2 : 7 = 8 : 28.',
        ],
        takeaway: 'Find the multiplier between one known pair, then apply it to the other side.',
      },
    ],
    explorePrompt:
      'Compare multiplying both numbers with adding the same number to see why balance only stays equal when multiplying.',
    interactiveKind: 'equivalent_scaler',
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Ratios in Recipes',
    shortSubtitle: 'Scale ingredients up or down while keeping the taste balanced.',
    introTitle: 'Keeping recipes balanced',
    introParagraphs: [
      'Every recipe is a ratio of ingredients. Whether you cook for 2 people or 8 people, keeping the same ratio ensures the food tastes right.',
      'To scale a recipe up (for more servings) or down (for fewer servings), multiply or divide every ingredient by the same factor.',
      'A common mistake is changing only one ingredient or adding instead of multiplying, which makes the dish too sweet, salty, or thick.',
    ],
    everydayConnection:
      'If 4 glasses of lemonade need 2 lemons and 4 spoons of sugar, making 8 glasses means doubling both: 4 lemons and 8 spoons of sugar.',
    examples: [
      {
        title: 'Example 1: Scaling a recipe up and down',
        summary: 'A smoothie for 4 people uses 4 bananas and 6 cups of milk.',
        steps: [
          'To make enough for 2 people (half as much), divide both by 2: 2 bananas and 3 cups of milk.',
          'To make enough for 8 people (twice as much), multiply both by 2: 8 bananas and 12 cups of milk.',
        ],
        takeaway: 'Every ingredient scales up or down by the same multiplier or divisor.',
      },
      {
        title: 'Example 2: Spotting a scaling mistake',
        summary: 'A pancake mix uses 2 cups of flour and 1 egg. Sam adds 2 to both to get 4 cups of flour and 3 eggs. Is that right?',
        steps: [
          'Doubling flour from 2 cups to 4 cups multiplies by 2.',
          'Eggs must also multiply by 2: 1 x 2 = 2 eggs, not 3.',
          'Adding 2 instead of multiplying changed the ratio from 2 : 1 to 4 : 3.',
        ],
        takeaway: 'Check the multiplier (4 / 2 = 2) rather than adding the difference.',
      },
    ],
    explorePrompt:
      'Change the number of servings below and watch how all ingredients scale together.',
    interactiveKind: 'recipe_mixer',
  },
  {
    id: 'ch4',
    number: 4,
    title: 'Ratios on Maps',
    shortSubtitle: 'Convert between map centimeters and real-world kilometers.',
    introTitle: 'How map scales work',
    introParagraphs: [
      'Maps shrink large real-world distances onto paper using a ratio called a scale.',
      'A scale like 1 cm = 5 km means every 1 centimeter you measure on the map stands for 5 kilometers in real life.',
      'To go from map distance to real distance, multiply by the scale. To go from real distance back to map distance, divide by the scale.',
    ],
    everydayConnection:
      'Planning a bike trip on a park map works just like scaling a recipe: 3 centimeters on a 1 cm = 4 km map means 3 groups of 4 km, or 12 km.',
    examples: [
      {
        title: 'Example 1: Finding real distance from a map',
        summary: 'On a map, 1 cm = 6 km. Two towns are 4 cm apart on the map.',
        steps: [
          'Each 1 cm stands for 6 km.',
          'Multiply map centimeters by kilometers per cm: 4 x 6 = 24 km.',
          'The real distance between the towns is 24 km.',
        ],
        takeaway: 'Real distance = map centimeters x kilometers per 1 cm.',
      },
      {
        title: 'Example 2: Using a multi-cm scale and finding map distance',
        summary: 'A trail map shows 2 cm = 10 km. How many cm on paper represent 25 km?',
        steps: [
          'First find what 1 cm stands for: 10 / 2 = 5 km (so 1 cm = 5 km).',
          'Now divide the real distance by 5 km: 25 / 5 = 5 cm.',
          'So 25 km in real life is 5 cm on the map.',
        ],
        takeaway: 'Always find the value for 1 cm first when a scale starts with 2 cm or more.',
      },
    ],
    explorePrompt:
      'Pick a map scale and slide the distance ruler to compare map measurements with real distances.',
    interactiveKind: 'map_ruler',
  },
  {
    id: 'ch5',
    number: 5,
    title: 'Practice and Challenge',
    shortSubtitle: 'Bring ratios, equivalent scaling, recipes, and maps together.',
    introTitle: 'Putting all ratio skills together',
    introParagraphs: [
      'In everyday problems, you will meet ratios, equivalent scaling, recipes, and map scales side by side.',
      'Before calculating, check two quick things: are both measurements in the same unit (such as 1 L = 1000 ml or 1 m = 100 cm), and which quantity is asked first?',
      'Take your time and work one step at a time.',
    ],
    everydayConnection:
      'Whether you are mixing 500 ml of juice with 1 L of water or measuring a 4.5 cm hiking route, the exact same proportional rule applies.',
    examples: [
      {
        title: 'Example 1: Matching units before simplifying',
        summary: 'Find the simplest ratio of 500 ml of juice to 1 L of water.',
        steps: [
          'Convert 1 L into milliliters so both use the same unit: 1 L = 1000 ml.',
          'Write the ratio: 500 : 1000.',
          'Divide both by 500 to get the simplest ratio: 1 : 2.',
        ],
        takeaway: 'Convert to matching units first, then simplify both numbers together.',
      },
      {
        title: 'Example 2: Scaling through a unit rate',
        summary: 'If 4 cups of flour make 12 muffins, how many cups make 18 muffins?',
        steps: [
          'Find how many muffins 1 cup of flour makes: 12 / 4 = 3 muffins per cup.',
          'Divide 18 muffins by 3 muffins per cup: 18 / 3 = 6 cups of flour.',
        ],
        takeaway: 'When a direct multiplier is not obvious, find the amount for 1 unit first.',
      },
    ],
    explorePrompt:
      'Practise matching units and planning batches below before jumping into the mixed challenge.',
    interactiveKind: 'challenge_review',
  },
];

export function getChapterById(chapterId: string): ChapterDefinition {
  return CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];
}

export function getNextChapter(chapterId: string): ChapterDefinition | null {
  const idx = CHAPTERS.findIndex((c) => c.id === chapterId);
  if (idx < 0 || idx >= CHAPTERS.length - 1) return null;
  return CHAPTERS[idx + 1];
}

export function createInitialChapterProgress(
  chapterId: string,
  status: ChapterStatus = 'locked'
): ChapterProgress {
  return {
    chapterId,
    status,
    currentStep: 'intro',
    completedSteps: [],
    exploredInteractive: false,
    guidedQuestions: [],
    guidedIndex: 0,
    guidedCompletedIds: [],
    independentQuestions: [],
    independentIndex: 0,
    independentCompletedIds: [],
    masteryQuestions: [],
    masteryIndex: 0,
    masteryAnswers: [],
    masteryHistory: [],
    selectedAnswerDraft: '',
    hintRevealed: false,
    attemptsOnCurrent: 0,
    weakConcepts: [],
    timeSpentSeconds: 0,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function createInitialLearnerState(learnerId = 'learner'): LearnerState {
  const chapters: Record<string, ChapterProgress> = {};
  CHAPTERS.forEach((ch, idx) => {
    chapters[ch.id] = createInitialChapterProgress(
      ch.id,
      idx === 0 ? 'available' : 'locked'
    );
  });

  return {
    learnerId,
    activeChapterId: 'ch1',
    chapters,
    sessionElapsedSeconds: 0,
    totalTimeSpentSeconds: 0,
    interactionLogs: [],
    lastActiveAt: new Date().toISOString(),
  };
}
