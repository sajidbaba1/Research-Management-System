import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import ProjectTimeline3D from './components/ProjectTimeline3D';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TeamManagement from './components/TeamManagement';
import DocumentManagement from './components/DocumentManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Research Management System</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Projects
                </Link>
                <Link to="/timeline" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Timeline
                </Link>
                <Link to="/analytics" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Analytics
                </Link>
                <Link to="/team" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Team
                </Link>
                <Link to="/documents" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Documents
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/timeline" element={<ProjectTimeline3D />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/documents" element={<DocumentManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;