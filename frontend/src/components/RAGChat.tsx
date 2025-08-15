import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    sources?: SearchResult[];
}

interface SearchResult {
    content: string;
    fileName: string;
    relevance: number;
    context: string;
}

interface Project {
    id: number;
    title: string;
}

const RAGChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedProject, setSelectedProject] = useState<number | ''>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [projectInsights, setProjectInsights] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchProjectInsights = async (projectId: number) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/rag/insights/${projectId}`);
            setProjectInsights(response.data);
        } catch (error) {
            console.error('Error fetching project insights:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedProject) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await axios.post('http://localhost:8080/api/rag/search', null, {
                params: {
                    query: inputMessage,
                    projectId: selectedProject
                }
            });

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: response.data.answer,
                timestamp: new Date(),
                sources: response.data.sources
            };

            setMessages(prev => [...prev, aiMessage]);
            
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: 'I apologize, but I encountered an error processing your request. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleProjectChange = (projectId: number) => {
        setSelectedProject(projectId);
        setMessages([]);
        fetchProjectInsights(projectId);
    };

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Research Assistant</h1>
                    <p className="text-lg text-gray-600">Ask questions about your research documents</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Project Selection</h2>
                            <select
                                value={selectedProject}
                                onChange={(e) => handleProjectChange(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>

                            {projectInsights && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-md font-semibold text-gray-700">Project Insights</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Documents:</span> {projectInsights.totalDocuments}</p>
                                        <div>
                                            <p className="font-medium">Document Types:</p>
                                            {Object.entries(projectInsights.documentTypes || {}).map(([type, count]) => (
                                                <React.Fragment key={type}>
                                                    <p className="ml-2 text-gray-600">
                                                        {type}: {count as number}
                                                    </p>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
                            {/* Chat Header */}
                            <div className="border-b px-6 py-4">
                                <h2 className="text-lg font-semibold">AI Assistant</h2>
                                {selectedProject && (
                                    <p className="text-sm text-gray-600">
                                        Chatting with documents from: {projects.find(p => p.id === selectedProject)?.title}
                                    </p>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <div className="text-6xl mb-4">🤖</div>
                                        <p className="text-lg">Ask me anything about your research documents!</p>
                                        <p className="text-sm mt-2">Select a project to get started</p>
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-3xl ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-2xl px-4 py-3`}>
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {formatTimestamp(message.timestamp)}
                                                </p>
                                                
                                                {message.sources && message.sources.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <p className="text-xs font-semibold mb-2">Sources:</p>
                                                        {message.sources.map((source, index) => (
                                                            <div key={index} className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 inline-block mr-2 mb-1">
                                                                {source.fileName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t px-6 py-4">
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={selectedProject ? "Ask about your research..." : "Select a project first..."}
                                        disabled={!selectedProject || isLoading}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || !selectedProject || isLoading}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RAGChat;
