import { GoogleGenAI } from '@google/genai';

const CACHE_KEY = 'translation_cache';

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
};

const setCache = (cache: Record<string, string>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // LocalStorage might be full
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      localStorage.removeItem(CACHE_KEY);
    }
  }
};

const LIBRE_TRANSLATE_MIRRORS = [
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
  'https://translate.terraprint.co/translate',
  'https://translate.fortuna.me/translate',
  'https://translate.astian.org/translate',
  'https://translate.fedilab.app/translate',
  'https://translate.mentality.rip/translate'
];

// Initialize Gemini for fallback
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export const translateText = async (text: string, _targetLang: string): Promise<string> => {
  return text; // Online translation disabled as per user request
};
