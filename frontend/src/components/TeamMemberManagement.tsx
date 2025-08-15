import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { teamAPI, TeamMember, CreateTeamMemberRequest, ResearchProject } from '../services/api';
import { 
  Plus, Search, Filter, Edit2, Trash2, Users, User, Mail, Phone,
  Calendar, MapPin, Briefcase, X, Save, UserPlus, Award, Clock
} from 'lucide-react';

interface TeamMemberManagementProps {
  projectId?: number;
}

const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  
  const [newMember, setNewMember] = useState<CreateTeamMemberRequest>({
    userId: 0,
    role: 'MEMBER',
    joinDate: new Date().toISOString().split('T')[0],
    responsibilities: '',
    projectId: projectId || 0
  });

  const { data: teamMembers = [], isLoading, error } = useQuery<TeamMember[]>({
    queryKey: projectId ? ['project-team', projectId] : ['team-members'],
    queryFn: () => projectId 
      ? teamAPI.getByProjectId(projectId)
      : teamAPI.getAll(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const createMemberMutation = useMutation({
    mutationFn: (memberData: Omit<TeamMember, 'id'>) => teamAPI.create(memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-team', projectId] : ['team-members'] });
      setShowCreateModal(false);
      resetNewMember();
    },
    onError: (error: any) => {
      console.error('Error creating team member:', error);
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TeamMember> }) => 
      teamAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-team', projectId] : ['team-members'] });
      setEditingMember(null);
    },
    onError: (error: any) => {
      console.error('Error updating team member:', error);
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: number) => teamAPI.delete(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-team', projectId] : ['team-members'] });
    },
    onError: (error: any) => {
      console.error('Error deleting team member:', error);
    }
  });

  const resetNewMember = () => {
    setNewMember({
      userId: 0,
      role: 'MEMBER',
      joinDate: new Date().toISOString().split('T')[0],
      responsibilities: '',
      projectId: projectId || 0
    });
  };

  const handleCreateMember = () => {
    const memberData: Omit<TeamMember, 'id'> = {
      name: '', // This should be filled from user selection
      email: '', // This should be filled from user selection
      role: newMember.role,
      responsibilities: newMember.responsibilities,
      joinDate: newMember.joinDate,
      project: {} as ResearchProject, // This should be filled with actual project data
      userId: newMember.userId,
      projectId: newMember.projectId
    };
    createMemberMutation.mutate(memberData);
  };

  const handleUpdateMember = () => {
    if (editingMember && editingMember.id) {
      updateMemberMutation.mutate({
        id: editingMember.id,
        data: {
          role: editingMember.role,
          responsibilities: (editingMember as any).responsibilities,
          joinDate: editingMember.joinDate
        }
      });
    }
  };

  const handleDeleteMember = (memberId: number) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      deleteMemberMutation.mutate(memberId);
    }
  };

  const filteredMembers = (teamMembers as TeamMember[]).filter((member: TeamMember) => {
    const matchesSearch = (member as any).user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member as any).user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member as any).responsibilities?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LEAD': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'ADMIN': return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'MEMBER': return <User className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEAD': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'MEMBER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
        Failed to load team members. Please try again.
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['team-members'] })} className="ml-2 text-blue-500 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {projectId ? 'Project Team' : 'Team Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage team members and their roles
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(teamMembers as TeamMember[]).length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(teamMembers as TeamMember[]).filter((m: TeamMember) => m.role === 'PRINCIPAL_INVESTIGATOR').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Team Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(teamMembers as TeamMember[]).filter((m: TeamMember) => m.role === 'PRINCIPAL_INVESTIGATOR').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(teamMembers as TeamMember[]).filter((m: TeamMember) => {
                  const joinDate = new Date(m.joinDate || new Date());
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return joinDate > thirtyDaysAgo;
                }).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">New (30 days)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Roles</option>
            <option value="LEAD">Team Lead</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Active: {filteredMembers.length} members
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Avg. Tenure: {Math.round(
            (teamMembers as TeamMember[]).reduce((sum: number, member: TeamMember) => {
              const joinDate = new Date(member.joinDate || new Date());
              const now = new Date();
              const daysActive = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + daysActive;
            }, 0) / ((teamMembers as TeamMember[]).length || 1)
          )} days
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member: TeamMember) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(member as any).user?.name ? getInitials((member as any).user.name) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(member as any).user?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewingMember(member)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="View Details"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingMember(member)}
                    className="text-green-500 hover:text-green-700 p-1"
                    title="Edit Member"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id!)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(member as any).user?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  {(member as any).user.email}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <Calendar className="w-4 h-4" />
                Joined: {new Date(member.joinDate || new Date()).toLocaleDateString()}
              </div>

              {(member as any).responsibilities && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Responsibilities</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {(member as any).responsibilities || 'No responsibilities assigned'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No team members found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterRole !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first team member'}
          </p>
        </div>
      )}

      {/* Create Member Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Team Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                placeholder="User ID"
                value={newMember.userId}
                onChange={(e) => setNewMember({...newMember, userId: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="MEMBER">Member</option>
                <option value="LEAD">Team Lead</option>
                <option value="ADMIN">Admin</option>
              </select>
              <input
                type="date"
                placeholder="Join Date"
                value={newMember.joinDate}
                onChange={(e) => setNewMember({...newMember, joinDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {!projectId && (
                <input
                  type="number"
                  placeholder="Project ID"
                  value={newMember.projectId}
                  onChange={(e) => setNewMember({...newMember, projectId: Number(e.target.value)})}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              )}
            </div>
            <textarea
              placeholder="Responsibilities and duties..."
              value={newMember.responsibilities}
              onChange={(e) => setNewMember({...newMember, responsibilities: e.target.value})}
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
                onClick={handleCreateMember}
                disabled={createMemberMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createMemberMutation.isPending ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Team Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={editingMember.role}
                onChange={(e) => setEditingMember({...editingMember, role: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="MEMBER">Member</option>
                <option value="LEAD">Team Lead</option>
                <option value="ADMIN">Admin</option>
              </select>
              <input
                type="date"
                placeholder="Join Date"
                value={editingMember.joinDate}
                onChange={(e) => setEditingMember({...editingMember, joinDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Responsibilities and duties..."
              value={(editingMember as any).responsibilities || ''}
              onChange={(e) => setEditingMember({...editingMember, responsibilities: e.target.value} as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMember}
                disabled={updateMemberMutation.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateMemberMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Member Modal */}
      {viewingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {(viewingMember as any).user?.name ? getInitials((viewingMember as any).user.name) : 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(viewingMember as any).user?.name || 'Unknown User'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleIcon(viewingMember.role)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(viewingMember.role)}`}>
                      {viewingMember.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {(viewingMember as any).user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{(viewingMember as any).user.email}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  Joined on {new Date(viewingMember.joinDate || new Date()).toLocaleDateString()}
                </span>
              </div>

              {(viewingMember as any).responsibilities && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Responsibilities
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {(viewingMember as any).responsibilities || 'No responsibilities specified'}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.floor((new Date().getTime() - new Date(viewingMember.joinDate || new Date()).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {viewingMember.role === 'PRINCIPAL_INVESTIGATOR' ? 'Principal Investigator' : 
                       viewingMember.role === 'CO_INVESTIGATOR' ? 'Co-Investigator' : 
                       viewingMember.role === 'POSTDOC' ? 'Postdoc' : 'Team Member'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Role Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberManagement;
