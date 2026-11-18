import type {
  DifficultyLevel,
  MathCheckSpec,
  PracticeQuestion,
  QuestionOption,
  QuestionType,
} from './types';
import { getChapterById } from './chapters';

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function validateQuestion(q: PracticeQuestion): boolean {
  if (
    !q.questionText.trim() ||
    !q.correctAnswer.trim() ||
    !q.hint.trim() ||
    !q.explanation.trim()
  ) {
    return false;
  }

  if (q.questionType === 'mcq') {
    if (!q.options || q.options.length !== 4) return false;
    const values = q.options.map((o) => o.value.trim().toLowerCase());
    if (new Set(values).size !== 4) return false;
    if (!values.includes(q.correctAnswer.trim().toLowerCase())) return false;
  }

  if (q.questionType === 'short_answer') {
    if (!q.expectedKeywords || q.expectedKeywords.length === 0) return false;
  }

  if (q.mathCheck) {
    const mc = q.mathCheck;
    if (mc.kind === 'scale_pair' && mc.factor !== undefined) {
      const expected = mc.b * mc.factor;
      const num = Number(String(q.correctAnswer).replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(num) || Math.abs(num - expected) > 0.01) return false;
    }
    if (mc.kind === 'missing_value' && mc.factor !== undefined) {
      const expected = mc.b * mc.factor;
      const num = Number(String(q.correctAnswer).replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(num) || Math.abs(num - expected) > 0.01) return false;
    }
    if (mc.kind === 'map_distance' && mc.factor !== undefined) {
      const expected = mc.a * mc.factor;
      const num = Number(String(q.correctAnswer).replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(num) || Math.abs(num - expected) > 0.01) return false;
    }
    if (mc.kind === 'simplify_ratio') {
      const g = gcd(mc.a, mc.b);
      const expected = `${mc.a / g}:${mc.b / g}`;
      if (q.correctAnswer.replace(/\s+/g, '') !== expected) return false;
    }
  }

  return true;
}

function buildMCQOptions(
  correct: string,
  distractors: { value: string; mistakeHint: string }[],
  seed: number
): QuestionOption[] {
  const seen = new Set<string>([correct.trim().toLowerCase()]);
  const unique: { value: string; mistakeHint?: string }[] = [];

  for (const d of distractors) {
    const key = d.value.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(d);
    }
  }

  let pad = 2;
  while (unique.length < 3) {
    const candidate = `${pad + 6}`;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      unique.push({
        value: candidate,
        mistakeHint: 'Recheck the values and operation needed in this question.',
      });
    }
    pad += 1;
  }

  const all = [{ value: correct, mistakeHint: undefined }, ...unique.slice(0, 3)];
  const shift = seed % 4;
  const rotated = [...all.slice(shift), ...all.slice(0, shift)];
  const ids = ['a', 'b', 'c', 'd'];

  return rotated.map((opt, idx) => ({
    id: ids[idx],
    label: opt.value,
    value: opt.value,
    mistakeHint: opt.mistakeHint,
  }));
}

function getPreparedFallback(chapterId: string, preferredType?: QuestionType): PracticeQuestion {
  const type = preferredType ?? 'mcq';
  if (type === 'short_answer') {
    return {
      id: makeId('q_prep'),
      chapterId,
      conceptTag: 'proportional_reasoning',
      conceptLabel: 'Proportional reasoning',
      questionText:
        'Why do we multiply or divide both numbers in a ratio by the same amount instead of adding?',
      questionType: 'short_answer',
      difficulty: 'Medium',
      correctAnswer:
        'Multiplying or dividing both numbers by the same factor keeps the balance and ratio equal, while adding changes the comparison.',
      expectedKeywords: ['multiply', 'divide', 'same', 'equal', 'balance', 'factor', 'proportion'],
      explanation:
        'Ratios compare relative sizes. Multiplying or dividing both sides by the same number keeps their relationship unchanged.',
      hint: 'Think about what happens to 1 : 2 if you double both vs if you add 5 to both.',
      stepByStepSupport: [
        'Compare 1 : 2 multiplied by 2 -> 2 : 4 (still half as much).',
        'Compare 1 : 2 with 5 added -> 6 : 7 (almost equal, balance changed).',
      ],
      extraExample: 'Doubling 1 cup syrup and 2 cups water gives 2 : 4, which tastes the same.',
      source: 'prepared',
    };
  }

  return {
    id: makeId('q_prep'),
    chapterId,
    conceptTag: 'basic_ratio',
    conceptLabel: 'Comparing quantities',
    questionText:
      'A fruit basket has 3 pears and 5 oranges. What is the ratio of pears to oranges?',
    questionType: 'mcq',
    difficulty: 'Easy',
    options: [
      { id: 'a', label: '3 : 5', value: '3 : 5' },
      {
        id: 'b',
        label: '5 : 3',
        value: '5 : 3',
        mistakeHint: 'Pears are asked first (3) and oranges second (5), so write 3 : 5.',
      },
      {
        id: 'c',
        label: '3 : 8',
        value: '3 : 8',
        mistakeHint: 'Compare pears (3) to oranges (5), not the total fruit (8).',
      },
      {
        id: 'd',
        label: '4 : 6',
        value: '4 : 6',
        mistakeHint: 'Use the exact counts given in the basket.',
      },
    ],
    correctAnswer: '3 : 5',
    explanation: 'There are 3 pears and 5 oranges, so pears to oranges is 3 : 5.',
    hint: 'Put the number of pears first and the number of oranges second.',
    stepByStepSupport: ['Count pears: 3.', 'Count oranges: 5.', 'Write 3 : 5.'],
    extraExample: 'With 2 lemons and 7 limes, lemons to limes is 2 : 7.',
    source: 'prepared',
  };
}

export function generateLocalQuestion(params: {
  chapterId: string;
  difficulty: DifficultyLevel;
  preferredType?: QuestionType;
  preferredConcept?: string;
  recentQuestionTexts?: string[];
  seedOffset?: number;
}): PracticeQuestion {
  const chapter = getChapterById(params.chapterId);
  const recent = params.recentQuestionTexts ?? [];
  const baseSeed = Math.abs(params.seedOffset ?? 1) * 13 + recent.length * 7;

  for (let attempt = 0; attempt < 12; attempt++) {
    const seed = baseSeed + attempt * 5;
    const candidate = buildTemplateQuestion(
      chapter.id,
      params.difficulty,
      seed,
      params.preferredType,
      params.preferredConcept
    );
    if (validateQuestion(candidate) && !recent.includes(candidate.questionText)) {
      return candidate;
    }
  }

  const fallback = getPreparedFallback(chapter.id, params.preferredType);
  return validateQuestion(fallback)
    ? fallback
    : getPreparedFallback(chapter.id, 'mcq');
}

