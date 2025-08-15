import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, tasksAPI, milestonesAPI, teamAPI, budgetAPI, documentsAPI, risksAPI, ProjectRisk, ProjectTask, ResearchProject } from '../services/api';
import { 
  ArrowLeft, Edit2, Save, X, Plus, Calendar, DollarSign, Users, FileText, 
  AlertTriangle, Package, CheckCircle, Clock, TrendingUp, Activity 
} from 'lucide-react';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ResearchProject>>({});

  const { data: project, isLoading: projectLoading } = useQuery<ResearchProject>({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(Number(id!)),
    enabled: !!id && !!token
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => tasksAPI.getByProjectId(Number(id!)),
    enabled: !!id && !!token
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: () => milestonesAPI.getByProjectId(Number(id!)),
    enabled: !!id && !!token
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project-team', id],
    queryFn: () => teamAPI.getByProjectId(Number(id!)),
    enabled: !!id && !!token
  });

  const { data: budgetData = [] } = useQuery({
    queryKey: ['project-budget', id],
    queryFn: () => budgetAPI.getByProjectId(Number(id!)),
    enabled: !!id && !!token
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['project-documents', id],
    queryFn: () => documentsAPI.getByProjectId(Number(id!)),
    enabled: !!id && !!token
  });

  const { data: risks = [] } = useQuery<ProjectRisk[]>({
    queryKey: ['project-risks', id],
    queryFn: () => risksAPI.getByProjectId(Number(id!)),
    enabled: !!id && !!token
  });

  // TODO: Implement deliverables API when available
  const deliverables: any[] = [];

  const updateProjectMutation = useMutation({
    mutationFn: (updatedData: any) => projectsAPI.update(Number(id!), updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsEditing(false);
    }
  });

  const handleEdit = () => {
    setEditData(project as unknown as Partial<ResearchProject>);
    setIsEditing(true);
  };

  const handleSave = () => {
    (updateProjectMutation as any).mutate(editData);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PLANNING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const calculateProgress = () => {
    const taskArray = (tasks as ProjectTask[]) || [];
    if (!taskArray.length) return 0;
    const completedTasks = taskArray.filter((task: ProjectTask) => task.status === 'COMPLETED').length;
    return Math.round((completedTasks / taskArray.length) * 100);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle, count: (tasks as any[])?.length || 0 },
    { id: 'milestones', label: 'Milestones', icon: Calendar, count: (milestones as any[])?.length || 0 },
    { id: 'team', label: 'Team', icon: Users, count: (teamMembers as any[])?.length || 0 },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText, count: (documents as any[])?.length || 0 },
    { id: 'risks', label: 'Risks', icon: AlertTriangle, count: (risks as any[])?.length || 0 },
    { id: 'deliverables', label: 'Deliverables', icon: Package, count: (deliverables as any[])?.length || 0 },
  ];

  if (projectLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">The requested project could not be found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{(project as unknown as ResearchProject)?.title}</h1>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((project as unknown as ResearchProject)?.status)}`}>
                  {(project as unknown as ResearchProject)?.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor((project as unknown as ResearchProject)?.priority)}`}>
                  {(project as unknown as ResearchProject)?.priority} Priority
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {calculateProgress()}% Complete
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={(updateProjectMutation as any)?.isLoading}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Project
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } flex items-center gap-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">{(project as unknown as ResearchProject)?.description}</p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{(tasks as any[])?.length || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{(tasks as ProjectTask[])?.filter((t: ProjectTask) => t.status === 'COMPLETED').length || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{(milestones as any[])?.length || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Milestones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{(teamMembers as any[])?.length || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Team Size</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Info</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Research Area</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{(project as unknown as ResearchProject)?.researchArea}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Principal Investigator</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{(project as unknown as ResearchProject)?.principalInvestigator}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Institution</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{(project as unknown as ResearchProject)?.institution}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">${(project as unknown as ResearchProject)?.budget?.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {new Date((project as unknown as ResearchProject)?.startDate || '').toLocaleDateString()} - {new Date((project as unknown as ResearchProject)?.endDate || '').toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                {(risks as ProjectRisk[]).length > 0 && (
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">High Priority Risks</h3>
                    <div className="space-y-2">
                      {(risks as ProjectRisk[]).filter((risk: ProjectRisk) => risk.riskLevel === 'HIGH').slice(0, 3).map((risk: ProjectRisk) => (
                        <div key={risk.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-900 dark:text-white truncate">{risk.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {tabs.find(t => t.id === activeTab)?.label} Management
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  This section will be implemented with full CRUD operations for {activeTab}.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetails;
