import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { app } from '../firebase';
import { toast } from 'react-toastify';

interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  wordCount: number;
  charCount: number;
}

export const DocumentHistory: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewDocumentModal, setViewDocumentModal] = useState<{
    visible: boolean;
    document: DocumentRecord | null;
  }>({ visible: false, document: null });

  useEffect(() => {
    const db = getDatabase(app);
    const documentsRef = ref(db, 'documents');

    setIsLoading(true);
    const unsubscribe = onValue(documentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: DocumentRecord[] = Object.entries(data).map(
          ([id, val]: [string, any]) => ({
            id,
            title: val.title,
            content: val.content,
            timestamp: val.timestamp,
            wordCount: val.wordCount || 0,
            charCount: val.charCount || 0,
          })
        );
        setDocuments(
          parsed.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      } else {
        setDocuments([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteDocument = async (id: string) => {
    try {
      const db = getDatabase(app);
      await remove(ref(db, `documents/${id}`));
      toast.success('Belge başarıyla silindi');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Belge silinirken bir hata oluştu');
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

  const viewDocument = (document: DocumentRecord) => {
    setViewDocumentModal({ visible: true, document });
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
        <h2 className="text-2xl font-semibold text-primary dark:text-accent">Belgelerim</h2>
        <span className="text-sm text-primary/60 dark:text-accent/80">
          {documents.length} belge
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-accent text-5xl mb-4">📄</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Henüz belge oluşturulmamış</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Belgeleriniz burada görünecek. Hemen yeni bir belge oluşturmak için Editör sayfasına gidin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h3 className="font-medium text-primary dark:text-accent mb-1">{item.title}</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                    <span>{formatDate(item.timestamp)}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent">
                      {item.wordCount} kelime
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewDocument(item)}
                    className="text-xs px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 dark:bg-accent/10 dark:text-accent dark:hover:bg-accent/20 transition-colors duration-200 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Görüntüle
                  </button>
                  <button
                    onClick={() => deleteDocument(item.id)}
                    className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors duration-200 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Sil
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <p className="text-gray-800 dark:text-gray-200 text-sm break-words">
                  {expandedItems.has(item.id) || item.content.length <= 100
                    ? item.content
                    : `${item.content.substring(0, 100)}...`}
                </p>
              </div>
              
              {/* Expand/Collapse Button */}
              {item.content.length > 100 && (
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

      {/* View Document Modal */}
      {viewDocumentModal.visible && viewDocumentModal.document && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary dark:text-accent">{viewDocumentModal.document.title}</h3>
              <button
                onClick={() => setViewDocumentModal({ visible: false, document: null })}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Oluşturulma: {formatDate(viewDocumentModal.document.timestamp)} • 
                {viewDocumentModal.document.wordCount} kelime • 
                {viewDocumentModal.document.charCount} karakter
              </div>
              <div
                className="whitespace-pre-wrap text-gray-800 dark:text-gray-200"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  fontFamily: '"Inter", "Segoe UI", "Helvetica", "Arial", sans-serif',
                }}
              >
                {viewDocumentModal.document.content}
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setViewDocumentModal({ visible: false, document: null })}
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