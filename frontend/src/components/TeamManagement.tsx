import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface TeamMember {
    id?: number;
    name: string;
    email: string;
    role: string;
    expertise: string;
    department: string;
    projectId: number;
}

interface ResearchProject {
    id: number;
    title: string;
}

const TeamManagement: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [projects, setProjects] = useState<ResearchProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<number | string>('');
    const [newMember, setNewMember] = useState<TeamMember>({
        name: '',
        email: '',
        role: '',
        expertise: '',
        department: '',
        projectId: 0
    });

    useEffect(() => {
        fetchTeamMembers();
        fetchProjects();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/team-members');
            setTeamMembers(response.data);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/team-members', newMember);
            setNewMember({
                name: '',
                email: '',
                role: '',
                expertise: '',
                department: '',
                projectId: 0
            });
            fetchTeamMembers();
        } catch (error) {
            console.error('Error creating team member:', error);
        }
    };

    const handleDelete = async (id?: number) => {
        if (id === undefined) {
            console.error('No team member ID provided for deletion');
            return;
        }
        try {
            await axios.delete(`http://localhost:8080/api/team-members/${id}`);
            fetchTeamMembers();
        } catch (error) {
            console.error('Error deleting team member:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Team Management</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                value={newMember.name}
                                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select
                                value={newMember.role}
                                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Principal Investigator">Principal Investigator</option>
                                <option value="Co-Investigator">Co-Investigator</option>
                                <option value="Research Assistant">Research Assistant</option>
                                <option value="Data Analyst">Data Analyst</option>
                                <option value="Project Manager">Project Manager</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Expertise</label>
                            <input
                                type="text"
                                value={newMember.expertise}
                                onChange={(e) => setNewMember({...newMember, expertise: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Department</label>
                            <input
                                type="text"
                                value={newMember.department}
                                onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Project</label>
                            <select
                                value={newMember.projectId}
                                onChange={(e) => setNewMember({...newMember, projectId: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Select Project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                        >
                            Add Team Member
                        </button>
                    </form>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamMembers.map(member => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
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
            </div>
        </div>
    );
};

export default TeamManagement;
