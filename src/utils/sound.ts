import confetti from 'canvas-confetti';

let audioCtx: AudioContext | null = null;
let stopTopicPlaybackFlag = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSuccessTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Pleasant major chord chime (C5 -> E5 -> G5)
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.32);
    });
  } catch {
    // Ignore audio context errors silently
  }
}

export function playErrorTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore
  }
}

export function playMatchClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Ignore
  }
}

export function playCelebrationFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.18, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.46);
    });
  } catch {
    // Ignore
  }

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
}

/**
 * Formats an English vocabulary entry for natural speech synthesis.
 * e.g. "Put sth down" -> "Put something down"
 * e.g. "Football / Soccer" -> "Football, Soccer"
 */
export function formatTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\bsth\b/gi, 'something')
    .replace(/\bsb\b/gi, 'somebody')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\.\.\./g, '')
    .trim();
}

function getPreferredEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  return (
    voices.find(v => v.lang === 'en-US' && /Google|Natural|Samantha|Daniel|Alex/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-GB' && /Google|Natural|Daniel/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en-US')) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null
  );
}

export function stopSpeaking() {
  stopTopicPlaybackFlag = true;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

export function speakWord(text: string, lang = 'en-US', rate = 0.9) {
  if (typeof window === 'undefined') return;
  stopTopicPlaybackFlag = true;

  // Subtle click cue so user immediately feels audio feedback
  playMatchClick();

  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = formatTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const preferredVoice = getPreferredEnglishVoice();
    if (preferredVoice && lang.startsWith('en')) {
      utterance.voice = preferredVoice;
    }
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}

/**
 * Sequentially reads a list of words aloud with a short pause between words.
 */
export function speakWordSequence(
  items: Array<{ id: string; word: string }>,
  onWordStart?: (id: string, index: number) => void,
  onComplete?: () => void
) {
  if (typeof window === 'undefined' || !window.speechSynthesis || items.length === 0) {
    onComplete?.();
    return;
  }

  stopSpeaking();
  stopTopicPlaybackFlag = false;

  let currentIdx = 0;

  const speakNext = () => {
    if (stopTopicPlaybackFlag || currentIdx >= items.length) {
      onComplete?.();
      return;
    }

    const currentItem = items[currentIdx];
    onWordStart?.(currentItem.id, currentIdx);

    try {
      const cleanText = formatTextForSpeech(currentItem.word);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const preferredVoice = getPreferredEnglishVoice();
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.88;

      utterance.onend = () => {
        if (stopTopicPlaybackFlag) {
          onComplete?.();
          return;
        }
        currentIdx++;
        setTimeout(speakNext, 650);
      };

      utterance.onerror = () => {
        currentIdx++;
        setTimeout(speakNext, 400);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      onComplete?.();
    }
  };

  speakNext();
}
