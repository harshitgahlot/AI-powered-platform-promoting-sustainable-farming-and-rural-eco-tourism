import React, { useState, useEffect, useRef } from 'react';
import { aiService, type ChatSession } from '../services/aiService';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Bot, User, Send, Plus, Trash2, MessageSquare, Sparkles, ChevronRight, Menu, X } from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What is RuralConnect AI?",
    "How can I book an organic farm tour?",
    "How do farmers sell crops on the marketplace?",
    "What activities are available at eco-homestays?"
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const data = await aiService.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        selectSession(data[0].id);
      }
    } catch (err: any) {
      // If error (e.g. unauthenticated), user can still use stateless chat
    }
  };

  const selectSession = async (sessionId: number) => {
    setActiveSessionId(sessionId);
    setSidebarOpen(false);
    try {
      const sessionData = await aiService.getSession(sessionId);
      if (sessionData.messages && sessionData.messages.length > 0) {
        setMessages(sessionData.messages.map(m => ({
          sender: m.sender,
          text: m.content
        })));
        const lastMsg = sessionData.messages[sessionData.messages.length - 1];
        if (lastMsg.suggestions && Array.isArray(lastMsg.suggestions)) {
          setSuggestions(lastMsg.suggestions);
        }
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      addToast('Failed to load session history', 'error');
    }
  };

  const handleCreateSession = async () => {
    try {
      const newSession = await aiService.createSession('New Conversation');
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setSidebarOpen(false);
      addToast('Started new conversation', 'success');
    } catch (err: any) {
      addToast('Failed to create new session', 'error');
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiService.deleteSession(sessionId);
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          selectSession(updated[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
      addToast('Conversation deleted', 'info');
    } catch (err: any) {
      addToast('Failed to delete session', 'error');
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg = { sender: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.reduce<Array<{ message: string; reply: string }>>((acc, curr, idx, arr) => {
        if (curr.sender === 'user' && arr[idx + 1] && arr[idx + 1].sender === 'assistant') {
          acc.push({ message: curr.text, reply: arr[idx + 1].text });
        }
        return acc;
      }, []);

      const res = await aiService.chatbotQuery(textToSend, history, activeSessionId || undefined);
      setMessages(prev => [...prev, { sender: 'assistant', text: res.reply }]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
      if (res.session_id && !activeSessionId) {
        setActiveSessionId(res.session_id);
        loadSessions();
      }
    } catch (err: any) {
      addToast(err.message || 'Error communicating with AI Assistant', 'error');
      setMessages(prev => [...prev, { sender: 'assistant', text: 'I encountered an issue generating a response. Please try again shortly.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Conversation Sessions */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-primary-600 dark:text-primary-400">
            <Sparkles className="w-5 h-5" />
            <span>AI Sessions</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <Button
            variant="primary"
            className="w-full gap-2 text-xs py-2"
            onClick={handleCreateSession}
          >
            <Plus className="w-4 h-4" /> New Conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs font-medium transition-all ${activeSessionId === s.id ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-primary-500" />
                <span className="truncate">{s.title || `Conversation ${s.id}`}</span>
              </div>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {sessions.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-6">No previous conversations</p>
          )}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto w-full">
        {/* Header */}
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="p-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold">RuralConnect AI Assistant</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by Gemini AI • Sustainable Farming & Eco-Tourism Guide</p>
            </div>
          </div>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-12">
              <div className="p-4 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-3xl animate-bounce">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold">Welcome to RuralConnect AI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask me about organic farming techniques, booking homestays, crop recommendations, marketplace listings, or rural tourism experiences.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <Card className={`p-4 text-xs leading-relaxed max-w-[85%] ${msg.sender === 'user' ? 'bg-primary-600 text-white border-none rounded-2xl rounded-tr-none' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none shadow-sm'}`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {suggestions.length > 0 && !loading && (
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800/50">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-primary-500/20 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 hover:bg-primary-500 hover:text-white transition-all flex items-center gap-1"
              >
                <span>{sug}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question for RuralConnect AI..."
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button
              type="submit"
              variant="primary"
              className="px-5 rounded-2xl"
              isLoading={loading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AIAssistantPage;
