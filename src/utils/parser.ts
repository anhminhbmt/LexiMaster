import type { VocabItem, QuizQuestionType, UnifiedQuizQuestion } from '../types.ts';

/**
 * Parses raw text input into array of word & meaning pairs (with optional topic header detection).
 * Supports:
 * - "UNIT 1: NUMBERS (Số đếm)" header lines
 * - "word - meaning"
 * - "word : meaning"
 * - "word = meaning"
 * - "word \t meaning"
 * - "word, meaning"
 * - "1. word - meaning" / "1) word : meaning" / "- word: meaning"
 */
export function parseVocabText(rawText: string, defaultTopic?: string): Array<{ word: string; meaning: string; topic?: string }> {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/);
  const results: Array<{ word: string; meaning: string; topic?: string }> = [];
  const seen = new Set<string>();
  let currentTopic = defaultTopic;

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    // Detect UNIT header lines like "UNIT 1: NUMBERS (Số đếm)"
    if (/^UNIT\s+\d+/i.test(line)) {
      currentTopic = line;
      continue;
    }

    // Remove leading bullet points, numbers e.g. "1. ", "12) ", "- ", "• "
    line = line.replace(/^(\d+[\.\)]|\-|\*|•)\s*/, '').trim();
    if (!line) continue;

    // Detect separator: prioritize tab, " - ", " : ", " = ", then ":", "-", "=", ",", ";"
    let word = '';
    let meaning = '';

    if (line.includes('\t')) {
      const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        word = parts[0];
        meaning = parts.slice(1).join(' - ');
      }
    } else {
      // Look for explicit delimiters with spaces or standard separators
      const delimiterRegex = /\s*(?:–|—|-|:|=|;)\s*|\t+/;
      const match = line.search(delimiterRegex);
      if (match !== -1) {
        const parts = line.split(delimiterRegex);
        if (parts.length >= 2) {
          word = parts[0].trim();
          meaning = parts.slice(1).join('; ').trim();
        }
      } else if (line.includes(',')) {
        // Fallback to comma if no dash or colon
        const commaIdx = line.indexOf(',');
        word = line.substring(0, commaIdx).trim();
        meaning = line.substring(commaIdx + 1).trim();
      }
    }

    // Clean quotes or bracket artifacts
    word = word.replace(/^["']|["']$/g, '').trim();
    meaning = meaning.replace(/^["']|["']$/g, '').trim();

    if (word && meaning) {
      const key = `${(currentTopic || '').toLowerCase()}:::${word.toLowerCase()}:::${meaning.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ word, meaning, ...(currentTopic ? { topic: currentTopic } : {}) });
      }
    }
  }

  return results;
}

/**
 * Normalizes text for comparison (trims spaces, removes excessive whitespace, lowercases)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein Distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Extracts candidate valid answers from a target string that may contain:
 * - slashes: "Football / Soccer" -> ["football / soccer", "football", "soccer"]
 * - parentheses: "PE (Physical Education)" -> ["pe physical education", "pe", "physical education"]
 */
export function extractAcceptableTargets(targetAnswer: string, isVietnamese: boolean): string[] {
  const candidates = new Set<string>();
  const fullNorm = normalizeText(targetAnswer);
  if (fullNorm) candidates.add(fullNorm);

  // Without parenthetical content e.g. "Short (hair)" -> "Short"
  const withoutParens = normalizeText(targetAnswer.replace(/\([^)]*\)/g, ' '));
  if (withoutParens) candidates.add(withoutParens);

  // Inside parentheses if substantial e.g. "PE (Physical Education)" -> "Physical Education"
  const parenMatches = targetAnswer.match(/\(([^)]+)\)/g);
  if (parenMatches) {
    for (const pm of parenMatches) {
      const inner = normalizeText(pm.slice(1, -1));
      if (inner && inner.length >= 2) {
        candidates.add(inner);
      }
    }
  }

  // Split by slash, semicolon, or comma (for Vietnamese or slash-separated English variants)
  const separatorRegex = isVietnamese ? /[,;/]/ : /\//;
  const parts = targetAnswer.split(separatorRegex);
  for (const part of parts) {
    const normPart = normalizeText(part);
    if (normPart) candidates.add(normPart);
    const normPartNoParens = normalizeText(part.replace(/\([^)]*\)/g, ' '));
    if (normPartNoParens) candidates.add(normPartNoParens);
  }

  return Array.from(candidates);
}

/**
 * Checks typing match for accuracy.
 * Handles exact match, slash/parenthesis alternatives, case-insensitivity, and close matches.
 */
export function checkTypingMatch(
  userInput: string,
  targetAnswer: string,
  isVietnamese: boolean = false
): { isExact: boolean; isClose: boolean; distance: number; similarity: number } {
  const normUser = normalizeText(userInput);
  const normTarget = normalizeText(targetAnswer);

  if (!normUser) {
    return { isExact: false, isClose: false, distance: normTarget.length, similarity: 0 };
  }

  const acceptableTargets = extractAcceptableTargets(targetAnswer, isVietnamese);

  for (const candidate of acceptableTargets) {
    if (normUser === candidate) {
      return { isExact: true, isClose: true, distance: 0, similarity: 1 };
    }
  }

  // Partial / close check for Vietnamese meanings
  if (isVietnamese) {
    for (const opt of acceptableTargets) {
      if (opt.length >= 3 && (normUser.includes(opt) || opt.includes(normUser))) {
        return { isExact: false, isClose: true, distance: 1, similarity: 0.85 };
      }
    }
  }

  // Compute best Levenshtein distance across all acceptable target variants
  let bestDist = Infinity;
  let bestSim = 0;
  let bestClose = false;

  for (const candidate of acceptableTargets) {
    const maxLen = Math.max(normUser.length, candidate.length);
    if (maxLen === 0) continue;
    const dist = levenshteinDistance(normUser, candidate);
    const similarity = 1 - dist / maxLen;
    const isClose =
      (maxLen <= 4 && dist <= 1) ||
      (maxLen > 4 && maxLen <= 8 && dist <= 1) ||
      (maxLen > 8 && dist <= 2) ||
      similarity >= 0.75;

    if (similarity > bestSim) {
      bestSim = similarity;
      bestDist = dist;
    }
    if (isClose) {
      bestClose = true;
    }
  }

  return {
    isExact: false,
    isClose: bestClose,
    distance: bestDist === Infinity ? normTarget.length : bestDist,
    similarity: Math.max(0, Math.min(1, bestSim)),
  };
}

/**
 * Shuffles an array with Fisher-Yates
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates options for Multiple Choice Quiz
 * IMPORTANT RULE: Distractor options MUST be picked exclusively from user's other words!
 */
export function generateMultipleChoiceOptions(
  targetItem: VocabItem,
  allItems: VocabItem[],
  mode: 'vn-prompt' | 'en-prompt',
  maxOptions: number = 4
): string[] {
  const isOptionEn = mode === 'vn-prompt';
  const correctAnswer = isOptionEn ? targetItem.word : targetItem.meaning;

  // Prefer distractors from the same topic first if available, then fallback to all user items
  const sameTopicItems = targetItem.topic
    ? allItems.filter(item => item.id !== targetItem.id && item.topic === targetItem.topic)
    : [];
  const otherItems = allItems.filter(item => item.id !== targetItem.id);

  const sourcePool = sameTopicItems.length >= maxOptions - 1 ? sameTopicItems : otherItems;
  const pool = sourcePool
    .map(item => (isOptionEn ? item.word : item.meaning))
    .filter(val => val !== correctAnswer);

  const uniquePool = Array.from(new Set(pool));
  const shuffledPool = shuffleArray(uniquePool);

  const neededDistractors = Math.min(maxOptions - 1, shuffledPool.length);
  const selectedDistractors = shuffledPool.slice(0, neededDistractors);

  const combined = [correctAnswer, ...selectedDistractors];
  return shuffleArray(combined);
}

/**
 * Generates matching pairs from vocab items.
 * Returns shuffled words (Column A) and shuffled meanings (Column B) with matching IDs.
 */
export function generateMatchingBatch(
  items: VocabItem[],
  batchSize: number = 5
): {
  words: Array<{ id: string; text: string }>;
  meanings: Array<{ id: string; text: string }>;
} {
  const selected = shuffleArray(items).slice(0, batchSize);
  const words = shuffleArray(selected.map(item => ({ id: item.id, text: item.word })));
  const meanings = shuffleArray(selected.map(item => ({ id: item.id, text: item.meaning })));

  return { words, meanings };
}

/**
 * Generates a unified queue of quiz questions containing any combination of the 4 question types.
 * Enables mixed exams ("1 bài làm có cả 4 dạng câu hỏi") with customizable question counts.
 */
export function generateUnifiedQuizQueue(
  items: VocabItem[],
  allowedTypes: QuizQuestionType[],
  totalQuestions: number
): UnifiedQuizQuestion[] {
  if (items.length === 0 || allowedTypes.length === 0 || totalQuestions <= 0) return [];

  const pool = shuffleArray(items);
  const questions: UnifiedQuizQuestion[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    const item = pool[i % pool.length];
    const type = allowedTypes[i % allowedTypes.length];

    let options: string[] | undefined = undefined;
    let matchingItems: VocabItem[] | undefined = undefined;

    if (type === 'multiple-choice') {
      options = generateMultipleChoiceOptions(item, items, 'vn-prompt', 4);
    } else if (type === 'matching') {
      const batchCount = Math.min(items.length, 4);
      const sameTopicOthers = item.topic
        ? items.filter(x => x.id !== item.id && x.topic === item.topic)
        : [];
      const candidateOthers = sameTopicOthers.length >= batchCount - 1
        ? sameTopicOthers
        : items.filter(x => x.id !== item.id);
      const others = shuffleArray(candidateOthers).slice(0, batchCount - 1);
      matchingItems = shuffleArray([item, ...others]);
    }

    questions.push({
      id: `q-${i + 1}-${item.id}-${type}`,
      type,
      item,
      options,
      matchingItems,
    });
  }

  return questions;
}
