import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface AnalyticsData {
  id: number;
  projectTitle: string;
  completionRate: number;
  durationDays: number;
  actualDurationDays: number;
  onTimeCompletion: boolean;
  calculatedDate: string;
  project?: {
    title: string;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/analytics/calculate-all', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to calculate analytics');
      }
      await fetchAnalytics(); // Refresh data after calculation
    } catch (error) {
      console.error('Error calculating analytics:', error);
      setError('Failed to calculate analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={calculateAnalytics}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Calculate Analytics
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">No analytics data available</p>
          <button 
            onClick={calculateAnalytics}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Calculate Analytics
          </button>
        </div>
      </div>
    );
  }

  const projectStatusData = {
    labels: analytics.map(a => a.projectTitle || a.project?.title || 'Unknown Project'),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: analytics.map(a => Math.max(0, Math.min(100, a.completionRate || 0))),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const completedCount = analytics.filter(a => (a.completionRate || 0) >= 100).length;
  const inProgressCount = analytics.filter(a => (a.completionRate || 0) > 0 && (a.completionRate || 0) < 100).length;
  const pendingCount = analytics.filter(a => (a.completionRate || 0) === 0).length;

  const statusDistribution = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [completedCount, inProgressCount, pendingCount],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 2,
      },
    ],
  };

  const progressOverTime = {
    labels: analytics.map(a => a.projectTitle || a.project?.title || 'Unknown Project'),
    datasets: [
      {
        label: 'Progress Over Time',
        data: analytics.map(a => Math.max(0, Math.min(100, a.completionRate || 0))),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + Math.round(context.raw) + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button 
          onClick={calculateAnalytics}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Refresh Analytics'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Completion Rates</h2>
          <div className="h-64">
            <Bar data={projectStatusData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
          <div className="h-64">
            <Doughnut data={statusDistribution} options={chartOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
        <div className="h-64">
          <Line data={progressOverTime} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-600">Completed</h3>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-600">In Progress</h3>
          <p className="text-2xl font-bold">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-600">Pending</h3>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
