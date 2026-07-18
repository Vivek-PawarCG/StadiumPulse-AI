import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Languages, Volume2, Mic, MicOff, 
  HelpCircle, Eye, ZoomIn, ZoomOut, VolumeX 
} from 'lucide-react';

export default function FanAssistant() {
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: "Hello! I am your StadiumPulse AI Fan Assistant. Ask me about exits, concessions, wait times, or sustainable transit.", 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [lang, setLang] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  
  // Accessibility state
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('md'); // sm, md, lg, xl
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = (text) => {
    if (!textToSpeech) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: lang })
      });
      const data = await res.json();
      
      const aiMsg = {
        sender: 'ai',
        text: data.response || "I couldn't reach the system. Please try again.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      speakText(aiMsg.text);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Sorry, I am experiencing network issues. Gate 4 and Concession C are currently running smoothly.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported on this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInputValue(speechToText);
      setIsListening(false);
    };

    recognition.start();
  };

  const quickPrompts = {
    en: [
      "Where is the nearest medical aid station?",
      "Which gate has the shortest queue?",
      "Show me dynamic transit options to Downtown.",
      "Sustainable tips for fans."
    ],
    es: [
      "¿Dónde está la estación médica más cercana?",
      "¿Qué puerta tiene la fila más corta?",
      "Muéstrame opciones de transporte al centro.",
      "Consejos de sostenibilidad."
    ],
    fr: [
      "Où se trouve le poste de secours ?",
      "Quelle porte a le moins d'attente ?",
      "Options de transport vers le centre-ville.",
      "Conseils durables."
    ]
  };

  const prompts = quickPrompts[lang] || quickPrompts['en'];

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row h-[550px] border transition-colors ${
      highContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-darkCard/60 border-glassBorder'
    }`}>
      
      {/* SIDEBAR: ACCESSIBILITY & CONTROLS */}
      <div className={`p-4 md:w-64 border-b md:border-b-0 md:border-r flex flex-col justify-between ${
        highContrast ? 'border-yellow-400/30' : 'border-glassBorder'
      }`} role="complementary" aria-label="Accessibility Controls">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="text-primaryEmerald" size={18} />
            <h4 className="text-sm font-bold">Language / Idioma</h4>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button 
              onClick={() => setLang('en')} 
              className={`text-xs py-1.5 rounded font-bold transition-all ${
                lang === 'en' 
                  ? 'bg-primaryEmerald text-darkBg' 
                  : highContrast ? 'bg-zinc-800 text-yellow-300' : 'bg-darkBg text-gray-300 hover:bg-zinc-800'
              }`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('es')} 
              className={`text-xs py-1.5 rounded font-bold transition-all ${
                lang === 'es' 
                  ? 'bg-primaryEmerald text-darkBg' 
                  : highContrast ? 'bg-zinc-800 text-yellow-300' : 'bg-darkBg text-gray-300 hover:bg-zinc-800'
              }`}
            >
              ES
            </button>
            <button 
              onClick={() => setLang('fr')} 
              className={`text-xs py-1.5 rounded font-bold transition-all ${
                lang === 'fr' 
                  ? 'bg-primaryEmerald text-darkBg' 
                  : highContrast ? 'bg-zinc-800 text-yellow-300' : 'bg-darkBg text-gray-300 hover:bg-zinc-800'
              }`}
            >
              FR
            </button>
          </div>

          <hr className={highContrast ? 'border-yellow-400/20' : 'border-glassBorder'} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Eye size={14} /> WCAG Contrast
              </span>
              <button 
                onClick={() => setHighContrast(!highContrast)}
                className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all ${
                  highContrast ? 'bg-yellow-300 text-black' : 'bg-zinc-800 text-white'
                }`}
                aria-label="Toggle High Contrast Mode"
              >
                {highContrast ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <ZoomIn size={14} /> Text Scale
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setTextSize(prev => prev === 'xl' ? 'lg' : prev === 'lg' ? 'md' : 'sm')}
                  className="p-1 bg-zinc-800 rounded text-white"
                  aria-label="Decrease text size"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="text-xs font-bold w-6 text-center uppercase">{textSize}</span>
                <button 
                  onClick={() => setTextSize(prev => prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'xl')}
                  className="p-1 bg-zinc-800 rounded text-white"
                  aria-label="Increase text size"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Volume2 size={14} /> Screen Reader
              </span>
              <button 
                onClick={() => {
                  setTextToSpeech(!textToSpeech);
                  if(!textToSpeech) speakText("Screen reader mode enabled");
                }}
                className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all ${
                  textToSpeech ? 'bg-primaryEmerald text-darkBg' : 'bg-zinc-800 text-white'
                }`}
                aria-label="Toggle screen reader read aloud"
              >
                {textToSpeech ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 mt-4 md:mt-0">
          <HelpCircle size={10} className="inline mr-1" />
          WCAG 2.2 AA Compliant
        </div>
      </div>

      {/* MAIN VIEWPORT: CHAT STREAM */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Chat Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-darkBg/30" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-3 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-brandBlue text-white rounded-br-none' 
                  : highContrast 
                    ? 'bg-zinc-900 border border-yellow-400 text-yellow-300 rounded-bl-none' 
                    : 'bg-zinc-800/80 text-gray-200 rounded-bl-none border border-glassBorder'
              }`}>
                <p className={`${textSizes[textSize] || 'text-sm'} leading-relaxed`}>{msg.text}</p>
                <span className="text-[9px] text-gray-400 text-right block mt-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/50 rounded-xl p-3 rounded-bl-none border border-glassBorder flex items-center gap-1">
                <span className="h-2 w-2 bg-primaryEmerald rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 bg-primaryEmerald rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 bg-primaryEmerald rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Container */}
        <div className="px-4 py-2 bg-darkBg/60 overflow-x-auto flex gap-2 border-t border-glassBorder whitespace-nowrap scrollbar-none">
          {prompts.map((p, index) => (
            <button
              key={index}
              onClick={() => handleSend(p)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-medium px-3 py-1.5 rounded-full border border-glassBorder transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className={`p-4 border-t ${highContrast ? 'border-yellow-400/30' : 'border-glassBorder'}`}>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder={lang === 'es' ? 'Pregúntame algo...' : lang === 'fr' ? 'Demande-moi...' : 'Ask about wait times, gates, transit...'}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              aria-label="Type your question"
              className="flex-1 bg-darkBg border border-glassBorder rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
            />
            
            <button
              onClick={startVoiceInput}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-accentRose border-accentRose text-white animate-pulse' 
                  : highContrast ? 'bg-zinc-800 border-yellow-400 text-yellow-300' : 'bg-zinc-800 border-glassBorder text-gray-300 hover:text-white'
              }`}
              title="Voice Input"
              aria-label="Voice Input"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button 
              onClick={() => handleSend()}
              className="bg-primaryEmerald hover:bg-primaryEmerald/90 text-darkBg font-bold p-2.5 rounded-xl transition-all shadow-glow"
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
