
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockChatMessages } from '@/mockData';
import { Link } from 'react-router-dom';
import { Message } from '@/types';
import { toast } from "@/components/ui/use-toast";

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
      
      // Enhanced response logic based on keywords
      const lowercaseInput = input.toLowerCase();
      if (lowercaseInput.includes('deal') || lowercaseInput.includes('offer')) {
        botResponse = "I found several great deals nearby! 🎉\n\n• Electronics: 30% off Samsung devices\n• Grocery: BOGO deals at Whole Foods\n• Fashion: 50% off at Nike\n\nWhich category interests you most?";
      } else if (lowercaseInput.includes('electronic') || lowercaseInput.includes('phone')) {
        botResponse = "📱 Tech deals alert! Check out:\n\n• Samsung Galaxy S23 at Best Buy - save $200 with trade-in\n• Apple AirPods Pro 20% off at Amazon\n• Dell XPS laptops with $300 discount\n\nWant more electronics deals?";
      } else if (lowercaseInput.includes('amazon')) {
        botResponse = "Amazon deals right now:\n\n• Echo Dot - 30% off\n• Fire TV Stick 4K - 40% off\n• Kindle Paperwhite - $45 discount\n\nThese are affiliate deals with great value! Would you like the links?";
      } else if (lowercaseInput.includes('grocery') || lowercaseInput.includes('food')) {
        botResponse = "Fresh food deals this week:\n\n• Whole Foods: 50% off produce (ends Sunday)\n• Safeway: BOGO ice cream\n• Trader Joe's: Wine discounts\n• Kroger: 30% off meat department\n\nShould I add these to your saved deals?";
      } else if (lowercaseInput.includes('expir')) {
        botResponse = "⏰ Expiring soon:\n\n• Nike sale: TOMORROW\n• Whole Foods produce: Sunday\n• Best Buy tech event: 3 days left\n\nWould you like to receive notifications before these expire?";
      } else if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
        botResponse = "Hello there! 👋 I'm your OffersMonkey assistant. I can help with:\n\n• Finding deals near you\n• Searching by store or category\n• Tracking expiring offers\n• Amazon product deals\n\nWhat are you looking for today?";
      } else if (lowercaseInput.includes('thank')) {
        botResponse = "You're welcome! 😊 Always happy to help you find the best deals. Let me know if you need anything else!";
      } else if (lowercaseInput.includes('save') || lowercaseInput.includes('bookmark')) {
        botResponse = "I've saved this deal to your favorites! 🌟 You can access all your saved deals in the Profile section. Would you like me to remind you about this deal before it expires?";
      } else if (lowercaseInput.includes('nearby') || lowercaseInput.includes('close') || lowercaseInput.includes('near me')) {
        botResponse = "📍 Deals near your location:\n\n• Target (0.8mi): 25% off home goods\n• Walgreens (1.2mi): BOGO vitamins\n• Best Buy (1.5mi): Weekend tech sale\n• Ross (2.1mi): Clearance event\n\nWould you like directions to any of these?";
      } else {
        botResponse = "I'm still learning! 🐒 Would you like to:\n\n• See the latest deals near you?\n• Check offers by category?\n• View expiring deals?\n• Search Amazon products?\n\nJust let me know how I can help!";
      }
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Show toast notification for new deals
      if (lowercaseInput.includes('deal') || lowercaseInput.includes('offer')) {
        setTimeout(() => {
          toast({
            title: "New Deals Found!",
            description: "3 new deals match your preferences",
          });
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-monkeyBackground">
      {/* Header */}
      <div className="bg-monkeyGreen text-white p-4 flex items-center space-x-4 shadow-md">
        <Link to="/home">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">OffersMonkey Assistant</h1>
          <p className="text-xs text-green-100">Always finding the best deals for you</p>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-green-50 to-yellow-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-monkeyGreen text-white rounded-tr-none shadow-lg'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white shadow-up border-t border-gray-100">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask about deals near you..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border-gray-200 focus:border-monkeyGreen"
          />
          <Button 
            type="button"
            size="icon"
            variant="outline"
            className="bg-white text-monkeyGreen border-monkeyGreen hover:bg-green-50"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            className="bg-monkeyYellow text-black hover:bg-monkeyYellow/90 shadow-sm"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotScreen;