export function buildGuidedPracticeSet(
  chapterId: string,
  weakConcepts: string[] = []
): PracticeQuestion[] {
  const plan: { difficulty: DifficultyLevel; type: QuestionType; offset: number }[] = [
    { difficulty: 'Easy', type: 'mcq', offset: 1 },
    { difficulty: 'Easy', type: 'fill_blank', offset: 2 },
    { difficulty: 'Medium', type: 'numerical', offset: 3 },
  ];
  const used: string[] = [];
  return plan.map((slot, idx) => {
    const q = generateLocalQuestion({
      chapterId,
      difficulty: slot.difficulty,
      preferredType:
        chapterId === 'ch1' && slot.type === 'numerical' ? 'fill_blank' : slot.type,
      preferredConcept: weakConcepts[idx % Math.max(1, weakConcepts.length)],
      recentQuestionTexts: used,
      seedOffset: slot.offset + idx * 3,
    });
    used.push(q.questionText);
    return q;
  });
}

export function buildIndependentPracticeSet(
  chapterId: string,
  weakConcepts: string[] = []
): PracticeQuestion[] {
  const plan: { difficulty: DifficultyLevel; type: QuestionType; offset: number }[] = [
    { difficulty: 'Medium', type: 'mcq', offset: 11 },
    { difficulty: 'Medium', type: 'numerical', offset: 14 },
    { difficulty: 'Hard', type: 'short_answer', offset: 17 },
  ];
  const used: string[] = [];
  return plan.map((slot, idx) => {
    const q = generateLocalQuestion({
      chapterId,
      difficulty: slot.difficulty,
      preferredType:
        chapterId === 'ch1' && slot.type === 'numerical' ? 'fill_blank' : slot.type,
      preferredConcept: weakConcepts[idx % Math.max(1, weakConcepts.length)],
      recentQuestionTexts: used,
      seedOffset: slot.offset + idx * 4,
    });
    used.push(q.questionText);
    return q;
  });
}

export function buildMasteryCheckSet(
  chapterId: string,
  attemptSeed = 0,
  weakConcepts: string[] = []
): PracticeQuestion[] {
  const chapterApplicationConcept =
    chapterId === 'ch3'
      ? 'recipe_scaling'
      : chapterId === 'ch4'
        ? 'map_distance'
        : undefined;

  const plan: {
    difficulty: DifficultyLevel;
    type: QuestionType;
    offset: number;
    concept?: string;
  }[] = [
    { difficulty: 'Easy', type: 'mcq', offset: 21 + attemptSeed * 7 },
    {
      difficulty: 'Medium',
      type: chapterId === 'ch1' ? 'fill_blank' : 'numerical',
      offset: 25 + attemptSeed * 7,
      concept: chapterApplicationConcept ?? weakConcepts[0],
    },
    {
      difficulty: 'Medium',
      type: 'fill_blank',
      offset: 29 + attemptSeed * 7,
    },
    {
      difficulty: 'Hard',
      type: chapterId === 'ch1' ? 'mcq' : 'numerical',
      offset: 33 + attemptSeed * 7,
      concept: chapterApplicationConcept,
    },
    {
      difficulty: 'Medium',
      type: 'short_answer',
      offset: 37 + attemptSeed * 7,
    },
  ];

  const used: string[] = [];
  return plan.map((slot) => {
    const q = generateLocalQuestion({
      chapterId,
      difficulty: slot.difficulty,
      preferredType: slot.type,
      preferredConcept: slot.concept,
      recentQuestionTexts: used,
      seedOffset: slot.offset,
    });
    used.push(q.questionText);
    return q;
  });
}

