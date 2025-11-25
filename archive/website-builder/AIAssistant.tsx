import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Zap } from 'lucide-react';
import { useSelectedElement } from '../../contexts/SelectedElementContext';
import { supabase } from '../../lib/supabase';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'ai', content: 'Hi! I\'m your AI Director. How can I help you improve your site today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { selectedElement } = useSelectedElement();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            console.log('🤖 Invoking ai-director function...');

            const { data, error } = await supabase.functions.invoke('ai-director', {
                body: {
                    messages: [
                        { role: 'system', content: 'You are an expert AI Website Director. Your goal is to help users build high-converting, beautiful sports organization websites. You have knowledge of design principles, copywriting, and user experience. Keep responses concise and actionable.' },
                        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
                        { role: 'user', content: userMsg.content }
                    ]
                }
            });

            console.log('📦 Response:', { data, error });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error(`Edge Function failed: ${error.message || JSON.stringify(error)}`);
            }

            if (!data) {
                throw new Error('No response from AI service');
            }

            if (data.error) {
                throw new Error(`API Error: ${data.error}`);
            }

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error('Invalid response structure:', data);
                throw new Error('Invalid response format from AI service');
            }

            const aiContent = data.choices[0].message.content;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiContent
            };
            setMessages(prev => [...prev, aiMsg]);
            console.log('✅ AI response received successfully');
        } catch (error: any) {
            console.error('❌ AI Director Error:', error);

            let errorMessage = '❌ **AI Director Error**\n\n';

            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
                errorMessage += '**Network Issue**: Unable to reach AI service.\n\n';
                errorMessage += '**Possible causes:**\n';
                errorMessage += '• Check your internet connection\n';
                errorMessage += '• VPN or firewall blocking the request\n';
            } else if (error.message?.includes('OPENAI_API_KEY')) {
                errorMessage += '**API Key Issue**: OpenAI API key not configured.\n\n';
                errorMessage += '**Solution:**\n';
                errorMessage += '• Run: `supabase secrets set OPENAI_API_KEY=your-key`\n';
            } else if (error.message?.includes('Edge Function')) {
                errorMessage += '**Deployment Issue**: Edge function not properly deployed.\n\n';
                errorMessage += '**Solution:**\n';
                errorMessage += '• Run: `supabase functions deploy ai-director`\n';
            } else {
                errorMessage += `**Error**: ${error.message || 'Unknown error'}\n\n`;
                errorMessage += '**Debug Info:**\n';
                errorMessage += `• Timestamp: ${new Date().toISOString()}\n`;
                errorMessage += `• Error Type: ${error.name || 'Unknown'}\n`;
            }

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: errorMessage
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        // Optional: auto-send
    };

    // Dynamic suggestions based on context
    const getSuggestions = () => {
        if (selectedElement?.elementType === 'text' || selectedElement?.elementType === 'heading') {
            return ['Fix grammar', 'Make it punchier', 'Rewrite for clarity'];
        }
        if (selectedElement?.elementType === 'image') {
            return ['Suggest a better image', 'Generate alt text'];
        }
        return ['Change color theme', 'Add a contact section', 'Optimize for SEO'];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    id="ai-assistant"
                    className="fixed bottom-28 right-8 w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[101]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-white">AI Director</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white/10 text-slate-200 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    <div className="p-2 border-t border-white/5 bg-white/5 overflow-x-auto flex gap-2 scrollbar-hide">
                        {getSuggestions().map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-300 whitespace-nowrap transition-colors flex items-center gap-1.5"
                            >
                                <Zap className="w-3 h-3 text-yellow-400" />
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-slate-900">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask AI to change something..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
