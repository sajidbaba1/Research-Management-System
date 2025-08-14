import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import ProjectTimeline3D from './components/ProjectTimeline3D';

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-blue-500 p-4">
                    <ul className="flex space-x-4 text-white">
                        <li><Link to="/">Project List</Link></li>
                        <li><Link to="/timeline">3D Timeline</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<ProjectList />} />
                    <Route path="/timeline" element={<ProjectTimeline3D />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;