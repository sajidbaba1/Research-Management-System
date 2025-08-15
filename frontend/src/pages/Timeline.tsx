import React from 'react';
import ProjectTimeline3D from '../components/ProjectTimeline3D';

const Timeline: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Project Timeline</h1>
        <ProjectTimeline3D />
      </div>
    </div>
  );
};

export default Timeline;
