// src/components/auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Başarıyla giriş yapıldı!');
      navigate('/');
    } catch (error: any) {
      let message = 'Giriş yapılamadı.';
      
      if (error.code === 'auth/user-not-found') {
        message = 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Hatalı parola girdiniz.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Geçersiz e-posta formatı.';
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }

    try {
      await resetPassword(email);
      toast.success('Parola sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (error: any) {
      toast.error('Parola sıfırlama işlemi başarısız oldu.');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-primary/10 dark:border-accent/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary dark:text-accent">Giriş Yap</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Hesabınıza erişim sağlayın</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary dark:text-accent">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 mt-1 border rounded-md bg-white dark:bg-gray-700 
                           border-primary/20 dark:border-accent/30 text-gray-800 dark:text-white 
                           focus:ring-2 focus:ring-primary focus:border-primary 
                           dark:focus:ring-accent dark:focus:border-accent transition duration-200"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary dark:text-accent">
                Parola
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 mt-1 border rounded-md bg-white dark:bg-gray-700 
                           border-primary/20 dark:border-accent/30 text-gray-800 dark:text-white 
                           focus:ring-2 focus:ring-primary focus:border-primary 
                           dark:focus:ring-accent dark:focus:border-accent transition duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="font-medium text-accent hover:text-accent/80 dark:text-accent dark:hover:text-accent/80"
              >
                Parolanızı mı unuttunuz?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-primary hover:bg-primary/90 
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
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hesabınız yok mu?{' '}
            <Link to="/signup" className="font-medium text-accent hover:text-accent/80">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};