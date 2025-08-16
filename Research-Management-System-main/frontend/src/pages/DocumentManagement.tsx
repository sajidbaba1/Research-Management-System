import React, { useState, useEffect } from 'react';
import { Search, Upload, Plus, Download, Eye, Trash2, Edit, FileText, ExternalLink, Calendar, User, Tag } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  lastModified: string;
  version: number;
  projectId: number;
  uploadedBy: string;
  status?: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';
  description?: string;
}

const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', 'Uploaded document for RAG processing');
    formData.append('uploadedBy', 'current-user');

    try {
      // Upload document
      const uploadResponse = await fetch('http://localhost:8080/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadedDoc = await uploadResponse.json();
      
      // Process document for RAG
      await processForRAG(uploadedDoc);
      
      setUploadStatus('success');
      fetchDocuments();
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    }
  };

  const processForRAG = async (document: any) => {
    try {
      // Send document to RAG processing
      const ragResponse = await fetch('http://localhost:8080/api/rag/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          fileName: document.name,
          filePath: document.filePath,
          fileType: document.type
        }),
      });

      if (ragResponse.ok) {
        console.log('Document processed for RAG successfully');
      }
    } catch (error) {
      console.error('Error processing document for RAG:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    ((doc.name || (doc as any).fileName || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedFilter === 'all' || ((doc.type || (doc as any).fileType) === selectedFilter))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage and organize all research documents</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="PPTX">PPTX</option>
              <option value="TXT">TXT</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{doc.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type} • {formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    doc.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    doc.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                
                {doc.description && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                )}
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {doc.uploadedBy}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {doc.uploadDate}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Document</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {uploadFile && (
                  <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  </div>
                )}

                {uploadStatus === 'uploading' && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Uploading and processing for RAG...
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Upload failed. Please try again.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadStatus('idle');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => uploadFile && handleFileUpload(uploadFile)}
                  disabled={!uploadFile || uploadStatus === 'uploading'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;
