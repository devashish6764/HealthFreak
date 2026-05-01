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

  const callGeminiAPI = async (userText) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: { text: systemPrompt }
            },
            contents: [
              // Optionally, you can map previous messages here for conversation history
              { role: "user", parts: [{ text: userText }] }
            ],
          }),
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "I'm having a little trouble connecting to my database right now. Let's take a deep breath and try again in a moment! 🧘‍♂️";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Fetch AI response
    const aiResponseText = await callGeminiAPI(userMessage.text);

    // Add AI message to UI
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
              placeholder="Ask about meds..." 
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