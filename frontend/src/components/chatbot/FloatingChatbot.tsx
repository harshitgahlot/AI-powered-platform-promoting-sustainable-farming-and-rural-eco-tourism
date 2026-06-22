import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! I am RuralConnect Assistant. Ask me anything about farm tours, homestay reservations, or ordering organic foods!' }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What is RuralConnect AI?",
    "How do I book a homestay room?",
    "What categories are available?"
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { sender: 'user', text: textToSend } as Message];
    setMessages(updatedMessages);
    setMessage('');
    setLoading(true);

    try {
      // Build conversation history format for API
      const history = [];
      for (let i = 1; i < messages.length; i += 2) {
        if (messages[i] && messages[i + 1]) {
          history.push({
            message: messages[i].text,
            reply: messages[i + 1].text
          });
        }
      }

      const res = await aiService.chatbotQuery(textToSend, history);
      
      setMessages(prev => [...prev, { sender: 'bot', text: res.reply }]);
      setSuggestions(res.suggestions || []);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am facing an issue connecting. Please try again shortly!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(message);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl hover:bg-primary-500 hover:scale-105 active:scale-95 transition-all"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-85 sm:w-96 h-120 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-250">
          {/* Header */}
          <div className="px-5 py-4 bg-primary-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="text-sm font-bold">RuralConnect AI Help</h4>
                <p className="text-[10px] text-emerald-100">AI recommendation active</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions chips */}
          {suggestions.length > 0 && !loading && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-primary-500/20 bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage(message)}
              className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FloatingChatbot;
