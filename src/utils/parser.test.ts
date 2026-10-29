import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVocabText,
  checkTypingMatch,
  generateMultipleChoiceOptions,
  generateMatchingBatch,
  generateUnifiedQuizQueue,
  levenshteinDistance
} from './parser.ts';
import { CURRICULUM_UNITS, createInitialVocabList } from '../data/starterVocab.ts';
import { getPhonetic } from './phonetics.ts';

test('parseVocabText parses standard hyphen separated lines and UNIT topic headers', () => {
  const input = `
    UNIT 1: NUMBERS (Số đếm)
    one: số 1
    two: số 2
    UNIT 2: TIME (Thời gian)
    midday - Buổi trưa
  `;
  const result = parseVocabText(input);
  assert.equal(result.length, 3);
  assert.equal(result[0].word, 'one');
  assert.equal(result[0].meaning, 'số 1');
  assert.equal(result[0].topic, 'UNIT 1: NUMBERS (Số đếm)');
  assert.equal(result[2].word, 'midday');
  assert.equal(result[2].topic, 'UNIT 2: TIME (Thời gian)');
});

test('parseVocabText handles colon, equals, tabs, and numbered lists', () => {
  const input = `
    1. resilient : kiên cường, bền bỉ
    2) collaborate = hợp tác
    3. ubiquitous\tphổ biến, có mặt khắp nơi
    # this is a comment
    innovative : có tính đổi mới
  `;
  const result = parseVocabText(input);
  assert.equal(result.length, 4);
  assert.equal(result[0].word, 'resilient');
  assert.equal(result[0].meaning, 'kiên cường, bền bỉ');
  assert.equal(result[1].word, 'collaborate');
  assert.equal(result[1].meaning, 'hợp tác');
  assert.equal(result[2].word, 'ubiquitous');
  assert.equal(result[2].meaning, 'phổ biến, có mặt khắp nơi');
  assert.equal(result[3].word, 'innovative');
});

test('levenshteinDistance calculates correctly', () => {
  assert.equal(levenshteinDistance('kitten', 'sitting'), 3);
  assert.equal(levenshteinDistance('apple', 'apple'), 0);
  assert.equal(levenshteinDistance('cat', 'bat'), 1);
});

test('checkTypingMatch handles exact match, slash alternatives, and minor typos', () => {
  // Exact match with whitespace and casing
  const exact = checkTypingMatch('  Hello World ', 'hello world');
  assert.equal(exact.isExact, true);
  assert.equal(exact.isClose, true);

  // Slash alternative in English word e.g. "Football / Soccer"
  const slashMatch1 = checkTypingMatch('Football', 'Football / Soccer', false);
  assert.equal(slashMatch1.isExact, true);
  const slashMatch2 = checkTypingMatch('soccer', 'Football / Soccer', false);
  assert.equal(slashMatch2.isExact, true);

  // Parenthetical clarification e.g. "PE (Physical Education)"
  const parenMatch1 = checkTypingMatch('PE', 'PE (Physical Education)', false);
  assert.equal(parenMatch1.isExact, true);
  const parenMatch2 = checkTypingMatch('Physical Education', 'PE (Physical Education)', false);
  assert.equal(parenMatch2.isExact, true);

  // 1 character typo
  const typo = checkTypingMatch('collaborat', 'collaborate');
  assert.equal(typo.isExact, false);
  assert.equal(typo.isClose, true);

  // Total mismatch
  const mismatch = checkTypingMatch('banana', 'computer');
  assert.equal(mismatch.isExact, false);
  assert.equal(mismatch.isClose, false);
});

