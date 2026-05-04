import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

const AlexChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'alex', 
      text: "Hey! I'm Alex. 🌟 I'm so glad you're here. Ask me anything about medicines, hydration, or just tell me how you're feeling today!" 
    }
  ]);
  const scrollRef = useRef(null);

  // This safely grabs your API key from the .env file!
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.replace(/['"]/g, '').trim();

  const systemPrompt = `You are Alex, an energetic, highly motivating, and informative health assistant for the HealthFreak app. 
  Your primary rules are:
  1. If asked about medicines, explain their general purpose, how they work, and standard dosage guidelines. 
  2. ALWAYS include a strict disclaimer when discussing medication that the user must consult their doctor.
  3. Be incredibly supportive. Celebrate small health wins.
  4. Always ask a relevant, interactive follow-up question at the end to keep the conversation going.
  5. Keep answers concise for a mobile chat interface. Use emojis to be friendly.`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const callGeminiAPI = async (userText) => {
    // Super-clean the API key
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const cleanKey = rawKey.replace(/['"]/g, '').trim();

    if (!cleanKey) {
      return "Oops! My API key is missing. Please check your Vercel settings! 🛑";
    }

    try {
      // 🚨 FIXED MODEL NAME TO INCLUDE '-latest' 🚨
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: { text: systemPrompt } },
            contents: [{ role: "user", parts: [{ text: userText }] }],
          }),
        }
      );

      // Catch Google's exact error
      if (!response.ok) {
        const errorData = await response.json();
        console.error("🚨 GOOGLE ERROR:", errorData);
        return `Google Error: ${errorData.error?.message || "Unknown 404"}`;
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return "I connected, but didn't get a response back!";
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      return "My connection dropped! Check your internet or API key formatting. 🧘‍♂️";
    }
  };


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const aiResponseText = await callGeminiAPI(userMessage.text);

    const alexMessage = { role: 'alex', text: aiResponseText };
    setMessages(prev => [...prev, alexMessage]);
    setIsTyping(false);
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
          
          {/* Header - Dark Mode & Fixed Close Button */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-white text-lg">Alex</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
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
              placeholder="Ask me anything..." 
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