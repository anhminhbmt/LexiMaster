import React from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, ListRestart, Award, Download } from 'lucide-react';

interface NavbarProps {
  currentTab: 'vocab' | 'practice' | 'summary';
  setCurrentTab: (tab: 'vocab' | 'practice' | 'summary') => void;
  vocabCount: number;
  hasSummary: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onExportData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  vocabCount,
  hasSummary,
  soundEnabled,
  setSoundEnabled,
  onExportData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('vocab')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">
                LexiMaster
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                EdTech
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Ôn luyện từ vựng thông minh</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentTab('vocab')}
            aria-label="Quản lý từ vựng"
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              currentTab === 'vocab'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListRestart className="w-3.5 h-3.5 sm:w-4 h-4 shrink-0" />
            <span>Từ vựng</span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full ${
                currentTab === 'vocab' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {vocabCount}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('practice')}
            aria-label="Luyện tập kiểm tra"
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
              currentTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 h-4 shrink-0" />
            <span>Luyện tập</span>
          </button>

          {hasSummary && (
            <button
              onClick={() => setCurrentTab('summary')}
              aria-label="Tổng kết kết quả"
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                currentTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 sm:w-4 h-4 shrink-0" />
              <span>Kết quả</span>
            </button>
          )}
        </nav>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={onExportData}
            title="Triển khai lên GitHub Pages hoặc Xuất file"
            aria-label="Triển khai GitHub Pages & Xuất dữ liệu"
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden md:inline">Triển khai GitHub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
