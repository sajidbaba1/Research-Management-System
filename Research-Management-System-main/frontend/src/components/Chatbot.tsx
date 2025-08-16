import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Loader2, Bot, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'project' | 'document' | 'member';
  data?: any;
}

interface SearchResult {
  id: string;
  type: 'project' | 'document' | 'member';
  title: string;
  description: string;
  content: string;
  metadata: any;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Database access functions
  const searchDatabase = async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`http://localhost:8080/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  };

  const getProjectDetails = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/projects/${projectId}`);
      return await response.json();
    } catch (error) {
      console.error('Project fetch error:', error);
      return null;
    }
  };

  const getTeamMemberDetails = async (memberId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/team-members/${memberId}`);
      return await response.json();
    } catch (error) {
      console.error('Member fetch error:', error);
      return null;
    }
  };

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Search database for relevant information
      const searchResults = await searchDatabase(messageText);
      
      // Prepare context for AI
      const context = {
        query: messageText,
        searchResults,
        timestamp: new Date().toISOString()
      };

      // Send to backend for AI processing
      const response = await fetch('http://localhost:8080/api/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: Date.now().toString() + '_bot',
        text: data.answer || 'I found some information for you:',
        sender: 'bot',
        timestamp: new Date(),
        type: data.type || 'text',
        data: data.results || searchResults
      };

      setMessages(prev => [...prev, botMessage]);

      // If we have search results, add them as separate messages
      if (searchResults.length > 0) {
        searchResults.forEach((result: SearchResult, index: number) => {
          const resultMessage: Message = {
            id: Date.now().toString() + '_result_' + index,
            text: `${result.type}: ${result.title}`,
            sender: 'bot',
            timestamp: new Date(),
            type: result.type,
            data: result
          };
          setMessages(prev => [...prev, resultMessage]);
        });
      }

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        text: 'I apologize, but I encountered an error while searching. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleQuickAction = (action: string) => {
    const quickQueries = {
      'show projects': 'show all projects',
      'team members': 'list all team members',
      'recent documents': 'show recent documents',
      'project status': 'what is the status of all projects',
      'analytics': 'show project analytics',
    };

    const query = quickQueries[action as keyof typeof quickQueries] || action;
    setInputText(query);
    handleSendMessage(query);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    'show projects',
    'team members',
    'recent documents',
    'project status',
    'analytics',
  ];

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                AI Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <MicOff className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about projects, documents, or team members..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
