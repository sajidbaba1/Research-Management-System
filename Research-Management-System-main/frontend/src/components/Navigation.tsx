import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Users, Search, Home, BarChart3, Bot, Folder, Clock } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: location.pathname === '/dashboard' },
    { name: 'Projects', href: '/projects', icon: Folder, current: location.pathname === '/projects' },
    { name: 'Documents', href: '/documents', icon: FileText, current: location.pathname === '/documents' },
    { name: 'Team Management', href: '/team-management', icon: Users, current: location.pathname === '/team-management' },
    { name: 'Timeline', href: '/timeline', icon: Clock, current: location.pathname === '/timeline' },
    { name: 'Search', href: '/search', icon: Search, current: location.pathname === '/search' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, current: location.pathname === '/analytics' },
    { name: 'RAG Chat', href: '/rag', icon: Bot, current: location.pathname === '/rag' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Research Management</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${item.current
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
