import React, { useState, useRef, DragEvent } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

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
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [newDocument, setNewDocument] = useState({
    fileName: '',
    fileType: '',
    filePath: '',
    description: '',
    uploadedBy: '',
    projectId: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDropRef = useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      alert('Please select valid file types (PDF, DOC, DOCX, TXT, JPG, PNG)');
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    for (const file of validFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('description', `Uploaded file: ${file.name}`);
    formData.append('uploadedBy', 'Current User');
    formData.append('projectId', selectedProject.toString());

    try {
      const response = await axios.post('http://localhost:8080/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setUploadProgress(percentCompleted);
        }
      });

      setDocuments(prev => [...prev, response.data]);
      setUploadProgress(0);
      setUploadedFiles(prev => prev.filter(f => f.name !== file.name));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleCreateDocument = async () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/documents', {
        ...newDocument,
        projectId: selectedProject
      });
      setDocuments(prev => [...prev, response.data]);
      setNewDocument({
        fileName: '',
        fileType: '',
        filePath: '',
        description: '',
        uploadedBy: '',
        projectId: 0
      });
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Document Management</h1>
        
        {/* Drag and Drop Upload Zone */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="mb-8"
        >
          <div
            ref={dragDropRef}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    ref={fileInputRef}
                  />
                </label>
                <span className="pl-1">or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <div className="bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
            </motion.div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Uploading files:</h3>
              <ul className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Document Creation Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-gray-50 p-6 rounded-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Document</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Uploaded By</label>
              <input
                type="text"
                value={newDocument.uploadedBy}
                onChange={(e) => setNewDocument({...newDocument, uploadedBy: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newDocument.description}
                onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Document description"
              />
            </div>
          </div>
          <button
            onClick={handleCreateDocument}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Document
          </button>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(document => (
              <motion.div
                key={document.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{document.fileName}</h3>
                    <p className="text-sm text-gray-600">{document.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {document.fileType} | Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">By: {document.uploadedBy}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DocumentManagement;
