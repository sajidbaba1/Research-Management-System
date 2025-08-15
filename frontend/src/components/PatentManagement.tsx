import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { patentsApi, projectsApi, Patent, CreatePatentRequest, UpdatePatentRequest } from '../services/api';
import { 
  Shield, Search, Filter, Edit2, Trash2, Plus,
  X, Save, Calendar, CheckCircle, Clock, AlertCircle, ExternalLink
} from 'lucide-react';

interface PatentManagementProps {
  projectId?: number;
}

const PatentManagement: React.FC<PatentManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  
  const [newPatent, setNewPatent] = useState<CreatePatentRequest>({
    title: '',
    description: '',
    inventors: '',
    status: 'DRAFT',
    projectId: projectId || 0
  });

  const { data: patents = [], isLoading: patentsLoading } = useQuery({
    queryKey: projectId ? ['project-patents', projectId] : ['patents'],
    queryFn: () => projectId 
      ? patentsApi.getPatentsByProject(projectId, token!)
      : patentsApi.getAllPatents(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAllProjects(token!),
    enabled: !!token && !projectId,
    staleTime: 10 * 60 * 1000,
  });

  const createPatentMutation = useMutation({
    mutationFn: (patentData: CreatePatentRequest) => patentsApi.createPatent(patentData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-patents', projectId] : ['patents'] });
      setShowCreateModal(false);
      resetNewPatent();
    }
  });

  const updatePatentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePatentRequest }) => 
      patentsApi.updatePatent(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-patents', projectId] : ['patents'] });
      setShowEditModal(false);
      setSelectedPatent(null);
    }
  });

  const deletePatentMutation = useMutation({
    mutationFn: (patentId: number) => patentsApi.deletePatent(patentId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-patents', projectId] : ['patents'] });
    }
  });

  const handleCreatePatent = () => {
    if (!newPatent.title.trim()) return;
    createPatentMutation.mutate(newPatent);
  };

  const handleUpdatePatent = () => {
    if (!selectedPatent || !selectedPatent.id) return;
    updatePatentMutation.mutate({
      id: selectedPatent.id,
      data: selectedPatent as UpdatePatentRequest
    });
  };

  const handleDeletePatent = (patentId: number) => {
    if (window.confirm('Are you sure you want to delete this patent?')) {
      deletePatentMutation.mutate(patentId);
    }
  };

  const resetNewPatent = () => {
    setNewPatent({
      title: '',
      description: '',
      inventors: '',
      status: 'DRAFT',
      projectId: projectId || 0
    });
  };

  const openEditModal = (patent: Patent) => {
    setSelectedPatent(patent);
    setShowEditModal(true);
  };

  const patentsArray = Array.isArray(patents) ? patents as Patent[] : [];
  const filteredPatents = patentsArray.filter((patent: Patent) => {
    const matchesSearch = patent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patent.inventors?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || patent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'FILED': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'PUBLISHED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'GRANTED': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Clock className="w-4 h-4" />;
      case 'FILED': return <AlertCircle className="w-4 h-4" />;
      case 'PUBLISHED': return <ExternalLink className="w-4 h-4" />;
      case 'GRANTED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const patentStats = {
    total: patentsArray.length,
    draft: patentsArray.filter((p: Patent) => p.status === 'DRAFT').length,
    filed: patentsArray.filter((p: Patent) => p.status === 'FILED').length,
    granted: patentsArray.filter((p: Patent) => p.status === 'GRANTED').length
  };

  if (patentsLoading) {
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
          {projectId ? 'Project Patents' : 'Patent Management'}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Patent
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{patentStats.total}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{patentStats.draft}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filed</p>
              <p className="text-2xl font-bold text-blue-600">{patentStats.filed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Granted</p>
              <p className="text-2xl font-bold text-green-600">{patentStats.granted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search patents..."
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
            <option value="DRAFT">Draft</option>
            <option value="FILED">Filed</option>
            <option value="PUBLISHED">Published</option>
            <option value="GRANTED">Granted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Showing: {filteredPatents.length} patents
        </div>
      </div>

      {/* Patents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatents.map((patent) => (
          <motion.div
            key={patent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {patent.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {patent.description}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(patent)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => patent.id && handleDeletePatent(patent.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete"
                  disabled={!patent.id}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(patent.status)}`}>
                {getStatusIcon(patent.status)}
                {patent.status}
              </span>
            </div>

            {patent.inventors && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inventors:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{patent.inventors}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {patent.applicationDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Filed: {new Date(patent.applicationDate).toLocaleDateString()}
                </div>
              )}
              {patent.applicationDate && (
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Published: {new Date(patent.applicationDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPatents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No patents found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first patent record to get started'}
          </p>
        </div>
      )}

      {/* Create Patent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Patent</h2>
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
                  Patent Title *
                </label>
                <input
                  type="text"
                  value={newPatent.title}
                  onChange={(e) => setNewPatent({...newPatent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter patent title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newPatent.description}
                  onChange={(e) => setNewPatent({...newPatent, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the patent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inventors
                </label>
                <input
                  type="text"
                  value={newPatent.inventors}
                  onChange={(e) => setNewPatent({...newPatent, inventors: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter inventor names (comma separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newPatent.status}
                    onChange={(e) => setNewPatent({...newPatent, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="FILED">Filed</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="GRANTED">Granted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={newPatent.applicationDate}
                    onChange={(e) => setNewPatent({...newPatent, applicationDate: e.target.value})}
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
                    value={newPatent.projectId}
                    onChange={(e) => setNewPatent({...newPatent, projectId: Number(e.target.value)})}
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
                onClick={handleCreatePatent}
                disabled={!newPatent.title.trim() || createPatentMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createPatentMutation.isPending ? 'Creating...' : 'Create Patent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PatentManagement;