test('CURRICULUM_UNITS and createInitialVocabList contain all 42 units starting from UNIT 3 with IPA phonetics and all 13 new Unit 55 words', () => {
  assert.equal(CURRICULUM_UNITS.length, 42);
  const initialList = createInitialVocabList();
  assert.ok(initialList.length >= 460);
  assert.equal(initialList[0].word, 'Monday');
  assert.equal(initialList[0].phonetic, '/ˈmʌn.deɪ/');
  assert.equal(initialList[0].topic, 'UNIT 3: DAYS, DATES & SEASONS (Ngày, Tháng & Mùa)');

  // Verify every single item has a valid IPA phonetic string
  for (const item of initialList) {
    const phonetic = getPhonetic(item.word, item.phonetic);
    assert.ok(phonetic.startsWith('/'), `Missing phonetic slash for ${item.word}: ${phonetic}`);
    assert.ok(phonetic.length >= 3, `Phonetic too short for ${item.word}: ${phonetic}`);
  }

  // Verify the 13 new words in UNIT 54 & 55: HOLIDAY & HOTEL ROOM (Du lịch & Khách sạn)
  const unit55Items = initialList.filter(
    i => i.topic === 'UNIT 54 & 55: HOLIDAY & HOTEL ROOM (Du lịch & Khách sạn)'
  );
  assert.equal(unit55Items.length, 23);

  const expectedUnit55Additions = [
    { word: 'Bed', phonetic: '/bed/', meaning: 'Giường' },
    { word: 'Single bed', phonetic: '/ˈsɪŋ.ɡəl bed/', meaning: 'Giường đơn' },
    { word: 'Double bed', phonetic: '/ˈdʌb.əl bed/', meaning: 'Giường đôi' },
    { word: 'King-size bed', phonetic: '/kɪŋ.saɪz bed/', meaning: 'Giường cỡ lớn (King)' },
    { word: 'Queen-size bed', phonetic: '/kwiːn.saɪz bed/', meaning: 'Giường cỡ vừa (Queen)' },
    { word: 'Pillow', phonetic: '/ˈpɪl.oʊ/', meaning: 'Gối' },
    { word: 'Blanket', phonetic: '/ˈblæŋ.kɪt/', meaning: 'Chăn / mền' },
    { word: 'Sheet', phonetic: '/ʃiːt/', meaning: 'Ga trải giường' },
    { word: 'Wardrobe', phonetic: '/ˈwɔːr.droʊb/', meaning: 'Tủ quần áo' },
    { word: 'Hanger', phonetic: '/ˈhæŋ.ər/', meaning: 'Móc treo quần áo' },
    { word: 'Bedside table', phonetic: '/ˈbed.saɪd ˌteɪ.bəl/', meaning: 'Bàn cạnh giường / Tủ đầu giường' },
    { word: 'Desk', phonetic: '/desk/', meaning: 'Bàn làm việc' },
    { word: 'Chair', phonetic: '/tʃer/', meaning: 'Ghế' },
  ];

  for (const exp of expectedUnit55Additions) {
    const found = unit55Items.find(x => x.word === exp.word);
    assert.ok(found, `Expected ${exp.word} in Unit 55`);
    assert.equal(found.meaning, exp.meaning);
    assert.equal(found.phonetic, exp.phonetic);
  }
});

test('parseVocabText extracts inline IPA phonetic transcriptions when present', () => {
  const input = `
    Bed /bed/: Giường
    King-size bed /kɪŋ.saɪz bed/: Giường cỡ lớn (King)
    Bedside table /ˈbed.saɪd ˌteɪ.bəl/: Bàn cạnh giường / Tủ đầu giường
  `;
  const parsed = parseVocabText(input);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].word, 'Bed');
  assert.equal(parsed[0].phonetic, '/bed/');
  assert.equal(parsed[0].meaning, 'Giường');
  assert.equal(parsed[1].word, 'King-size bed');
  assert.equal(parsed[1].phonetic, '/kɪŋ.saɪz bed/');
  assert.equal(parsed[1].meaning, 'Giường cỡ lớn (King)');
  assert.equal(parsed[2].word, 'Bedside table');
  assert.equal(parsed[2].phonetic, '/ˈbed.saɪd ˌteɪ.bəl/');
  assert.equal(parsed[2].meaning, 'Bàn cạnh giường / Tủ đầu giường');
});

