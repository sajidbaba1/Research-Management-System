import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Analytics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default Analytics;