function buildTemplateQuestion(
  chapterId: string,
  difficulty: DifficultyLevel,
  seed: number,
  preferredType?: QuestionType,
  preferredConcept?: string
): PracticeQuestion {
  const pairItems = [
    { article: 'A', context: 'lemonade mix', itemA: 'lemons', itemB: 'glasses of water' },
    { article: 'A', context: 'cookie mix', itemA: 'cups of flour', itemB: 'cups of sugar' },
    { article: 'A', context: 'hot cocoa mix', itemA: 'spoons of cocoa', itemB: 'cups of milk' },
    { article: 'A', context: 'bead bracelet', itemA: 'red beads', itemB: 'blue beads' },
  ];
  const pair = pairItems[seed % pairItems.length];

  switch (chapterId) {
    case 'ch1': {
      if (preferredType === 'short_answer') {
        const a = 2 + (seed % 3);
        const b = a + 2 + (seed % 2);
        return {
          id: makeId('q_ch1'),
          chapterId,
          conceptTag: 'ratio_order',
          conceptLabel: 'Order in ratios',
          questionText: `A drink uses ${a} ${pair.itemA} and ${b} ${pair.itemB}. Explain why writing ${b} : ${a} means something different from ${a} : ${b} when asked for ${pair.itemA} to ${pair.itemB}.`,
          questionType: 'short_answer',
          difficulty,
          correctAnswer: `Order matters in a ratio: the first number matches the first item (${pair.itemA}) and the second number matches the second item (${pair.itemB}), so swapping them reverses the meaning.`,
          expectedKeywords: ['order', 'first', 'second', 'swap', 'reverse', 'different', 'match'],
          explanation: `In a ratio, the first number always belongs to the first quantity named. Swapping ${a} : ${b} to ${b} : ${a} switches which amount is larger.`,
          hint: `Think about which number stands for ${pair.itemA} and which stands for ${pair.itemB}.`,
          stepByStepSupport: [
            `${pair.itemA} is named first, so ${a} goes on the left.`,
            `${pair.itemB} is named second, so ${b} goes on the right.`,
          ],
          extraExample: 'Example: 1 lemon to 4 glasses of water is sour-sweet, while 4 lemons to 1 glass is very sour.',
          source: 'generated',
        };
      }

      const wantSimplify =
        preferredConcept === 'simplify_ratio' ||
        (difficulty !== 'Easy' && seed % 2 === 1 && preferredConcept !== 'ratio_order');

      if (wantSimplify) {
        const baseA = 2 + (seed % 3);
        const baseB = baseA + 1 + (seed % 2);
        const g = gcd(baseA, baseB);
        const simpA = baseA / g;
        const simpB = baseB / g;
        const factor = 2 + (seed % 4);
        const rawA = simpA * factor;
        const rawB = simpB * factor;
        const mathCheck: MathCheckSpec = { kind: 'simplify_ratio', a: rawA, b: rawB };

        if (preferredType === 'fill_blank') {
          return {
            id: makeId('q_ch1'),
            chapterId,
            conceptTag: 'simplify_ratio',
            conceptLabel: 'Simplifying ratios',
            questionText: `Simplify the ratio ${rawA} : ${rawB} to its simplest form (write like x:y).`,
            questionType: 'fill_blank',
            difficulty,
            correctAnswer: `${simpA}:${simpB}`,
            acceptableAnswers: [`${simpA}:${simpB}`, `${simpA} : ${simpB}`, `${simpA} to ${simpB}`],
            explanation: `Divide both ${rawA} and ${rawB} by ${factor}: ${rawA} / ${factor} = ${simpA} and ${rawB} / ${factor} = ${simpB}.`,
            hint: `Find a whole number that divides evenly into both ${rawA} and ${rawB}. Try ${factor}.`,
            stepByStepSupport: [
              `Check what divides both ${rawA} and ${rawB}: ${factor}.`,
              `${rawA} / ${factor} = ${simpA}.`,
              `${rawB} / ${factor} = ${simpB}, so the simplest form is ${simpA}:${simpB}.`,
            ],
            extraExample: 'Example: To simplify 6 : 10, divide both by 2 to get 3 : 5.',
            mathCheck,
            source: 'generated',
          };
        }

        const correct = `${simpA} : ${simpB}`;
        return {
          id: makeId('q_ch1'),
          chapterId,
          conceptTag: 'simplify_ratio',
          conceptLabel: 'Simplifying ratios',
          questionText: `What is the simplest form of the ratio ${rawA} : ${rawB}?`,
          questionType: 'mcq',
          difficulty,
          options: buildMCQOptions(
            correct,
            [
              {
                value: `${simpB} : ${simpA}`,
                mistakeHint: `Keep the numbers in the same order: ${rawA} goes on the left and ${rawB} on the right.`,
              },
              {
                value: `${simpA} : ${rawB}`,
                mistakeHint: `Remember to divide both sides by ${factor}, not just the first number.`,
              },
              {
                value: `${rawA - factor} : ${rawB - factor}`,
                mistakeHint: `To simplify a ratio, divide both numbers by a common factor instead of subtracting.`,
              },
            ],
            seed
          ),
          correctAnswer: correct,
          explanation: `Dividing both ${rawA} and ${rawB} by ${factor} gives ${correct}.`,
          hint: `Divide both numbers by ${factor}.`,
          stepByStepSupport: [
            `Divide ${rawA} by ${factor} to get ${simpA}.`,
            `Divide ${rawB} by ${factor} to get ${simpB}.`,
          ],
          extraExample: 'Example: 8 : 12 divided by 4 simplifies to 2 : 3.',
          mathCheck,
          source: 'generated',
        };
      }

      const a = 2 + (seed % 4);
      const b = a + 1 + (seed % 3);
      const reverseAsk = difficulty !== 'Easy' || seed % 2 === 1;
      const firstLabel = reverseAsk ? pair.itemB : pair.itemA;
      const secondLabel = reverseAsk ? pair.itemA : pair.itemB;
      const firstVal = reverseAsk ? b : a;
      const secondVal = reverseAsk ? a : b;

      if (preferredType === 'fill_blank') {
        return {
          id: makeId('q_ch1'),
          chapterId,
          conceptTag: 'ratio_order',
          conceptLabel: 'Writing ratios in order',
          questionText: `${pair.article} ${pair.context} has ${a} ${pair.itemA} and ${b} ${pair.itemB}. Write the ratio of ${firstLabel} to ${secondLabel} (like 2:3).`,
          questionType: 'fill_blank',
          difficulty,
          correctAnswer: `${firstVal}:${secondVal}`,
          acceptableAnswers: [
            `${firstVal}:${secondVal}`,
            `${firstVal} : ${secondVal}`,
            `${firstVal} to ${secondVal}`,
          ],
          explanation: `${firstLabel} is named first (${firstVal}) and ${secondLabel} is second (${secondVal}), so the ratio is ${firstVal} : ${secondVal}.`,
          hint: `Put the count for ${firstLabel} on the left and ${secondLabel} on the right.`,
          stepByStepSupport: [
            `Amount of ${firstLabel}: ${firstVal}.`,
            `Amount of ${secondLabel}: ${secondVal}.`,
            `Write as ${firstVal} : ${secondVal}.`,
          ],
          extraExample: 'Example: With 3 cats and 5 dogs, dogs to cats is 5 : 3.',
          source: 'generated',
        };
      }

      const correct = `${firstVal} : ${secondVal}`;
      return {
        id: makeId('q_ch1'),
        chapterId,
        conceptTag: 'ratio_order',
        conceptLabel: 'Writing ratios in order',
        questionText: `${pair.article} ${pair.context} has ${a} ${pair.itemA} and ${b} ${pair.itemB}. Which ratio shows ${firstLabel} to ${secondLabel}?`,
        questionType: 'mcq',
        difficulty,
        options: buildMCQOptions(
          correct,
          [
            {
              value: `${secondVal} : ${firstVal}`,
              mistakeHint: `The order is flipped. ${firstLabel} is asked first, so ${firstVal} goes on the left.`,
            },
            {
              value: `${firstVal} : ${firstVal + secondVal}`,
              mistakeHint: `Compare ${firstLabel} directly to ${secondLabel} (${secondVal}), not the combined total.`,
            },
            {
              value: `${firstVal + 1} : ${secondVal + 1}`,
              mistakeHint: 'Use the exact amounts shown in the problem.',
            },
          ],
          seed
        ),
        correctAnswer: correct,
        explanation: `${firstLabel} (${firstVal}) goes first and ${secondLabel} (${secondVal}) goes second, giving ${correct}.`,
        hint: `Check which item is named first in "${firstLabel} to ${secondLabel}".`,
        stepByStepSupport: [
          `Find ${firstLabel}: ${firstVal}.`,
          `Find ${secondLabel}: ${secondVal}.`,
        ],
        extraExample: 'Example: 4 red pens and 7 blue pens gives red to blue as 4 : 7.',
        source: 'generated',
      };
    }

    case 'ch2': {
      const a = 2 + (seed % 3);
      const b = a + 1 + (seed % 3);
      const factor = difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 3 : 4;
      const c = a * factor;
      const ans = b * factor;

      if (preferredType === 'short_answer') {
        return {
          id: makeId('q_ch2'),
          chapterId,
          conceptTag: 'proportional_rule',
          conceptLabel: 'Why equivalent ratios multiply',
          questionText: `A student says ${a + 2} : ${b + 2} is equivalent to ${a} : ${b} because 2 was added to both numbers. Explain why that is not equivalent.`,
          questionType: 'short_answer',
          difficulty,
          correctAnswer: `Equivalent ratios are made by multiplying or dividing both numbers by the same factor, not by adding. Adding changes the proportion.`,
          expectedKeywords: ['multiply', 'divide', 'add', 'same', 'factor', 'change', 'balance', 'proportion'],
          explanation: `Adding 2 changes the balance between the two quantities. To keep the ratio equivalent, both ${a} and ${b} must be multiplied or divided by the same number.`,
          hint: 'Mention the difference between multiplying both sides vs adding to both sides.',
          stepByStepSupport: [
            `Compare multiplying ${a} : ${b} by 2 -> ${a * 2} : ${b * 2}.`,
            `Adding 2 gives ${a + 2} : ${b + 2}, which is a different ratio.`,
          ],
          extraExample: 'Example: 1 : 2 doubled is 2 : 4 (still half), whereas adding 2 gives 3 : 4.',
          source: 'generated',
        };
      }

      const mathCheck: MathCheckSpec = { kind: 'missing_value', a, b, factor };
      if (preferredType === 'fill_blank' || preferredType === 'numerical') {
        return {
          id: makeId('q_ch2'),
          chapterId,
          conceptTag: 'missing_value',
          conceptLabel: 'Finding missing values',
          questionText: `Find the missing number in this equivalent ratio: ${a} : ${b} = ${c} : ____`,
          questionType: preferredType,
          difficulty,
          correctAnswer: `${ans}`,
          acceptableAnswers: [`${ans}`],
          explanation: `${a} multiplied by ${factor} makes ${c}, so multiply ${b} by ${factor}: ${b} x ${factor} = ${ans}.`,
          hint: `Ask what number multiplies ${a} to make ${c}. Multiply ${b} by that same number.`,
          stepByStepSupport: [
            `Find the multiplier: ${c} / ${a} = ${factor}.`,
            `Multiply the other side by ${factor}: ${b} x ${factor} = ${ans}.`,
          ],
          extraExample: 'Example: In 3 : 4 = 9 : ____, 3 x 3 = 9, so 4 x 3 = 12.',
          mathCheck,
          source: 'generated',
        };
      }

      const correct = `${c} : ${ans}`;
      return {
        id: makeId('q_ch2'),
        chapterId,
        conceptTag: 'equivalent_scaling',
        conceptLabel: 'Multiplying ratios equally',
        questionText: `Which ratio is equivalent to ${a} : ${b}?`,
        questionType: 'mcq',
        difficulty,
        options: buildMCQOptions(
          correct,
          [
            {
              value: `${a + factor} : ${b + factor}`,
              mistakeHint: `Adding ${factor} to both numbers changes the balance. Multiply both ${a} and ${b} by ${factor} instead.`,
            },
            {
              value: `${c} : ${b}`,
              mistakeHint: `Both numbers need to be multiplied by ${factor}, not just the left side.`,
            },
            {
              value: `${ans} : ${c}`,
              mistakeHint: `Keep the left and right positions in the same order.`,
            },
          ],
          seed
        ),
        correctAnswer: correct,
        explanation: `Multiplying both ${a} and ${b} by ${factor} gives ${c} : ${ans}.`,
        hint: `Look for a pair where both ${a} and ${b} were multiplied by the same whole number.`,
        stepByStepSupport: [
          `Multiply ${a} by ${factor} -> ${c}.`,
          `Multiply ${b} by ${factor} -> ${ans}.`,
        ],
        extraExample: 'Example: 2 : 5 multiplied by 3 gives 6 : 15.',
        source: 'generated',
      };
    }

    case 'ch3': {
      const recipes = [
        { article: 'A', dish: 'lemonade', aName: 'lemons', bName: 'spoons of sugar', a: 2, b: 3 },
        { article: 'A', dish: 'pancake', aName: 'cups of flour', bName: 'eggs', a: 2, b: 1 },
        { article: 'A', dish: 'fruit punch', aName: 'cups of juice', bName: 'cups of water', a: 3, b: 4 },
        { article: 'An', dish: 'oat muffin', aName: 'cups of oats', bName: 'spoons of honey', a: 4, b: 2 },
      ];
      const rec = recipes[seed % recipes.length];
      const factor = difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 3 : 4;
      const ansA = rec.a * factor;
      const ansB = rec.b * factor;

      if (preferredType === 'short_answer') {
        return {
          id: makeId('q_ch3'),
          chapterId,
          conceptTag: 'recipe_mistakes',
          conceptLabel: 'Keeping recipe proportions',
          questionText: `${rec.article} ${rec.dish} recipe uses ${rec.a} ${rec.aName} and ${rec.b} ${rec.bName}. If someone multiplies ${rec.aName} by ${factor} to get ${ansA} but leaves ${rec.bName} at ${rec.b}, why will the ${rec.dish} not taste the same?`,
          questionType: 'short_answer',
          difficulty,
          correctAnswer: `Only one ingredient was scaled, so the ratio changed. Both ingredients must be multiplied by ${factor} to keep the taste balanced.`,
          expectedKeywords: ['both', 'same', 'multiply', 'factor', 'scale', 'one', 'ratio', 'taste', 'balance'],
          explanation: `Changing only ${rec.aName} breaks the original ${rec.a} : ${rec.b} ratio. Both ingredients need to be multiplied by ${factor} (${ansA} and ${ansB}).`,
          hint: 'Explain what happens when only one ingredient changes instead of scaling both by the same factor.',
          stepByStepSupport: [
            `${rec.aName} was multiplied by ${factor}.`,
            `${rec.bName} must also be multiplied by ${factor} to keep the ratio unchanged.`,
          ],
          extraExample: 'Example: Doubling flour without doubling sugar makes cookies taste plain.',
          source: 'generated',
        };
      }

      const mathCheck: MathCheckSpec = { kind: 'scale_pair', a: rec.a, b: rec.b, factor };
      if (preferredType === 'numerical' || preferredType === 'fill_blank') {
        const servingsBase = 2;
        const servingsTarget = servingsBase * factor;
        const useServingsPrompt = preferredConcept === 'recipe_scaling' || seed % 2 === 0;
        return {
          id: makeId('q_ch3'),
          chapterId,
          conceptTag: 'recipe_scaling',
          conceptLabel: 'Scaling recipes by servings',
          questionText: useServingsPrompt
            ? `${rec.article} ${rec.dish} recipe for ${servingsBase} servings uses ${rec.a} ${rec.aName} and ${rec.b} ${rec.bName}. How many ${rec.bName} do you need for ${servingsTarget} servings?`
            : `${rec.article} ${rec.dish} recipe uses ${rec.a} ${rec.aName} and ${rec.b} ${rec.bName}. If you use ${ansA} ${rec.aName}, how many ${rec.bName} keep the recipe balanced?`,
          questionType: preferredType,
          difficulty,
          correctAnswer: `${ansB}`,
          acceptableAnswers: [`${ansB}`, `${ansB} ${rec.bName}`],
          unitLabel: rec.bName,
          explanation: `The recipe is scaled by ${factor}, so multiply ${rec.b} by ${factor}: ${rec.b} x ${factor} = ${ansB} ${rec.bName}.`,
          hint: `First find the multiplier (${factor}), then multiply ${rec.b} ${rec.bName} by ${factor}.`,
          stepByStepSupport: [
            useServingsPrompt
              ? `Servings multiplier: ${servingsTarget} / ${servingsBase} = ${factor}.`
              : `Ingredient multiplier: ${ansA} / ${rec.a} = ${factor}.`,
            `Multiply ${rec.b} by ${factor} = ${ansB} ${rec.bName}.`,
          ],
          extraExample: 'Example: Tripling 2 eggs and 3 cups of milk gives 6 eggs and 9 cups of milk.',
          mathCheck,
          source: 'generated',
        };
      }

      const correct = `${ansA} ${rec.aName} and ${ansB} ${rec.bName}`;
      return {
        id: makeId('q_ch3'),
        chapterId,
        conceptTag: 'recipe_scaling',
        conceptLabel: 'Scaling all ingredients',
        questionText: `${rec.article} ${rec.dish} recipe uses ${rec.a} ${rec.aName} and ${rec.b} ${rec.bName}. What amounts are needed for ${factor} times the recipe?`,
        questionType: 'mcq',
        difficulty,
        options: buildMCQOptions(
          correct,
          [
            {
              value: `${ansA} ${rec.aName} and ${rec.b} ${rec.bName}`,
              mistakeHint: `Remember to multiply BOTH ingredients by ${factor}, not only ${rec.aName}.`,
            },
            {
              value: `${rec.a + factor} ${rec.aName} and ${rec.b + factor} ${rec.bName}`,
              mistakeHint: `Scaling a recipe by ${factor} means multiplying each amount by ${factor}, not adding ${factor}.`,
            },
            {
              value: `${ansB} ${rec.aName} and ${ansA} ${rec.bName}`,
              mistakeHint: 'Check which scaled number matches each ingredient.',
            },
          ],
          seed
        ),
        correctAnswer: correct,
        explanation: `Multiply both ${rec.a} and ${rec.b} by ${factor}: ${ansA} ${rec.aName} and ${ansB} ${rec.bName}.`,
        hint: `Multiply each ingredient amount by ${factor}.`,
        stepByStepSupport: [
          `${rec.a} x ${factor} = ${ansA} ${rec.aName}.`,
          `${rec.b} x ${factor} = ${ansB} ${rec.bName}.`,
        ],
        extraExample: 'Example: Doubling 1 cup oats and 2 cups milk gives 2 cups oats and 4 cups milk.',
        source: 'generated',
      };
    }

    case 'ch4': {
      const kmPerCm = 3 + (seed % 5);
      const mapCm = difficulty === 'Easy' ? 2 + (seed % 3) : 4 + (seed % 5);
      const actualKm = kmPerCm * mapCm;

      if (preferredType === 'short_answer') {
        return {
          id: makeId('q_ch4'),
          chapterId,
          conceptTag: 'map_reasoning',
          conceptLabel: 'Understanding map scales',
          questionText: `A map scale is 1 cm = ${kmPerCm} km. Explain how you know that ${mapCm} cm on the map represents ${actualKm} km rather than ${mapCm + kmPerCm} km.`,
          questionType: 'short_answer',
          difficulty,
          correctAnswer: `Every 1 cm equals ${kmPerCm} km, so you multiply ${mapCm} by ${kmPerCm} to get ${actualKm} km instead of adding.`,
          expectedKeywords: ['multiply', 'each', 'every', 'group', 'times', `${kmPerCm}`, `${actualKm}`],
          explanation: `Each centimeter stands for ${kmPerCm} km, so ${mapCm} centimeters means ${mapCm} groups of ${kmPerCm} km (${mapCm} x ${kmPerCm} = ${actualKm} km).`,
          hint: 'Think about how many kilometers each single centimeter stands for.',
          stepByStepSupport: [
            `1 cm = ${kmPerCm} km.`,
            `Multiply ${mapCm} cm x ${kmPerCm} km/cm = ${actualKm} km.`,
          ],
          extraExample: 'Example: If 1 cm = 5 km, then 3 cm is 5 + 5 + 5 = 3 x 5 = 15 km.',
          source: 'generated',
        };
      }

      if (difficulty === 'Hard' && (preferredType === 'numerical' || preferredType === 'fill_blank') && seed % 2 === 1) {
        return {
          id: makeId('q_ch4'),
          chapterId,
          conceptTag: 'map_reverse',
          conceptLabel: 'Finding map distance',
          questionText: `A trail map has a scale of 1 cm = ${kmPerCm} km. Two viewpoints are ${actualKm} km apart in real life. How many cm apart are they on the map?`,
          questionType: preferredType,
          difficulty,
          correctAnswer: `${mapCm}`,
          acceptableAnswers: [`${mapCm}`, `${mapCm} cm`],
          unitLabel: 'cm',
          explanation: `Every 1 cm covers ${kmPerCm} km, so divide ${actualKm} km by ${kmPerCm} to get ${mapCm} cm.`,
          hint: `Since we want centimeters on paper from real kilometers, divide ${actualKm} by ${kmPerCm}.`,
          stepByStepSupport: [
            `Scale: 1 cm = ${kmPerCm} km.`,
            `Divide real distance by ${kmPerCm}: ${actualKm} / ${kmPerCm} = ${mapCm} cm.`,
          ],
          extraExample: 'Example: If 1 cm = 4 km, then 20 km is 20 / 4 = 5 cm on the map.',
          source: 'generated',
        };
      }

      const mathCheck: MathCheckSpec = { kind: 'map_distance', a: mapCm, b: 1, factor: kmPerCm };
      if (preferredType === 'numerical' || preferredType === 'fill_blank') {
        const useTwoCm = difficulty === 'Medium';
        const shownKm = kmPerCm * 2;
        return {
          id: makeId('q_ch4'),
          chapterId,
          conceptTag: 'map_distance',
          conceptLabel: 'Calculating real distance',
          questionText: useTwoCm
            ? `A park map shows 2 cm = ${shownKm} km. What real distance (in km) does ${mapCm} cm represent?`
            : `A town map uses 1 cm = ${kmPerCm} km. Two stations are ${mapCm} cm apart on the map. What is the real distance in km?`,
          questionType: preferredType,
          difficulty,
          correctAnswer: `${actualKm}`,
          acceptableAnswers: [`${actualKm}`, `${actualKm} km`],
          unitLabel: 'km',
          explanation: useTwoCm
            ? `First find 1 cm: ${shownKm} / 2 = ${kmPerCm} km. Then ${mapCm} x ${kmPerCm} = ${actualKm} km.`
            : `Each 1 cm equals ${kmPerCm} km, so ${mapCm} x ${kmPerCm} = ${actualKm} km.`,
          hint: useTwoCm
            ? `Find 1 cm first (${shownKm} / 2), then multiply by ${mapCm}.`
            : `Multiply ${mapCm} cm by ${kmPerCm} km.`,
          stepByStepSupport: useTwoCm
            ? [`2 cm = ${shownKm} km -> 1 cm = ${kmPerCm} km.`, `${mapCm} x ${kmPerCm} = ${actualKm} km.`]
            : [`1 cm = ${kmPerCm} km.`, `${mapCm} x ${kmPerCm} = ${actualKm} km.`],
          extraExample: 'Example: On a 1 cm = 6 km map, 3 cm equals 3 x 6 = 18 km.',
          mathCheck,
          source: 'generated',
        };
      }

      const correct = `${actualKm} km`;
      return {
        id: makeId('q_ch4'),
        chapterId,
        conceptTag: 'map_distance',
        conceptLabel: 'Reading map scales',
        questionText: `On a cycling map, 1 cm = ${kmPerCm} km. A path measures ${mapCm} cm on the map. How long is the real path?`,
        questionType: 'mcq',
        difficulty,
        options: buildMCQOptions(
          correct,
          [
            {
              value: `${mapCm + kmPerCm} km`,
              mistakeHint: `Instead of adding ${mapCm} + ${kmPerCm}, multiply because each of the ${mapCm} centimeters stands for ${kmPerCm} km.`,
            },
            {
              value: `${kmPerCm} km`,
              mistakeHint: `${kmPerCm} km is only for 1 cm. Multiply by ${mapCm} cm.`,
            },
            {
              value: `${actualKm + kmPerCm} km`,
              mistakeHint: `Check ${mapCm} x ${kmPerCm} again.`,
            },
          ],
          seed
        ),
        correctAnswer: correct,
        explanation: `${mapCm} cm on the map equals ${mapCm} x ${kmPerCm} = ${actualKm} km.`,
        hint: `Multiply ${mapCm} by ${kmPerCm}.`,
        stepByStepSupport: [`1 cm = ${kmPerCm} km.`, `${mapCm} x ${kmPerCm} = ${actualKm} km.`],
        extraExample: 'Example: 2 cm on a 1 cm = 8 km map is 16 km.',
        mathCheck,
        source: 'generated',
      };
    }

    case 'ch5':
    default: {
      if (preferredType === 'short_answer') {
        const kmPerCm = 3 + (seed % 4);
        return {
          id: makeId('q_ch5'),
          chapterId,
          conceptTag: 'mixed_reasoning',
          conceptLabel: 'Connecting recipes and maps',
          questionText: `How is scaling a recipe (like doubling 2 : 3 to 4 : 6) similar to using a map scale (like 1 cm = ${kmPerCm} km so 2 cm = ${kmPerCm * 2} km)?`,
          questionType: 'short_answer',
          difficulty,
          correctAnswer: `Both keep the same ratio by multiplying every quantity by the same factor.`,
          expectedKeywords: ['multiply', 'same', 'factor', 'scale', 'ratio', 'equal', 'proportion'],
          explanation: `Recipes and maps both rely on proportional scaling: multiplying all quantities by the same factor keeps the relationship unchanged.`,
          hint: 'Focus on what mathematical operation keeps both recipes and map scales accurate.',
          stepByStepSupport: [
            'In recipes, multiplying every ingredient by 2 keeps the taste identical.',
            'On maps, multiplying both cm and km by 2 keeps the scale accurate.',
          ],
          extraExample: 'Both use multiplication by the same scale factor.',
          source: 'generated',
        };
      }

      if (difficulty === 'Hard' && (preferredType === 'numerical' || preferredType === 'fill_blank')) {
        const flourBase = 2;
        const muffinsBase = 6;
        const muffinsTarget = 15;
        const ansFlour = 5;
        return {
          id: makeId('q_ch5'),
          chapterId,
          conceptTag: 'unit_rate_mixed',
          conceptLabel: 'Unit-rate scaling',
          questionText: `A bakery uses ${flourBase} cups of flour to make ${muffinsBase} muffins. How many cups of flour are needed to make ${muffinsTarget} muffins?`,
          questionType: preferredType,
          difficulty,
          correctAnswer: `${ansFlour}`,
          acceptableAnswers: [`${ansFlour}`, `${ansFlour} cups`],
          unitLabel: 'cups',
          explanation: `${flourBase} cups make ${muffinsBase} muffins, so 1 cup makes 3 muffins. For ${muffinsTarget} muffins, you need ${muffinsTarget} / 3 = ${ansFlour} cups.`,
          hint: `First find how many muffins 1 cup of flour makes (${muffinsBase} / ${flourBase} = 3).`,
          stepByStepSupport: [
            `1 cup makes ${muffinsBase} / ${flourBase} = 3 muffins.`,
            `Divide ${muffinsTarget} by 3 = ${ansFlour} cups.`,
          ],
          extraExample: 'Example: If 2 lemons make 4 glasses (1 lemon per 2 glasses), 10 glasses need 5 lemons.',
          source: 'generated',
        };
      }

      if (seed % 2 === 0) {
        const kmPerCm = 4 + (seed % 4);
        const mapCm = 3 + (seed % 4);
        const actualKm = kmPerCm * mapCm;
        const mathCheck: MathCheckSpec = { kind: 'map_distance', a: mapCm, b: 1, factor: kmPerCm };
        if (preferredType === 'numerical' || preferredType === 'fill_blank') {
          return {
            id: makeId('q_ch5'),
            chapterId,
            conceptTag: 'map_mixed',
            conceptLabel: 'Map distance problem',
            questionText: `On a hiking map, 1 cm = ${kmPerCm} km. A trail is ${mapCm} cm long on the map. What is the real trail distance in km?`,
            questionType: preferredType,
            difficulty,
            correctAnswer: `${actualKm}`,
            acceptableAnswers: [`${actualKm}`, `${actualKm} km`],
            unitLabel: 'km',
            explanation: `Multiply ${mapCm} cm by ${kmPerCm} km per cm to get ${actualKm} km.`,
            hint: `Multiply ${mapCm} by ${kmPerCm}.`,
            stepByStepSupport: [`1 cm = ${kmPerCm} km.`, `${mapCm} x ${kmPerCm} = ${actualKm} km.`],
            extraExample: 'Example: 5 cm on a 1 cm = 3 km map equals 15 km.',
            mathCheck,
            source: 'generated',
          };
        }

        const correct = `${actualKm} km`;
        return {
          id: makeId('q_ch5'),
          chapterId,
          conceptTag: 'map_mixed',
          conceptLabel: 'Map distance problem',
          questionText: `A map scale is 1 cm = ${kmPerCm} km. What actual distance does ${mapCm} cm represent?`,
          questionType: 'mcq',
          difficulty,
          options: buildMCQOptions(
            correct,
            [
              {
                value: `${mapCm + kmPerCm} km`,
                mistakeHint: `Multiply ${mapCm} by ${kmPerCm} rather than adding them.`,
              },
              {
                value: `${kmPerCm} km`,
                mistakeHint: `Remember to multiply by all ${mapCm} cm.`,
              },
              {
                value: `${actualKm + 4} km`,
                mistakeHint: `Recalculate ${mapCm} x ${kmPerCm}.`,
              },
            ],
            seed
          ),
          correctAnswer: correct,
          explanation: `${mapCm} x ${kmPerCm} = ${actualKm} km.`,
          hint: `Multiply ${mapCm} by ${kmPerCm}.`,
          stepByStepSupport: [`${mapCm} cm x ${kmPerCm} km/cm = ${actualKm} km.`],
          extraExample: 'Example: 4 cm at 1 cm = 5 km is 20 km.',
          mathCheck,
          source: 'generated',
        };
      }

      const unitPairs = [
        { aLabel: '500 ml of juice', bLabel: '1 L of water', a: 500, b: 1000, note: '1 L = 1000 ml' },
        { aLabel: '250 g of sugar', bLabel: '1 kg of flour', a: 250, b: 1000, note: '1 kg = 1000 g' },
        { aLabel: '40 cm of ribbon', bLabel: '2 m of ribbon', a: 40, b: 200, note: '1 m = 100 cm' },
      ];
      const up = unitPairs[seed % unitPairs.length];
      const g = gcd(up.a, up.b);
      const simpA = up.a / g;
      const simpB = up.b / g;
      const mathCheck: MathCheckSpec = { kind: 'simplify_ratio', a: up.a, b: up.b };

      if (preferredType === 'fill_blank') {
        return {
          id: makeId('q_ch5'),
          chapterId,
          conceptTag: 'unit_conversion',
          conceptLabel: 'Matching units in ratios',
          questionText: `Convert to the same unit (${up.note}) and write the simplest ratio of ${up.aLabel} to ${up.bLabel} (like 1:2).`,
          questionType: 'fill_blank',
          difficulty,
          correctAnswer: `${simpA}:${simpB}`,
          acceptableAnswers: [`${simpA}:${simpB}`, `${simpA} : ${simpB}`],
          explanation: `Using ${up.note}, the ratio is ${up.a} : ${up.b}. Dividing both by ${g} gives ${simpA} : ${simpB}.`,
          hint: `First convert both measurements using ${up.note}.`,
          stepByStepSupport: [
            `Convert using ${up.note}: ${up.a} : ${up.b}.`,
            `Divide both by ${g} -> ${simpA} : ${simpB}.`,
          ],
          extraExample: 'Example: 200 ml to 1 L is 200 : 1000, which simplifies to 1 : 5.',
          mathCheck,
          source: 'generated',
        };
      }

      const correct = `${simpA} : ${simpB}`;
      return {
        id: makeId('q_ch5'),
        chapterId,
        conceptTag: 'unit_conversion',
        conceptLabel: 'Matching units in ratios',
        questionText: `What is the simplest ratio of ${up.aLabel} to ${up.bLabel}? (${up.note})`,
        questionType: 'mcq',
        difficulty,
        options: buildMCQOptions(
          correct,
          [
            {
              value: `${up.a} : ${up.b / 1000}`,
              mistakeHint: `Match the units first (${up.note}) before writing the ratio.`,
            },
            {
              value: `${simpB} : ${simpA}`,
              mistakeHint: `Keep ${up.aLabel} on the left and ${up.bLabel} on the right.`,
            },
            {
              value: `${simpA} : ${simpB + 1}`,
              mistakeHint: `Divide both ${up.a} and ${up.b} by ${g}.`,
            },
          ],
          seed
        ),
        correctAnswer: correct,
        explanation: `Convert to ${up.a} : ${up.b}, then divide both by ${g} to get ${correct}.`,
        hint: `Convert both into the same unit using ${up.note}, then simplify.`,
        stepByStepSupport: [
          `${up.a} : ${up.b}.`,
          `Divide both by ${g}: ${correct}.`,
        ],
        extraExample: 'Example: 50 cm to 1 m is 50 : 100, which simplifies to 1 : 2.',
        mathCheck,
        source: 'generated',
      };
    }
  }
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  feedbackTitle: string;
  feedbackMessage: string;
  correctApproach: string;
  extraExample: string;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function extractNumbers(value: string): number[] {
  const matches = value.match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

export function evaluateAnswer(
  question: PracticeQuestion,
  rawLearnerAnswer: string
): AnswerEvaluation {
  const cleaned = rawLearnerAnswer.trim();

  if (question.questionType === 'mcq') {
    const matchedOpt = question.options?.find(
      (o) => normalizeText(o.value) === normalizeText(cleaned)
    );
    const isCorrect =
      normalizeText(cleaned) === normalizeText(question.correctAnswer);

    if (isCorrect) {
      return {
        isCorrect: true,
        feedbackTitle: 'That is right',
        feedbackMessage: question.explanation,
        correctApproach: question.explanation,
        extraExample: question.extraExample,
      };
    }

    return {
      isCorrect: false,
      feedbackTitle: 'Not quite yet',
      feedbackMessage:
        matchedOpt?.mistakeHint ||
        'Take another look at how the numbers in the question relate to each other.',
      correctApproach: question.explanation,
      extraExample: question.extraExample,
    };
  }

  if (question.questionType === 'short_answer') {
    const lower = cleaned.toLowerCase();
    const keywords = question.expectedKeywords ?? [];
    const matched = keywords.filter((kw) => lower.includes(kw.toLowerCase()));
    const hasReasonableLength = cleaned.length >= 12;
    const isCorrect = hasReasonableLength && matched.length >= 2;

    if (isCorrect) {
      return {
        isCorrect: true,
        feedbackTitle: 'Clear explanation',
        feedbackMessage: question.explanation,
        correctApproach: question.explanation,
        extraExample: question.extraExample,
      };
    }

    let mistakeHint =
      'Try naming the key rule clearly in one or two short sentences, such as multiplying both sides by the same factor.';
    if (cleaned.length < 12) {
      mistakeHint =
        'Write a short sentence explaining why, rather than only one or two words.';
    } else if (
      lower.includes('add') &&
      !lower.includes('not') &&
      !lower.includes('instead') &&
      !lower.includes('multiply')
    ) {
      mistakeHint =
        'Be careful: adding changes the balance. Explain why multiplying or dividing both quantities equally keeps the ratio the same.';
    }

    return {
      isCorrect: false,
      feedbackTitle: 'Let us strengthen that explanation',
      feedbackMessage: mistakeHint,
      correctApproach: question.explanation,
      extraExample: question.extraExample,
    };
  }

  const acceptable = question.acceptableAnswers ?? [question.correctAnswer];
  const normInput = normalizeText(cleaned);
  let isCorrect = acceptable.some((acc) => normalizeText(acc) === normInput);

  if (!isCorrect && question.questionType === 'numerical') {
    const expectedNum = Number(
      String(question.correctAnswer).replace(/[^0-9.-]/g, '')
    );
    const givenNums = extractNumbers(cleaned);
    if (
      Number.isFinite(expectedNum) &&
      givenNums.length === 1 &&
      Math.abs(givenNums[0] - expectedNum) < 0.01
    ) {
      isCorrect = true;
    }
  }

  if (isCorrect) {
    return {
      isCorrect: true,
      feedbackTitle: 'That matches',
      feedbackMessage: question.explanation,
      correctApproach: question.explanation,
      extraExample: question.extraExample,
    };
  }

  const givenNums = extractNumbers(cleaned);
  const expectedNums = extractNumbers(question.correctAnswer);
  let gentleHint =
    'Check the relationship between the numbers in the question and try again.';

  if (
    expectedNums.length === 2 &&
    givenNums.length === 2 &&
    givenNums[0] === expectedNums[1] &&
    givenNums[1] === expectedNums[0]
  ) {
    gentleHint =
      'Your numbers are right, just in the opposite order. Check which item is named first.';
  } else if (
    question.mathCheck?.kind === 'map_distance' &&
    question.mathCheck.factor !== undefined
  ) {
    const sumAttempt = question.mathCheck.a + question.mathCheck.factor;
    if (givenNums.length === 1 && Math.abs(givenNums[0] - sumAttempt) < 0.01) {
      gentleHint = `It looks like you added ${question.mathCheck.a} + ${question.mathCheck.factor}. With map scales, multiply instead because each centimeter equals ${question.mathCheck.factor} km.`;
    }
  } else if (
    (question.mathCheck?.kind === 'scale_pair' ||
      question.mathCheck?.kind === 'missing_value') &&
    question.mathCheck.factor !== undefined
  ) {
    const mc = question.mathCheck;
    const factor = question.mathCheck.factor;
    const diff = mc.a * factor - mc.a;
    if (givenNums.length === 1 && Math.abs(givenNums[0] - (mc.b + diff)) < 0.01) {
      gentleHint =
        'It looks like the same number was added instead of multiplying. Multiply both quantities by the same factor.';
    } else if (givenNums.length === 1 && Math.abs(givenNums[0] - mc.b) < 0.01) {
      gentleHint =
        'Remember to multiply this second quantity by the same factor too, so the ratio stays balanced.';
    }
  }

  return {
    isCorrect: false,
    feedbackTitle: 'Not quite yet',
    feedbackMessage: gentleHint,
    correctApproach: question.explanation,
    extraExample: question.extraExample,
  };
}
