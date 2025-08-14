import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Add react-router-dom: npm install react-router-dom @types/react-router-dom
import ProjectList from './components/ProjectList';

const App: React.FC = () => {
  return (
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            {/* Add more routes later */}
          </Routes>
        </div>
      </Router>
  );
};

export default App;