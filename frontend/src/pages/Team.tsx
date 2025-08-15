import React from 'react';
import TeamManagement from '../components/TeamManagement';

const Team: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Management</h1>
        <TeamManagement />
      </div>
    </div>
  );
};

export default Team;
