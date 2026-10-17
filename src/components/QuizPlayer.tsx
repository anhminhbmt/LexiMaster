import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  Flame, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Check,
  Keyboard,
  Languages,
  CheckSquare,
  Layers,
  FolderOpen
} from 'lucide-react';
import { VocabItem, QuizMode, QuizQuestionType, QuizResultItem, QuizSessionStats, UnifiedQuizQuestion } from '../types.ts';
import { 
  checkTypingMatch, 
  generateUnifiedQuizQueue,
  shuffleArray 
} from '../utils/parser.ts';
import { 
  playSuccessTone, 
  playErrorTone, 
  playMatchClick, 
  speakWord 
} from '../utils/sound.ts';

interface QuizPlayerProps {
  mode: QuizMode;
  items: VocabItem[];
  selectedTypes?: QuizQuestionType[];
  questionCount: number;
  onFinishQuiz: (stats: QuizSessionStats) => void;
  onExit: () => void;
  soundEnabled: boolean;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  mode,
  items,
  selectedTypes,
  questionCount,
  onFinishQuiz,
  onExit,
  soundEnabled,
}) => {
  // Generate question queue
  const [questions] = useState<UnifiedQuizQuestion[]>(() => {
    const types: QuizQuestionType[] = mode === 'mixed'
      ? (selectedTypes && selectedTypes.length > 0 ? selectedTypes : ['vn-to-en', 'en-to-vn', 'multiple-choice', 'matching'])
      : [mode as QuizQuestionType];
    return generateUnifiedQuizQueue(items, types, questionCount);
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Score & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Results log
  const [results, setResults] = useState<QuizResultItem[]>([]);

  // Typing inputs
  const [typedAnswer, setTypedAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isCloseMatch, setIsCloseMatch] = useState(false);
  const [isOverridden, setIsOverridden] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Multiple Choice state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Matching Question state
  const [matchingWords, setMatchingWords] = useState<Array<{ id: string; text: string }>>([]);
  const [matchingMeanings, setMatchingMeanings] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongMatchPair, setWrongMatchPair] = useState<{ wordId: string; meaningId: string } | null>(null);
  const [matchingMistakes, setMatchingMistakes] = useState(0);

  const currentQ = questions[currentIndex];
  const currentItem = currentQ?.item;

  // Set up question state whenever currentIndex changes
  useEffect(() => {
    if (!currentQ) return;

    setHasSubmitted(false);
    setTypedAnswer('');
    setIsAnswerCorrect(false);
    setIsCloseMatch(false);
    setIsOverridden(false);
    setSelectedOption(null);

    if (currentQ.type === 'vn-to-en' || currentQ.type === 'en-to-vn') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    if (currentQ.type === 'en-to-vn' && soundEnabled && currentQ.item) {
      speakWord(currentQ.item.word);
    }

    if (currentQ.type === 'matching' && currentQ.matchingItems) {
      const qItems = currentQ.matchingItems;
      setMatchingWords(shuffleArray(qItems.map(i => ({ id: i.id, text: i.word }))));
      setMatchingMeanings(shuffleArray(qItems.map(i => ({ id: i.id, text: i.meaning }))));
      setMatchedIds(new Set());
      setSelectedWordId(null);
      setSelectedMeaningId(null);
      setWrongMatchPair(null);
      setMatchingMistakes(0);
    }
  }, [currentIndex, currentQ, soundEnabled]);

  // Typing submit handler
  const handleTypingSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (hasSubmitted || !typedAnswer.trim() || !currentItem) return;

    const isVnToEn = currentQ.type === 'vn-to-en';
    const target = isVnToEn ? currentItem.word : currentItem.meaning;
    const match = checkTypingMatch(typedAnswer, target, !isVnToEn);

    setHasSubmitted(true);
    setIsCloseMatch(match.isClose && !match.isExact);

    if (match.isExact || (match.isClose && !isVnToEn)) {
      setIsAnswerCorrect(true);
      if (soundEnabled) playSuccessTone();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const points = 100 + newStreak * 10;
      setScore(prev => prev + points);

      if (soundEnabled) {
        speakWord(currentItem.word);
      }

      setResults(prev => [
        ...prev,
        {
          item: currentItem,
          userAnswer: typedAnswer,
          correctAnswer: target,
          isCorrect: true,
          mode: currentQ.type,
        },
      ]);
    } else {
      setIsAnswerCorrect(false);
      if (soundEnabled) playErrorTone();
      setStreak(0);

      setResults(prev => [
        ...prev,
        {
          item: currentItem,
          userAnswer: typedAnswer,
          correctAnswer: target,
          isCorrect: false,
          mode: currentQ.type,
        },
      ]);
    }
  };

  // Override answer to correct (User accepts close answer in EN to VN)
  const handleAcceptCloseAnswer = () => {
    if (isOverridden || !currentItem) return;
    setIsOverridden(true);
    setIsAnswerCorrect(true);
    if (soundEnabled) playSuccessTone();

    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) setBestStreak(newStreak);
    setScore(prev => prev + 100);

    setResults(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          isCorrect: true,
        };
      }
      return copy;
    });
  };

  // Multiple Choice selection
  const handleSelectOption = (option: string) => {
    if (hasSubmitted || !currentItem) return;
    setSelectedOption(option);
    setHasSubmitted(true);

    const isCorrect = option === currentItem.word;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      if (soundEnabled) playSuccessTone();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setScore(prev => prev + 100 + newStreak * 10);
      if (soundEnabled) speakWord(currentItem.word);

      setResults(prev => [
        ...prev,
        {
          item: currentItem,
          userAnswer: option,
          correctAnswer: currentItem.word,
          isCorrect: true,
          mode: currentQ.type,
        },
      ]);
    } else {
      if (soundEnabled) playErrorTone();
      setStreak(0);

      setResults(prev => [
        ...prev,
        {
          item: currentItem,
          userAnswer: option,
          correctAnswer: currentItem.word,
          isCorrect: false,
          mode: currentQ.type,
        },
      ]);
    }
  };

  // Matching interactions
  const handleWordClick = (wordId: string) => {
    if (matchedIds.has(wordId) || wrongMatchPair || hasSubmitted) return;
    if (soundEnabled) playMatchClick();
    setSelectedWordId(wordId);

    if (selectedMeaningId) {
      checkMatchingPair(wordId, selectedMeaningId);
    }
  };

  const handleMeaningClick = (meaningId: string) => {
    if (matchedIds.has(meaningId) || wrongMatchPair || hasSubmitted) return;
    if (soundEnabled) playMatchClick();
    setSelectedMeaningId(meaningId);

    if (selectedWordId) {
      checkMatchingPair(selectedWordId, meaningId);
    }
  };

  const checkMatchingPair = (wordId: string, meaningId: string) => {
    if (wordId === meaningId) {
      // Correct pair!
      if (soundEnabled) playSuccessTone();
      const matchedItem = items.find(i => i.id === wordId);
      if (matchedItem && soundEnabled) {
        speakWord(matchedItem.word);
      }

      const nextMatched = new Set(matchedIds);
      nextMatched.add(wordId);
      setMatchedIds(nextMatched);

      setSelectedWordId(null);
      setSelectedMeaningId(null);

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setScore(prev => prev + 80 + newStreak * 10);

      // Check if all pairs in this question are matched
      if (nextMatched.size === matchingWords.length) {
        setHasSubmitted(true);
        const isOverallCorrect = matchingMistakes === 0;
        setIsAnswerCorrect(isOverallCorrect);

        if (currentItem) {
          setResults(prev => [
            ...prev,
            {
              item: currentItem,
              userAnswer: `Ghép đúng ${matchingWords.length}/${matchingWords.length} cặp`,
              correctAnswer: `Ghép đúng ${matchingWords.length} cặp`,
              isCorrect: isOverallCorrect,
              mode: 'matching',
            },
          ]);
        }
      }
    } else {
      // Wrong pair
      if (soundEnabled) playErrorTone();
      setStreak(0);
      setMatchingMistakes(prev => prev + 1);
      setWrongMatchPair({ wordId, meaningId });

      setTimeout(() => {
        setWrongMatchPair(null);
        setSelectedWordId(null);
        setSelectedMeaningId(null);
      }, 700);
    }
  };

  // Advance to next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = useCallback(() => {
    const total = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    const wrong = total - correct;
    onFinishQuiz({
      total,
      correct,
      wrong,
      score,
      streak,
      bestStreak: Math.max(bestStreak, streak),
      results,
    });
  }, [results, score, streak, bestStreak, onFinishQuiz]);

  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

  // Type Badge configuration
  const getTypeBadge = (type: QuizQuestionType) => {
    switch (type) {
      case 'vn-to-en':
        return {
          icon: Keyboard,
          label: 'Nhìn Tiếng Việt → Gõ Tiếng Anh',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'en-to-vn':
        return {
          icon: Languages,
          label: 'Nhìn Tiếng Anh → Gõ Tiếng Việt',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'multiple-choice':
        return {
          icon: CheckSquare,
          label: 'Trắc nghiệm 4 lựa chọn (A, B, C, D)',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'matching':
        return {
          icon: Layers,
          label: 'Nối cột A với cột B (Matching Pairs)',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
    }
  };

  const currentBadge = currentQ ? getTypeBadge(currentQ.type) : null;
  const BadgeIcon = currentBadge?.icon || Sparkles;

  if (!currentQ || !currentItem) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Đang chuẩn bị câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Top Bar HUD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onExit}
            aria-label="Thoát bài kiểm tra"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          {/* Mode Badge & Question Counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              Câu {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Streak & Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streak}</span>
            </div>

            <div className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {score} pts
            </div>
          </div>
        </div>

        {/* Question Type & Topic Indicator Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {currentBadge && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${currentBadge.color}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{currentBadge.label}</span>
            </div>
          )}
          {currentItem.topic && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <FolderOpen className="w-3 h-3 text-indigo-500" />
              <span>{currentItem.topic}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* 1. VN -> EN TYPING QUESTION */}
      {currentQ.type === 'vn-to-en' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="text-center space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Nghĩa Tiếng Việt
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-2">
              {currentItem.meaning}
            </h2>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => speakWord(currentItem.word)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe gợi ý phát âm tiếng Anh</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleTypingSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
              <label htmlFor="en-typing-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Gõ từ tiếng Anh tương ứng
              </label>
              <input
                id="en-typing-input"
                ref={inputRef}
                type="text"
                disabled={hasSubmitted}
                value={typedAnswer}
                onChange={e => setTypedAnswer(e.target.value)}
                placeholder="Nhập từ tiếng Anh..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className={`w-full text-center px-4 py-3.5 rounded-2xl border text-lg font-bold tracking-wide transition-all focus:outline-none ${
                  hasSubmitted
                    ? isAnswerCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400'
                      : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900'
                }`}
              />
            </div>

            {!hasSubmitted ? (
              <button
                type="submit"
                disabled={!typedAnswer.trim()}
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                  typedAnswer.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Kiểm tra đáp án (Enter)
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {isAnswerCorrect ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Chính xác tuyệt vời!</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-lg">
                      <span>{currentItem.word}</span>
                      <button
                        type="button"
                        onClick={() => speakWord(currentItem.word)}
                        title="Nghe phát âm"
                        className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs flex items-center gap-1"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Đọc</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-rose-700 font-extrabold text-base">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Chưa chính xác!</span>
                    </div>
                    <div className="text-xs text-rose-600">
                      Đáp án đúng là:
                    </div>
                    <div className="flex items-center justify-center gap-2 text-rose-950 font-black text-xl">
                      <span>{currentItem.word}</span>
                      <button
                        type="button"
                        onClick={() => speakWord(currentItem.word)}
                        title="Nghe phát âm"
                        className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Đọc</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  autoFocus
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả tổng kết'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* 2. EN -> VN TYPING QUESTION */}
      {currentQ.type === 'en-to-vn' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="text-center space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Từ Tiếng Anh
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                {currentItem.word}
              </h2>
              <button
                type="button"
                onClick={() => speakWord(currentItem.word)}
                title="Nghe phát âm"
                className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe phát âm</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleTypingSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
              <label htmlFor="vn-typing-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Gõ nghĩa tiếng Việt tương ứng
              </label>
              <input
                id="vn-typing-input"
                ref={inputRef}
                type="text"
                disabled={hasSubmitted}
                value={typedAnswer}
                onChange={e => setTypedAnswer(e.target.value)}
                placeholder="Nhập nghĩa tiếng Việt..."
                className={`w-full text-center px-4 py-3.5 rounded-2xl border text-lg font-bold tracking-wide transition-all focus:outline-none ${
                  hasSubmitted
                    ? isAnswerCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400'
                      : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900'
                }`}
              />
            </div>

            {!hasSubmitted ? (
              <button
                type="submit"
                disabled={!typedAnswer.trim()}
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                  typedAnswer.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Kiểm tra đáp án (Enter)
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {isAnswerCorrect ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>{isOverridden ? 'Đã chấp nhận câu trả lời của bạn!' : 'Chính xác!'}</span>
                    </div>
                    <div className="text-emerald-900 font-bold text-base">
                      Nghĩa gốc: {currentItem.meaning}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-rose-700 font-extrabold text-base">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Chưa khớp nghĩa chuẩn!</span>
                    </div>
                    <div>
                      <div className="text-xs text-rose-600 mb-0.5">Nghĩa gốc trong danh sách:</div>
                      <div className="text-rose-950 font-black text-lg">{currentItem.meaning}</div>
                    </div>

                    {!isOverridden && (
                      <button
                        type="button"
                        onClick={handleAcceptCloseAnswer}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Chấp nhận câu trả lời này là đúng (Gần đúng)</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  autoFocus
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả tổng kết'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* 3. MULTIPLE CHOICE QUESTION */}
      {currentQ.type === 'multiple-choice' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Chọn từ tiếng Anh phù hợp cho nghĩa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-2">
              {currentItem.meaning}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {(currentQ.options || []).map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentItem.word;

              let btnStyle = 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-700';

              if (hasSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400 font-extrabold';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400 line-through';
                  badgeStyle = 'bg-rose-600 text-white';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition-all ${btnStyle}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    disabled={hasSubmitted}
                    className="flex-1 text-left flex items-center gap-2.5 min-w-0 focus:outline-none"
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                      {letter}
                    </span>
                    <span className="font-semibold text-sm sm:text-base flex-1 truncate">{opt}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(opt);
                    }}
                    title={`Nghe phát âm ${opt}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 shrink-0 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {hasSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {hasSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {hasSubmitted && (
            <div className="max-w-lg mx-auto pt-2 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={handleNextQuestion}
                autoFocus
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả tổng kết'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. MATCHING PAIRS QUESTION */}
      {currentQ.type === 'matching' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Thử thách nối từ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
              Ghép các cặp từ tương ứng ({matchingWords.length} cặp)
            </h2>
            <p className="text-xs text-slate-500">
              Nhấp 1 từ ở Cột A, sau đó nhấp vào nghĩa tương ứng ở Cột B
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Column A */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1 flex items-center justify-between">
                <span>Cột A: Tiếng Anh</span>
                <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                  Đã ghép: {matchedIds.size} / {matchingWords.length}
                </span>
              </div>
              <div className="space-y-2">
                {matchingWords.map(item => {
                  const isMatched = matchedIds.has(item.id);
                  const isSelected = selectedWordId === item.id;
                  const isWrong = wrongMatchPair?.wordId === item.id;

                  let style = 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800';

                  if (isMatched) {
                    style = 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-70 cursor-default';
                  } else if (isWrong) {
                    style = 'border-rose-500 bg-rose-50 text-rose-900 animate-shake';
                  } else if (isSelected) {
                    style = 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500 font-extrabold shadow-sm';
                  }

                  return (
                    <div
                      key={item.id}
                      className={`w-full p-3.5 rounded-xl border font-semibold text-sm transition-all flex items-center justify-between gap-2 ${style}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleWordClick(item.id)}
                        disabled={isMatched || hasSubmitted}
                        className="flex-1 text-left focus:outline-none disabled:cursor-default"
                      >
                        {item.text}
                      </button>
                      {isMatched ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => speakWord(item.text)}
                          title="Phát âm từ"
                          aria-label={`Phát âm ${item.text}`}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column B */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
                <span>Cột B: Nghĩa Tiếng Việt</span>
              </div>
              <div className="space-y-2">
                {matchingMeanings.map(item => {
                  const isMatched = matchedIds.has(item.id);
                  const isSelected = selectedMeaningId === item.id;
                  const isWrong = wrongMatchPair?.meaningId === item.id;

                  let style = 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800';

                  if (isMatched) {
                    style = 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-70 cursor-default';
                  } else if (isWrong) {
                    style = 'border-rose-500 bg-rose-50 text-rose-900 animate-shake';
                  } else if (isSelected) {
                    style = 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500 font-extrabold shadow-sm';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMeaningClick(item.id)}
                      disabled={isMatched || hasSubmitted}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                    >
                      <span className="line-clamp-2">{item.text}</span>
                      {isMatched && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* If all pairs matched in this question */}
          {hasSubmitted && (
            <div className="pt-2 max-w-md mx-auto space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800">
                ✓ Hoàn thành nối tất cả các cặp từ trong câu này!
              </div>
              <button
                type="button"
                onClick={handleNextQuestion}
                autoFocus
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả tổng kết'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
