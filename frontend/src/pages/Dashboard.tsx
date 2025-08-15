import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Activity, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  totalTeamMembers: number;
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalBudget: number;
  success?: boolean;
}

interface RecentActivity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'project' | 'member' | 'document';
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalTeamMembers: 0,
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    totalBudget: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:8080/api/dashboard/stats');
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent activity
      const activityResponse = await fetch('http://localhost:8080/api/dashboard/activity');
      if (!activityResponse.ok) {
        console.warn('Activity endpoint failed, using empty activity list');
        setRecentActivity([]);
      } else {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData || []);
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Set fallback data
      setStats({
        totalDocuments: 0,
        totalTeamMembers: 0,
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        totalBudget: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-blue-600',
      link: '/document-management'
    },
    {
      name: 'Team Members',
      value: stats.totalTeamMembers,
      icon: Users,
      color: 'text-green-600',
      link: '/team-management'
    },
    {
      name: 'Active Projects',
      value: stats.inProgressProjects,
      icon: Activity,
      color: 'text-purple-600',
      link: '/projects'
    },
    {
      name: 'Total Budget',
      value: stats.totalBudget ? `$${stats.totalBudget.toLocaleString()}` : '$0',
      icon: TrendingUp,
      color: 'text-orange-600',
      link: '/analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error ? 'Error loading data - showing cached information' : 'Real-time overview of your research management system'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Connection Issue</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button 
                    onClick={handleRetry}
                    className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Retry connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 px-5 py-3">
                <div className="text-sm">
                  <Link to={stat.link} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    View details<span className="sr-only"> {stat.name}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Activity {recentActivity.length > 0 ? `(${recentActivity.length})` : ''}
            </h3>
            
            {recentActivity.length === 0 ? (
              <div className="mt-5 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <p>No recent activity to display</p>
                  <p className="text-sm mt-1">Add some projects, team members, or documents to see activity here</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-800">
                              {activity.type === 'project' ? (
                                <Activity className="h-5 w-5 text-purple-600" />
                              ) : activity.type === 'member' ? (
                                <Users className="h-5 w-5 text-green-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-blue-600" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {activity.action} <span className="font-medium text-gray-900 dark:text-white">{activity.item}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
