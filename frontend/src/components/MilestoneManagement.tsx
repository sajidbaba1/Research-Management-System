import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { milestonesApi, Milestone, CreateMilestoneRequest, UpdateMilestoneRequest } from '../services/api';
import { 
  Plus, Search, Filter, Edit2, Trash2, CheckCircle, Clock, AlertCircle,
  Calendar, Target, Flag, FileText, X, Save, TrendingUp
} from 'lucide-react';

interface MilestoneManagementProps {
  projectId?: number;
}

const MilestoneManagement: React.FC<MilestoneManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  
  const [newMilestone, setNewMilestone] = useState<CreateMilestoneRequest>({
    title: '',
    description: '',
    targetDate: '',
    status: 'PENDING',
    completionPercentage: 0,
    projectId: projectId || 0
  });

  const { data: milestones = [], isLoading, error } = useQuery({
    queryKey: projectId ? ['project-milestones', projectId] : ['milestones'],
    queryFn: () => projectId 
      ? milestonesApi.getMilestonesByProject(projectId, token!)
      : milestonesApi.getAllMilestones(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (milestoneData: CreateMilestoneRequest) => milestonesApi.createMilestone(milestoneData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-milestones', projectId] : ['milestones'] });
      setShowCreateModal(false);
      resetNewMilestone();
    },
    onError: (error: any) => {
      console.error('Error creating milestone:', error);
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMilestoneRequest }) => 
      milestonesApi.updateMilestone(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-milestones', projectId] : ['milestones'] });
      setEditingMilestone(null);
    },
    onError: (error: any) => {
      console.error('Error updating milestone:', error);
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: number) => milestonesApi.deleteMilestone(milestoneId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-milestones', projectId] : ['milestones'] });
    },
    onError: (error: any) => {
      console.error('Error deleting milestone:', error);
    }
  });

  const resetNewMilestone = () => {
    setNewMilestone({
      title: '',
      description: '',
      targetDate: '',
      status: 'PENDING',
      completionPercentage: 0,
      projectId: projectId || 0
    });
  };

  const handleCreateMilestone = () => {
    createMilestoneMutation.mutate(newMilestone);
  };

  const handleUpdateMilestone = () => {
    if (editingMilestone && editingMilestone.id) {
      updateMilestoneMutation.mutate({
        id: editingMilestone.id,
        data: {
          title: editingMilestone.title,
          description: editingMilestone.description,
          targetDate: editingMilestone.targetDate,
          status: editingMilestone.status,
          completionPercentage: editingMilestone.completionPercentage
        }
      });
    }
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestoneMutation.mutate(milestoneId);
    }
  };

  const milestonesArray = Array.isArray(milestones) ? milestones as Milestone[] : [];
  const filteredMilestones = milestonesArray.filter((milestone: Milestone) => {
    const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || milestone.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'PENDING': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'OVERDUE': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'OVERDUE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isOverdue = (targetDate: string, status: string) => {
    if (status === 'COMPLETED') return false;
    return new Date(targetDate) < new Date();
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Failed to load milestones. Please try again.
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['milestones'] })} className="ml-2 text-blue-500 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {projectId ? 'Project Milestones' : 'Milestone Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Milestone
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search milestones..."
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
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Total: {filteredMilestones.length} milestones
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Completed: {filteredMilestones.filter((m: Milestone) => m.status === 'COMPLETED').length}
        </div>
      </div>

      {/* Milestone Timeline View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Milestone Timeline
        </h3>
        <div className="space-y-4">
          {filteredMilestones
            .sort((a: Milestone, b: Milestone) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
            .map((milestone: Milestone, index: number) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-start space-x-4 p-4 rounded-lg border-l-4 ${
                milestone.status === 'COMPLETED' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : isOverdue(milestone.targetDate, milestone.status)
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(milestone.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {milestone.title}
                    </h4>
                    {milestone.description && (
                      <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingMilestone(milestone)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => milestone.id && handleDeleteMilestone(milestone.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete milestone"
                      disabled={!milestone.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                    {milestone.status.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(milestone.targetDate).toLocaleDateString()}
                    {milestone.status !== 'COMPLETED' && (
                      <span className={`ml-1 ${isOverdue(milestone.targetDate, milestone.status) ? 'text-red-500' : ''}`}>
                        ({getDaysUntilTarget(milestone.targetDate)} days)
                      </span>
                    )}
                  </div>
                  
                  {milestone.completionPercentage > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600 dark:text-blue-400">
                        {milestone.completionPercentage}% complete
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                {milestone.completionPercentage > 0 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          milestone.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${milestone.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {filteredMilestones.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No milestones found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first milestone'}
          </p>
        </div>
      )}

      {/* Create Milestone Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Milestone</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Milestone Title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="date"
                placeholder="Target Date"
                value={newMilestone.targetDate}
                onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newMilestone.status}
                onChange={(e) => setNewMilestone({...newMilestone, status: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <input
                type="number"
                placeholder="Completion %"
                min="0"
                max="100"
                value={newMilestone.completionPercentage}
                onChange={(e) => setNewMilestone({...newMilestone, completionPercentage: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Milestone Description"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMilestone}
                disabled={createMilestoneMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createMilestoneMutation.isPending ? 'Creating...' : 'Create Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Milestone</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Milestone Title"
                value={editingMilestone.title}
                onChange={(e) => setEditingMilestone({...editingMilestone, title: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="date"
                placeholder="Target Date"
                value={editingMilestone.targetDate}
                onChange={(e) => setEditingMilestone({...editingMilestone, targetDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={editingMilestone.status}
                onChange={(e) => setEditingMilestone({...editingMilestone, status: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <input
                type="number"
                placeholder="Completion %"
                min="0"
                max="100"
                value={editingMilestone.completionPercentage}
                onChange={(e) => setEditingMilestone({...editingMilestone, completionPercentage: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Milestone Description"
              value={editingMilestone.description}
              onChange={(e) => setEditingMilestone({...editingMilestone, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingMilestone(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMilestone}
                disabled={updateMilestoneMutation.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateMilestoneMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneManagement;
