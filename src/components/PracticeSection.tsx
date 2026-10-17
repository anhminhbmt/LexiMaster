import React, { useState, useMemo, useEffect } from 'react';
import { 
  Keyboard, 
  Languages, 
  CheckSquare, 
  Layers, 
  Play, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  BookOpen,
  Check,
  Plus,
  Minus,
  Shuffle,
  FolderOpen,
  Volume2,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { VocabItem, QuizMode, QuizQuestionType, QuizSessionStats } from '../types.ts';
import { QuizPlayer } from './QuizPlayer.tsx';
import { ALL_TOPIC_NAMES } from '../data/starterVocab.ts';
import { speakWord } from '../utils/sound.ts';

interface PracticeSectionProps {
  vocabList: VocabItem[];
  onFinishQuiz: (stats: QuizSessionStats, mode: QuizMode) => void;
  onNavigateToVocab: () => void;
  soundEnabled: boolean;
  preselectedMode?: QuizMode;
  initialFilterItems?: VocabItem[];
  initialSelectedTopic?: string;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  vocabList,
  onFinishQuiz,
  onNavigateToVocab,
  soundEnabled,
  preselectedMode = 'mixed',
  initialFilterItems,
  initialSelectedTopic,
}) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>(preselectedMode);

  // Compute available topics in vocabList
  const availableTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of vocabList) {
      const t = item.topic || 'Chưa phân loại';
      counts.set(t, (counts.get(t) || 0) + 1);
    }

    const list: Array<{ topic: string; count: number }> = [];
    const seen = new Set<string>();

    for (const u of ALL_TOPIC_NAMES) {
      if (counts.has(u)) {
        list.push({ topic: u, count: counts.get(u)! });
        seen.add(u);
      }
    }
    for (const [t, c] of counts.entries()) {
      if (!seen.has(t)) {
        list.push({ topic: t, count: c });
      }
    }
    return list;
  }, [vocabList]);

  // Selected topics state: empty array = "ALL TOPICS", otherwise array of selected topic names
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => {
    if (initialSelectedTopic) return [initialSelectedTopic];
    return [];
  });

  useEffect(() => {
    if (initialSelectedTopic) {
      setSelectedTopics([initialSelectedTopic]);
    }
  }, [initialSelectedTopic]);

  const [topicFilterQuery, setTopicFilterQuery] = useState('');
  const [showQuickPreviewWords, setShowQuickPreviewWords] = useState<boolean>(Boolean(initialSelectedTopic));

  // For mixed mode: which types are included
  const [selectedTypes, setSelectedTypes] = useState<QuizQuestionType[]>([
    'vn-to-en',
    'en-to-vn',
    'multiple-choice',
    'matching',
  ]);

  const [useMissedOnly, setUseMissedOnly] = useState(Boolean(initialFilterItems && initialFilterItems.length > 0));
  const [isPlaying, setIsPlaying] = useState(false);

  // Active vocabulary pool filtered by missed items OR selected topics
  const activePool = useMemo(() => {
    if (useMissedOnly && initialFilterItems && initialFilterItems.length > 0) {
      return initialFilterItems;
    }
    if (selectedTopics.length === 0) {
      return vocabList;
    }
    const topicSet = new Set(selectedTopics);
    return vocabList.filter(item => topicSet.has(item.topic || 'Chưa phân loại'));
  }, [vocabList, selectedTopics, useMissedOnly, initialFilterItems]);

  // Question count customization
  const [questionCount, setQuestionCount] = useState<number>(() => {
    if (activePool.length <= 5) return activePool.length || 5;
    if (activePool.length <= 15) return activePool.length;
    return 10;
  });
  const [isAllSelected, setIsAllSelected] = useState<boolean>(Boolean(initialSelectedTopic));

  // Update question count when topic selection changes
  useEffect(() => {
    if (isAllSelected) {
      setQuestionCount(Math.max(1, activePool.length));
    } else if (questionCount > activePool.length && activePool.length > 0) {
      setQuestionCount(activePool.length);
    }
  }, [activePool.length, isAllSelected]);

  const toggleTopicSelection = (topicName: string) => {
    setUseMissedOnly(false);
    setSelectedTopics(prev => {
      if (prev.includes(topicName)) {
        return prev.filter(t => t !== topicName);
      } else {
        return [...prev, topicName];
      }
    });
  };

  const selectSingleTopicOnly = (topicName: string) => {
    setUseMissedOnly(false);
    setSelectedTopics([topicName]);
    setIsAllSelected(true);
  };

  // Toggle type for mixed mode
  const toggleType = (t: QuizQuestionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev; // Keep at least one type
        return prev.filter(x => x !== t);
      } else {
        return [...prev, t];
      }
    });
  };

  const handleSelectPresetCount = (cnt: number | 'all') => {
    if (cnt === 'all') {
      setIsAllSelected(true);
      setQuestionCount(Math.max(1, activePool.length));
    } else {
      setIsAllSelected(false);
      setQuestionCount(cnt);
    }
  };

  const handleCustomCountChange = (val: number) => {
    setIsAllSelected(false);
    const sanitized = Math.max(1, Math.min(val, Math.max(activePool.length * 2, 100)));
    setQuestionCount(sanitized);
  };

  const handleStart = () => {
    if (activePool.length === 0) return;
    setIsPlaying(true);
  };

  const handlePlayerFinish = (stats: QuizSessionStats) => {
    setIsPlaying(false);
    onFinishQuiz(stats, selectedMode);
  };

  // If in active quiz mode
  if (isPlaying) {
    const finalCount = isAllSelected ? activePool.length : questionCount;

    return (
      <QuizPlayer
        mode={selectedMode}
        items={activePool}
        selectedTypes={selectedMode === 'mixed' ? selectedTypes : undefined}
        questionCount={finalCount}
        onFinishQuiz={handlePlayerFinish}
        onExit={() => setIsPlaying(false)}
        soundEnabled={soundEnabled}
      />
    );
  }

  const filteredTopicsForPicker = availableTopics.filter(t =>
    t.topic.toLowerCase().includes(topicFilterQuery.toLowerCase().trim())
  );

  const individualModes = [
    {
      id: 'vn-to-en' as QuizMode,
      title: 'Nhìn Tiếng Việt → Gõ Tiếng Anh',
      subtitle: 'VN to EN Typing',
      desc: 'Hiển thị nghĩa tiếng Việt, bạn gõ từ tiếng Anh tương ứng. Kiểm tra chính tả và luyện phản xạ gợi nhớ.',
      icon: Keyboard,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Gõ phím',
    },
    {
      id: 'en-to-vn' as QuizMode,
      title: 'Nhìn Tiếng Anh → Gõ Tiếng Việt',
      subtitle: 'EN to VN Typing',
      desc: 'Hiển thị từ tiếng Anh (kèm âm thanh đọc), bạn gõ nghĩa tiếng Việt. Hỗ trợ chấp nhận câu trả lời gần đúng.',
      icon: Languages,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Hiểu nghĩa',
    },
    {
      id: 'multiple-choice' as QuizMode,
      title: 'Trắc nghiệm 4 lựa chọn (A, B, C, D)',
      subtitle: 'Multiple Choice Quiz',
      desc: 'Chọn 1 đáp án đúng trong 4 lựa chọn. Đáp án gây nhiễu được lấy từ cùng chủ đề hoặc danh sách của bạn.',
      icon: CheckSquare,
      color: 'from-amber-600 to-orange-600',
      badge: 'Trắc nghiệm',
    },
    {
      id: 'matching' as QuizMode,
      title: 'Nối cột A với cột B (Matching Pairs)',
      subtitle: 'Word Pairing',
      desc: 'Ghép từ tiếng Anh ở Cột A với nghĩa tiếng Việt ở Cột B. Tự động phát âm khi ghép đúng cặp từ.',
      icon: Layers,
      color: 'from-purple-600 to-violet-600',
      badge: 'Ghép cặp',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Học Theo Chủ Đề & Thi Ôn Tập 4 Dạng</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cấu hình bài học & kiểm tra từ vựng
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Chọn chủ đề (Unit) bạn muốn học, nghe phát âm từng từ và tùy chỉnh số lượng câu hỏi với đầy đủ 4 dạng bài tập.
        </p>
      </div>

      {/* Warning if list is empty */}
      {vocabList.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-amber-900 text-base">
            Danh sách từ vựng hiện đang trống!
          </h3>
          <p className="text-amber-700 text-xs sm:text-sm max-w-md mx-auto">
            Bạn cần nạp hoặc nhập từ vựng trước khi tạo đề luyện tập.
          </p>
          <button
            onClick={onNavigateToVocab}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Quay lại trang Từ vựng</span>
          </button>
        </div>
      ) : (
        <>
          {/* STEP 1: CHỌN CHỦ ĐỀ (UNIT) ĐỂ HỌC */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">
                    Chọn chủ đề (Unit) cần học & kiểm tra
                  </h2>
                  <p className="text-xs text-slate-500">
                    Đang chọn:{' '}
                    <strong className="text-indigo-700">
                      {selectedTopics.length === 0
                        ? `Tất cả ${availableTopics.length} chủ đề (${vocabList.length} từ)`
                        : `${selectedTopics.length} chủ đề (${activePool.length} từ)`}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={topicFilterQuery}
                    onChange={e => setTopicFilterQuery(e.target.value)}
                    placeholder="Tìm Unit..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopics([]);
                    setIsAllSelected(false);
                    setQuestionCount(15);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    selectedTopics.length === 0
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({vocabList.length})
                </button>
              </div>
            </div>

            {/* Topic Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
              {filteredTopicsForPicker.map(group => {
                const isSelected = selectedTopics.includes(group.topic);
                return (
                  <div
                    key={group.topic}
                    onClick={() => selectSingleTopicOnly(group.topic)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold ring-2 ring-indigo-100'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-bold">{group.topic}</div>
                      <div className="text-[11px] text-slate-500">{group.count} từ</div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopicSelection(group.topic);
                      }}
                      title="Chọn kết hợp nhiều chủ đề"
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />
                  </div>
                );
              })}
            </div>

            {/* Quick Flashcard & Audio Preview of Selected Topic */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowQuickPreviewWords(prev => !prev)}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  {showQuickPreviewWords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>
                    {showQuickPreviewWords
                      ? 'Ẩn danh sách ôn nhanh & nghe phát âm'
                      : `Xem & Nghe phát âm nhanh ${activePool.length} từ trong chủ đề đang chọn`}
                  </span>
                </button>
              </div>

              {showQuickPreviewWords && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {activePool.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => speakWord(item.word)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 flex items-center justify-between gap-2 cursor-pointer group transition-all shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                          {item.word}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.meaning}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(item.word);
                        }}
                        title={`Nghe phát âm ${item.word}`}
                        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: TOP PREMIER CARD: MIXED EXAM WITH ALL 4 QUESTION TYPES */}
          <div
            onClick={() => setSelectedMode('mixed')}
            className={`p-6 sm:p-7 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden group ${
              selectedMode === 'mixed'
                ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Shuffle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-slate-900 text-lg sm:text-xl group-hover:text-indigo-600 transition-colors">
                      2. Bài thi tổng hợp cả 4 dạng câu hỏi
                    </h2>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 shadow-xs">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Một bài làm kết hợp luân phiên: Gõ Tiếng Anh, Gõ Tiếng Việt, Trắc nghiệm 4 lựa chọn và Nối cặp từ
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                {selectedMode === 'mixed' ? (
                  <span className="text-indigo-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Đang chọn
                  </span>
                ) : (
                  <span className="text-slate-400">Chọn chế độ này</span>
                )}
              </div>
            </div>

            {/* Checkboxes to select which types are active in mixed mode */}
            {selectedMode === 'mixed' && (
              <div 
                className="mt-4 pt-4 border-t border-indigo-100 bg-white/70 p-4 rounded-2xl space-y-3"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Các dạng câu hỏi sẽ xuất hiện trong bài làm:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTypes(['vn-to-en', 'en-to-vn', 'multiple-choice', 'matching'])}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    Chọn cả 4 dạng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'vn-to-en' as QuizQuestionType, label: '1. Nhìn Tiếng Việt → Gõ Tiếng Anh', icon: Keyboard },
                    { id: 'en-to-vn' as QuizQuestionType, label: '2. Nhìn Tiếng Anh → Gõ Tiếng Việt', icon: Languages },
                    { id: 'multiple-choice' as QuizQuestionType, label: '3. Trắc nghiệm 4 lựa chọn (A, B, C, D)', icon: CheckSquare },
                    { id: 'matching' as QuizQuestionType, label: '4. Nối cột A với cột B (Matching Pairs)', icon: Layers },
                  ].map(item => {
                    const isChecked = selectedTypes.includes(item.id);
                    const ItemIcon = item.icon;
                    return (
                      <label
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleType(item.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <ItemIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* OR SELECT A SPECIFIC INDIVIDUAL MODE */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Hoặc chọn riêng từng dạng bài tập đơn lẻ:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {individualModes.map(m => {
                const Icon = m.icon;
                const isSelected = selectedMode === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {m.title}
                        </h3>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. QUESTION COUNT CUSTOMIZATION SECTION */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">
                    Tùy chọn số lượng câu hỏi
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tự chọn số câu bất kỳ hoặc ôn toàn bộ các từ trong chủ đề đã chọn
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Đang chọn: </span>
                <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {isAllSelected ? `Tất cả (${activePool.length} câu)` : `${questionCount} câu`}
                </span>
              </div>
            </div>

            {/* Presets & Custom Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Mốc số lượng gợi ý:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[5, 10, 15, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectPresetCount(val)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        !isAllSelected && questionCount === val
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {val} câu
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectPresetCount('all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isAllSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả trong chủ đề ({activePool.length})
                  </button>
                </div>
              </div>

              {/* Custom Number Input & Stepper */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Hoặc tự nhập số lượng tùy ý:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCustomCountChange(questionCount - 1)}
                    disabled={questionCount <= 1}
                    aria-label="Giảm 1 câu"
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 font-bold transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={questionCount}
                      onChange={e => handleCustomCountChange(parseInt(e.target.value) || 1)}
                      className="w-full text-center py-2 px-3 rounded-xl border border-slate-300 font-bold text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      câu
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCustomCountChange(questionCount + 1)}
                    aria-label="Tăng 1 câu"
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter missed only if available */}
            {initialFilterItems && initialFilterItems.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="missed-checkbox"
                  checked={useMissedOnly}
                  onChange={e => setUseMissedOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="missed-checkbox" className="text-xs font-bold text-rose-700 cursor-pointer">
                  Chỉ ôn lại {initialFilterItems.length} từ vừa làm sai ở bài kiểm tra trước
                </label>
              </div>
            )}

            {/* Launch CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>
                  Sẵn sàng: <strong className="text-slate-800">{isAllSelected ? activePool.length : questionCount} câu hỏi</strong>
                  {selectedTopics.length === 1 && (
                    <span className="text-emerald-700 font-bold"> • {selectedTopics[0]}</span>
                  )}
                  {selectedMode === 'mixed' && (
                    <span className="text-indigo-600 font-semibold"> ({selectedTypes.length} dạng câu hỏi)</span>
                  )}
                </span>
              </div>

              <button
                onClick={handleStart}
                disabled={activePool.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt đầu bài làm ngay</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
