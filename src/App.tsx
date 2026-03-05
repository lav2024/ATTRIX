import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useApp } from './context/AppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Results from './pages/Results';
import Outcome from './pages/Outcome';

function App() {
  const { user, logout, analyzedData, meetings } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={logout} employees={analyzedData} meetings={meetings} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/results" element={<Results />} />
          <Route path="/outcome" element={<Outcome />} />
        </Routes>
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 ATTRIX AI. All rights reserved. Empowering HR with Intelligence.</p>
      </footer>
    </div>
  );
}

export default App;
