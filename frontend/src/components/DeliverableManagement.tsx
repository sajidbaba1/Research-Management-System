import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { deliverablesApi, projectsApi, Deliverable, CreateDeliverableRequest, UpdateDeliverableRequest } from '../services/api';
import { 
  Package, Search, Filter, Edit2, Trash2, Plus,
  X, Save, Calendar, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

interface DeliverableManagementProps {
  projectId?: number;
}

const DeliverableManagement: React.FC<DeliverableManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  
  const [newDeliverable, setNewDeliverable] = useState<CreateDeliverableRequest>({
    title: '',
    description: '',
    type: 'REPORT',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    completionPercentage: 0,
    projectId: projectId || 0
  });

  const { data: deliverables = [], isLoading: deliverablesLoading } = useQuery({
    queryKey: projectId ? ['project-deliverables', projectId] : ['deliverables'],
    queryFn: () => projectId 
      ? deliverablesApi.getDeliverablesByProject(projectId, token!)
      : deliverablesApi.getAllDeliverables(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAllProjects(token!),
    enabled: !!token && !projectId,
    staleTime: 10 * 60 * 1000,
  });

  const createDeliverableMutation = useMutation({
    mutationFn: (deliverableData: CreateDeliverableRequest) => deliverablesApi.createDeliverable(deliverableData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-deliverables', projectId] : ['deliverables'] });
      setShowCreateModal(false);
      resetNewDeliverable();
    }
  });

  const updateDeliverableMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeliverableRequest }) => 
      deliverablesApi.updateDeliverable(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-deliverables', projectId] : ['deliverables'] });
      setShowEditModal(false);
      setSelectedDeliverable(null);
    }
  });

  const deleteDeliverableMutation = useMutation({
    mutationFn: (deliverableId: number) => deliverablesApi.deleteDeliverable(deliverableId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-deliverables', projectId] : ['deliverables'] });
    }
  });

  const handleCreateDeliverable = () => {
    if (!newDeliverable.title.trim()) return;
    createDeliverableMutation.mutate(newDeliverable);
  };

  const handleUpdateDeliverable = () => {
    if (!selectedDeliverable) return;
    updateDeliverableMutation.mutate({
      id: selectedDeliverable.id,
      data: selectedDeliverable as UpdateDeliverableRequest
    });
  };

  const handleDeleteDeliverable = (deliverableId: number) => {
    if (window.confirm('Are you sure you want to delete this deliverable?')) {
      deleteDeliverableMutation.mutate(deliverableId);
    }
  };

  const resetNewDeliverable = () => {
    setNewDeliverable({
      title: '',
      description: '',
      type: 'REPORT',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
      completionPercentage: 0,
      projectId: projectId || 0
    });
  };

  const openEditModal = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setShowEditModal(true);
  };

  const filteredDeliverables = deliverables.filter(deliverable => {
    const matchesSearch = deliverable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliverable.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || deliverable.status === filterStatus;
    const matchesType = filterType === 'ALL' || deliverable.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'COMPLETED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'OVERDUE': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REPORT': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'SOFTWARE': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'PRESENTATION': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'PROTOTYPE': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'OTHER': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const deliverableStats = {
    total: deliverables.length,
    pending: deliverables.filter(d => d.status === 'PENDING').length,
    inProgress: deliverables.filter(d => d.status === 'IN_PROGRESS').length,
    completed: deliverables.filter(d => d.status === 'COMPLETED').length,
    overdue: deliverables.filter(d => d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 'COMPLETED').length
  };

  if (deliverablesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {projectId ? 'Project Deliverables' : 'Deliverable Management'}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Deliverable
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{deliverableStats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{deliverableStats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{deliverableStats.inProgress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{deliverableStats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{deliverableStats.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search deliverables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Types</option>
            <option value="REPORT">Report</option>
            <option value="SOFTWARE">Software</option>
            <option value="PRESENTATION">Presentation</option>
            <option value="PROTOTYPE">Prototype</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Showing: {filteredDeliverables.length} deliverables
        </div>
      </div>

      {/* Deliverables List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeliverables.map((deliverable) => (
          <motion.div
            key={deliverable.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {deliverable.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {deliverable.description}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(deliverable)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDeliverable(deliverable.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(deliverable.status)}`}>
                {getStatusIcon(deliverable.status)}
                {deliverable.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(deliverable.type)}`}>
                {deliverable.type}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{deliverable.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    deliverable.completionPercentage === 100
                      ? 'bg-green-500'
                      : deliverable.completionPercentage > 50
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${deliverable.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due: {deliverable.dueDate ? new Date(deliverable.dueDate).toLocaleDateString() : 'No due date'}
              </div>
              <div>
                Created: {new Date(deliverable.createdAt || '').toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDeliverables.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deliverables found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'ALL' || filterType !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first deliverable to get started'}
          </p>
        </div>
      )}

      {/* Create Deliverable Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Deliverable</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  value={newDeliverable.title}
                  onChange={(e) => setNewDeliverable({...newDeliverable, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter deliverable title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDeliverable.description}
                  onChange={(e) => setNewDeliverable({...newDeliverable, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the deliverable"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newDeliverable.type}
                    onChange={(e) => setNewDeliverable({...newDeliverable, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="REPORT">Report</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="PROTOTYPE">Prototype</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newDeliverable.status}
                    onChange={(e) => setNewDeliverable({...newDeliverable, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDeliverable.dueDate}
                    onChange={(e) => setNewDeliverable({...newDeliverable, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Completion Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDeliverable.completionPercentage}
                    onChange={(e) => setNewDeliverable({...newDeliverable, completionPercentage: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {!projectId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project
                  </label>
                  <select
                    value={newDeliverable.projectId}
                    onChange={(e) => setNewDeliverable({...newDeliverable, projectId: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={0}>Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeliverable}
                disabled={!newDeliverable.title.trim() || createDeliverableMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createDeliverableMutation.isPending ? 'Creating...' : 'Create Deliverable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DeliverableManagement;
