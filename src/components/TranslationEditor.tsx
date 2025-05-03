import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ref, push } from 'firebase/database';
import { database } from '../firebase';

interface LanguageOption {
  code: string;
  name: string;
}

let debounceTimer: ReturnType<typeof setTimeout>;

export const TranslationEditor: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('EN');
  const [targetLanguage, setTargetLanguage] = useState('TR');

  const DEEPL_API_KEY = import.meta.env.VITE_deepl_apiKey
  
  const languageOptions: LanguageOption[] = [
    { code: 'EN', name: 'English' },
    { code: 'TR', name: 'Turkish' },
    { code: 'DE', name: 'German' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'IT', name: 'Italian' },
    { code: 'NL', name: 'Dutch' },
    { code: 'PL', name: 'Polish' },
    { code: 'PT', name: 'Portuguese' },
    { code: 'RU', name: 'Russian' },
    { code: 'JA', name: 'Japanese' },
    { code: 'ZH', name: 'Chinese' },
    { code: 'AR', name: 'Arabic' },
  ];

  // Auto-translate when sourceText changes (with debounce)
  useEffect(() => {
    if (!sourceText.trim()) {
      setTargetText('');
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleTranslate(sourceText);
    }, 1500); // Wait 1500ms after typing stops
  }, [sourceText, sourceLanguage, targetLanguage]);

  const handleTranslate = async (text: string) => {
    setIsLoading(true);
    
    try {
      // Using the API route that works in production on Vercel
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_key: DEEPL_API_KEY,
          text,
          source_lang: sourceLanguage,
          target_lang: targetLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.translations || !data.translations[0]?.text) {
        throw new Error('Çeviri alınamadı.');
      }

      const translated = data.translations[0].text;
      setTargetText(translated);

      // Save to Firebase
      await push(ref(database, 'translations'), {
        sourceText: text,
        targetText: translated,
        sourceLanguage,
        targetLanguage,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Çeviri hatası:', error);
      toast.error(error?.message || 'Çeviri başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Language Selectors */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak Dil</label>
          <select
            className="w-full p-2 border rounded-md"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Dil</label>
          <select
            className="w-full p-2 border rounded-md"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kaynak Metin ({sourceLanguage})
          </label>
          <textarea
            className="w-full h-40 border p-2 rounded"
            placeholder="Çevirmek için metin gir..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hedef Metin ({targetLanguage})
          </label>
          <textarea
            className="w-full h-40 border p-2 rounded bg-gray-100"
            placeholder="Çevirilmiş metin..."
            value={targetText}
            readOnly
          />
        </div>
      </div>

      {/* Manual Translate Fallback */}
      <div className="text-right text-sm text-gray-500">
        {isLoading && <span>Gerçek zamanlı çeviri yapılıyor...</span>}
      </div>
    </div>
  );
};