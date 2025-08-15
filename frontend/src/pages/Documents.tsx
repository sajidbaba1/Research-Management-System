import React from 'react';
import DocumentManagement from '../components/DocumentManagement';

const Documents: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Document Management</h1>
        <DocumentManagement />
      </div>
    </div>
  );
};

export default Documents;
