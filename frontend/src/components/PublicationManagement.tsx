import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { publicationsApi, projectsApi, Publication, CreatePublicationRequest, UpdatePublicationRequest } from '../services/api';
import { 
  BookOpen, Search, Filter, Edit2, Trash2, Plus,
  X, Save, Calendar, ExternalLink, Star, Users
} from 'lucide-react';

interface PublicationManagementProps {
  projectId?: number;
}

const PublicationManagement: React.FC<PublicationManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  
  const [newPublication, setNewPublication] = useState<CreatePublicationRequest>({
    title: '',
    authors: '',
    journal: '',
    status: 'DRAFT',
    abstract: '',
    projectId: projectId || 0
  });

  const { data: publications = [], isLoading: publicationsLoading } = useQuery({
    queryKey: projectId ? ['project-publications', projectId] : ['publications'],
    queryFn: () => projectId 
      ? publicationsApi.getPublicationsByProject(projectId, token!)
      : publicationsApi.getAllPublications(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAllProjects(token!),
    enabled: !!token && !projectId,
    staleTime: 10 * 60 * 1000,
  });

  const createPublicationMutation = useMutation({
    mutationFn: (publicationData: CreatePublicationRequest) => publicationsApi.createPublication(publicationData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-publications', projectId] : ['publications'] });
      setShowCreateModal(false);
      resetNewPublication();
    }
  });

  const updatePublicationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePublicationRequest }) => 
      publicationsApi.updatePublication(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-publications', projectId] : ['publications'] });
      setShowEditModal(false);
      setSelectedPublication(null);
    }
  });

  const deletePublicationMutation = useMutation({
    mutationFn: (publicationId: number) => publicationsApi.deletePublication(publicationId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-publications', projectId] : ['publications'] });
    }
  });

  const handleCreatePublication = () => {
    if (!newPublication.title.trim()) return;
    createPublicationMutation.mutate(newPublication);
  };

  const handleUpdatePublication = () => {
    if (!selectedPublication || !selectedPublication.id) return;
    updatePublicationMutation.mutate({
      id: selectedPublication.id,
      data: selectedPublication as UpdatePublicationRequest
    });
  };

  const handleDeletePublication = (publicationId: number) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      deletePublicationMutation.mutate(publicationId);
    }
  };

  const resetNewPublication = () => {
    setNewPublication({
      title: '',
      authors: '',
      journal: '',
      status: 'DRAFT',
      abstract: '',
      projectId: projectId || 0
    });
  };

  const openEditModal = (publication: Publication) => {
    setSelectedPublication(publication);
    setShowEditModal(true);
  };

  const filteredPublications = publications.filter((publication: Publication) => {
    const matchesSearch = publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publication.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publication.journal?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || publication.status === filterType;
    const matchesStatus = filterStatus === 'ALL' || publication.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'SUBMITTED': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'UNDER_REVIEW': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'ACCEPTED': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'PUBLISHED': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const publicationStats = {
    total: publications.length,
    published: publications.filter((p: Publication) => p.status === 'PUBLISHED').length,
    underReview: publications.filter((p: Publication) => p.status === 'UNDER_REVIEW').length,
    accepted: publications.filter((p: Publication) => p.status === 'ACCEPTED').length
  };

  if (publicationsLoading) {
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
          {projectId ? 'Project Publications' : 'Publication Management'}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Publication
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Publications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{publicationStats.total}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-2xl font-bold text-green-600">{publicationStats.published}</p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{publicationStats.underReview}</p>
            </div>
            <BookOpen className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
              <p className="text-2xl font-bold text-blue-600">{publicationStats.accepted}</p>
            </div>
            <Star className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search publications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Types</option>
            <option value="JOURNAL_ARTICLE">Journal Article</option>
            <option value="CONFERENCE_PAPER">Conference Paper</option>
            <option value="BOOK_CHAPTER">Book Chapter</option>
            <option value="THESIS">Thesis</option>
            <option value="PREPRINT">Preprint</option>
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
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Showing: {filteredPublications.length} publications
        </div>
      </div>

      {/* Publications List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPublications.map((publication: Publication) => (
          <motion.div
            key={publication.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {publication.title}
                </h3>
                {publication.authors && (
                  <div className="flex items-center gap-1 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{publication.authors}</p>
                  </div>
                )}
                {publication.journal && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">Journal:</span> {publication.journal}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(publication)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => publication.id && handleDeletePublication(publication.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete"
                  disabled={!publication.id}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(publication.status)}`}>
                {publication.status.replace('_', ' ')}
              </span>
            </div>

            {publication.abstract && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abstract:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{publication.abstract}</p>
              </div>
            )}

            {publication.doi && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DOI:</h4>
                <a
                  href={`https://doi.org/${publication.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 p-1"
                  title="DOI Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400">{publication.doi}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {publication.publishedDate 
                  ? `Published: ${new Date(publication.publishedDate).toLocaleDateString()}`
                  : 'No publication date'
                }
              </div>
              <div>
                Added: {new Date(publication.createdAt || '').toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPublications.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first publication record to get started'}
          </p>
        </div>
      )}

      {/* Create Publication Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Publication</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPublication.title}
                  onChange={(e) => setNewPublication({...newPublication, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter publication title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Authors
                </label>
                <input
                  type="text"
                  value={newPublication.authors || ''}
                  onChange={(e) => setNewPublication({...newPublication, authors: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter authors (comma separated)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Journal
                </label>
                <input
                  type="text"
                  value={newPublication.journal || ''}
                  onChange={(e) => setNewPublication({...newPublication, journal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter journal name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={newPublication.status}
                  onChange={(e) => setNewPublication({...newPublication, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Abstract
                </label>
                <textarea
                  value={newPublication.abstract || ''}
                  onChange={(e) => setNewPublication({...newPublication, abstract: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter abstract"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  value={newPublication.keywords || ''}
                  onChange={(e) => setNewPublication({...newPublication, keywords: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter keywords (comma separated)"
                />
              </div>

              {!projectId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project
                  </label>
                  <select
                    value={newPublication.projectId}
                    onChange={(e) => setNewPublication({...newPublication, projectId: Number(e.target.value)})}
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
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePublication}
                disabled={!newPublication.title.trim() || createPublicationMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createPublicationMutation.isPending ? 'Creating...' : 'Create Publication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PublicationManagement;
