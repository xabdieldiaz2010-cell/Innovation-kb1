import { useState, useRef, useEffect } from 'react';
import { ChatMessage, CustomizerSelection } from '../types';
import { Sparkles, Send, Bot, User, Trash2, HelpCircle, Loader2, ArrowRight } from 'lucide-react';

interface AiDesignAssistantProps {
  currentSelection?: CustomizerSelection;
  onApplyAssistantDesign?: (stoneId: string, cabinetId: string) => void;
}

export default function AiDesignAssistant({ currentSelection, onApplyAssistantDesign }: AiDesignAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Greetings! I am **Caleb**, Lead Architectural Consultant for *Innovation Kitchen and Bath*. \n\nI can help you co-design your dream kitchen or bath, recommend stone slabs that match your style, explain IKB's precision Orlando fabrication capabilities, or help choose the perfect cabinetry hardware. \n\nWhat are you envisioning for your space today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Clean messages history for API payload
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch('/api/design-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          currentSelection: currentSelection || null
        })
      });

      if (!response.ok) {
        throw new Error('Our design network is currently experiencing heavy traffic.');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: data.text || "I apologize, I was temporarily unable to compile the design profile. Let me know if you would like me to review your selections again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check if Caleb's response recommends applying a specific layout
      // Simple parser: if Caleb recommends Calacatta Gold or Absolute Black, we can optionally parse and let them apply it!
      
    } catch (error: any) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: "I apologize, my systems are running offline. To connect with Caleb, please verify your **GEMINI_API_KEY** is added in **Settings > Secrets** in AI Studio and make sure the server is fully running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Greetings! Caleb here. Let's start fresh. What custom kitchen, luxury bath, or commercial stone layout can I design for you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { label: "Suggest hardware accents", text: "What hardware finishes and backsplash options do you suggest to pair with my current customizer selections?" },
    { label: "Compare Granite vs Quartz", text: "I am choosing a kitchen slab. Can you explain the pros and cons of Granite versus Quartz for heat resistance and scratching?" },
    { label: "Porcelain waterfall tips", text: "I love the idea of an Emerald Green Porcelain island with a waterfall edge. How does IKB fabricate and install porcelain slabs?" },
    { label: "Commercial bar suggestions", text: "I am planning a commercial restaurant bar counter in Orlando. Which natural stone or composite material is best for high-acid food prep areas?" }
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden" id="ai-assistant">
      {/* Header */}
      <div className="bg-neutral-950/80 border-b border-neutral-850 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-display font-medium text-sm text-white flex items-center gap-1.5">
              Caleb <span className="text-[9px] bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">Design AI</span>
            </h4>
            <span className="text-[10px] text-zinc-400 block font-mono">IKB Master Consultant</span>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="Clear Conversation"
          className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Board */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 bg-neutral-900/60 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
              msg.sender === 'user'
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
              msg.sender === 'user'
                ? 'bg-neutral-800 text-neutral-200 rounded-tr-none border border-neutral-750'
                : 'bg-neutral-950/40 text-neutral-300 rounded-tl-none border border-neutral-850'
            }`}>
              {/* Simple Markdown-Like parser for bolding and italics */}
              <div className="whitespace-pre-wrap select-text">
                {msg.text.split('\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {para.split('**').map((chunk, j) => {
                      if (j % 2 === 1) {
                        return <strong key={j} className="text-white font-semibold">{chunk}</strong>;
                      }
                      return chunk.split('*').map((subchunk, k) => {
                        if (k % 2 === 1) {
                          return <em key={k} className="text-amber-300 font-medium italic">{subchunk}</em>;
                        }
                        return subchunk;
                      });
                    })}
                  </p>
                ))}
              </div>
              <span className="text-[9px] text-zinc-500 block text-right mt-1.5 font-mono">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-neutral-950/40 border border-neutral-850 text-neutral-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
              <span>Caleb is formulating your design recommendations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts (only if fewer than 3 user messages have been sent to keep layout clean) */}
      {messages.filter(m => m.sender === 'user').length < 2 && (
        <div className="bg-neutral-950/40 border-t border-neutral-850 p-3 overflow-x-auto whitespace-nowrap flex gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="inline-flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 hover:border-neutral-600 border border-neutral-750 text-neutral-300 text-[10px] font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Tray */}
      <div className="bg-neutral-950 border-t border-neutral-850 p-3.5 flex gap-2">
        <input
          type="text"
          placeholder={currentSelection ? "Chat with Caleb about your active customizer designs..." : "Ask Caleb anything about stone countertops or cabinets..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          disabled={isLoading}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={isLoading || !input.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl p-2.5 transition-all shadow-md flex items-center justify-center disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
