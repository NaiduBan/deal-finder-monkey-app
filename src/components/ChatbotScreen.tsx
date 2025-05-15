
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockChatMessages } from '@/mockData';
import { Link } from 'react-router-dom';
import { Message } from '@/types';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>(mockChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate bot response after delay
    setTimeout(() => {
      let botResponse: string;
      
      // Simple response logic based on keywords
      const lowercaseInput = input.toLowerCase();
      if (lowercaseInput.includes('deal') || lowercaseInput.includes('offer')) {
        botResponse = "I found several great deals nearby! Would you like to see offers in electronics, supermarket, or fashion?";
      } else if (lowercaseInput.includes('electronic') || lowercaseInput.includes('phone')) {
        botResponse = "Check out the Samsung Galaxy S23 offer at Best Buy - save $200 with trade-in! Want me to show you more electronics deals?";
      } else if (lowercaseInput.includes('amazon')) {
        botResponse = "I found Amazon Echo Dot at 30% off and Fire TV Stick 4K at 40% off! These are affiliate deals with great value.";
      } else if (lowercaseInput.includes('grocery') || lowercaseInput.includes('food')) {
        botResponse = "Whole Foods has 50% off fresh produce this weekend! Also, Safeway has a BOGO deal on premium ice cream.";
      } else if (lowercaseInput.includes('expir')) {
        botResponse = "The Nike sale ends tomorrow! Also, the Whole Foods produce deal expires this Sunday. Would you like reminders?";
      } else if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
        botResponse = "Hello there! I'm your OffersMonkey assistant. How can I help you find deals today?";
      } else {
        botResponse = "I'm still learning! Would you like to see the latest deals near you? Or ask me about specific stores or product categories.";
      }
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-monkeyBackground">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center space-x-4">
        <Link to="/home">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-semibold">OffersMonkey Assistant</h1>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.isUser
                    ? 'bg-monkeyGreen text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                }`}
              >
                <p>{message.text}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white shadow-up">
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-monkeyYellow text-black hover:bg-monkeyYellow/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotScreen;
