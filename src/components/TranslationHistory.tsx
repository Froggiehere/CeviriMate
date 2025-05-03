import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebase';
import { toast } from 'react-toastify';

interface TranslationRecord {
  id: string;
  sourceText: string;
  targetText: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
}

export const TranslationHistory: React.FC = () => {
  const [translations, setTranslations] = useState<TranslationRecord[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [analysisModal, setAnalysisModal] = useState<{
    visible: boolean;
    content: string;
  }>({ visible: false, content: '' });

  useEffect(() => {
    const db = getDatabase(app);
    const translationsRef = ref(db, 'translations');

    const unsubscribe = onValue(translationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: TranslationRecord[] = Object.entries(data).map(
          ([id, val]: any) => ({
            id,
            sourceText: val.sourceText,
            targetText: val.targetText,
            timestamp: val.timestamp,
            sourceLanguage: val.sourceLanguage,
            targetLanguage: val.targetLanguage,
          })
        );
        setTranslations(parsed.sort((a, b) => b.timestamp - a.timestamp));
      }
    });

    return () => unsubscribe();
  }, []);

  const analyzeSingleText = async (sourceText: string, targetText: string, id: string) => {
    setLoadingId(id);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: [sourceText, targetText],
          language: 'tr',  // Add the language parameter to request in Turkish
        }),
      });

      const result = await response.json();

      const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!raw || typeof raw !== 'string') {
        throw new Error('No content found in analysis result.');
      }

      setAnalysisModal({ visible: true, content: raw });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Bir hata oluştu: analiz başarısız.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Çeviri Geçmişi</h2>

      {translations.length === 0 && (
        <p className="text-gray-500">Henüz çeviri yapılmamış.</p>
      )}

      {translations.map((item) => (
        <div key={item.id} className="border rounded p-4 bg-white shadow-sm space-y-2">
          <div className="text-xs text-gray-500 flex justify-between items-center">
            <span>
              {new Date(item.timestamp).toLocaleString()} • {item.sourceLanguage} → {item.targetLanguage}
            </span>
            <button
              onClick={() => analyzeSingleText(item.sourceText, item.targetText, item.id)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 disabled:text-gray-400"
              disabled={loadingId === item.id}
            >
              {loadingId === item.id ? (
                <>
                  <span className="w-3 h-3 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>
                  Analiz ediliyor...
                </>
              ) : (
                'Bu ifadeyi analiz et'
              )}
            </button>
          </div>
          <div>
            <strong className="text-sm block">Girdi:</strong>
            <p>{item.sourceText}</p>
          </div>
          <div>
            <strong className="text-sm block">Çıktı:</strong>
            <p className="text-green-700">{item.targetText}</p>
          </div>
        </div>
      ))}

      {/* Modal */}
      {analysisModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
            <button
              onClick={() => setAnalysisModal({ visible: false, content: '' })}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-2">Analiz Sonucu</h3>
            <pre
              className="whitespace-pre-wrap text-gray-800 max-h-[60vh] overflow-y-auto"
              style={{
                fontSize: '15px',
                lineHeight: '1.6',
                fontFamily: '"Inter", "Segoe UI", "Helvetica", "Arial", sans-serif',
                backgroundColor: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              {analysisModal.content}
            </pre>

          </div>
        </div>
      )}
    </div>
  );
};
