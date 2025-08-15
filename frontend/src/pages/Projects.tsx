import React from 'react';
import ProjectList from '../components/ProjectList';

const Projects: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Research Projects</h1>
        <ProjectList />
      </div>
    </div>
  );
};

export default Projects;
