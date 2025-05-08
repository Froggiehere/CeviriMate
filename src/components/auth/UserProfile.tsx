// src/components/auth/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultSourceLang: string;
  defaultTargetLang: string;
}

interface UserData {
  displayName: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  preferences: UserPreferences;
}

export const UserProfile: React.FC = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Kullanıcı bilgileri yüklenemedi");
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, db]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      return toast.error('Ad Soyad alanı boş olamaz.');
    }
    
    try {
      setLoading(true);
      await updateUserProfile(displayName);
      toast.success('Profil başarıyla güncellendi!');
    } catch (error) {
      toast.error('Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-primary/10 dark:border-accent/20 p-6">
        <h1 className="text-2xl font-bold text-primary dark:text-accent mb-6">Profil Bilgileri</h1>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-primary dark:text-accent">
              Ad Soyad
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="w-full px-3 py-2 mt-1 border rounded-md bg-white dark:bg-gray-700 
                         border-primary/20 dark:border-accent/30 text-gray-800 dark:text-white 
                         focus:ring-2 focus:ring-primary focus:border-primary 
                         dark:focus:ring-accent dark:focus:border-accent transition duration-200"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary dark:text-accent">
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-3 py-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-600 
                         border-primary/20 dark:border-accent/30 text-gray-800 dark:text-white"
              value={currentUser?.email || ''}
              disabled
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              E-posta adresi değiştirilemez
            </p>
          </div>
          
          {userData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hesap Oluşturma</h3>
                <p className="mt-1 text-primary dark:text-accent">
                  {new Date(userData.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Giriş</h3>
                <p className="mt-1 text-primary dark:text-accent">
                  {new Date(userData.lastLogin).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <h2 className="text-lg font-semibold text-primary dark:text-accent mb-4">Tercihler</h2>
            
            {userData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema</h3>
                  <p className="mt-1 text-primary dark:text-accent capitalize">
                    {userData.preferences.theme === 'system' ? 'Sistem' : 
                    userData.preferences.theme === 'dark' ? 'Koyu' : 'Açık'}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Varsayılan Kaynak Dil</h3>
                  <p className="mt-1 text-primary dark:text-accent">
                    {userData.preferences.defaultSourceLang}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Varsayılan Hedef Dil</h3>
                  <p className="mt-1 text-primary dark:text-accent">
                    {userData.preferences.defaultTargetLang}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-primary hover:bg-primary/90 
                        dark:bg-accent dark:hover:bg-accent/90 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        focus:ring-primary dark:focus:ring-accent
                        transition duration-200 flex justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Güncelleniyor...
                </>
              ) : (
                'Profili Güncelle'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                logout().then(() => {
                  toast.success('Başarıyla çıkış yapıldı');
                });
              }}
              className="px-4 py-2 text-primary dark:text-accent border border-primary/30 dark:border-accent/30 
                         hover:bg-primary/10 dark:hover:bg-accent/10 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-primary dark:focus:ring-accent
                         transition duration-200"
            >
              Çıkış Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};