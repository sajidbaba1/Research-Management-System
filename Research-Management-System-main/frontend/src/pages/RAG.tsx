import React from 'react';
import RAGChat from '../components/RAGChat';

const RAG: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Assistant</h1>
        <RAGChat />
      </div>
    </div>
  );
};

export default RAG;
