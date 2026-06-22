import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, CornerDownLeft, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I am your MedHome AI Health Assistant. How can I help you today? (Please note: For emergencies, please use our SOS emergency mode immediately.)",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const presetQueries = [
    { text: "What should I do for chest pain?", response: "⚠️ CRITICAL ALERT: Chest pain could indicate an acute cardiovascular episode (Angina/Heart Attack). Stop all physical exertion immediately. Sit upright, rest, and check our SOS emergency panel or dial local emergency services (911/112) right away. Do not wait." },
    { text: "I have a fever.", response: "🤒 For seasonal fevers or influenza-like illnesses: Ensure complete bed rest and stay hydrated with warm water. Monitor your temperature every 4 hours. You can take paracetamol (acetaminophen) for relief, but consult a General Physician if the fever exceeds 101.5°F (38.6°C) or lasts more than 3 days." },
    { text: "Which doctor should I visit?", response: "🩺 That depends on your symptoms: \n- Cough, wheezing or breathlessness: Pulmonologist\n- Chest pain/pressure: Cardiologist\n- Headaches/dizziness/migraines: Neurologist\n- Rashes/allergic skin issues: Dermatologist\n- Stomach pain/acid reflux: Gastroenterologist" },
    { text: "Can I take medicine?", response: "💊 MedHome strongly advises against self-prescribing antibiotics or specialized drugs without clinical evaluation. For minor symptoms, basic over-the-counter support (like saline nasal drops, lozenges, or paracetamol) can help, but please consult one of our verified doctors in the 'Find Doctors' panel for a proper prescription." }
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "I have analyzed your request. Based on typical clinical diagnostics, I recommend tracking the duration of these symptoms and consulting a certified General Physician. You can use our Symptom Checker tab for a deeper analysis.";
      
      // Match query to presets
      const match = presetQueries.find(q => text.toLowerCase().includes(q.text.toLowerCase().substring(0, 15)));
      if (match) {
        aiResponse = match.response;
      } else if (text.toLowerCase().includes('cough') || text.toLowerCase().includes('breath')) {
        aiResponse = "🫁 It sounds like you are experiencing respiratory symptoms. This might match a pulmonology case. Please rest, wear a mask, keep hydrated, and try our AI Symptom Checker for a detailed severity report.";
      } else if (text.toLowerCase().includes('pain') || text.toLowerCase().includes('hurt')) {
        aiResponse = "🩹 Pain requires structured evaluation. If it is chest pain, please click SOS immediately. If it is abdominal or joint pain, check our Specialist Roster to book an appointment with a Gastroenterologist or Orthopedic expert.";
      }

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-brand-blue to-brand-teal shadow-neon-blue transition-transform duration-300 hover:scale-110 active:scale-95 animate-float"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-teal rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
        </button>
      )}

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-2xl border dark:border-slate-800 border-slate-200 shadow-2xl flex flex-col overflow-hidden dark:bg-slate-950 bg-white transition-all duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-blue to-brand-teal text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">MedHome AI Assistant</h3>
                <span className="text-[10px] opacity-75 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Online & Active
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-slate-950 bg-slate-50/50">
            {messages.map((m, idx) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={idx} className={`flex gap-2.5 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isAi ? 'bg-brand-blue/15 text-brand-blue' : 'bg-brand-teal/20 text-brand-teal'
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                    isAi 
                      ? 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-800 dark:text-slate-200' 
                      : 'bg-brand-blue text-white'
                  }`}>
                    {m.text.split('\n').map((line, lidx) => (
                      <p key={lidx} className={lidx > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] self-start">
                <div className="w-7 h-7 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset Helper Queries */}
          <div className="px-4 py-2 border-t dark:border-slate-900 border-slate-100 dark:bg-slate-950/80 bg-white">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Frequently Asked Questions</span>
            <div className="flex flex-wrap gap-1.5">
              {presetQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="text-[10px] px-2 py-1 rounded-lg border dark:border-slate-800 dark:bg-slate-900/50 border-slate-200 hover:border-brand-blue hover:text-brand-blue transition-colors text-slate-500 dark:text-slate-400 font-medium truncate max-w-[170px]"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 border-t dark:border-slate-900 border-slate-100 flex gap-2 items-center dark:bg-slate-950 bg-white"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 text-xs px-3 py-2.5 rounded-xl border dark:border-slate-800 dark:bg-slate-900/40 border-slate-200 outline-none text-slate-700 dark:text-slate-200 focus:border-brand-blue"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95 transition-all shadow-md shadow-brand-blue/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
