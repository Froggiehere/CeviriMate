import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { app } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface TranslationRecord {
  id: string;
  sourceText: string;
  targetText: string;
  timestamp: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Create a service to handle sending text to editor
// This can be in a separate file in a real app
let editorTextSetter: ((title: string, content: string) => void) | null = null;

export const registerEditorTextSetter = (setter: (title: string, content: string) => void) => {
  editorTextSetter = setter;
};

export const TranslationHistory: React.FC = () => {
  const [translations, setTranslations] = useState<TranslationRecord[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sendingToEditorId, setSendingToEditorId] = useState<string | null>(null);
  const [analysisModal, setAnalysisModal] = useState<{
    visible: boolean;
    content: string;
  }>({ visible: false, content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const translationsRef = ref(db, 'translations');

    setIsLoading(true);
    const unsubscribe = onValue(translationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: TranslationRecord[] = Object.entries(data).map(
          ([id, val]: [string, any]) => ({
            id,
            sourceText: val.sourceText,
            targetText: val.targetText,
            timestamp: val.timestamp,
            sourceLanguage: val.sourceLanguage,
            targetLanguage: val.targetLanguage,
          })
        );
        setTranslations(
          parsed.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      } else {
        setTranslations([]);
      }
      setIsLoading(false);
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

  const deleteTranslation = async (id: string) => {
    try {
      const db = getDatabase(app);
      await remove(ref(db, `translations/${id}`));
      toast.success('Çeviri başarıyla silindi');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Çeviri silinirken bir hata oluştu');
    }
  };

  const sendToEditor = (item: TranslationRecord) => {
    setSendingToEditorId(item.id);
    try {
      // Use session storage to transfer the text to editor
      sessionStorage.setItem('textEditorContent', item.targetText);
      sessionStorage.setItem('textEditorTitle', `${item.sourceLanguage} - ${item.targetLanguage} Çevirisi`);
      
      // If we have a direct setter function, use it (in-app communication)
      if (editorTextSetter) {
        editorTextSetter(
          `${item.sourceLanguage} - ${item.targetLanguage} Çevirisi`,
          item.targetText
        );
      }
      
      // Navigate to the editor page
      navigate('/editor');
      toast.success('Metin editöre gönderildi');
    } catch (error) {
      console.error('Error sending to editor:', error);
      toast.error('Metin editöre gönderilirken hata oluştu');
    } finally {
      setSendingToEditorId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prevState => {
      const newState = new Set(prevState);
      if (newState.has(id)) {
        newState.delete(id);
      } else {
        newState.add(id);
      }
      return newState;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary dark:text-accent">Çeviri Geçmişi</h2>
        <span className="text-sm text-primary/60 dark:text-accent/80">
          {translations.length} çeviri kaydı
        </span>
      </div>

      {translations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-accent text-5xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Henüz çeviri yapılmamış</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Çevirileriniz burada görünecek. Hemen bir çeviri yapmak için Çeviri sayfasına gidin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {translations.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                  <span>{formatDate(item.timestamp)}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent">
                    {item.sourceLanguage} → {item.targetLanguage}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => sendToEditor(item)}
                    className={`text-xs px-3 py-1 rounded-md flex items-center gap-1 transition-colors duration-200
                      ${sendingToEditorId === item.id 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-wait' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                      }`}
                    disabled={sendingToEditorId === item.id}
                  >
                    {sendingToEditorId === item.id ? (
                      <>
                        <span className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin"></span>
                        Gönderiliyor
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editöre Gönder
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => analyzeSingleText(item.sourceText, item.targetText, item.id)}
                    className={`text-xs px-3 py-1 rounded-md flex items-center gap-1 transition-colors duration-200
                      ${loadingId === item.id 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-wait' 
                        : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-accent/10 dark:text-accent dark:hover:bg-accent/20'
                      }`}
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? (
                      <>
                        <span className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin"></span>
                        Analiz
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                        Analiz Et
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteTranslation(item.id)}
                    className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors duration-200 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Sil
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-primary dark:text-accent mb-1">Girdi:</h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm break-words">
                    {expandedItems.has(item.id) || item.sourceText.length <= 100
                      ? item.sourceText
                      : `${item.sourceText.substring(0, 100)}...`}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-primary dark:text-accent mb-1">Çıktı:</h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm break-words">
                    {expandedItems.has(item.id) || item.targetText.length <= 100
                      ? item.targetText
                      : `${item.targetText.substring(0, 100)}...`}
                  </p>
                </div>
              </div>
              
              {/* Expand/Collapse Button */}
              {(item.sourceText.length > 100 || item.targetText.length > 100) && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-xs px-3 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 
                             dark:bg-accent/10 dark:text-accent dark:hover:bg-accent/20 transition-colors inline-flex items-center gap-1"
                  >
                    {expandedItems.has(item.id) ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        Daralt
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                        Genişlet
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {analysisModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary dark:text-accent">Analiz Sonucu</h3>
              <button
                onClick={() => setAnalysisModal({ visible: false, content: '' })}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <div
                className="whitespace-pre-wrap text-gray-800 dark:text-gray-200"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  fontFamily: '"Inter", "Segoe UI", "Helvetica", "Arial", sans-serif',
                }}
              >
                {analysisModal.content}
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setAnalysisModal({ visible: false, content: '' })}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};