import React, { useEffect } from 'react';
import { 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ArrowRight, 
  Volume2, 
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { QuizSessionStats, QuizResultItem, VocabItem, QuizMode } from '../types.ts';
import { playCelebrationFanfare, speakWord } from '../utils/sound.ts';
import { getPhonetic } from '../utils/phonetics.ts';

interface QuizSummaryProps {
  stats: QuizSessionStats;
  onRestartSameMode: () => void;
  onReviewMissedOnly: (missedItems: VocabItem[]) => void;
  onSelectNewMode: () => void;
  onBackToVocab: () => void;
  mode: QuizMode;
  soundEnabled: boolean;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({
  stats,
  onRestartSameMode,
  onReviewMissedOnly,
  onSelectNewMode,
  onBackToVocab,
  mode,
  soundEnabled,
}) => {
  const percent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const missedResults = stats.results.filter(r => !r.isCorrect);
  const correctResults = stats.results.filter(r => r.isCorrect);

  // Trigger fanfare on high score
  useEffect(() => {
    if (soundEnabled && percent >= 60) {
      playCelebrationFanfare();
    }
  }, [percent, soundEnabled]);

  const getModeTitle = (m: QuizMode) => {
    switch (m) {
      case 'mixed': return 'Bài thi tổng hợp cả 4 dạng câu hỏi';
      case 'vn-to-en': return 'Nhìn Tiếng Việt → Gõ Tiếng Anh';
      case 'en-to-vn': return 'Nhìn Tiếng Anh → Gõ Tiếng Việt';
      case 'multiple-choice': return 'Trắc nghiệm 4 lựa chọn (A, B, C, D)';
      case 'matching': return 'Nối cột A với cột B (Matching Pairs)';
      default: return 'Bài luyện tập';
    }
  };

  const getQuestionTypeLabel = (t: string) => {
    switch (t) {
      case 'vn-to-en': return 'Gõ Tiếng Anh';
      case 'en-to-vn': return 'Gõ Tiếng Việt';
      case 'multiple-choice': return 'Trắc nghiệm';
      case 'matching': return 'Nối từ';
      default: return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header card with gradient and score celebration */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{getModeTitle(mode)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {percent === 100
                ? 'Xuất sắc! Bạn đã trả lời đúng 100%!'
                : percent >= 75
                ? 'Rất tốt! Bạn ghi nhớ gần như toàn bộ!'
                : percent >= 50
                ? 'Khá tốt! Hãy ôn lại các từ chưa vững!'
                : 'Cần cố gắng thêm! Hãy luyện tập thêm nhé!'}
            </h1>
            <p className="text-indigo-200 text-sm">
              Hoàn thành bài kiểm tra với {stats.total} câu hỏi từ bộ từ vựng cá nhân.
            </p>
          </div>

          {/* Big percentage ring */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center rounded-full bg-white/10 border-4 border-indigo-400/40">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300">{percent}%</div>
              <div className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Chính xác</div>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 text-center">
            <div className="text-xs text-indigo-200 font-medium">Tổng câu hỏi</div>
            <div className="text-2xl font-black text-white mt-0.5">{stats.total}</div>
          </div>

          <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-emerald-400/30">
            <div className="text-xs text-emerald-200 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Làm đúng</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">{stats.correct}</div>
          </div>

          <div className="bg-rose-500/20 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-rose-400/30">
            <div className="text-xs text-rose-200 font-medium flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Làm sai</span>
            </div>
            <div className="text-2xl font-black text-rose-300 mt-0.5">{stats.wrong}</div>
          </div>

          <div className="bg-amber-500/20 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-amber-400/30">
            <div className="text-xs text-amber-200 font-medium flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Chuỗi tối đa</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{stats.bestStreak}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {missedResults.length > 0 && (
            <button
              onClick={() => onReviewMissedOnly(missedResults.map(r => r.item))}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ôn lại riêng {missedResults.length} từ chưa thuộc</span>
            </button>
          )}

          <button
            onClick={onRestartSameMode}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Chơi lại lượt mới</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSelectNewMode}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chọn chế độ khác</span>
          </button>

          <button
            onClick={onBackToVocab}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Quản lý từ vựng</span>
          </button>
        </div>
      </div>

      {/* Detailed breakdown: Missed Words first! */}
      {missedResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                Từ vựng cần ôn lại ({missedResults.length})
              </h2>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
              Ưu tiên học
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {missedResults.map((res, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{res.item.word}</span>
                    <span className="text-xs font-mono text-indigo-600 font-medium">
                      {getPhonetic(res.item.word, res.item.phonetic)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {getQuestionTypeLabel(res.mode)}
                    </span>
                    <button
                      onClick={() => speakWord(res.item.word)}
                      title="Nghe phát âm"
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Nghĩa:</span> {res.item.meaning}
                  </p>
                </div>

                <div className="text-xs text-right sm:max-w-xs space-y-0.5">
                  <div className="text-slate-400">
                    Bạn trả lời: <span className="line-through text-rose-600 font-mono font-semibold">{res.userAnswer || '(Bỏ trống)'}</span>
                  </div>
                  <div className="text-emerald-700 font-semibold font-mono">
                    Đáp án đúng: {res.correctAnswer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct Words */}
      {correctResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                Từ đã trả lời đúng ({correctResults.length})
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Đã ghi nhớ
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {correctResults.map((res, idx) => (
              <div key={idx} className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{res.item.word}</span>
                      <span className="text-xs font-mono text-indigo-600 font-medium">
                        {getPhonetic(res.item.word, res.item.phonetic)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {getQuestionTypeLabel(res.mode)}
                      </span>
                      <button
                        onClick={() => speakWord(res.item.word)}
                        title="Nghe phát âm"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">{res.item.meaning}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  +100 điểm
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