test('generateMultipleChoiceOptions picks distractors EXCLUSIVELY from user list', () => {
  const items = [
    { id: '1', word: 'ephemeral', meaning: 'phù du, chóng tàn', createdAt: 1 },
    { id: '2', word: 'serendipity', meaning: 'sự tình cờ may mắn', createdAt: 2 },
    { id: '3', word: 'eloquent', meaning: 'hùng biện, lưu loát', createdAt: 3 },
    { id: '4', word: 'lucid', meaning: 'rõ ràng, minh bạch', createdAt: 4 },
  ];

  const target = items[0];
  const options = generateMultipleChoiceOptions(target, items, 'vn-prompt', 4);

  // Options must contain the target's word
  assert.ok(options.includes('ephemeral'));
  assert.equal(options.length, 4);

  // Every option must be in the items' words
  const validWords = new Set(items.map(i => i.word));
  for (const opt of options) {
    assert.ok(validWords.has(opt));
  }
});

test('generateMultipleChoiceOptions gracefully handles < 4 items', () => {
  const items = [
    { id: '1', word: 'cat', meaning: 'con mèo', createdAt: 1 },
    { id: '2', word: 'dog', meaning: 'con chó', createdAt: 2 },
  ];

  const target = items[0];
  const options = generateMultipleChoiceOptions(target, items, 'vn-prompt', 4);
  assert.equal(options.length, 2);
  assert.ok(options.includes('cat'));
  assert.ok(options.includes('dog'));
});

test('generateMatchingBatch creates matching pairs with identical IDs', () => {
  const items = [
    { id: '1', word: 'cat', meaning: 'con mèo', createdAt: 1 },
    { id: '2', word: 'dog', meaning: 'con chó', createdAt: 2 },
    { id: '3', word: 'bird', meaning: 'con chim', createdAt: 3 },
  ];

  const batch = generateMatchingBatch(items, 3);
  assert.equal(batch.words.length, 3);
  assert.equal(batch.meanings.length, 3);

  const wordIds = new Set(batch.words.map(w => w.id));
  const meaningIds = new Set(batch.meanings.map(m => m.id));

  assert.deepEqual(Array.from(wordIds).sort(), ['1', '2', '3']);
  assert.deepEqual(Array.from(meaningIds).sort(), ['1', '2', '3']);
});

test('generateUnifiedQuizQueue generates mixed questions with all 4 types and custom count', () => {
  const items = [
    { id: '1', word: 'apple', meaning: 'quả táo', createdAt: 1 },
    { id: '2', word: 'banana', meaning: 'quả chuối', createdAt: 2 },
    { id: '3', word: 'orange', meaning: 'quả cam', createdAt: 3 },
    { id: '4', word: 'grape', meaning: 'quả nho', createdAt: 4 },
    { id: '5', word: 'mango', meaning: 'quả xoài', createdAt: 5 },
  ];

  const types: Array<'vn-to-en' | 'en-to-vn' | 'multiple-choice' | 'matching'> = [
    'vn-to-en',
    'en-to-vn',
    'multiple-choice',
    'matching',
  ];

  const queue = generateUnifiedQuizQueue(items, types, 8);
  assert.equal(queue.length, 8);

  // Check that all 4 types are present
  const presentTypes = new Set(queue.map(q => q.type));
  assert.ok(presentTypes.has('vn-to-en'));
  assert.ok(presentTypes.has('en-to-vn'));
  assert.ok(presentTypes.has('multiple-choice'));
  assert.ok(presentTypes.has('matching'));

  // Verify multiple-choice question has options
  const mcQuestion = queue.find(q => q.type === 'multiple-choice');
  assert.ok(mcQuestion?.options && mcQuestion.options.length >= 2);

  // Verify matching question has matchingItems
  const matchingQuestion = queue.find(q => q.type === 'matching');
  assert.ok(matchingQuestion?.matchingItems && matchingQuestion.matchingItems.length >= 2);
});
