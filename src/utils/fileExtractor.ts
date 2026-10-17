import JSZip from 'jszip';
import { parseVocabText } from './parser.ts';

declare global {
  interface Window {
    pdfjsLib?: {
      getDocument: (src: unknown) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNumber: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string; hasEOL?: boolean }>;
            }>;
          }>;
        }>;
      };
    };
  }
}

/**
 * Extracts raw text from TXT or CSV
 */
export async function extractTextFromPlain(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Không thể đọc file văn bản'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Extracts raw text from PDF using PDF.js
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (!window.pdfjsLib) {
    throw new Error('Thư viện PDF.js chưa sẵn sàng. Vui lòng thử lại sau giây lát.');
  }

  const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const textChunks: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => item.str + (item.hasEOL ? '\n' : ' '))
      .join('');
    textChunks.push(pageText);
  }

  return textChunks.join('\n');
}

/**
 * Extracts raw text from PPTX slides using JSZip
 */
export async function extractTextFromPptx(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  const textChunks: string[] = [];

  // Look for slide files: ppt/slides/slide*.xml
  const slideRegex = /^ppt\/slides\/slide\d+\.xml$/i;
  const slideFiles = Object.keys(zip.files).filter(name => slideRegex.test(name));

  // Sort slides numerically: slide1, slide2, ...
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)![0], 10);
    const numB = parseInt(b.match(/\d+/)![0], 10);
    return numA - numB;
  });

  for (const filename of slideFiles) {
    const content = await zip.files[filename].async('string');
    // Extract text inside <a:t>...</a:t> nodes
    const matches = content.match(/<a:t[^>]*>(.*?)<\/a:t>/gi);
    if (matches) {
      const slideTexts = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      textChunks.push(slideTexts.join(' '));
    }
  }

  return textChunks.join('\n');
}

/**
 * Main parser entry point for uploaded files
 */
export async function parseUploadedFile(file: File): Promise<{
  fileName: string;
  items: Array<{ word: string; meaning: string }>;
  rawTextPreview: string;
}> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rawText = '';

  if (extension === 'pdf') {
    rawText = await extractTextFromPdf(file);
  } else if (extension === 'pptx') {
    rawText = await extractTextFromPptx(file);
  } else if (['txt', 'csv', 'tsv', 'md'].includes(extension || '')) {
    rawText = await extractTextFromPlain(file);
  } else {
    // Try text reader as fallback
    rawText = await extractTextFromPlain(file);
  }

  const items = parseVocabText(rawText);

  return {
    fileName: file.name,
    items,
    rawTextPreview: rawText.slice(0, 500),
  };
}
