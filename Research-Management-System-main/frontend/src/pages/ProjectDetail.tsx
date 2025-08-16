import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, FileText, Clock, Edit, Trash2 } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  priority: string;
  teamMembers: any[];
  documents: any[];
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PLANNED': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'ON_HOLD': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'HIGH': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-600 dark:text-yellow-200">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {project.description}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Project Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${project.budget?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Team & Resources
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Team Members:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {project.teamMembers?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {project.documents?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Duration:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
