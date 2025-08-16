import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import DocumentManagement from './pages/DocumentManagement';
import SearchResults from './pages/SearchResults';
import Navigation from './components/Navigation';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Chatbot from './components/Chatbot';
import ThemeToggle from './components/ThemeToggle';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import RAG from './pages/RAG';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <Navigation />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/team-management" element={<TeamManagement />} />
              <Route path="/documents" element={<DocumentManagement />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/rag" element={<RAG />} />
            </Routes>
          </main>
          <Chatbot />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;