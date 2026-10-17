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
import { createInitialVocabList } from './data/starterVocab.ts';

const STORAGE_KEY_VOCAB = 'leximaster_vocab_items_v3';
const STORAGE_KEY_SOUND = 'leximaster_sound_enabled';

export default function App() {
  // Initialize vocab from LocalStorage or curriculum starter kit (without Unit 1 & 2)
  const [vocabList, setVocabList] = useState<VocabItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOCAB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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

  const handleExportSingleHtml = () => {
    import('./utils/standaloneHtmlGenerator.ts').then(({ generateStandaloneSingleHtml }) => {
      const htmlContent = generateStandaloneSingleHtml(vocabList);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leximaster-app-standalone.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    });
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Tùy chọn xuất dữ liệu</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có thể xuất danh sách từ vựng dạng văn bản hoặc tải về một file HTML độc lập chứa toàn bộ ứng dụng và dữ liệu hiện tại để chạy offline.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={handleExportTxt}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600">
                    Xuất file văn bản (.txt)
                  </div>
                  <div className="text-[11px] text-slate-500">Định dạng word: meaning cho Anki / Quizlet</div>
                </div>
                <span className="text-xs font-bold text-indigo-600">.txt →</span>
              </button>

              <button
                onClick={handleExportSingleHtml}
                className="w-full p-3.5 rounded-2xl border-2 border-indigo-200 hover:border-indigo-600 bg-indigo-50/30 hover:bg-indigo-50 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-indigo-900 text-xs sm:text-sm group-hover:text-indigo-700">
                    Xuất ứng dụng HTML độc lập (.html)
                  </div>
                  <div className="text-[11px] text-indigo-600/80">Chạy offline trên bất kỳ máy tính/điện thoại nào</div>
                </div>
                <span className="text-xs font-bold text-indigo-700">.html →</span>
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
            <span>Ứng dụng học & ôn tập từ vựng tiếng Anh theo chủ đề</span>
          </div>
          <div>
            Toàn bộ dữ liệu được lưu an toàn trong trình duyệt (LocalStorage).
          </div>
        </div>
      </footer>
    </div>
  );
}
