import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface ChatMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    sources?: any;
    citations?: Citation[];
    streaming?: boolean;
}

interface SearchResult {
    content: string;
    fileName: string;
    relevance: number;
    context: string;
}

interface Citation {
    index: number;
    fileName: string;
    snippet: string;
    page?: any;
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
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | ''>('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [openCite, setOpenCite] = useState<Record<string, number | null>>({});
    const speakingRef = useRef<SpeechSynthesisUtterance | null>(null);

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

    const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
        setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
    }, []);

    const speak = (text: string) => {
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            speakingRef.current = u;
            window.speechSynthesis.speak(u);
        } catch {}
    };

    const stopSpeak = () => {
        try { window.speechSynthesis.cancel(); speakingRef.current = null; } catch {}
    };

    const exportMarkdown = (msg: ChatMessage) => {
        const parts: string[] = [];
        parts.push(msg.content || '');
        if (msg.citations && msg.citations.length > 0) {
            parts.push('\n\n## Sources');
            msg.citations.forEach(c => {
                const pageTxt = c.page != null ? ` (p. ${c.page})` : '';
                parts.push(`- [${c.index}] ${c.fileName}${pageTxt}`);
            });
        }
        const blob = new Blob([parts.join('\n')], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `answer-${msg.id}.md`;
        a.click();
        URL.revokeObjectURL(url);
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

        // Prepare placeholder AI message for streaming
        const aiId = (Date.now() + 1).toString();
        const aiMessage: ChatMessage = { id: aiId, type: 'ai', content: '', timestamp: new Date(), streaming: true };
        setMessages(prev => [...prev, aiMessage]);

        const streamUrl = `http://localhost:8080/api/rag/stream?query=${encodeURIComponent(userMessage.content)}&projectId=${selectedProject}${selectedDocumentId ? `&documentId=${selectedDocumentId}` : ''}`;

        let usedStream = false;
        try {
            const es = new EventSource(streamUrl);
            usedStream = true;
            const append = (delta: string) => {
                setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: (m.content || '') + delta } : m));
            };
            es.onmessage = (evt) => {
                if (evt?.data) {
                    append(evt.data);
                }
            };
            es.addEventListener('done', (evt: MessageEvent) => {
                try {
                    const data = JSON.parse(evt.data);
                    updateMessage(aiId, {
                        content: data.answer || '',
                        sources: data.sources || [],
                        citations: data.citations || [],
                        streaming: false
                    });
                } catch {
                    updateMessage(aiId, { streaming: false });
                }
                setIsLoading(false);
                setIsTyping(false);
                es.close();
            });
            es.onerror = () => {
                es.close();
                // Fallback to non-streaming
                void (async () => {
                    try {
                        const response = await axios.post('http://localhost:8080/api/rag/search', null, {
                            params: {
                                query: userMessage.content,
                                projectId: selectedProject,
                                documentId: selectedDocumentId || undefined
                            }
                        });
                        updateMessage(aiId, {
                            content: response.data.answer,
                            sources: response.data.sources,
                            citations: response.data.citations,
                            streaming: false
                        });
                    } catch {
                        updateMessage(aiId, {
                            content: 'I apologize, but I encountered an error processing your request. Please try again.',
                            streaming: false
                        });
                    } finally {
                        setIsLoading(false);
                        setIsTyping(false);
                    }
                })();
            };
        } catch {
            // If EventSource fails immediately, fallback
        }
    };

    const handleProjectChange = (projectId: number) => {
        setSelectedProject(projectId);
        setMessages([]);
        fetchProjectInsights(projectId);
        setSelectedDocumentId('');
    };

    // Initialize Web Speech API lazily
    const initRecognition = () => {
        if (recognitionRef.current) return recognitionRef.current;
        const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Try Chrome.');
            return null;
        }
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += transcript;
                else interim += transcript;
            }
            setInputMessage(prev => final ? final : (interim || prev));
        };
        rec.onend = () => {
            setIsRecording(false);
        };
        recognitionRef.current = rec;
        return rec;
    };

    const toggleRecording = () => {
        const rec = initRecognition();
        if (!rec) return;
        if (isRecording) {
            rec.stop();
            setIsRecording(false);
        } else {
            try {
                rec.start();
                setIsRecording(true);
            } catch (e) {
                // start can throw if already started
                console.warn('Speech start warning:', e);
            }
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Ctrl+K focus input
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input[type="text"]');
                if (inputs && inputs[inputs.length - 1]) (inputs[inputs.length - 1] as HTMLInputElement).focus();
            }
            // Esc to stop mic
            if (e.key === 'Escape' && isRecording) {
                toggleRecording();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isRecording]);

    const handleIndexDocument = async () => {
        if (!selectedProject || !selectedDocumentId) return;
        try {
            const res = await axios.post('http://localhost:8080/api/rag/index-document', null, {
                params: { documentId: selectedDocumentId }
            });
            // Refresh insights to reflect processed status
            await fetchProjectInsights(selectedProject as number);
            if (res.data && res.data.success) {
                alert('Document indexed successfully.');
            } else {
                const msg = res.data?.message || res.data?.error || 'Unknown error';
                alert(`Failed to index document: ${msg}`);
            }
        } catch (err) {
            console.error('Indexing failed', err);
            // Try to surface backend error message if available
            const anyErr: any = err as any;
            const serverMsg = anyErr?.response?.data?.message || anyErr?.response?.data?.error;
            alert(`Failed to index document: ${serverMsg || 'Network/server error'}`);
        }
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
                                        <p><span className="font-medium">Documents:</span> {projectInsights.totalDocuments ?? projectInsights.documentCount ?? 0}</p>
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
                                        {/* Document selection for indexing */}
                                        <div className="mt-4">
                                            <p className="font-medium mb-2">Select document to index</p>
                                            <select
                                                value={selectedDocumentId}
                                                onChange={(e) => setSelectedDocumentId(Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select a document</option>
                                                {(projectInsights.documents || []).map((d: any) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.fileName || d.name || `Document ${d.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleIndexDocument}
                                                disabled={!selectedDocumentId}
                                                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                                            >
                                                Index Document
                                            </button>
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
                                            <div className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-900 border border-gray-200'}`}>
                                                {message.type === 'user' ? (
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                ) : (
                                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                        <ReactMarkdown
                                                            components={{
                                                                a: ({node, ...props}) => (
                                                                    <a {...props} target="_blank" rel="noopener noreferrer">{props.children}</a>
                                                                )
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                                <p className="text-xs opacity-70 mt-2">
                                                    {formatTimestamp(message.timestamp)}
                                                </p>

                                                {(message.citations && message.citations.length > 0) && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <p className="text-xs font-semibold mb-2">Citations:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {message.citations!.map((c) => (
                                                                <button
                                                                    key={c.index}
                                                                    onClick={() => setOpenCite(prev => ({...prev, [message.id]: prev[message.id] === c.index ? null : c.index}))}
                                                                    className={`text-xs rounded px-2 py-1 border ${openCite[message.id] === c.index ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-800 border-blue-200'}`}
                                                                    title={`${c.fileName}${c.page != null ? ` (p. ${c.page})` : ''}`}
                                                                >
                                                                    [{c.index}]
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {openCite[message.id] && (
                                                            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
                                                                {(() => {
                                                                    const c = message.citations!.find(x => x.index === openCite[message.id]);
                                                                    if (!c) return null;
                                                                    return (
                                                                        <div>
                                                                            <p className="text-xs font-semibold mb-1">{c.fileName}{c.page != null ? ` (p. ${c.page})` : ''}</p>
                                                                            <p className="text-xs whitespace-pre-wrap">{c.snippet}</p>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {message.sources && message.sources.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold mb-2">Sources:</p>
                                                        {(message.sources as any[]).map((s, idx) => {
                                                            const name = typeof s === 'string' ? s : (s && s.fileName) ? s.fileName : String(s);
                                                            return (
                                                                <span key={idx} className="text-xs bg-gray-100 text-gray-800 rounded px-2 py-1 inline-block mr-2 mb-1">{name}</span>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {message.type === 'ai' && (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <button onClick={() => speak(message.content)} className="text-xs px-2 py-1 border rounded bg-white">Listen</button>
                                                        <button onClick={stopSpeak} className="text-xs px-2 py-1 border rounded bg-white">Stop</button>
                                                        <button onClick={() => exportMarkdown(message)} className="text-xs px-2 py-1 border rounded bg-white">Export</button>
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
                                        type="button"
                                        onClick={toggleRecording}
                                        disabled={!selectedProject}
                                        title={isRecording ? 'Stop recording' : 'Start voice input'}
                                        className={`px-3 py-2 rounded-lg border ${isRecording ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                                    >
                                        {isRecording ? '● Rec' : '🎤'}
                                    </button>
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
