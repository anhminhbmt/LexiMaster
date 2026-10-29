/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { VocabInputSection } from './components/VocabInputSection.tsx';
import { PracticeSection } from './components/PracticeSection.tsx';
import { QuizSummary } from './components/QuizSummary.tsx';
import { VocabItem, QuizMode, QuizSessionStats } from './types.ts';
import { createInitialVocabList, syncWithCurriculumVocab } from './data/starterVocab.ts';
import { Rocket, FileCode, Archive, FileText, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_VOCAB = 'leximaster_vocab_items_v3';
const STORAGE_KEY_SOUND = 'leximaster_sound_enabled';

export default function App() {
  // Initialize vocab from LocalStorage (auto-synced with latest curriculum units) or curriculum starter kit
  const [vocabList, setVocabList] = useState<VocabItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOCAB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return syncWithCurriculumVocab(parsed);
        }
      }
    } catch {
      // Ignore parse error
    }
    return createInitialVocabList();
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'vocab' | 'practice' | 'summary'>('vocab');

  // Quiz state
  const [lastStats, setLastStats] = useState<QuizSessionStats | null>(null);
  const [lastMode, setLastMode] = useState<QuizMode>('mixed');
  const [missedFilter, setMissedFilter] = useState<VocabItem[] | undefined>(undefined);
  const [selectedTopicForPractice, setSelectedTopicForPractice] = useState<string | undefined>(undefined);

  // Sync vocab to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOCAB, JSON.stringify(vocabList));
    } catch {
      // Storage quota or error
    }
  }, [vocabList]);

  // Sync sound setting to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Check ?autostart=1 or ?practice=1 URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('practice') === '1') {
      setCurrentTab('practice');
    }
  }, []);

  const handleFinishQuiz = (stats: QuizSessionStats, mode: QuizMode) => {
    setLastStats(stats);
    setLastMode(mode);
    setCurrentTab('summary');
  };

  const handleReviewMissedOnly = (missedItems: VocabItem[]) => {
    setMissedFilter(missedItems);
    setCurrentTab('practice');
  };

  const handleRestartSameMode = () => {
    setMissedFilter(undefined);
    setCurrentTab('practice');
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  const handleExportTxt = () => {
    if (vocabList.length === 0) {
      return;
    }
    const lines = vocabList.map(item =>
      item.topic ? `[${item.topic}] ${item.word}: ${item.meaning}` : `${item.word}: ${item.meaning}`
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leximaster-vocabulary-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleExportIndexHtmlForGitHub = () => {
    import('./utils/standaloneHtmlGenerator.ts').then(({ generateStandaloneSingleHtml }) => {
      const htmlContent = generateStandaloneSingleHtml(vocabList);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `index.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const handleExportGitHubPagesZip = async () => {
    setIsGeneratingZip(true);
    try {
      const { generateGitHubPagesZip } = await import('./utils/standaloneHtmlGenerator.ts');
      const blob = await generateGitHubPagesZip(vocabList);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leximaster-github-pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'practice') {
            setMissedFilter(undefined);
          }
          setCurrentTab(tab);
        }}
        vocabCount={vocabList.length}
        hasSummary={lastStats !== null}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onExportData={() => setShowExportModal(true)}
      />

      {/* GitHub Pages Deployment & Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Triển Khai Lên Web GitHub (GitHub Pages)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đầy đủ {vocabList.length} từ vựng (42 Chủ đề), âm thanh đọc & bài kiểm tra 4 dạng câu hỏi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Option 1: Direct index.html or ZIP for GitHub web upload */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                Cách 1: Kéo thả trực tiếp lên trang web GitHub.com (Nhanh nhất - 1 phút)
              </div>

              <button
                onClick={handleExportIndexHtmlForGitHub}
                className="w-full p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-indigo-950 text-xs sm:text-sm group-hover:text-indigo-700">
                      Tải file chuẩn <code className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">index.html</code> (Khuyên dùng)
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      1 file duy nhất chứa toàn bộ ứng dụng & 42 chủ đề từ vựng. Chỉ cần tải lên Repository GitHub và bật GitHub Pages là chạy ngay!
                    </div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-white bg-indigo-600 px-3 py-1.5 rounded-xl shrink-0">
                  Tải index.html
                </span>
              </button>

              <button
                onClick={handleExportGitHubPagesZip}
                disabled={isGeneratingZip}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 text-left transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600">
                      {isGeneratingZip ? 'Đang đóng gói...' : 'Tải trọn bộ gói GitHub Pages (.zip)'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bao gồm <code className="font-mono">index.html</code>, <code className="font-mono">.nojekyll</code> và <code className="font-mono">README.md</code> hướng dẫn chi tiết
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 shrink-0">.zip →</span>
              </button>
            </div>

            {/* Step-by-step GitHub guide */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hướng dẫn 3 bước đưa lên GitHub Pages:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-0.5 leading-relaxed">
                <li>
                  Vào <strong>github.com</strong> → tạo một Repository mới (đặt tên bất kỳ, chọn chế độ <strong>Public</strong>).
                </li>
                <li>
                  Nhấn <strong>uploading an existing file</strong> → kéo thả file <code className="px-1.5 py-0.5 bg-white border rounded font-bold text-slate-800">index.html</code> vừa tải ở trên vào → bấm <strong>Commit changes</strong>.
                </li>
                <li>
                  Vào mục <strong>Settings</strong> → <strong>Pages</strong> (menu trái) → dưới mục <strong>Branch</strong> chọn <code className="px-1 py-0.5 bg-white border rounded font-bold">main</code> rồi bấm <strong>Save</strong>. Đợi 1 phút là có link web!
                </li>
              </ol>
              <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/70">
                💡 <strong>Nếu bạn đẩy toàn bộ mã nguồn React/Vite này lên GitHub:</strong> Dự án cũng đã được tích hợp sẵn <code className="font-mono">.github/workflows/deploy.yml</code> và <code className="font-mono">base: './'</code> để tự động build qua <strong>GitHub Actions</strong>.
              </div>
            </div>

            {/* Export raw text */}
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleExportTxt}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xuất danh sách từ vựng dạng văn bản (.txt)</span>
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'vocab' && (
          <VocabInputSection
            vocabList={vocabList}
            setVocabList={setVocabList}
            onStartPractice={(topic) => {
              setMissedFilter(undefined);
              setSelectedTopicForPractice(topic);
              setCurrentTab('practice');
            }}
          />
        )}

        {currentTab === 'practice' && (
          <PracticeSection
            vocabList={vocabList}
            onFinishQuiz={handleFinishQuiz}
            onNavigateToVocab={() => setCurrentTab('vocab')}
            soundEnabled={soundEnabled}
            preselectedMode={lastMode}
            initialFilterItems={missedFilter}
            initialSelectedTopic={selectedTopicForPractice}
          />
        )}

        {currentTab === 'summary' && lastStats && (
          <QuizSummary
            stats={lastStats}
            onRestartSameMode={handleRestartSameMode}
            onReviewMissedOnly={handleReviewMissedOnly}
            onSelectNewMode={() => {
              setMissedFilter(undefined);
              setCurrentTab('practice');
            }}
            onBackToVocab={() => setCurrentTab('vocab')}
            mode={lastMode}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-700">LexiMaster</span>
            <span>—</span>
            <span>Ứng dụng học & ôn tập từ vựng tiếng Anh theo chủ đề (Sẵn sàng cho GitHub Pages)</span>
          </div>
          <div>
            Toàn bộ dữ liệu được lưu an toàn trong trình duyệt (LocalStorage).
          </div>
        </div>
      </footer>
    </div>
  );
}
