import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Project {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProject, setNewProject] = useState({ title: '', description: '', startDate: '', endDate: '' });
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const response = await axios.get('http://localhost:8080/api/projects');
        setProjects(response.data);
    };

    const handleCreate = async () => {
        const response = await axios.post('http://localhost:8080/api/projects', newProject);
        setProjects([...projects, response.data]);
        setNewProject({ title: '', description: '', startDate: '', endDate: '' });
    };

    const handleUpdate = async (id: number) => {
        const response = await axios.put(`http://localhost:8080/api/projects/${id}`, newProject);
        setProjects(projects.map(p => p.id === id ? response.data : p));
        setEditingId(null);
        setNewProject({ title: '', description: '', startDate: '', endDate: '' });
    };

    const handleDelete = async (id: number) => {
        await axios.delete(`http://localhost:8080/api/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
    };

    const startEdit = (project: Project) => {
        setNewProject(project);
        setEditingId(project.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-2xl font-bold mb-4">Research Projects</h1>

            {/* Form */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="p-2 border rounded"
                />
                <input
                    type="date"
                    value={newProject.startDate}
                    onChange={e => setNewProject({...newProject, startDate: e.target.value})}
                    className="p-2 border rounded"
                />
                <input
                    type="date"
                    value={newProject.endDate}
                    onChange={e => setNewProject({...newProject, endDate: e.target.value})}
                    className="p-2 border rounded"
                />
                <button
                    onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
                    className="bg-blue-500 text-white p-2 rounded col-span-1 md:col-span-2"
                >
                    {editingId ? 'Update' : 'Create'}
                </button>
            </div>

            {/* List */}
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                    <motion.li
                        key={project.id}
                        className="bg-white p-4 rounded shadow"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h2 className="font-bold">{project.title}</h2>
                        <p>{project.description}</p>
                        <p>Start: {project.startDate}</p>
                        <p>End: {project.endDate}</p>
                        <button onClick={() => startEdit(project)} className="text-blue-500 mr-2">Edit</button>
                        <button onClick={() => handleDelete(project.id)} className="text-red-500">Delete</button>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

export default ProjectList;