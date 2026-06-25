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
      console.warn("Express design assistant endpoint unreachable. Formulating expert advice offline.", error);
      const offlineText = generateSmartDesignAdvice(textToSend, currentSelection);
      const assistantMessage: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: offlineText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

function generateSmartDesignAdvice(message: string, currentSelection: CustomizerSelection | undefined): string {
  const stoneName: Record<string, string> = {
    'calacatta-gold': 'Calacatta Gold Quartz',
    'absolute-black': 'Absolute Black Granite',
    'blue-bahia': 'Blue Bahia Quartzite',
    'emerald-green-porcelain': 'Emerald Green Porcelain',
    'colonial-white': 'Colonial White Granite',
    'statuario-porcelain': 'Statuario White Porcelain',
    'empire-gray': 'Empire Gray Quartz'
  };
  const selectedStone = currentSelection ? (stoneName[currentSelection.stoneId] || 'our custom slabs') : 'our custom slabs';

  const cabinetName: Record<string, string> = {
    'chantilly-white': 'Chantilly Lace White',
    'charcoal-gray': 'Charcoal Slate Gray',
    'midnight-navy': 'Midnight Navy Blue',
    'warm-oak': 'Warm Oak Woodgrain'
  };
  const selectedCabinet = currentSelection ? (cabinetName[currentSelection.cabinetId] || 'our premium cabinetry') : 'our premium cabinetry';

  const backsplashName: Record<string, string> = {
    'subway': 'Classic Subway Tile Backsplash',
    'full-slab': 'Sleek Full-Slab Matching Backsplash',
    'mosaic': 'Exquisite Mosaic Tile Backsplash',
    'none': 'Minimal/No Backsplash'
  };
  const selectedBacksplash = currentSelection ? (backsplashName[currentSelection.backsplash] || 'custom backsplash') : 'custom backsplash';

  const edgeName: Record<string, string> = {
    'eased': 'Eased / Flat Edge',
    'bevel': 'Beveled Edge',
    'bullnose': 'Full Bullnose Edge',
    'ogee': 'Classic Ogee Edge'
  };
  const selectedEdge = currentSelection ? (edgeName[currentSelection.edgeId] || 'custom edge profile') : 'custom edge profile';

  const sinkName: Record<string, string> = {
    'undermount': 'Modern Undermount Sink',
    'farmhouse': 'Elegant Farmhouse Sink',
    'apron-front': 'Apron-Front Design Sink',
    'none': 'No Sink / Custom Selection'
  };
  const selectedSink = currentSelection ? (sinkName[currentSelection.sinkType] || 'sink layout') : 'sink layout';

  const msgLower = (message || '').toLowerCase();

  let adviceIntro = "";
  let designAnalysis = "";
  let hardwareTips = "";

  if (currentSelection) {
    adviceIntro = `Greetings! I am Caleb, lead design consultant for Innovation Kitchen and Bath. I would be absolutely thrilled to help you analyze your project. 
    
 I see you're evaluating a gorgeous combination in our design customizer: **${selectedStone}** countertops paired with **${selectedCabinet}** cabinets, complete with a **${selectedBacksplash}** and finished with a **${selectedEdge}** profile hosting a **${selectedSink}**!`;

    if (currentSelection.stoneId === 'calacatta-gold' && currentSelection.cabinetId === 'midnight-navy') {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: This is one of IKB's signature high-end combinations! The deep, regal undertones of the *Midnight Navy* cabinets provide an incredible anchor that draws out the subtle golden-warm veins of the *Calacatta Gold Quartz*.
- **Backsplash Selection**: Your choice of a **${selectedBacksplash}** is excellent. It creates a continuous marble-esque flow that visually expands the kitchen height and creates a grand focal point.
- **Edge Architecture**: The **${selectedEdge}** profile adds a beautifully tailored outline to your countertops, contributing to that bespoke, high-luxury aesthetic.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: We highly recommend brushed brass or satin gold handles and plumbing fixtures to directly mirror the golden veining of the Calacatta Quartz.
- **Lighting Temperature**: Use 3000K warm-white LED under-cabinet tape lights to highlight the countertops without washing out the deep blue cabinetry.`;
    } else if (currentSelection.stoneId === 'absolute-black' && currentSelection.cabinetId === 'chantilly-white') {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: A true high-contrast luxury classic! The stark *Chantilly Lace White* cabinets bring unparalleled brightness and clean elegance, while the *Absolute Black Granite* brings deep, rich basaltic structure that grounds the space.
- **Durability**: Absolute Black Granite is practically indestructible and highly resistant to stains and heat.
- **Backsplash Selection**: Pairing this with a **${selectedBacksplash}** offers beautiful texture to prevent the black-and-white theme from feeling sterile.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: Matte black handles create a sleek modern vibe, while polished chrome provides an incredibly crisp, jewelry-like sparkle.
- **Lighting Temperature**: Go with 3500K neutral white recessed cans to preserve the bright white cabinetry.`;
    } else if (currentSelection.stoneId === 'blue-bahia' || currentSelection.stoneId === 'emerald-green-porcelain') {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: You have a spectacular eye for exotic luxury. Pairing **${selectedStone}** with **${selectedCabinet}** creates a custom, conversation-starting masterpiece.
- **Architectural Depth**: These rare jewel-toned slabs deserve to be the centerpiece. Keeping the surrounding cabinets clean like *${selectedCabinet}* allows the dramatic stone patterns to be the main focal point.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: Choose minimal, understated satin nickel or brushed stainless steel fixtures to avoid competing with the rich colors of the stone.
- **Lighting Temperature**: Dimmable pendant lights over the island are crucial to accentuating the natural crystalline structures in the quartzite or the gold veins of the porcelain.`;
    } else {
      designAnalysis = `### 🌟 Caleb's Designer Masterpiece Evaluation
- **Visual Chemistry**: This combination of **${selectedStone}** and **${selectedCabinet}** is highly sophisticated. It strikes a beautiful balance between warmth, luxury, and daily utility.
- **Edge & Sink Harmony**: The **${selectedEdge}** with a **${selectedSink}** provides clean lines and high-end functional longevity. It ensures ease of cleaning while maintaining IKB's signature high standards.`;
      hardwareTips = `### 💡 Hardware & Lighting Guidance
- **Hardware Accents**: Satin bronze or soft gold hardware works wonders to warm up gray tones, whereas matte black adds an industrial edge.
- **Lighting Temperature**: We recommend adjustable directional spotlights to showcase the exact texture and polish of your countertop edge.`;
    }
  } else {
    adviceIntro = `Greetings! I am Caleb, lead design consultant for Innovation Kitchen and Bath. I would be absolutely thrilled to assist you with your remodeling vision today.`;
    designAnalysis = `### 🌟 Caleb's Design Consultation Recommendations
- **Our Process**: At IKB, we believe every kitchen, bathroom, and commercial space is unique. Since 2011, we've fabricated and installed thousands of premium countertop slabs and custom cabinets throughout Central Florida.
- **Material Choices**: We invite you to explore our dynamic design customizer! We feature premium Quartz (like Calacatta Gold), indestructible natural Granite (like Absolute Black), rare Quartzite (like Blue Bahia), and state-of-the-art Spanish Porcelain.
- **Custom Cabinetry**: Complete your space with our premium cabinet finishes including Chantilly Lace White, Charcoal Slate Gray, Midnight Navy Blue, or Warm Oak Woodgrain.`;
    hardwareTips = `### 💡 Materials Selection Tips
- **High Traffic Spaces**: If you cook frequently, our Quartz and high-tech Porcelain provide non-porous, maintenance-free surfaces.
- **Natural Stone Enthusiasts**: For raw organic depth, natural Granite or exotic Quartzite offers unique, one-of-a-kind slab patterns.`;
  }

  let keywordResponse = "";
  if (msgLower.includes("cost") || msgLower.includes("price") || msgLower.includes("budget") || msgLower.includes("expensive")) {
    keywordResponse = `\n### 📊 Budget & Pricing Insights
- **Pricing Tiers**: *${selectedStone}* is in our **Luxury/Premium** tier due to its elite aesthetics and high-demand fabrication requirements.
- **Cost Saving Tip**: If you love the look but want to optimize your investment, keeping your layout simple with an **Eased Edge** and utilizing IKB's custom-fabricated in-stock slab program can save up to 15% on fabrication costs! You can also check out our real-time **Estimate Calculator** in the menu above for an interactive breakdown.`;
  } else if (msgLower.includes("kitchen") || msgLower.includes("island") || msgLower.includes("counter")) {
    keywordResponse = `\n### 🍳 Kitchen & Island Design Notes
- **Double Islands**: For large kitchens in Windermere or Lake Nona, we love doing a dramatic *Waterfall Edge* on the central island and a clean *Eased Edge* on the perimeter countertops.
- **Backsplash Continuity**: Continuing the countertop stone all the way up as a full-slab backsplash creates an ultra-premium, continuous luxurious feel that is incredibly easy to clean compared to traditional tile grout lines.`;
  } else if (msgLower.includes("bath") || msgLower.includes("vanity") || msgLower.includes("shower")) {
    keywordResponse = `\n### 🛁 Bathroom & Custom Vanity Tips
- **Moisture Resistance**: For high-humidity bathrooms, our Spanish porcelain slabs are absolutely ideal. They have zero moisture absorption, are mold-resistant, and can be used on both vanities and full walk-in shower walls.
- **Sinks**: An undermount sink provides a clean, seamless sweep to easily wipe down water from the countertops.`;
  }

  return `${adviceIntro}\n\n${designAnalysis}\n\n${hardwareTips}${keywordResponse}\n\n*Would you like to schedule a detailed laser-templating consultation with our team? Feel free to use the scheduler tab at the top of the page!*`;
}
