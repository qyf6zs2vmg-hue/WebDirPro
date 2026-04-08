import React from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { useItems } from '@/services/firebaseService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  itemId?: string;
}

export const AIChatAssistant = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я ваш ИИ-помощник. Чем могу помочь в поиске ресурсов?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { items } = useItems();
  const chatRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
      if (!apiKey) {
        throw new Error('MISTRAL_API_KEY is not configured');
      }

      // Prepare items context - sorted by rating and limited to top 50 to save tokens
      const sortedItems = [...items].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      const itemsContext = sortedItems.slice(0, 50).map(item => 
        `- ${item.title} (ID: ${item.id}): ${item.shortDescription}. Rating: ${item.averageRating.toFixed(1)}/5`
      ).join('\n');

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-small',
          messages: [
            {
              role: 'system',
              content: `You are a recommendation assistant for a resource catalog. 
Only suggest items from the existing dataset provided below. 
Prioritize items with higher ratings.
If you recommend a specific item, ALWAYS include its ID at the end of your message in the format [ITEM:id].
Example: "I recommend Google. [ITEM:123]"
Be short and clear. Respond in the same language as the user.
Dataset:
${itemsContext}`
            },
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      // Extract item ID if present
      const idMatch = assistantMessage.match(/\[ITEM:([^\]]+)\]/);
      const itemId = idMatch ? idMatch[1] : undefined;
      const cleanMessage = assistantMessage.replace(/\[ITEM:[^\]]+\]/, '').trim();

      setMessages(prev => [...prev, { role: 'assistant', content: cleanMessage, itemId }]);
    } catch (error) {
      console.error('Mistral error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Извините, произошла ошибка при обращении к ИИ. Пожалуйста, проверьте API ключ.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all z-[60] group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[60]"
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ИИ Помощник</h3>
                  <p className="text-[10px] text-blue-100">Mistral AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={chatRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "max-w-[85%] flex flex-col gap-2",
                    msg.role === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-input text-foreground rounded-tl-none border border-border"
                  )}>
                    {msg.content}
                  </div>
                  {msg.itemId && (
                    <button
                      onClick={() => {
                        navigate(`/item/${msg.itemId}`);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-900/30"
                    >
                      <ExternalLink size={14} />
                      {t('common.go')}
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="bg-input text-foreground mr-auto rounded-2xl rounded-tl-none border border-border p-3 max-w-[85%] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-xs">Думаю...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Задайте вопрос..."
                  className="w-full pl-4 pr-12 py-3 bg-input border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-foreground"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
