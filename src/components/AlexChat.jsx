import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const AlexChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'alex', 
      text: "Hey! I'm Alex. 🌟 I'm so glad you're here today. What's on your mind?" 
    }
  ]);
  const scrollRef = useRef(null);

  // Replace this with your actual Gemini API Key from Google AI Studio
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

  // System instructions that tell the AI how to behave
  const systemPrompt = `You are Alex, an energetic, highly motivating, and informative health assistant for the HealthFreak app. 
  Your primary rules are:
  1. If asked about medicines, explain their general purpose, how they work, and standard dosage guidelines. 
  2. ALWAYS include a disclaimer when discussing medication that the user must consult their doctor or pharmacist.
  3. Be incredibly supportive and positive. Celebrate small health wins.
  4. Always keep the conversation going by asking a relevant, interactive follow-up question at the end of your response.
  5. Keep answers concise and readable for a mobile chat interface. Use emojis to be friendly.`;

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

 // --- ALEX'S BUILT-IN MEDICINE DICTIONARY ---
  const offlineMedicineDB = {
    paracetamol: "Paracetamol (or Crocin/Tylenol) is used for mild pain and fever. 💊 **Adult Dose:** 500mg to 1000mg every 4-6 hours. **Max:** Do not exceed 4000mg in 24 hours. ⚠️ Always consult your doctor!",
    ibuprofen: "Ibuprofen (Advil/Motrin) is an NSAID for pain, fever, and inflammation. 💊 **Adult Dose:** 200mg to 400mg every 4-6 hours. Take it with food to avoid stomach upset. ⚠️ Always consult your doctor!",
    metformin: "Metformin is commonly used to manage type 2 diabetes. 💊 **Dose:** This is highly individualized, but often starts at 500mg once or twice daily with meals. ⚠️ You must follow your doctor's exact prescription for this!",
    cetirizine: "Cetirizine (Zyrtec) is an antihistamine for allergies. 💊 **Adult Dose:** Usually 10mg once daily. It can cause slight drowsiness in some people. ⚠️ Always consult your doctor!",
    amoxicillin: "Amoxicillin is an antibiotic for bacterial infections. 💊 **Dose:** Depends entirely on the infection (often 250mg-500mg every 8 hours). You MUST finish the entire course your doctor prescribed, even if you feel better! ⚠️",
  };

  const getOfflineResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Check if they are asking about a specific medicine
    for (const [med, info] of Object.entries(offlineMedicineDB)) {
      if (q.includes(med)) {
        return `${info} \n\nHow are you feeling today? Are you tracking your symptoms in the app?`;
      }
    }

    // 2. Interactive & Motivational Catch-alls
    if (q.includes('hello') || q.includes('hi')) {
      return "Hey there! I'm Alex. 🌟 I can tell you about common meds like Paracetamol, Ibuprofen, or Metformin. What do you need help with?";
    }
    if (q.includes('water') || q.includes('thirsty')) {
      return "Hydration check! 💧 Have you logged your water intake today? Aim for at least 8 glasses!";
    }

    // 3. Fallback
    return "That's a great question! I'm currently in 'Offline Mode', so I only know about common medicines like Paracetamol, Ibuprofen, Cetirizine, Amoxicillin, and Metformin. Try asking me about one of those! 🩺";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input; // save it before clearing
    setInput('');
    setIsTyping(true);

    // 2. Simulate a slight delay so it feels like a real chat
    setTimeout(() => {
      const responseText = getOfflineResponse(currentInput);
      const alexMessage = { role: 'alex', text: responseText };
      setMessages(prev => [...prev, alexMessage]);
      setIsTyping(false);
    }, 600);
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-105"
        >
          <MessageCircle size={28} className="text-white" />
        </Button>
      ) : (
        <Card className="w-80 h-[28rem] flex flex-col shadow-2xl border-t-4 border-t-primary border-slate-700 rounded-2xl overflow-hidden bg-slate-900">
          {/* Header - Dark Mode */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-white text-lg">Alex</span>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Chat Body - Dark Mode */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none' 
                    : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator - Dark Mode */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Alex is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Dark Mode */}
          <div className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2 items-center">
            <Input 
              placeholder="Ask me anything about health, meds, or just say hi! 👋" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-full bg-slate-700 text-white placeholder:text-slate-400 border-transparent focus:bg-slate-600 focus:border-primary"
              disabled={isTyping}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              className="shrink-0 rounded-full w-10 h-10 transition-transform hover:scale-105"
              disabled={isTyping || !input.trim()}
            >
              <Send size={18} className="ml-1 text-white" /> 
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AlexChat;