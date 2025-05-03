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

  const DEEPL_API_KEY = import.meta.env.VITE_deepl_apiKey;

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
      
      toast.success('Çeviri başarıyla kaydedildi!');
    } catch (error: any) {
      console.error('Çeviri hatası:', error);
      toast.error(error?.message || 'Çeviri başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  return (
    <div className="space-y-8">
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg">
        {/* Language Selectors */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-primary dark:text-accent">Kaynak Dil</label>
            <select
              className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                         text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary 
                         dark:focus:ring-accent dark:focus:border-accent transition duration-200"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          {/* Swap Button */}
          <button 
            onClick={handleSwapLanguages}
            className="flex-shrink-0 self-center mt-4 md:mt-0 p-2 rounded-full bg-primary/10 text-primary 
                       dark:bg-accent/20 dark:text-accent hover:bg-primary/20 dark:hover:bg-accent/30 
                       transition-colors duration-200"
            title="Dilleri Değiştir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
            </svg>
          </button>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-primary dark:text-accent">Hedef Dil</label>
            <select
              className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                         text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary 
                         dark:focus:ring-accent dark:focus:border-accent transition duration-200"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-accent">
              Kaynak Metin ({languageOptions.find(l => l.code === sourceLanguage)?.name})
            </label>
            <textarea
              className="w-full h-48 border p-4 rounded-lg bg-white dark:bg-gray-700 
                         border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white 
                         focus:ring-2 focus:ring-primary focus:border-primary 
                         dark:focus:ring-accent dark:focus:border-accent transition duration-200"
              placeholder="Çevirmek için metin gir..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-accent">
              Hedef Metin ({languageOptions.find(l => l.code === targetLanguage)?.name})
            </label>
            <textarea
              className="w-full h-48 border p-4 rounded-lg bg-gray-50 dark:bg-gray-700 
                         border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white 
                         focus:ring-2 focus:ring-accent focus:border-accent transition duration-200"
              placeholder="Çevirilmiş metin..."
              value={targetText}
              readOnly
            />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="text-right">
          {isLoading ? (
            <div className="flex items-center justify-end space-x-2 text-accent">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Gerçek zamanlı çeviri yapılıyor...</span>
            </div>
          ) : (
            sourceText && targetText && (
              <span className="text-sm text-primary dark:text-accent">
                Çeviri tamamlandı
              </span>
            )
          )}
        </div>
      </div>
      
      {/* Help Card */}
      <div className="p-5 bg-primary/5 dark:bg-accent/10 rounded-lg border border-primary/10 dark:border-accent/20">
        <h3 className="text-primary dark:text-accent font-medium mb-2">Nasıl Kullanılır?</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Metninizi sol taraftaki kutucuğa yazın</li>
          <li>Kaynak ve hedef dilleri yukarıdaki açılır menüden seçin</li>
          <li>Çeviri işlemi otomatik olarak yapılacaktır</li>
          <li>Tüm çevirileriniz kaydedilir ve Geçmiş sayfasından erişilebilir</li>
        </ul>
      </div>
    </div>
  );
};