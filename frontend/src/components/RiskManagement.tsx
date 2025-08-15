import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { risksApi, projectsApi, Risk, CreateRiskRequest, UpdateRiskRequest } from '../services/api';
import { 
  AlertTriangle, Search, Filter, Edit2, Trash2, Plus,
  X, Save, Calendar, Shield, CheckCircle
} from 'lucide-react';

interface RiskManagementProps {
  projectId?: number;
}

const RiskManagement: React.FC<RiskManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  
  const [newRisk, setNewRisk] = useState<CreateRiskRequest>({
    title: '',
    description: '',
    severity: 'MEDIUM',
    probability: 'MEDIUM',
    impact: '',
    mitigation: '',
    status: 'ACTIVE',
    projectId: projectId || 0
  });

  const { data: risks = [], isLoading: risksLoading } = useQuery({
    queryKey: projectId ? ['project-risks', projectId] : ['risks'],
    queryFn: () => projectId 
      ? risksApi.getRisksByProject(projectId, token!)
      : risksApi.getAllRisks(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAllProjects(token!),
    enabled: !!token && !projectId,
    staleTime: 10 * 60 * 1000,
  });

  const createRiskMutation = useMutation({
    mutationFn: (riskData: CreateRiskRequest) => risksApi.createRisk(riskData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-risks', projectId] : ['risks'] });
      setShowCreateModal(false);
      resetNewRisk();
    }
  });

  const updateRiskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRiskRequest }) => 
      risksApi.updateRisk(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-risks', projectId] : ['risks'] });
      setShowEditModal(false);
      setSelectedRisk(null);
    }
  });

  const deleteRiskMutation = useMutation({
    mutationFn: (riskId: number) => risksApi.deleteRisk(riskId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-risks', projectId] : ['risks'] });
    }
  });

  const handleCreateRisk = () => {
    if (!newRisk.title.trim()) return;
    createRiskMutation.mutate(newRisk);
  };

  const handleUpdateRisk = () => {
    if (!selectedRisk) return;
    updateRiskMutation.mutate({
      id: selectedRisk.id!,
      data: {
        title: selectedRisk.title,
        description: selectedRisk.description,
        severity: selectedRisk.severity,
        probability: selectedRisk.probability,
        impact: selectedRisk.impact,
        mitigation: selectedRisk.mitigation,
        status: selectedRisk.status
      }
    });
  };

  const handleDeleteRisk = (riskId: number) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      deleteRiskMutation.mutate(riskId);
    }
  };

  const resetNewRisk = () => {
    setNewRisk({
      title: '',
      description: '',
      severity: 'MEDIUM',
      probability: 'MEDIUM',
      impact: '',
      mitigation: '',
      status: 'ACTIVE',
      projectId: projectId || 0
    });
  };

  const openEditModal = (risk: Risk) => {
    setSelectedRisk(risk);
    setShowEditModal(true);
  };

  const filteredRisks = risks.filter((risk: Risk) => {
    const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.mitigation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || risk.severity === filterLevel;
    const matchesStatus = filterStatus === 'ALL' || risk.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'MITIGATED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'CLOSED': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const riskStats = {
    total: risks.length,
    active: risks.filter((r: Risk) => r.status === 'ACTIVE').length,
    high: risks.filter((r: Risk) => r.severity === 'HIGH' || r.severity === 'CRITICAL').length,
    mitigated: risks.filter((r: Risk) => r.status === 'MITIGATED').length
  };

  if (risksLoading) {
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
          {projectId ? 'Project Risks' : 'Risk Management'}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Risk
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Risks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Risks</p>
              <p className="text-2xl font-bold text-blue-600">{riskStats.active}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{riskStats.high}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mitigated</p>
              <p className="text-2xl font-bold text-green-600">{riskStats.mitigated}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="MITIGATED">Mitigated</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Showing: {filteredRisks.length} risks
        </div>
      </div>

      {/* Risks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRisks.map((risk: Risk) => (
          <motion.div
            key={risk.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {risk.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {risk.description}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(risk)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRisk(risk.id!)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(risk.severity)}`}>
                {risk.severity}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                {risk.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Probability</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {risk.probability}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Impact</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {risk.impact}
                </p>
              </div>
            </div>

            {risk.mitigation && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mitigation Plan:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{risk.mitigation}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Added: {new Date(risk.createdAt || '').toLocaleDateString()}
              </div>
              <div>
                Updated: {new Date(risk.updatedAt || '').toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRisks.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No risks found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterLevel !== 'ALL' || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first risk record to get started'}
          </p>
        </div>
      )}

      {/* Create Risk Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Risk</h2>
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
                  Risk Title *
                </label>
                <input
                  type="text"
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({...newRisk, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter risk title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter risk description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={newRisk.severity}
                    onChange={(e) => setNewRisk({...newRisk, severity: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Probability
                  </label>
                  <select
                    value={newRisk.probability}
                    onChange={(e) => setNewRisk({...newRisk, probability: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Impact
                  </label>
                  <input
                    type="text"
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({...newRisk, impact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter impact description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newRisk.status}
                    onChange={(e) => setNewRisk({...newRisk, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MITIGATED">Mitigated</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                {!projectId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project
                    </label>
                    <select
                      value={newRisk.projectId}
                      onChange={(e) => setNewRisk({...newRisk, projectId: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={0}>Select a project</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>{project.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mitigation Plan
                </label>
                <textarea
                  value={newRisk.mitigation}
                  onChange={(e) => setNewRisk({...newRisk, mitigation: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter mitigation plan"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRisk}
                disabled={!newRisk.title.trim() || createRiskMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createRiskMutation.isPending ? 'Creating...' : 'Create Risk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Risk Modal */}
      {showEditModal && selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Risk</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Title *
                </label>
                <input
                  type="text"
                  value={selectedRisk.title}
                  onChange={(e) => setSelectedRisk({...selectedRisk, title: e.target.value} as Risk)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter risk title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedRisk.description || ''}
                  onChange={(e) => setSelectedRisk({...selectedRisk, description: e.target.value} as Risk)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter risk description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={selectedRisk.severity}
                    onChange={(e) => setSelectedRisk({...selectedRisk, severity: e.target.value as any} as Risk)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Probability
                  </label>
                  <select
                    value={selectedRisk.probability}
                    onChange={(e) => setSelectedRisk({...selectedRisk, probability: e.target.value as any} as Risk)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Impact
                  </label>
                  <input
                    type="text"
                    value={selectedRisk.impact || ''}
                    onChange={(e) => setSelectedRisk({...selectedRisk, impact: e.target.value} as Risk)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter impact description"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={selectedRisk.status}
                  onChange={(e) => setSelectedRisk({...selectedRisk, status: e.target.value as any} as Risk)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MITIGATED">Mitigated</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mitigation Plan
                </label>
                <textarea
                  value={selectedRisk.mitigation || ''}
                  onChange={(e) => setSelectedRisk({...selectedRisk, mitigation: e.target.value} as Risk)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter mitigation plan"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRisk}
                disabled={updateRiskMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateRiskMutation.isPending ? 'Updating...' : 'Update Risk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RiskManagement;
