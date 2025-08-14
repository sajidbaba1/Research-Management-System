import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ProjectDocument {
    id: number;
    fileName: string;
    fileType: string;
    filePath: string;
    description: string;
    uploadDate: string;
    uploadedBy: string;
    projectId: number;
}

interface ResearchProject {
    id: number;
    title: string;
}

const DocumentManagement: React.FC = () => {
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [projects, setProjects] = useState<ResearchProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<number>('');
    const [newDocument, setNewDocument] = useState<ProjectDocument>({
        fileName: '',
        fileType: '',
        filePath: '',
        description: '',
        uploadDate: '',
        uploadedBy: '',
        projectId: 0
    });

    useEffect(() => {
        fetchDocuments();
        fetchProjects();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/documents');
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
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
            await axios.post('http://localhost:8080/api/documents', newDocument);
            setNewDocument({
                fileName: '',
                fileType: '',
                filePath: '',
                description: '',
                uploadDate: '',
                uploadedBy: '',
                projectId: 0
            });
            fetchDocuments();
        } catch (error) {
            console.error('Error creating document:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/documents/${id}`);
            fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return '📄';
            case 'docx':
            case 'doc':
                return '📝';
            case 'xlsx':
            case 'xls':
                return '📊';
            case 'pptx':
            case 'ppt':
                return '📊';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return '🖼️';
            default:
                return '📁';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Document Management</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">File Name</label>
                            <input
                                type="text"
                                value={newDocument.fileName}
                                onChange={(e) => setNewDocument({...newDocument, fileName: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">File Type</label>
                            <select
                                value={newDocument.fileType}
                                onChange={(e) => setNewDocument({...newDocument, fileType: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="pdf">PDF</option>
                                <option value="docx">Word Document</option>
                                <option value="xlsx">Excel Spreadsheet</option>
                                <option value="pptx">PowerPoint</option>
                                <option value="jpg">Image</option>
                                <option value="png">Image</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">File Path</label>
                            <input
                                type="text"
                                value={newDocument.filePath}
                                onChange={(e) => setNewDocument({...newDocument, filePath: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="/uploads/filename.pdf"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={newDocument.description}
                                onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                rows={3}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Uploaded By</label>
                            <input
                                type="text"
                                value={newDocument.uploadedBy}
                                onChange={(e) => setNewDocument({...newDocument, uploadedBy: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Project</label>
                            <select
                                value={newDocument.projectId}
                                onChange={(e) => setNewDocument({...newDocument, projectId: parseInt(e.target.value)})}
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
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                        >
                            Upload Document
                        </button>
                    </form>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Project Documents</h2>
                    <div className="space-y-4">
                        {documents.map(document => (
                            <div key={document.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getFileIcon(document.fileType)}</span>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{document.fileName}</h3>
                                            <p className="text-sm text-gray-500">{document.fileType} • {document.uploadedBy}</p>
                                            <p className="text-sm text-gray-500">{new Date(document.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleDelete(document.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{document.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentManagement;
