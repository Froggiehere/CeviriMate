// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TranslationEditor } from './components/TranslationEditor';
import { TranslationHistory } from './components/TranslationHistory';
import { DocumentHistory } from './components/DocumentHistory';
import { TextEditor } from './components/TextEditor';
import { Toaster } from 'react-hot-toast';
import { ResetPassword } from './components/auth/ResetPassword';
import { UserProfile } from './components/auth/UserProfile';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';

// Navigation link component for consistent styling
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-md transition-colors duration-200 ${
        isActive 
          ? 'bg-white/15 text-white font-medium' 
          : 'text-white/80 hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="bg-primary dark:bg-primary/90 text-white shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="text-accent mr-2">✦</span>
              LexiMate
            </h1>
            <nav className="flex space-x-2">
              <NavLink to="/">Çeviri</NavLink>
              <NavLink to="/history">Geçmiş</NavLink>
              <NavLink to="/editor">Editör</NavLink>
              <NavLink to="/documents">Belgelerim</NavLink>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<TranslationEditor />} />
            <Route path="/history" element={<TranslationHistory />} />
            <Route path="/editor" element={<TextEditor />} />
            <Route path="/documents" element={<DocumentHistory />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/resetpassword" element={<ResetPassword />} />
          </Routes>
        </main>

        <footer className="mt-auto py-6 bg-primary/5 dark:bg-primary/10 border-t border-primary/10 dark:border-primary/20">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-primary/70 dark:text-primary/60">
            © {new Date().getFullYear()} LexiMate - All rights reserved
          </div>
        </footer>

        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E4174',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }} 
        />
      </div>
    </Router>
  );
}

export default App;