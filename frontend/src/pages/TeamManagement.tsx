import React, { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';

type TeamRole = 'RESEARCHER' | 'PROFESSOR' | 'STUDENT' | 'ADMIN' | 'PROJECT_MANAGER';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  department: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
}

const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchTeamMembers();
      } catch (err) {
        setError('Failed to load team members. Please try again later.');
        console.error('Error in useEffect:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [newMember, setNewMember] = useState<Omit<TeamMember, 'id' | 'joinDate' | 'status'>>({ 
    name: '',
    email: '',
    phone: '',
    role: 'RESEARCHER',
    department: ''
  });

  const fetchTeamMembers = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8080/api/team-members');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch team members');
      }
      const data = await response.json();
      setTeamMembers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError(error instanceof Error ? error.message : 'Failed to load team members');
      setTeamMembers([]);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingMember 
        ? `http://localhost:8080/api/team-members/${editingMember.id}`
        : 'http://localhost:8080/api/team-members';
      
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || (editingMember ? 'Failed to update member' : 'Failed to add member'));
      }

      setShowModal(false);
      setNewMember({ 
        name: '',
        email: '',
        phone: '',
        role: 'RESEARCHER',
        department: ''
      });
      setEditingMember(null);
      setError(null);
      await fetchTeamMembers();
      alert(`Team member ${editingMember ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving team member:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/team-members/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }

      fetchTeamMembers();
      alert('Team member deleted successfully!');
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete team member'}`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'INACTIVE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'ON_LEAVE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchTeamMembers}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 transition duration-150 ease-in-out"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your research team members
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Team Member
        </button>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamMembers?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <User className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamMembers?.filter(m => m.status === 'ACTIVE').length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Managers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamMembers?.filter(m => m.role === 'PROJECT_MANAGER').length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Researchers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamMembers?.filter(m => m.role === 'RESEARCHER').length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Team Members Grid */}
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Team Members
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {teamMembers?.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {member.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {member.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => handleEdit(member)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={newMember.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={newMember.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={newMember.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={newMember.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="RESEARCHER">Researcher</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="PROFESSOR">Professor</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={newMember.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-500">* Required fields</p>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMember(null);
                    setNewMember({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'RESEARCHER',
                      department: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} transition-colors`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingMember ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>{editingMember ? 'Update' : 'Add'} Team Member</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};

export default TeamManagement;
