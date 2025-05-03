// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TranslationEditor } from './components/TranslationEditor';
import { TranslationHistory } from './components/TranslationHistory';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">ÇeviriMate</h1>
            <nav className="space-x-4">
              <Link to="/" className="text-blue-600 hover:underline">Çeviri</Link>
              <Link to="/history" className="text-blue-600 hover:underline">Geçmiş</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<TranslationEditor />} />
            <Route path="/history" element={<TranslationHistory />} />
          </Routes>
        </main>

        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
