import { useEffect, useState } from 'react';
import { ref, push, getDatabase } from 'firebase/database';
import { app } from '../firebase';
import toast from 'react-hot-toast';
import { registerEditorTextSetter } from './TranslationHistory';

interface TextDocument {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  wordCount: number;
  charCount: number;
}

export const TextEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Inter');
  
  // Function to set text from external components
  const setExternalText = (newTitle: string, newContent: string) => {
    setTitle(newTitle);
    setContent(newContent);
    // Set isDirty to true as we have new content
    setIsDirty(true);
  };

  // Register the setter function for external components to use
  useEffect(() => {
    registerEditorTextSetter(setExternalText);
  }, []);

  // Check for content from sessionStorage (from translation history)
  useEffect(() => {
    const storedContent = sessionStorage.getItem('textEditorContent');
    const storedTitle = sessionStorage.getItem('textEditorTitle');
    
    if (storedContent && storedTitle) {
      setTitle(storedTitle);
      setContent(storedContent);
      setIsDirty(true);
      
      // Clear the session storage after loading
      sessionStorage.removeItem('textEditorContent');
      sessionStorage.removeItem('textEditorTitle');
    }
  }, []);

  // Update word and character counts
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);

    if (content.trim() !== '') {
      setIsDirty(true);
    }
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Lütfen içerik ekleyin');
      return;
    }

    if (!title.trim()) {
      toast.error('Lütfen bir başlık ekleyin');
      return;
    }

    setIsLoading(true);

    try {
      const db = getDatabase(app);
      await push(ref(db, 'documents'), {
        title,
        content,
        timestamp: new Date().toISOString(),
        wordCount,
        charCount,
      });
      
      toast.success('Belge başarıyla kaydedildi!');
      setIsDirty(false);
    } catch (error) {
      console.error('Kayıt hatası:', error);
      toast.error('Belge kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (isDirty && (title.trim() || content.trim())) {
      if (window.confirm('Tüm içeriği silmek istediğinizden emin misiniz?')) {
        setTitle('');
        setContent('');
        setIsDirty(false);
      }
    } else {
      setTitle('');
      setContent('');
    }
  };

  // Font style options
  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Times New Roman', label: 'Times New Roman' },
  ];

  const fontSizeOptions = [
    { value: '14px', label: 'Küçük' },
    { value: '16px', label: 'Normal' },
    { value: '18px', label: 'Büyük' },
    { value: '20px', label: 'Daha Büyük' },
  ];

  return (
    <div className="space-y-8">
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg border border-primary/5 dark:border-primary/10">
        {/* Header with title input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-primary dark:text-accent">Belge Başlığı</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 border-primary/20 dark:border-accent/30 
                     text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary 
                     dark:focus:ring-accent dark:focus:border-accent transition duration-200"
            placeholder="Belge başlığını girin..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Formatting options */}
        <div className="flex flex-wrap gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-primary dark:text-accent">Yazı Tipi:</label>
            <select
              className="p-2 text-sm border rounded-md bg-white dark:bg-gray-700 border-primary/20 dark:border-accent/30 
                         text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary 
                         dark:focus:ring-accent dark:focus:border-accent transition duration-200"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {fontOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-primary dark:text-accent">Boyut:</label>
            <select
              className="p-2 text-sm border rounded-md bg-white dark:bg-gray-700 border-primary/20 dark:border-accent/30 
                         text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary 
                         dark:focus:ring-accent dark:focus:border-accent transition duration-200"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              {fontSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Text editor */}
        <div>
          <label className="block text-sm font-medium mb-2 text-primary dark:text-accent">İçerik</label>
          <textarea
            className="w-full h-64 border p-4 rounded-lg bg-white dark:bg-gray-700 
                     border-primary/20 dark:border-accent/30 text-gray-800 dark:text-white 
                     focus:ring-2 focus:ring-primary/70 focus:border-primary/70 
                     dark:focus:ring-accent/70 dark:focus:border-accent/70 transition duration-200"
            placeholder="Metin içeriğinizi buraya yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ fontFamily, fontSize }}
          />
        </div>

        {/* Character and word count */}
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex space-x-4">
            <span>{wordCount} kelime</span>
            <span>{charCount} karakter</span>
          </div>
          <div>
            {isDirty && <span className="text-accent">• Kaydedilmemiş değişiklikler</span>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 
                     dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Temizle
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !content.trim() || !title.trim()}
            className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 
                      dark:bg-accent dark:hover:bg-accent/90 transition-colors flex items-center space-x-2
                      ${(isLoading || !content.trim() || !title.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Help Card */}
      <div className="p-5 bg-accent/5 dark:bg-accent/10 rounded-lg border border-accent/20 dark:border-accent/30">
        <h3 className="text-primary dark:text-accent font-medium mb-2">Metin Editörü Yardım</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Belge için bir başlık girin</li>
          <li>Yazı tipi ve boyutunu isteğinize göre ayarlayın</li>
          <li>İçeriğinizi yazın ve düzenleyin</li>
          <li>Bitirdiğinizde "Kaydet" düğmesine tıklayın</li>
          <li>Kaydedilen belgelerinize "Belgelerim" sayfasından erişebilirsiniz</li>
        </ul>
      </div>
    </div>
  );
};