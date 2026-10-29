import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  FileText, 
  FileCode, 
  Presentation, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Volume2, 
  Search, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ClipboardPaste,
  RotateCcw,
  BookMarked,
  FolderOpen,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Headphones
} from 'lucide-react';
import { VocabItem } from '../types.ts';
import { parseVocabText } from '../utils/parser.ts';
import { parseUploadedFile } from '../utils/fileExtractor.ts';
import { speakWord, speakWordSequence, stopSpeaking } from '../utils/sound.ts';
import { createInitialVocabList, ALL_TOPIC_NAMES } from '../data/starterVocab.ts';
import { getPhonetic } from '../utils/phonetics.ts';

interface VocabInputSectionProps {
  vocabList: VocabItem[];
  setVocabList: React.Dispatch<React.SetStateAction<VocabItem[]>>;
  onStartPractice: (selectedTopic?: string) => void;
}

export const VocabInputSection: React.FC<VocabInputSectionProps> = ({
  vocabList,
  setVocabList,
  onStartPractice,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'single' | 'bulk' | 'file'>('single');
  const [showInputPanel, setShowInputPanel] = useState<boolean>(false);

  // Selected topic filter ('ALL' or specific topic name)
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [showAllTopicsGrid, setShowAllTopicsGrid] = useState<boolean>(true);

  // Sequential audio state
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [isAutoPlayingTopic, setIsAutoPlayingTopic] = useState<boolean>(false);

  // Single word form
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newTopic, setNewTopic] = useState<string>(ALL_TOPIC_NAMES[0] || 'Từ vựng tự thêm');
  const [newExample, setNewExample] = useState('');
  const [singleError, setSingleError] = useState('');
  const [singleSuccess, setSingleSuccess] = useState('');

  // Bulk paste form
  const [bulkText, setBulkText] = useState('');
  const [bulkTopic, setBulkTopic] = useState('Từ vựng tự thêm');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // File upload state
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileSuccess, setFileSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table search & inline edit
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editMeaning, setEditMeaning] = useState('');
  const [editTopic, setEditTopic] = useState('');

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Compute topics and their counts from current vocabList
  const topicGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of vocabList) {
      const t = item.topic || 'Chưa phân loại';
      counts.set(t, (counts.get(t) || 0) + 1);
    }

    // Preserve curriculum order first, then any custom topics
    const orderedTopics: Array<{ topic: string; count: number }> = [];
    const seen = new Set<string>();

    for (const unitName of ALL_TOPIC_NAMES) {
      if (counts.has(unitName)) {
        orderedTopics.push({ topic: unitName, count: counts.get(unitName)! });
        seen.add(unitName);
      }
    }

    for (const [t, c] of counts.entries()) {
      if (!seen.has(t)) {
        orderedTopics.push({ topic: t, count: c });
      }
    }

    return orderedTopics;
  }, [vocabList]);

  const filteredTopicGroups = useMemo(() => {
    const q = topicSearch.toLowerCase().trim();
    if (!q) return topicGroups;
    return topicGroups.filter(g => g.topic.toLowerCase().includes(q));
  }, [topicGroups, topicSearch]);

  // Filtered vocabulary list based on selectedTopic and searchQuery
  const filteredList = useMemo(() => {
    return vocabList.filter(item => {
      const itemTopic = item.topic || 'Chưa phân loại';
      if (selectedTopic !== 'ALL' && itemTopic !== selectedTopic) {
        return false;
      }
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        itemTopic.toLowerCase().includes(q)
      );
    });
  }, [vocabList, selectedTopic, searchQuery]);

  // Handle single word pronunciation with visual highlight
  const handleSpeakSingleWord = (item: VocabItem) => {
    setIsAutoPlayingTopic(false);
    setSpeakingWordId(item.id);
    speakWord(item.word);
    setTimeout(() => {
      setSpeakingWordId(prev => (prev === item.id ? null : prev));
    }, 1200);
  };

  // Handle reading all words in current filtered view
  const handleToggleAutoPlayList = () => {
    if (isAutoPlayingTopic) {
      stopSpeaking();
      setIsAutoPlayingTopic(false);
      setSpeakingWordId(null);
      return;
    }

    if (filteredList.length === 0) return;
    setIsAutoPlayingTopic(true);
    speakWordSequence(
      filteredList.map(i => ({ id: i.id, word: i.word })),
      (id) => setSpeakingWordId(id),
      () => {
        setIsAutoPlayingTopic(false);
        setSpeakingWordId(null);
      }
    );
  };

  // Handlers
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError('');
    setSingleSuccess('');

    const word = newWord.trim();
    const meaning = newMeaning.trim();
    const topicName = newTopic.trim() || 'Từ vựng tự thêm';

    if (!word || !meaning) {
      setSingleError('Vui lòng nhập đầy đủ cả từ tiếng Anh và nghĩa tiếng Việt.');
      return;
    }

    const newItem: VocabItem = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word,
      meaning,
      phonetic: getPhonetic(word),
      topic: topicName,
      example: newExample.trim() || undefined,
      createdAt: Date.now(),
      stats: { correctCount: 0, wrongCount: 0 },
    };

    setVocabList(prev => [newItem, ...prev]);
    setNewWord('');
    setNewMeaning('');
    setNewExample('');
    setSingleSuccess(`Đã thêm "${word}" vào chủ đề "${topicName}"!`);
  };

  const handleBulkImport = () => {
    setBulkError('');
    setBulkSuccess('');

    if (!bulkText.trim()) {
      setBulkError('Vui lòng dán văn bản danh sách từ vựng vào ô bên dưới.');
      return;
    }

    const parsedPairs = parseVocabText(bulkText, bulkTopic.trim() || 'Từ vựng tự thêm');
    if (parsedPairs.length === 0) {
      setBulkError('Không nhận diện được cặp từ - nghĩa nào. Hãy kiểm tra định dạng (ví dụ: word: meaning hoặc word - meaning).');
      return;
    }

    const newItems: VocabItem[] = parsedPairs.map((pair, idx) => ({
      id: `vocab-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      word: pair.word,
      meaning: pair.meaning,
      phonetic: getPhonetic(pair.word, pair.phonetic),
      topic: pair.topic || bulkTopic.trim() || 'Từ vựng tự thêm',
      createdAt: Date.now() - idx,
      stats: { correctCount: 0, wrongCount: 0 },
    }));

    setVocabList(prev => [...newItems, ...prev]);
    setBulkSuccess(`Đã thêm thành công ${newItems.length} từ mới vào danh sách!`);
    setBulkText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileError('');
    setFileSuccess('');

    try {
      const result = await parseUploadedFile(file);
      if (result.items.length === 0) {
        setFileError(`Không tìm thấy cặp từ vựng nào trong file "${file.name}". Hãy kiểm tra xem file có chứa các dòng định dạng từ - nghĩa không.`);
        return;
      }

      const fileTopic = `File: ${file.name.replace(/\.[^.]+$/, '')}`;
      const newItems: VocabItem[] = result.items.map((pair, idx) => ({
        id: `vocab-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        word: pair.word,
        meaning: pair.meaning,
        topic: fileTopic,
        createdAt: Date.now() - idx,
        stats: { correctCount: 0, wrongCount: 0 },
      }));

      setVocabList(prev => [...newItems, ...prev]);
      setSelectedTopic(fileTopic);
      setFileSuccess(`Trích xuất thành công ${newItems.length} từ từ "${file.name}" vào chủ đề "${fileTopic}"!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đọc tệp tin';
      setFileError(`Lỗi khi đọc file: ${msg}`);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startEdit = (item: VocabItem) => {
    setEditingId(item.id);
    setEditWord(item.word);
    setEditMeaning(item.meaning);
    setEditTopic(item.topic || '');
  };

  const saveEdit = (id: string) => {
    if (!editWord.trim() || !editMeaning.trim()) return;
    setVocabList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              word: editWord.trim(),
              meaning: editMeaning.trim(),
              topic: editTopic.trim() || item.topic,
            }
          : item
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteItem = (id: string) => {
    setVocabList(prev => prev.filter(item => item.id !== id));
  };

  const deleteTopic = (topicToDelete: string) => {
    setVocabList(prev => prev.filter(item => (item.topic || 'Chủ đề chung') !== topicToDelete));
    if (selectedTopic === topicToDelete) {
      setSelectedTopic('ALL');
    }
  };

  const handleClearAll = () => {
    if (vocabList.length === 0) return;
    setVocabList([]);
    setSelectedTopic('ALL');
  };

  const handleResetStarter = () => {
    const fresh = createInitialVocabList();
    setVocabList(fresh);
    setSelectedTopic('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Top Hero / Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{topicGroups.length} Chủ đề (Units) • {vocabList.length} Từ vựng có phát âm chuẩn</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Học & Ôn Tập Từ Vựng Theo Chủ Đề
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Chọn bất kỳ chủ đề (Unit) nào bên dưới để nghe phát âm từng từ vựng và bắt đầu bài kiểm tra 4 dạng câu hỏi, hoặc tự thêm từ vựng mới của riêng bạn.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowInputPanel(prev => !prev)}
            className="flex-1 sm:flex-none px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showInputPanel ? 'Ẩn khung thêm từ' : 'Thêm / Tải từ mới'}</span>
          </button>

          <button
            type="button"
            onClick={() => onStartPractice(selectedTopic === 'ALL' ? undefined : selectedTopic)}
            disabled={vocabList.length === 0}
            className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              vocabList.length === 0
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>
              {selectedTopic === 'ALL'
                ? 'Ôn tập tất cả chủ đề'
                : `Luyện tập chủ đề đang chọn`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Input Module (Manual / Bulk / File Upload) */}
      {showInputPanel && (
        <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-md overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Bổ sung từ vựng mới vào kho</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowInputPanel(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
            >
              Đóng ✕
            </button>
          </div>

          {/* Input Method Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 sm:p-2 gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setActiveInputTab('single')}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeInputTab === 'single'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Nhập từng từ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('bulk')}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeInputTab === 'bulk'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Dán hàng loạt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('file')}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeInputTab === 'file'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Tải file (.txt, .csv, .pdf, .pptx)</span>
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {/* TAB 1: Single Input */}
            {activeInputTab === 'single' && (
              <form onSubmit={handleAddSingle} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="word-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Từ Tiếng Anh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="word-input"
                      type="text"
                      value={newWord}
                      onChange={e => setNewWord(e.target.value)}
                      placeholder="ví dụ: pineapple"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="meaning-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nghĩa Tiếng Việt <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="meaning-input"
                      type="text"
                      value={newMeaning}
                      onChange={e => setNewMeaning(e.target.value)}
                      placeholder="ví dụ: quả dứa, thơm"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="topic-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Chủ đề (Unit)
                    </label>
                    <input
                      id="topic-input"
                      type="text"
                      list="topic-suggestions"
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      placeholder="Nhập hoặc chọn chủ đề..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <datalist id="topic-suggestions">
                      {topicGroups.map(g => (
                        <option key={g.topic} value={g.topic} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {singleError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{singleError}</span>
                  </div>
                )}

                {singleSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{singleSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm vào chủ đề</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Bulk Input */}
            {activeInputTab === 'bulk' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800">Hỗ trợ tự nhận diện dòng UNIT hoặc cặp từ:</p>
                    <p className="font-mono text-slate-600 mt-0.5">word : meaning &nbsp;|&nbsp; word - meaning</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Chủ đề mặc định (nếu không ghi dòng UNIT):
                    </label>
                    <input
                      type="text"
                      value={bulkTopic}
                      onChange={e => setBulkTopic(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={`UNIT 60: CUSTOM TOPIC\napple: quả táo\nbanana: quả chuối`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs sm:text-sm"
                />

                {bulkError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bulkError}</span>
                  </div>
                )}

                {bulkSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{bulkSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    <span>Phân tích & Thêm danh sách</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: File Upload */}
            {activeInputTab === 'file' && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv,.pdf,.pptx,.tsv,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    Nhấp để tải lên tệp tin (.pdf, .pptx, .csv, .txt)
                  </h3>
                  <div className="inline-flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-rose-500" /> PDF</span>
                    <span className="flex items-center gap-1"><Presentation className="w-3.5 h-3.5 text-amber-500" /> PPTX</span>
                    <span className="flex items-center gap-1"><FileCode className="w-3.5 h-3.5 text-emerald-500" /> CSV / TXT</span>
                  </div>
                </div>

                {isProcessingFile && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-xs flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang trích xuất nội dung từ file...</span>
                  </div>
                )}

                {fileError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {fileSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{fileSuccess}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOPIC BROWSER SECTION: CHỌN CHỦ ĐỀ ĐỂ HỌC THEO TỪNG CHỦ ĐỀ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Chọn Chủ Đề (Unit) Để Học & Nghe Phát Âm
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {topicGroups.length} chủ đề
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nhấp vào một chủ đề để xem danh sách từ vựng, nghe đọc từng từ hoặc làm bài kiểm tra riêng cho chủ đề đó
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                placeholder="Tìm nhanh Unit / Chủ đề..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAllTopicsGrid(prev => !prev)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0"
            >
              <span>{showAllTopicsGrid ? 'Thu gọn' : 'Mở rộng'}</span>
              {showAllTopicsGrid ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showAllTopicsGrid && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* All Topics Pill + Individual Topic Cards */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedTopic('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  selectedTopic === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Tất cả chủ đề ({vocabList.length} từ)</span>
              </button>

              {selectedTopic !== 'ALL' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleAutoPlayList}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      isAutoPlayingTopic
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isAutoPlayingTopic ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Dừng đọc tự động</span>
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5" />
                        <span>Đọc phát âm cả chủ đề này</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartPractice(selectedTopic)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Kiểm tra chủ đề này</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredTopicGroups.map((group) => {
                const isSelected = selectedTopic === group.topic;
                return (
                  <div
                    key={group.topic}
                    onClick={() => setSelectedTopic(group.topic)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-100 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold text-xs truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                        {group.topic}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {group.count} từ vựng
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartPractice(group.topic);
                        }}
                        title={`Làm bài tập ${group.topic}`}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Học</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTopic(group.topic);
                        }}
                        title={`Xóa chủ đề ${group.topic}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Vocabulary Table & Audio Study Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header & actions bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {selectedTopic === 'ALL' ? 'Tất cả từ vựng' : selectedTopic}
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {filteredList.length} từ
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nhấp vào nút <strong className="text-indigo-600">Đọc âm thanh (🔊)</strong> bên cạnh mỗi từ để nghe phát âm tiếng Anh chuẩn
              </p>
            </div>
          </div>

          {/* Action buttons & search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm từ tiếng Anh hoặc nghĩa..."
                className="w-full pl-9 pr-7 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleAutoPlayList}
              disabled={filteredList.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAutoPlayingTopic
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {isAutoPlayingTopic ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Đọc lần lượt ({filteredList.length})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetStarter}
              title="Khôi phục đầy đủ 42 chủ đề gốc"
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nạp lại 42 Unit</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={vocabList.length === 0}
              className={`px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                vocabList.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa hết</span>
            </button>
          </div>
        </div>

        {/* Table / List */}
        {filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <BookMarked className="w-8 h-8" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">
              {vocabList.length === 0 ? 'Chưa có từ vựng nào trong danh sách' : 'Không tìm thấy từ nào khớp với bộ lọc hiện tại'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {selectedTopic !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic('ALL')}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Xem tất cả chủ đề
                </button>
              )}
              {vocabList.length === 0 && (
                <button
                  type="button"
                  onClick={handleResetStarter}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Nạp bộ từ vựng 42 Chủ đề (Units 3 - 59)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 sm:px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-3 sm:px-4 min-w-[210px]">Từ Tiếng Anh & Âm thanh</th>
                  <th className="py-3 px-3 sm:px-4 min-w-[200px]">Nghĩa Tiếng Việt</th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell min-w-[180px]">Chủ đề (Unit)</th>
                  <th className="py-3 px-3 sm:px-4 text-right w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredList.map((item, index) => {
                  const isEditing = editingId === item.id;
                  const isSpeakingThis = speakingWordId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors group ${
                        isSpeakingThis ? 'bg-indigo-50/90' : 'hover:bg-indigo-50/30'
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3 px-3 sm:px-4 text-center text-xs text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Word + Prominent Audio Button */}
                      <td className="py-3 px-3 sm:px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editWord}
                            onChange={e => setEditWord(e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg border border-indigo-400 text-sm font-semibold focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleSpeakSingleWord(item)}
                              title={`Nghe phát âm: ${item.word}`}
                              aria-label={`Phát âm ${item.word}`}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-2xs ${
                                isSpeakingThis
                                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 scale-105'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100'
                              }`}
                            >
                              <Volume2 className={`w-3.5 h-3.5 ${isSpeakingThis ? 'animate-bounce' : ''}`} />
                              <span className="hidden sm:inline">Đọc</span>
                            </button>

                            <div
                              onClick={() => handleSpeakSingleWord(item)}
                              className="cursor-pointer min-w-0"
                            >
                              <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                {item.word}
                              </div>
                              <div className="text-xs font-mono text-indigo-600/90 font-normal">
                                {getPhonetic(item.word, item.phonetic)}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Meaning */}
                      <td className="py-3 px-3 sm:px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editMeaning}
                            onChange={e => setEditMeaning(e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg border border-indigo-400 text-sm focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-700 font-medium">{item.meaning}</span>
                        )}
                      </td>

                      {/* Topic */}
                      <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTopic}
                            onChange={e => setEditTopic(e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg border border-indigo-400 text-xs focus:outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedTopic(item.topic || 'ALL')}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-800 transition-colors text-left truncate max-w-[220px] block"
                          >
                            {item.topic || 'Chưa phân loại'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => saveEdit(item.id)}
                              title="Lưu thay đổi"
                              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              title="Hủy"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              title="Chỉnh sửa từ này"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              title="Xóa từ này"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
