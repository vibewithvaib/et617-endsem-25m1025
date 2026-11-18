import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTERS,
  LEARNING_STEPS,
  MASTERY_PASS_SCORE,
  createInitialLearnerState,
} from './chapters';
import { applyMasteryOutcome } from './storage';
import {
  buildGuidedPracticeSet,
  buildIndependentPracticeSet,
  buildMasteryCheckSet,
  evaluateAnswer,
  generateLocalQuestion,
  validateQuestion,
} from './questionGenerator';
import {
  appendInteractionLog,
  buildInteractionLogExport,
  createInteractionLog,
} from './logger';

test('initial state has 5 chapters with ch1 available and ch2-ch5 locked', () => {
  assert.equal(CHAPTERS.length, 5);
  assert.equal(LEARNING_STEPS.length, 6);
  const state = createInitialLearnerState();
  assert.equal(state.chapters.ch1.status, 'available');
  assert.equal(state.chapters.ch2.status, 'locked');
  assert.equal(state.chapters.ch3.status, 'locked');
  assert.equal(state.chapters.ch4.status, 'locked');
  assert.equal(state.chapters.ch5.status, 'locked');
});

test('local generator builds valid questions for guided, independent, and mastery sets across all 5 chapters', () => {
  for (const ch of CHAPTERS) {
    const guided = buildGuidedPracticeSet(ch.id);
    const independent = buildIndependentPracticeSet(ch.id);
    const mastery = buildMasteryCheckSet(ch.id);

    assert.equal(guided.length, 3);
    assert.equal(independent.length, 3);
    assert.equal(mastery.length, 5);

    const hasShortAnswerInMastery = mastery.some(
      (q) => q.questionType === 'short_answer'
    );
    assert.equal(
      hasShortAnswerInMastery,
      true,
      `${ch.id} mastery check must include a reasoning/understanding question`
    );

    if (ch.id === 'ch3') {
      assert.equal(
        mastery.some((q) => q.conceptTag === 'recipe_scaling'),
        true,
        'ch3 mastery check must include a recipe scaling application question'
      );
    }

    if (ch.id === 'ch4') {
      assert.equal(
        mastery.some((q) => q.conceptTag === 'map_distance'),
        true,
        'ch4 mastery check must include a map distance application question'
      );
    }

    for (const q of [...guided, ...independent, ...mastery]) {
      assert.equal(validateQuestion(q), true, `Invalid question in ${ch.id}`);
      assert.equal(q.questionText.includes('—'), false);
      assert.equal(q.explanation.includes('—'), false);
    }
  }
});

test('evaluates all 4 question formats and diagnoses specific mistakes', () => {
  const numQ = generateLocalQuestion({
    chapterId: 'ch4',
    difficulty: 'Easy',
    preferredType: 'numerical',
    seedOffset: 2,
  });
  assert.equal(evaluateAnswer(numQ, `${numQ.correctAnswer} km`).isCorrect, true);
  assert.equal(evaluateAnswer(numQ, '9999').isCorrect, false);

  const fillQ = generateLocalQuestion({
    chapterId: 'ch1',
    difficulty: 'Medium',
    preferredType: 'fill_blank',
    preferredConcept: 'ratio_order',
    seedOffset: 1,
  });
  const [left, right] = fillQ.correctAnswer.split(':');
  const reversed = evaluateAnswer(fillQ, `${right}:${left}`);
  assert.equal(reversed.isCorrect, false);
  assert.match(reversed.feedbackMessage.toLowerCase(), /opposite order|first/);

  const shortQ = generateLocalQuestion({
    chapterId: 'ch3',
    difficulty: 'Medium',
    preferredType: 'short_answer',
    seedOffset: 3,
  });
  const goodShort = evaluateAnswer(
    shortQ,
    'Because both ingredients must be multiplied by the same factor to keep the ratio balanced.'
  );
  assert.equal(goodShort.isCorrect, true);

  const weakShort = evaluateAnswer(shortQ, 'bad');
  assert.equal(weakShort.isCorrect, false);
});

test('rule-based mastery check requires 4/5 to complete chapter and unlock the next one', () => {
  let state = createInitialLearnerState();

  // Failing mastery (< 4/5) keeps ch2 locked
  const failed = applyMasteryOutcome(state, 'ch1', false);
  assert.equal(failed.unlockedChapterId, null);
  assert.equal(failed.nextState.chapters.ch1.status, 'in_progress');
  assert.equal(failed.nextState.chapters.ch2.status, 'locked');

  // Passing mastery (>= 4/5) marks ch1 completed and unlocks ch2
  assert.equal(MASTERY_PASS_SCORE, 4);
  const passed = applyMasteryOutcome(failed.nextState, 'ch1', true);
  state = passed.nextState;
  assert.equal(passed.unlockedChapterId, 'ch2');
  assert.equal(state.chapters.ch1.status, 'completed');
  assert.equal(state.chapters.ch2.status, 'available');
  assert.equal(state.chapters.ch3.status, 'locked');
});

test('interaction log export records answers, hints, mastery results, and unlock events', () => {
  const state = createInitialLearnerState();
  state.totalTimeSpentSeconds = 240;
  state.sessionElapsedSeconds = 240;
  state.chapters.ch1.status = 'completed';
  state.chapters.ch1.timeSpentSeconds = 240;
  state.chapters.ch1.masteryHistory = [
    {
      attemptNumber: 1,
      score: 4,
      total: 5,
      passed: true,
      weakConcepts: [],
      completedAt: new Date().toISOString(),
    },
  ];

  const logs = [
    createInteractionLog({
      chapterId: 'ch1',
      activity: 'question_presented',
      step: 'guided',
      questionId: 'q1',
      questionText: 'Sample ratio question',
      questionType: 'mcq',
      timeSpentSeconds: 30,
    }),
    createInteractionLog({
      chapterId: 'ch1',
      activity: 'answer_submitted',
      step: 'guided',
      questionId: 'q1',
      questionType: 'mcq',
      learnerAnswer: '2 : 3',
      isCorrect: true,
      attemptNumber: 1,
      hintsUsed: 1,
      timeSpentSeconds: 45,
    }),
    createInteractionLog({
      chapterId: 'ch1',
      activity: 'mastery_completed',
      step: 'mastery',
      masteryScore: '4/5',
      unlockedChapterId: 'ch2',
      timeSpentSeconds: 240,
    }),
  ];

  for (const entry of logs) {
    state.interactionLogs = appendInteractionLog(state.interactionLogs, entry);
  }

  const exported = buildInteractionLogExport(state);
  assert.equal(exported.summary.chaptersCompleted, 1);
  assert.equal(exported.summary.questionsPresented, 1);
  assert.equal(exported.summary.correctAttempts, 1);
  assert.equal(exported.summary.hintsUsed, 1);
  assert.equal(exported.summary.masteryChecksCompleted, 1);
  assert.equal(exported.interactions[2].unlockedChapterId, 'ch2');
});
