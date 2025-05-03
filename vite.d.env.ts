export interface TranslationMemoryEntry {
  sourceText: string;
  targetText: string;
  timestamp: Date;
}

export interface TranslationProject {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  targetText: string;
  lastModified: Date;
}

export interface ImportMetaEnv {
  readonly VITE_firebase_apiKey: string;
  readonly VITE_firebase_authDomain: string;
  readonly VITE_firebase_databaseURL: string;
  readonly VITE_firebase_projectId: string;
  readonly VITE_firebase_storageBucket: string;
  readonly VITE_firebase_messagingSenderId: string;
  readonly VITE_firebase_appId: string;
  readonly VITE_firebase_measurementId: string;
  readonly VITE_deepl_apiKey: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}