import { VocabItem } from '../types.ts';

export function generateStandaloneSingleHtml(vocabList: VocabItem[]): string {
  const initialJson = JSON.stringify(vocabList, null, 2);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LexiMaster - Ứng dụng Ôn Tập Từ Vựng Tiếng Anh Độc Lập</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Be Vietnam Pro -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <!-- PDF.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  </script>
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

  <!-- Header -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
          LM
        </div>
        <div>
          <h1 class="font-extrabold text-indigo-700 text-lg leading-tight">LexiMaster</h1>
          <p class="text-xs text-slate-500">Ôn tập từ vựng tiếng Anh khép kín</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-tab-vocab" onclick="switchTab('vocab')" class="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-sm">
          Từ vựng (<span id="vocab-count-badge">0</span>)
        </button>
        <button id="btn-tab-practice" onclick="switchTab('practice')" class="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
          Luyện tập
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-5xl mx-auto px-4 py-8 flex-1 w-full" id="app-root">
    <!-- View 1: Vocab Management -->
    <div id="view-vocab" class="space-y-6">
      <div class="bg-indigo-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div class="space-y-1">
          <span class="text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-full">Dữ liệu khép kín 100%</span>
          <h2 class="text-2xl font-black">Danh sách từ vựng cá nhân</h2>
          <p class="text-indigo-100 text-xs sm:text-sm">Chỉ kiểm tra chính xác những từ bạn nhập vào.</p>
        </div>
        <button onclick="startPracticeMode('vn-to-en')" class="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm shadow-md transition-all">
          Bắt đầu luyện tập ngay →
        </button>
      </div>

      <!-- Input Form -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 class="font-bold text-slate-800 text-sm">Thêm từ mới hoặc dán danh sách hàng loạt</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input id="in-word" type="text" placeholder="Từ tiếng Anh (vd: meticulous)" class="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
          <input id="in-meaning" type="text" placeholder="Nghĩa tiếng Việt (vd: tỉ mỉ)" class="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm">
        </div>
        <div class="flex items-center justify-between gap-3">
          <button onclick="addSingleWord()" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">
            + Thêm từng từ
          </button>
          <button onclick="toggleBulkModal()" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100">
            Dán hàng loạt (word - meaning)
          </button>
        </div>
      </div>

      <!-- Vocab Table -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <span class="font-extrabold text-sm text-slate-800">Kho từ (<span id="table-count">0</span>)</span>
          <button onclick="clearAllWords()" class="text-xs text-rose-600 font-bold hover:underline">Xóa tất cả</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th class="py-3 px-4 w-12 text-center">STT</th>
                <th class="py-3 px-4">Từ Tiếng Anh</th>
                <th class="py-3 px-4">Nghĩa Tiếng Việt</th>
                <th class="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody id="vocab-table-body" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View 2: Practice Selection -->
    <div id="view-practice" class="hidden space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-slate-900">Chọn chế độ luyện tập</h2>
        <p class="text-xs text-slate-500">4 chế độ trắc nghiệm & tương tác ngẫu nhiên</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div onclick="startPracticeMode('vn-to-en')" class="p-5 rounded-3xl border-2 border-indigo-200 hover:border-indigo-600 bg-white cursor-pointer shadow-sm hover:shadow-md transition-all">
          <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Chế độ 1</span>
          <h3 class="font-bold text-slate-900 mt-2">Nhìn Tiếng Việt → Gõ Tiếng Anh</h3>
          <p class="text-xs text-slate-500 mt-1">Luyện nhớ chính tả từ tiếng Anh tương ứng.</p>
        </div>
        <div onclick="startPracticeMode('en-to-vn')" class="p-5 rounded-3xl border-2 border-emerald-200 hover:border-emerald-600 bg-white cursor-pointer shadow-sm hover:shadow-md transition-all">
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Chế độ 2</span>
          <h3 class="font-bold text-slate-900 mt-2">Nhìn Tiếng Anh → Gõ Tiếng Việt</h3>
          <p class="text-xs text-slate-500 mt-1">Luyện dịch nghĩa, có nút chấp nhận gần đúng.</p>
        </div>
        <div onclick="startPracticeMode('multiple-choice')" class="p-5 rounded-3xl border-2 border-amber-200 hover:border-amber-600 bg-white cursor-pointer shadow-sm hover:shadow-md transition-all">
          <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Chế độ 3</span>
          <h3 class="font-bold text-slate-900 mt-2">Trắc nghiệm 4 lựa chọn (A, B, C, D)</h3>
          <p class="text-xs text-slate-500 mt-1">Đáp án nhiễu lấy từ chính danh sách từ của bạn.</p>
        </div>
        <div onclick="startPracticeMode('matching')" class="p-5 rounded-3xl border-2 border-purple-200 hover:border-purple-600 bg-white cursor-pointer shadow-sm hover:shadow-md transition-all">
          <span class="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Chế độ 4</span>
          <h3 class="font-bold text-slate-900 mt-2">Nối cột A với cột B (Matching Pairs)</h3>
          <p class="text-xs text-slate-500 mt-1">Ghép cặp từ và nghĩa, khóa xanh khi đúng, rung đỏ khi sai.</p>
        </div>
      </div>
    </div>

    <!-- View 3: Active Quiz Player -->
    <div id="view-player" class="hidden space-y-6">
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-6" id="player-container">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- View 4: Quiz Summary -->
    <div id="view-summary" class="hidden space-y-6">
      <div id="summary-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </main>

  <script>
    let vocabList = ${initialJson};
    let activeQuiz = null;

    function renderVocabTable() {
      const tbody = document.getElementById('vocab-table-body');
      const countSpan = document.getElementById('vocab-count-badge');
      const tableCount = document.getElementById('table-count');
      if (countSpan) countSpan.textContent = vocabList.length;
      if (tableCount) tableCount.textContent = vocabList.length;
      if (!tbody) return;

      if (vocabList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="py-8 text-center text-slate-400 text-xs">Chưa có từ nào. Hãy thêm từ mới!</td></tr>';
        return;
      }

      tbody.innerHTML = vocabList.map((item, idx) => \`
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 text-center text-slate-400 text-xs font-mono">\${idx + 1}</td>
          <td class="py-3 px-4 font-bold text-slate-900">\${item.word}</td>
          <td class="py-3 px-4 text-slate-700">\${item.meaning}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="speak('\${item.word}')" class="text-slate-400 hover:text-indigo-600 px-2 py-1">🔊</button>
            <button onclick="deleteWord('\${item.id}')" class="text-slate-400 hover:text-rose-600 px-2 py-1">✕</button>
          </td>
        </tr>
      \`).join('');
    }

    function switchTab(tab) {
      document.getElementById('view-vocab').classList.toggle('hidden', tab !== 'vocab');
      document.getElementById('view-practice').classList.toggle('hidden', tab !== 'practice');
      document.getElementById('view-player').classList.toggle('hidden', tab !== 'player');
      document.getElementById('view-summary').classList.toggle('hidden', tab !== 'summary');
    }

    function speak(text) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
      }
    }

    function addSingleWord() {
      const w = document.getElementById('in-word').value.trim();
      const m = document.getElementById('in-meaning').value.trim();
      if (!w || !m) return alert('Vui lòng nhập cả từ và nghĩa');
      vocabList.unshift({ id: 'v-' + Date.now(), word: w, meaning: m });
      document.getElementById('in-word').value = '';
      document.getElementById('in-meaning').value = '';
      renderVocabTable();
    }

    function deleteWord(id) {
      vocabList = vocabList.filter(x => x.id !== id);
      renderVocabTable();
    }

    function clearAllWords() {
      if (confirm('Xóa toàn bộ từ vựng?')) {
        vocabList = [];
        renderVocabTable();
      }
    }

    function startPracticeMode(mode) {
      if (vocabList.length === 0) return alert('Danh sách từ vựng đang trống!');
      switchTab('player');
      const container = document.getElementById('player-container');
      const item = vocabList[Math.floor(Math.random() * vocabList.length)];
      container.innerHTML = \`
        <div class="flex items-center justify-between pb-4 border-b">
          <button onclick="switchTab('practice')" class="text-xs font-bold text-slate-500">← Quay lại</button>
          <span class="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">\${mode}</span>
        </div>
        <div class="text-center py-6 space-y-3">
          <div class="text-xs text-indigo-600 font-bold uppercase">Nghĩa tiếng Việt</div>
          <h2 class="text-3xl font-extrabold text-slate-900">\${item.meaning}</h2>
          <div class="max-w-xs mx-auto pt-4 space-y-3">
            <input id="play-input" type="text" placeholder="Nhập từ tiếng Anh..." class="w-full text-center px-4 py-3 rounded-2xl border border-slate-300 text-lg font-bold">
            <button onclick="checkAnswer('\${item.word}')" class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Kiểm tra</button>
          </div>
          <div id="play-feedback" class="pt-2 text-sm font-bold"></div>
        </div>
      \`;
    }

    function checkAnswer(expected) {
      const input = document.getElementById('play-input');
      const fb = document.getElementById('play-feedback');
      if (!input || !fb) return;
      const user = input.value.trim().toLowerCase();
      if (user === expected.toLowerCase()) {
        fb.innerHTML = '<span class="text-emerald-600">✓ Chính xác tuyệt vời!</span>';
        speak(expected);
      } else {
        fb.innerHTML = '<span class="text-rose-600">✕ Chưa đúng. Đáp án: ' + expected + '</span>';
      }
    }

    // Init
    renderVocabTable();
  </script>
</body>
</html>`;
}
