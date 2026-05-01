import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { MessageCircle, X, Send } from 'lucide-react';

const AlexChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'alex', text: "Hi! I'm Alex. How can I help with your health goals today?" }
  ]);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Mock AI Response Logic (Replace with an API call to OpenAI/Gemini later)
    setTimeout(() => {
      const alexResponse = { 
        role: 'alex', 
        text: getAlexResponse(input) 
      };
      setMessages(prev => [...prev, alexResponse]);
    }, 600);
  };

  const getAlexResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('water')) return "Staying hydrated is key! You should aim for about 2-3 liters a day.";
    if (q.includes('medicine') || q.includes('pill')) return "Don't forget to check your Medication Management tab for your schedule.";
    if (q.includes('hello') || q.includes('hi')) return "Hello! Ready to track some progress?";
    return "That's interesting! I'm still learning, but I can help you track food, water, and meds.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle size={28} />
        </Button>
      ) : (
        <Card className="w-80 h-96 flex flex-col shadow-2xl border-t-4 border-t-primary">
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center bg-muted/30">
            <span className="font-bold text-primary">Chat with Alex</span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </Button>
          </div>

          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input 
              placeholder="Ask Alex..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" onClick={handleSend} className="shrink-0">
              <Send size={16} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AlexChat;