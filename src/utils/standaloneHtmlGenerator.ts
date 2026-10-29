import JSZip from 'jszip';
import { VocabItem } from '../types.ts';
import { createInitialVocabList } from '../data/starterVocab.ts';

export function generateStandaloneSingleHtml(vocabList: VocabItem[]): string {
  const defaultVocab = createInitialVocabList();
  const activeList = vocabList.length > 0 ? vocabList : defaultVocab;
  const initialJson = JSON.stringify(activeList);
  const starterJson = JSON.stringify(defaultVocab);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LexiMaster - Học & Ôn Tập Từ Vựng Tiếng Anh Theo Chủ Đề</title>
  <meta name="description" content="Ứng dụng học từ vựng tiếng Anh theo 42 chủ đề có phát âm chuẩn và bài kiểm tra kết hợp cả 4 dạng câu hỏi.">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Be Vietnam Pro -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <style>
    body { font-family: 'Be Vietnam Pro', system-ui, sans-serif; }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .animate-shake { animation: shake 0.4s ease-in-out both; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- Navbar -->
  <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
      <div onclick="switchTab('vocab')" class="flex items-center gap-2.5 cursor-pointer">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
          LM
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-base sm:text-lg text-indigo-700">LexiMaster</span>
            <span class="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">EdTech</span>
          </div>
          <p class="text-[11px] text-slate-500 hidden sm:block">Học từ vựng theo chủ đề & phát âm chuẩn</p>
        </div>
      </div>

      <nav class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
        <button id="nav-vocab" onclick="switchTab('vocab')" class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all bg-indigo-600 text-white shadow-xs">
          Từ vựng (<span id="nav-vocab-count">0</span>)
        </button>
        <button id="nav-practice" onclick="switchTab('practice')" class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all text-slate-600 hover:text-slate-900">
          Luyện tập
        </button>
      </nav>

      <div class="flex items-center gap-1.5">
        <button id="btn-sound-toggle" onclick="toggleSound()" class="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-600 text-xs font-bold" title="Bật/Tắt âm thanh">
          🔊 Âm thanh: Bật
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
    <!-- TAB 1: VOCAB & TOPICS -->
    <div id="view-vocab" class="space-y-6">
      <!-- Hero Banner -->
      <div class="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
            ✨ <span id="hero-stats-badge">42 Chủ đề • 571 Từ vựng có phát âm chuẩn</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Học & Ôn Tập Từ Vựng Theo Chủ Đề</h1>
          <p class="text-indigo-100 text-sm sm:text-base">
            Chọn bất kỳ chủ đề (Unit) nào bên dưới để nghe phát âm từng từ vựng và bắt đầu bài kiểm tra kết hợp cả 4 dạng câu hỏi.
          </p>
        </div>
        <div class="flex flex-wrap gap-3 w-full lg:w-auto">
          <button onclick="toggleAddPanel()" class="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/25 transition-all">
            + Thêm từ mới
          </button>
          <button onclick="openPracticeForCurrentTopic()" class="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all">
            Ôn tập ngay →
          </button>
        </div>
      </div>

      <!-- Collapsible Add Word Panel -->
      <div id="add-word-panel" class="hidden bg-white rounded-3xl p-5 sm:p-6 border-2 border-indigo-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-extrabold text-slate-800 text-sm sm:text-base">Thêm từ vựng mới hoặc dán danh sách</h3>
          <button onclick="toggleAddPanel()" class="text-xs font-bold text-slate-400 hover:text-slate-700">Đóng ✕</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input id="in-topic" type="text" placeholder="Chủ đề (vd: UNIT 3: DAYS...)" class="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm">
          <input id="in-word" type="text" placeholder="Từ tiếng Anh (vd: Monday)" class="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold">
          <input id="in-meaning" type="text" placeholder="Nghĩa tiếng Việt (vd: Thứ Hai)" class="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm">
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <button onclick="addSingleWord()" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            + Lưu từ vựng
          </button>
          <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <textarea id="in-bulk" rows="2" placeholder="Hoặc dán nhiều dòng: word: meaning" class="flex-1 sm:w-72 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"></textarea>
            <button onclick="addBulkWords()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shrink-0">
              Nhập hàng loạt
            </button>
          </div>
        </div>
      </div>

      <!-- TOPIC BROWSER -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-extrabold text-slate-900 text-base sm:text-lg">Chọn Chủ Đề (Unit) Để Học & Nghe Phát Âm</h2>
              <span id="topic-count-badge" class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">0 chủ đề</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Nhấp vào một chủ đề để lọc từ vựng, nghe đọc lần lượt hoặc làm bài kiểm tra riêng</p>
          </div>
          <div class="flex items-center gap-2">
            <input id="topic-search" oninput="renderTopics()" type="text" placeholder="Tìm nhanh Unit / Chủ đề..." class="w-full sm:w-56 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white">
          </div>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <button id="btn-all-topics" onclick="selectTopic('ALL')" class="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 text-white shadow-sm">
              Tất cả chủ đề
            </button>
            <div id="selected-topic-actions" class="hidden flex items-center gap-2">
              <button id="btn-autoplay-topic" onclick="toggleAutoPlayCurrentList()" class="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                🔊 Đọc phát âm cả chủ đề này
              </button>
              <button onclick="openPracticeForCurrentTopic()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold">
                ▶ Kiểm tra chủ đề này
              </button>
            </div>
          </div>

          <div id="topics-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1"></div>
        </div>
      </div>

      <!-- VOCABULARY TABLE -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 id="current-topic-title" class="font-extrabold text-slate-900 text-base sm:text-lg">Tất cả từ vựng</h2>
              <span id="filtered-count-badge" class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">0 từ</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Nhấp vào nút <strong class="text-indigo-600">🔊 Đọc</strong> bên cạnh mỗi từ để nghe phát âm tiếng Anh chuẩn</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <input id="vocab-search" oninput="renderVocabTable()" type="text" placeholder="Tìm từ tiếng Anh hoặc nghĩa..." class="flex-1 sm:w-56 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white">
            <button id="btn-autoplay-table" onclick="toggleAutoPlayCurrentList()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">
              🔊 Đọc lần lượt
            </button>
            <button onclick="resetStarterVocab()" class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold">
              ↻ Nạp lại 42 Unit
            </button>
          </div>
        </div>
        <div class="overflow-x-auto max-h-[540px] overflow-y-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead class="sticky top-0 bg-slate-50 shadow-2xs z-10">
              <tr class="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th class="py-3 px-3 sm:px-4 w-12 text-center">STT</th>
                <th class="py-3 px-3 sm:px-4 min-w-[210px]">Từ Tiếng Anh & Âm thanh</th>
                <th class="py-3 px-3 sm:px-4 min-w-[200px]">Nghĩa Tiếng Việt</th>
                <th class="py-3 px-3 sm:px-4 hidden md:table-cell">Chủ đề (Unit)</th>
                <th class="py-3 px-3 sm:px-4 text-right w-20">Xóa</th>
              </tr>
            </thead>
            <tbody id="vocab-table-body" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: PRACTICE CONFIGURATION -->
    <div id="view-practice" class="hidden space-y-6">
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Thiết lập bài kiểm tra theo yêu cầu</span>
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">Tùy Chỉnh Chủ Đề, Số Lượng & 4 Dạng Câu Hỏi</h1>
          </div>
          <button onclick="startQuizNow()" class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all">
            ▶ Bắt đầu làm bài ngay
          </button>
        </div>

        <!-- Step 1: Select Topic -->
        <div class="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <label class="text-xs sm:text-sm font-extrabold text-slate-800 uppercase">1. Chọn Chủ Đề (Unit) Muốn Kiểm Tra</label>
            <div class="flex items-center gap-2">
              <button onclick="setPracticeTopicMode('ALL')" id="prac-topic-all" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white">
                Tất cả chủ đề
              </button>
              <button onclick="setPracticeTopicMode('CUSTOM')" id="prac-topic-custom" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-slate-200 text-slate-700">
                Chọn từng Unit cụ thể
              </button>
            </div>
          </div>
          <div id="prac-topics-picker" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pt-2"></div>
        </div>

        <!-- Step 2: Select 4 Question Types -->
        <div class="space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <label class="text-xs sm:text-sm font-extrabold text-slate-800 uppercase">2. Chọn Dạng Câu Hỏi Trong Bài Làm</label>
              <p class="text-xs text-slate-500">Mặc định tích chọn cả 4 dạng để tạo 1 bài kiểm tra tổng hợp đầy đủ 4 dạng câu hỏi</p>
            </div>
            <button onclick="selectAllFourModes()" class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white">
              ★ Kết hợp cả 4 dạng trong 1 bài
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="prac-modes-grid"></div>
        </div>

        <!-- Step 3: Custom Question Count -->
        <div class="space-y-3 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <label class="text-xs sm:text-sm font-extrabold text-slate-800 uppercase">3. Tùy Chỉnh Số Lượng Câu Hỏi</label>
            <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Sẽ tạo <span id="lbl-q-count">20</span> câu hỏi</span>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div class="flex flex-wrap items-center gap-1.5">
              <button onclick="setQuestionCount(5)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100">5 câu</button>
              <button onclick="setQuestionCount(10)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100">10 câu</button>
              <button onclick="setQuestionCount(15)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100">15 câu</button>
              <button onclick="setQuestionCount(20)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100">20 câu</button>
              <button onclick="setQuestionCount(30)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100">30 câu</button>
              <button onclick="setQuestionCount(50)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100">50 câu</button>
              <button onclick="setQuestionCountMax()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">Tất cả từ đang chọn</button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Nhập số câu:</span>
              <button onclick="adjustQuestionCount(-1)" class="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold">-</button>
              <input id="in-q-count" type="number" min="1" max="500" value="20" oninput="onCustomCountInput(this.value)" class="w-16 h-8 text-center font-extrabold text-sm rounded-lg border border-indigo-300 bg-white text-indigo-700">
              <button onclick="adjustQuestionCount(1)" class="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: QUIZ PLAYER -->
    <div id="view-player" class="hidden space-y-5">
      <div id="player-container"></div>
    </div>

    <!-- TAB 4: SUMMARY -->
    <div id="view-summary" class="hidden space-y-6">
      <div id="summary-container"></div>
    </div>
  </main>

  <footer class="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div><strong>LexiMaster</strong> — Ứng dụng học & ôn tập từ vựng tiếng Anh theo chủ đề</div>
      <div>Dữ liệu lưu tự động trong trình duyệt (LocalStorage)</div>
    </div>
  </footer>

  <script>
    const STORAGE_KEY = 'leximaster_vocab_items_v3';
    const STARTER_VOCAB = ${starterJson};
    let vocabList = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      vocabList = saved ? JSON.parse(saved) : ${initialJson};
      if (!Array.isArray(vocabList) || vocabList.length === 0) vocabList = ${initialJson};
    } catch (e) {
      vocabList = ${initialJson};
    }

    let soundEnabled = true;
    let selectedTopic = 'ALL';
    let isAutoPlaying = false;
    let stopAutoPlayFlag = false;

    // Practice state
    let practiceTopicMode = 'ALL';
    let practiceSelectedTopics = [];
    let selectedModes = ['vn-to-en', 'en-to-vn', 'multiple-choice', 'matching'];
    let questionCount = 20;

    // Active quiz state
    let quizQueue = [];
    let currentIndex = 0;
    let score = 0;
    let streak = 0;
    let bestStreak = 0;
    let missedIds = new Set();
    let answeredCurrent = false;
    let matchState = { words: [], meanings: [], selWord: null, selMeaning: null, matched: new Set(), wrongPair: false };

    function saveVocab() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabList)); } catch (e) {}
    }

    function cleanWordForSpeech(raw) {
      return String(raw || '')
        .replace(/\\bsb\\b/gi, 'somebody')
        .replace(/\\bsth\\b/gi, 'something')
        .replace(/\\(.*?\\)/g, ' ')
        .replace(/\\s*\\/\\s*/g, ', ')
        .replace(/\\s+/g, ' ')
        .trim();
    }

    function speakWord(text) {
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(cleanWordForSpeech(text));
        u.lang = 'en-US';
        u.rate = 0.92;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    function toggleSound() {
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('btn-sound-toggle');
      if (btn) {
        btn.textContent = soundEnabled ? '🔊 Âm thanh: Bật' : '🔇 Âm thanh: Tắt';
        btn.className = soundEnabled
          ? 'p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-600 text-xs font-bold'
          : 'p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-bold';
      }
    }

    function getTopicGroups() {
      const map = new Map();
      vocabList.forEach(item => {
        const t = item.topic || 'Chủ đề chung';
        map.set(t, (map.get(t) || 0) + 1);
      });
      return Array.from(map.entries()).map(([topic, count]) => ({ topic, count }));
    }

    function getFilteredVocab() {
      const q = (document.getElementById('vocab-search')?.value || '').trim().toLowerCase();
      return vocabList.filter(item => {
        const t = item.topic || 'Chủ đề chung';
        if (selectedTopic !== 'ALL' && t !== selectedTopic) return false;
        if (!q) return true;
        return item.word.toLowerCase().includes(q) || item.meaning.toLowerCase().includes(q) || t.toLowerCase().includes(q);
      });
    }

    function renderAll() {
      const groups = getTopicGroups();
      document.getElementById('nav-vocab-count').textContent = vocabList.length;
      document.getElementById('hero-stats-badge').textContent = groups.length + ' Chủ đề (Units) • ' + vocabList.length + ' Từ vựng có phát âm chuẩn';
      document.getElementById('topic-count-badge').textContent = groups.length + ' chủ đề';
      renderTopics();
      renderVocabTable();
      renderPracticeConfig();
    }

    function renderTopics() {
      const groups = getTopicGroups();
      const q = (document.getElementById('topic-search')?.value || '').trim().toLowerCase();
      const filteredGroups = q ? groups.filter(g => g.topic.toLowerCase().includes(q)) : groups;

      const btnAll = document.getElementById('btn-all-topics');
      btnAll.textContent = 'Tất cả chủ đề (' + vocabList.length + ' từ)';
      btnAll.className = selectedTopic === 'ALL'
        ? 'px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 text-white shadow-sm'
        : 'px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-700 hover:bg-slate-200';

      document.getElementById('selected-topic-actions').classList.toggle('hidden', selectedTopic === 'ALL');

      const grid = document.getElementById('topics-grid');
      grid.innerHTML = filteredGroups.map(g => {
        const isSel = selectedTopic === g.topic;
        const safeTopic = g.topic.replace(/'/g, "\\\\'");
        return \`
          <div onclick="selectTopic('\${safeTopic}')" class="p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 \${isSel ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-300'}">
            <div class="min-w-0 flex-1">
              <div class="font-bold text-xs truncate \${isSel ? 'text-indigo-950' : 'text-slate-800'}">\${g.topic}</div>
              <div class="text-[11px] text-slate-500 font-medium mt-0.5">\${g.count} từ vựng</div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="event.stopPropagation(); startPracticeForTopic('\${safeTopic}')" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold">▶ Học</button>
              <button onclick="event.stopPropagation(); deleteTopic('\${safeTopic}')" title="Xóa chủ đề" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs">🗑</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderVocabTable() {
      const list = getFilteredVocab();
      document.getElementById('current-topic-title').textContent = selectedTopic === 'ALL' ? 'Tất cả từ vựng' : selectedTopic;
      document.getElementById('filtered-count-badge').textContent = list.length + ' từ';
      const tbody = document.getElementById('vocab-table-body');
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-400 text-xs">Không có từ vựng nào khớp với bộ lọc hiện tại.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map((item, idx) => {
        const safeWord = item.word.replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
        return \`
          <tr class="hover:bg-indigo-50/30 transition-colors">
            <td class="py-3 px-3 sm:px-4 text-center text-xs text-slate-400 font-mono">\${idx + 1}</td>
            <td class="py-3 px-3 sm:px-4">
              <div class="flex items-center gap-2.5">
                <button onclick="speakWord('\${safeWord}')" class="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200/80 text-xs font-bold transition-all shrink-0">🔊 Đọc</button>
                <span class="font-bold text-slate-900">\${item.word}</span>
              </div>
            </td>
            <td class="py-3 px-3 sm:px-4 text-slate-700 font-medium">\${item.meaning}</td>
            <td class="py-3 px-3 sm:px-4 hidden md:table-cell">
              <span class="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">\${item.topic || 'Chủ đề chung'}</span>
            </td>
            <td class="py-3 px-3 sm:px-4 text-right">
              <button onclick="deleteWord('\${item.id}')" class="text-slate-400 hover:text-rose-600 px-2 py-1 text-xs font-bold">✕</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function selectTopic(topic) {
      selectedTopic = topic;
      renderAll();
    }

    function deleteTopic(topic) {
      vocabList = vocabList.filter(i => (i.topic || 'Chủ đề chung') !== topic);
      if (selectedTopic === topic) selectedTopic = 'ALL';
      saveVocab();
      renderAll();
    }

    function deleteWord(id) {
      vocabList = vocabList.filter(i => i.id !== id);
      saveVocab();
      renderAll();
    }

    function resetStarterVocab() {
      vocabList = JSON.parse(JSON.stringify(STARTER_VOCAB));
      selectedTopic = 'ALL';
      saveVocab();
      renderAll();
    }

    function toggleAddPanel() {
      document.getElementById('add-word-panel').classList.toggle('hidden');
    }

    function addSingleWord() {
      const t = document.getElementById('in-topic').value.trim() || (selectedTopic !== 'ALL' ? selectedTopic : 'Chủ đề cá nhân');
      const w = document.getElementById('in-word').value.trim();
      const m = document.getElementById('in-meaning').value.trim();
      if (!w || !m) return;
      vocabList.unshift({ id: 'v-' + Date.now(), word: w, meaning: m, topic: t, createdAt: Date.now() });
      document.getElementById('in-word').value = '';
      document.getElementById('in-meaning').value = '';
      saveVocab();
      renderAll();
    }

    function addBulkWords() {
      const raw = document.getElementById('in-bulk').value;
      if (!raw.trim()) return;
      let currentTopic = document.getElementById('in-topic').value.trim() || (selectedTopic !== 'ALL' ? selectedTopic : 'Chủ đề cá nhân');
      const lines = raw.split(/\\r?\\n/);
      lines.forEach((line, idx) => {
        const cleaned = line.trim();
        if (!cleaned) return;
        if (/^(UNIT|CHỦ ĐỀ|TOPIC)\\s+\\d+/i.test(cleaned) && !cleaned.includes('\t')) {
          currentTopic = cleaned;
          return;
        }
        const parts = cleaned.split(/\\s*[:=\\-–—\\t]\\s*/);
        if (parts.length >= 2) {
          const w = parts[0].trim();
          const m = parts.slice(1).join(': ').trim();
          if (w && m) vocabList.push({ id: 'b-' + Date.now() + '-' + idx, word: w, meaning: m, topic: currentTopic, createdAt: Date.now() });
        }
      });
      document.getElementById('in-bulk').value = '';
      saveVocab();
      renderAll();
    }

    async function toggleAutoPlayCurrentList() {
      if (isAutoPlaying) {
        stopAutoPlayFlag = true;
        isAutoPlaying = false;
        window.speechSynthesis && window.speechSynthesis.cancel();
        return;
      }
      const list = getFilteredVocab();
      if (list.length === 0) return;
      isAutoPlaying = true;
      stopAutoPlayFlag = false;
      for (let i = 0; i < list.length; i++) {
        if (stopAutoPlayFlag) break;
        speakWord(list[i].word);
        await new Promise(r => setTimeout(r, 1700));
      }
      isAutoPlaying = false;
    }

    function switchTab(tab) {
      ['vocab', 'practice', 'player', 'summary'].forEach(t => {
        document.getElementById('view-' + t).classList.toggle('hidden', t !== tab);
      });
      document.getElementById('nav-vocab').className = tab === 'vocab'
        ? 'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all bg-indigo-600 text-white shadow-xs'
        : 'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all text-slate-600 hover:text-slate-900';
      document.getElementById('nav-practice').className = (tab === 'practice' || tab === 'player')
        ? 'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all bg-indigo-600 text-white shadow-xs'
        : 'px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all text-slate-600 hover:text-slate-900';
      if (tab === 'practice') renderPracticeConfig();
    }

    function openPracticeForCurrentTopic() {
      if (selectedTopic !== 'ALL') {
        practiceTopicMode = 'CUSTOM';
        practiceSelectedTopics = [selectedTopic];
      } else {
        practiceTopicMode = 'ALL';
      }
      switchTab('practice');
    }

    function startPracticeForTopic(topic) {
      practiceTopicMode = 'CUSTOM';
      practiceSelectedTopics = [topic];
      const topicWords = vocabList.filter(i => (i.topic || 'Chủ đề chung') === topic);
      if (topicWords.length > 0) questionCount = topicWords.length;
      switchTab('practice');
    }

    function getActivePracticePool() {
      if (practiceTopicMode === 'ALL' || practiceSelectedTopics.length === 0) return vocabList;
      return vocabList.filter(i => practiceSelectedTopics.includes(i.topic || 'Chủ đề chung'));
    }

    function setPracticeTopicMode(mode) {
      practiceTopicMode = mode;
      if (mode === 'CUSTOM' && practiceSelectedTopics.length === 0) {
        const groups = getTopicGroups();
        if (groups.length > 0) practiceSelectedTopics = [groups[0].topic];
      }
      renderPracticeConfig();
    }

    function togglePracticeTopic(topic) {
      if (practiceSelectedTopics.includes(topic)) {
        if (practiceSelectedTopics.length > 1) practiceSelectedTopics = practiceSelectedTopics.filter(t => t !== topic);
      } else {
        practiceSelectedTopics.push(topic);
      }
      renderPracticeConfig();
    }

    function togglePracticeModeType(type) {
      if (selectedModes.includes(type)) {
        if (selectedModes.length > 1) selectedModes = selectedModes.filter(t => t !== type);
      } else {
        selectedModes.push(type);
      }
      renderPracticeConfig();
    }

    function selectAllFourModes() {
      selectedModes = ['vn-to-en', 'en-to-vn', 'multiple-choice', 'matching'];
      renderPracticeConfig();
    }

    function setQuestionCount(n) {
      questionCount = Math.max(1, n);
      document.getElementById('in-q-count').value = questionCount;
      document.getElementById('lbl-q-count').textContent = questionCount;
    }

    function setQuestionCountMax() {
      const pool = getActivePracticePool();
      setQuestionCount(Math.max(1, pool.length));
    }

    function adjustQuestionCount(delta) {
      setQuestionCount(Math.max(1, questionCount + delta));
    }

    function onCustomCountInput(val) {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) {
        questionCount = Math.min(500, n);
        document.getElementById('lbl-q-count').textContent = questionCount;
      }
    }

    function renderPracticeConfig() {
      document.getElementById('prac-topic-all').className = practiceTopicMode === 'ALL'
        ? 'px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white'
        : 'px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-slate-200 text-slate-700';
      document.getElementById('prac-topic-custom').className = practiceTopicMode === 'CUSTOM'
        ? 'px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 text-white'
        : 'px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-slate-200 text-slate-700';

      const picker = document.getElementById('prac-topics-picker');
      picker.classList.toggle('hidden', practiceTopicMode !== 'CUSTOM');
      if (practiceTopicMode === 'CUSTOM') {
        const groups = getTopicGroups();
        picker.innerHTML = groups.map(g => {
          const checked = practiceSelectedTopics.includes(g.topic);
          const safeTopic = g.topic.replace(/'/g, "\\\\'");
          return \`
            <button onclick="togglePracticeTopic('\${safeTopic}')" class="p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 text-xs \${checked ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold' : 'border-slate-200 bg-white text-slate-700'}">
              <span class="truncate">\${checked ? '✓ ' : ''}\${g.topic}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100">\${g.count} từ</span>
            </button>
          \`;
        }).join('');
      }

      const modeDefs = [
        { id: 'vn-to-en', badge: 'Dạng 1: Nhớ từ vựng', title: 'Nhìn Tiếng Việt → Gõ Tiếng Anh', desc: 'Hiển thị nghĩa tiếng Việt, gõ từ tiếng Anh chính xác.' },
        { id: 'en-to-vn', badge: 'Dạng 2: Dịch nghĩa', title: 'Nhìn Tiếng Anh → Gõ Tiếng Việt', desc: 'Hiển thị từ tiếng Anh kèm âm thanh, gõ nghĩa tiếng Việt.' },
        { id: 'multiple-choice', badge: 'Dạng 3: Trắc nghiệm A, B, C, D', title: 'Chọn Đáp Án Đúng (Multiple Choice)', desc: '1 đáp án đúng và 3 phương án nhiễu từ cùng chủ đề.' },
        { id: 'matching', badge: 'Dạng 4: Ghép cặp', title: 'Nối Cột A Với Cột B (Matching Pairs)', desc: 'Ghép cặp từ tiếng Anh với nghĩa tiếng Việt tương ứng.' }
      ];
      document.getElementById('prac-modes-grid').innerHTML = modeDefs.map(m => {
        const sel = selectedModes.includes(m.id);
        return \`
          <div onclick="togglePracticeModeType('\${m.id}')" class="p-4 rounded-2xl border-2 cursor-pointer transition-all \${sel ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white opacity-75'}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">\${m.badge}</span>
              <span class="text-xs font-extrabold \${sel ? 'text-indigo-600' : 'text-slate-400'}">\${sel ? '✓ Đã chọn' : 'Chưa chọn'}</span>
            </div>
            <h3 class="font-extrabold text-slate-900 text-sm mt-2">\${m.title}</h3>
            <p class="text-xs text-slate-500 mt-1">\${m.desc}</p>
          </div>
        \`;
      }).join('');

      document.getElementById('in-q-count').value = questionCount;
      document.getElementById('lbl-q-count').textContent = questionCount;
    }

    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function startQuizNow(customItems) {
      const pool = customItems || getActivePracticePool();
      if (pool.length === 0) return;
      const types = selectedModes.length > 0 ? selectedModes : ['vn-to-en', 'en-to-vn', 'multiple-choice', 'matching'];
      const total = customItems ? customItems.length : Math.max(1, questionCount);

      let picked = [];
      while (picked.length < total) {
        picked.push(...shuffle(pool));
      }
      picked = picked.slice(0, total);

      const typeSchedule = [];
      while (typeSchedule.length < total) {
        typeSchedule.push(...shuffle(types));
      }

      quizQueue = picked.map((item, idx) => {
        let qType = typeSchedule[idx];
        if (qType === 'matching' && pool.length < 2) qType = 'multiple-choice';
        if (qType === 'multiple-choice') {
          const promptLanguage = Math.random() > 0.5 ? 'vn-prompt' : 'en-prompt';
          const others = shuffle(pool.filter(x => x.id !== item.id)).slice(0, 3);
          const opts = shuffle([item, ...others]).map(x => promptLanguage === 'vn-prompt' ? x.word : x.meaning);
          return { id: 'q-' + idx, type: 'multiple-choice', item, promptLanguage, options: opts };
        }
        if (qType === 'matching') {
          const others = shuffle(pool.filter(x => x.id !== item.id)).slice(0, Math.min(3, pool.length - 1));
          return { id: 'q-' + idx, type: 'matching', item, matchingItems: shuffle([item, ...others]) };
        }
        return { id: 'q-' + idx, type: qType, item };
      });

      currentIndex = 0;
      score = 0;
      streak = 0;
      bestStreak = 0;
      missedIds = new Set();
      switchTab('player');
      renderCurrentQuestion();
    }

    function normalizeAns(s) {
      return String(s || '').trim().toLowerCase().replace(/[.,!?;:'"()\\[\\]{}]/g, '').replace(/\\s+/g, ' ');
    }

    function isAnswerMatch(userRaw, targetRaw) {
      const u = normalizeAns(userRaw);
      if (!u) return false;
      const parts = String(targetRaw || '').split(/[/,;]|\\(.*?\\)/).map(normalizeAns).filter(Boolean);
      parts.push(normalizeAns(targetRaw));
      return parts.some(p => p === u || (p.length >= 5 && Math.abs(p.length - u.length) <= 1 && p.includes(u.slice(0, 4))));
    }

    function renderCurrentQuestion() {
      answeredCurrent = false;
      const q = quizQueue[currentIndex];
      if (!q) return finishQuiz();
      const container = document.getElementById('player-container');
      const progress = Math.round(((currentIndex + 1) / quizQueue.length) * 100);
      const safeWord = q.item.word.replace(/'/g, "\\\\'").replace(/"/g, '&quot;');

      let bodyHtml = '';
      if (q.type === 'vn-to-en' || q.type === 'en-to-vn') {
        const isVnToEn = q.type === 'vn-to-en';
        const promptText = isVnToEn ? q.item.meaning : q.item.word;
        bodyHtml = \`
          <div class="text-center space-y-3 py-4">
            <span class="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">\${isVnToEn ? 'Nhìn Tiếng Việt → Gõ Tiếng Anh' : 'Nhìn Tiếng Anh → Gõ Tiếng Việt'}</span>
            <div class="text-xs text-slate-400 font-semibold">\${q.item.topic || ''}</div>
            <div class="flex items-center justify-center gap-3">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">\${promptText}</h2>
              <button onclick="speakWord('\${safeWord}')" class="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-200">🔊 Nghe phát âm</button>
            </div>
            <div class="max-w-md mx-auto pt-4 space-y-3">
              <input id="quiz-input" onkeydown="if(event.key==='Enter') submitTypingAnswer()" type="text" placeholder="\${isVnToEn ? 'Gõ từ tiếng Anh...' : 'Gõ nghĩa tiếng Việt...'}" class="w-full text-center px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:outline-none text-base font-bold">
              <button id="btn-submit-ans" onclick="submitTypingAnswer()" class="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm">Kiểm tra đáp án</button>
            </div>
            <div id="quiz-feedback" class="pt-3"></div>
          </div>
        \`;
      } else if (q.type === 'multiple-choice') {
        const isVnPrompt = q.promptLanguage === 'vn-prompt';
        const promptText = isVnPrompt ? q.item.meaning : q.item.word;
        const letters = ['A', 'B', 'C', 'D'];
        bodyHtml = \`
          <div class="text-center space-y-4 py-4">
            <span class="text-xs font-bold uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Trắc nghiệm 4 lựa chọn (A, B, C, D)</span>
            <div class="text-xs text-slate-400 font-semibold">\${q.item.topic || ''}</div>
            <div class="flex items-center justify-center gap-3">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">\${promptText}</h2>
              <button onclick="speakWord('\${safeWord}')" class="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-200">🔊 Phát âm</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-3">
              \${q.options.map((opt, idx) => {
                const safeOpt = opt.replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
                return \`
                  <button onclick="submitMcAnswer('\${safeOpt}')" class="mc-opt-btn p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-white text-left font-bold text-sm flex items-center gap-3 transition-all">
                    <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-extrabold shrink-0">\${letters[idx]}</span>
                    <span class="flex-1">\${opt}</span>
                  </button>
                \`;
              }).join('')}
            </div>
            <div id="quiz-feedback" class="pt-3"></div>
          </div>
        \`;
      } else if (q.type === 'matching') {
        const batch = q.matchingItems || [q.item];
        matchState = {
          words: shuffle(batch.map(x => ({ id: x.id, word: x.word }))),
          meanings: shuffle(batch.map(x => ({ id: x.id, meaning: x.meaning }))),
          selWord: null,
          selMeaning: null,
          matched: new Set(),
          wrongPair: false
        };
        bodyHtml = \`
          <div class="space-y-4 py-2">
            <div class="text-center">
              <span class="text-xs font-bold uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">Nối Cột A (Tiếng Anh) Với Cột B (Tiếng Việt)</span>
              <p class="text-xs text-slate-500 mt-1">Nhấp chọn 1 từ tiếng Anh ở cột A và nghĩa tương ứng ở cột B</p>
            </div>
            <div id="matching-board" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"></div>
            <div id="quiz-feedback" class="text-center pt-2"></div>
          </div>
        \`;
      }

      container.innerHTML = \`
        <div class="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-md space-y-5">
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <button onclick="switchTab('practice')" class="text-xs font-bold text-slate-500 hover:text-slate-900">← Thoát bài tập</button>
            <div class="text-xs font-extrabold text-slate-700">Câu \${currentIndex + 1} / \${quizQueue.length}</div>
            <div class="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">🔥 Chuỗi: \${streak}</div>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-600 transition-all" style="width: \${progress}%"></div>
          </div>
          \${bodyHtml}
        </div>
      \`;

      if (q.type === 'en-to-vn' && soundEnabled) speakWord(q.item.word);
      if (q.type === 'matching') renderMatchingBoard();
      const inp = document.getElementById('quiz-input');
      if (inp) inp.focus();
    }

    function showFeedback(isCorrect, expectedText, wordToSpeak) {
      answeredCurrent = true;
      if (soundEnabled && wordToSpeak) speakWord(wordToSpeak);
      if (isCorrect) {
        score++;
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
        missedIds.add(quizQueue[currentIndex].item.id);
      }
      const fb = document.getElementById('quiz-feedback');
      if (fb) {
        fb.innerHTML = \`
          <div class="p-4 rounded-2xl max-w-md mx-auto \${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'} space-y-2">
            <div class="font-extrabold text-sm">\${isCorrect ? '✓ Chính xác tuyệt vời!' : '✕ Chưa chính xác! Đáp án đúng: ' + expectedText}</div>
            <button onclick="nextQuestion()" class="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold">Câu tiếp theo →</button>
          </div>
        \`;
      }
    }

    function submitTypingAnswer() {
      if (answeredCurrent) return nextQuestion();
      const q = quizQueue[currentIndex];
      const val = document.getElementById('quiz-input')?.value || '';
      const expected = q.type === 'vn-to-en' ? q.item.word : q.item.meaning;
      const ok = isAnswerMatch(val, expected);
      showFeedback(ok, expected, q.item.word);
    }

    function submitMcAnswer(chosen) {
      if (answeredCurrent) return;
      const q = quizQueue[currentIndex];
      const expected = q.promptLanguage === 'vn-prompt' ? q.item.word : q.item.meaning;
      const ok = chosen === expected;
      showFeedback(ok, expected, q.item.word);
    }

    function renderMatchingBoard() {
      const board = document.getElementById('matching-board');
      if (!board) return;
      const leftHtml = matchState.words.map(w => {
        const done = matchState.matched.has(w.id);
        const sel = matchState.selWord === w.id;
        const safeW = w.word.replace(/'/g, "\\\\'");
        return \`
          <button \${done ? 'disabled' : ''} onclick="pickMatchWord('\${w.id}', '\${safeW}')" class="w-full p-3.5 rounded-2xl border-2 text-left font-bold text-sm transition-all \${done ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60' : sel ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white hover:border-indigo-300'}">
            🔊 \${w.word}
          </button>
        \`;
      }).join('');
      const rightHtml = matchState.meanings.map(m => {
        const done = matchState.matched.has(m.id);
        const sel = matchState.selMeaning === m.id;
        return \`
          <button \${done ? 'disabled' : ''} onclick="pickMatchMeaning('\${m.id}')" class="w-full p-3.5 rounded-2xl border-2 text-left font-medium text-sm transition-all \${done ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60' : sel ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white hover:border-indigo-300'}">
            \${m.meaning}
          </button>
        \`;
      }).join('');
      board.innerHTML = \`<div class="space-y-2">\${leftHtml}</div><div class="space-y-2">\${rightHtml}</div>\`;
    }

    function pickMatchWord(id, wordText) {
      if (soundEnabled) speakWord(wordText);
      matchState.selWord = id;
      checkMatchPair();
    }

    function pickMatchMeaning(id) {
      matchState.selMeaning = id;
      checkMatchPair();
    }

    function checkMatchPair() {
      if (!matchState.selWord || !matchState.selMeaning) {
        renderMatchingBoard();
        return;
      }
      if (matchState.selWord === matchState.selMeaning) {
        matchState.matched.add(matchState.selWord);
        matchState.selWord = null;
        matchState.selMeaning = null;
        renderMatchingBoard();
        if (matchState.matched.size === matchState.words.length) {
          showFeedback(true, '', '');
        }
      } else {
        missedIds.add(quizQueue[currentIndex].item.id);
        matchState.selWord = null;
        matchState.selMeaning = null;
        renderMatchingBoard();
      }
    }

    function nextQuestion() {
      currentIndex++;
      if (currentIndex >= quizQueue.length) {
        finishQuiz();
      } else {
        renderCurrentQuestion();
      }
    }

    function finishQuiz() {
      switchTab('summary');
      if (window.confetti) window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      const acc = quizQueue.length > 0 ? Math.round((score / quizQueue.length) * 100) : 100;
      const missedItems = vocabList.filter(x => missedIds.has(x.id));
      const container = document.getElementById('summary-container');
      container.innerHTML = \`
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-6">
          <div class="space-y-2">
            <span class="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">Hoàn thành bài kiểm tra</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Độ chính xác: \${acc}% (\${score}/\${quizQueue.length} câu đúng)</h2>
            <p class="text-xs text-slate-500">Chuỗi đúng liên tiếp cao nhất: 🔥 \${bestStreak}</p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <button onclick="startQuizNow()" class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm">↻ Làm lại bài mới</button>
            \${missedItems.length > 0 ? \`<button onclick="reviewMissed()" class="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm">Ôn lại \${missedItems.length} từ làm sai</button>\` : ''}
            <button onclick="switchTab('vocab')" class="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm">Về danh sách chủ đề</button>
          </div>
        </div>
      \`;
    }

    function reviewMissed() {
      const missedItems = vocabList.filter(x => missedIds.has(x.id));
      if (missedItems.length > 0) startQuizNow(missedItems);
    }

    // Initialize
    renderAll();
  </script>
</body>
</html>`;
}

export async function generateGitHubPagesZip(vocabList: VocabItem[]): Promise<Blob> {
  const zip = new JSZip();
  const indexHtml = generateStandaloneSingleHtml(vocabList);

  zip.file('index.html', indexHtml);
  zip.file('.nojekyll', '');
  zip.file(
    'README.md',
    `# LexiMaster - Ứng dụng Học & Ôn Tập Từ Vựng Tiếng Anh Theo Chủ Đề

Gói triển khai nhanh trên **GitHub Pages** (chứa sẵn 42 Chủ đề từ UNIT 3 đến UNIT 59, âm thanh phát âm chuẩn, tùy chỉnh số lượng câu hỏi và bài làm kết hợp cả 4 dạng câu hỏi).

## Các bước đưa lên GitHub Pages (Chỉ mất 1 phút):
1. Đăng nhập vào [GitHub.com](https://github.com) và nhấn nút **New** để tạo một Repository mới (đặt tên bất kỳ, ví dụ \`tu-vung-tieng-anh\`, chọn **Public**).
2. Nhấn vào dòng chữ **uploading an existing file** trên màn hình Repository mới tạo.
3. Kéo thả file \`index.html\` (và \`.nojekyll\`) trong thư mục giải nén này vào và nhấn nút **Commit changes** màu xanh lá.
4. Nhấn vào tab **Settings** (Cài đặt) của Repository → chọn mục **Pages** ở thanh menu bên trái.
5. Tại mục **Build and deployment** → phần **Branch**, đổi từ \`None\` sang \`main\` (hoặc \`master\`) và bấm **Save**.
6. Đợi khoảng 60 giây rồi tải lại trang, GitHub sẽ hiển thị đường link trang web chính thức của bạn: \`https://<tên-github-của-bạn>.github.io/<tên-repo>/\`
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
