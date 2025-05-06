// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TranslationEditor } from './components/TranslationEditor';
import { TranslationHistory } from './components/TranslationHistory';
import { Toaster } from 'react-hot-toast';

// Navigation link component for consistent styling
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-md transition-colors duration-200 ${
        isActive 
          ? 'bg-primary text-white font-medium' 
          : 'text-gray-700 hover:bg-primary/10'
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
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary dark:text-white flex items-center">
              <span className="text-accent mr-2">✦</span>
              ÇeviriMate
            </h1>
            <nav className="flex space-x-2">
              <NavLink to="/">Çeviri</NavLink>
              <NavLink to="/history">Geçmiş</NavLink>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<TranslationEditor />} />
            <Route path="/history" element={<TranslationHistory />} />
          </Routes>
        </main>

        <footer className="mt-auto py-6 bg-white dark:bg-gray-800 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} ÇeviriMate - All rights reserved
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
