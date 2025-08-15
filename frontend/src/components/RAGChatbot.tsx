import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ragApi } from '../services/api';
import { 
  Bot, Send, MessageCircle, User, RefreshCw, X, 
  Minimize2, Maximize2, FileText, Lightbulb, HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: string[] | null;
}

interface RAGChatbotProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const RAGChatbot: React.FC<RAGChatbotProps> = ({ 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: Date.now().toString(),
      message: "Hello! I'm your research assistant. I can help you with questions about your projects, documents, and research data. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => ragApi.sendMessage(message, token!),
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (response) => {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        message: response.response,
        sender: 'bot',
        timestamp: new Date(),
        sources: [],
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        sources: null,
      };
      setMessages(prev => [...prev, errorMessage]);
    },
    onSettled: () => {
      setIsTyping(false);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      sources: null,
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        message: "Chat cleared! How can I help you with your research today?",
        sender: 'bot',
        timestamp: new Date(),
        sources: null,
      }
    ]);
  };

  const suggestedQuestions = [
    "What projects are currently active?",
    "Show me recent documents",
    "What are the high-priority risks?",
    "Give me a project status summary"
  ];

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={onToggleMinimize}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors"
        >
          <Bot className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Research Assistant</h3>
            <p className="text-xs opacity-90">Powered by RAG</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearChat}
            className="p-1 hover:bg-blue-500 rounded transition-colors"
            title="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-blue-500 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-xs font-medium mb-1 opacity-70">Sources:</p>
                    <div className="space-y-1">
                      {message.sources.slice(0, 3).map((source, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs opacity-80">
                          <FileText className="w-3 h-3" />
                          <span className="truncate">{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Try asking:
          </p>
          <div className="space-y-1">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="w-full text-left text-xs p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about your research..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RAGChatbot;
