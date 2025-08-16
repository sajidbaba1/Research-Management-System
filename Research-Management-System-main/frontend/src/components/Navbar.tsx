import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Research Management System</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/timeline"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/timeline') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Timeline
                </Link>
                <Link
                  to="/analytics"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/analytics') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/team"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/team') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Team
                </Link>
                <Link
                  to="/documents"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/documents') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Documents
                </Link>
                <Link
                  to="/rag"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/rag') 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  AI Assistant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
