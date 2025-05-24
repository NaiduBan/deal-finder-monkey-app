
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Mic, Sparkles, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Message } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi there! 👋 I'm your OffersMonkey Assistant powered by AI. I can help you find the best deals, answer questions about offers, and provide personalized recommendations based on your preferences. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const { user } = useUser();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          const historyMessages: Message[] = [];
          data.forEach(chat => {
            historyMessages.push({
              id: `${chat.id}-user`,
              text: chat.message,
              isUser: true,
              timestamp: new Date(chat.created_at)
            });
            if (chat.response) {
              historyMessages.push({
                id: `${chat.id}-bot`,
                text: chat.response,
                isUser: false,
                timestamp: new Date(chat.created_at)
              });
            }
          });
          
          setMessages(prev => [prev[0], ...historyMessages]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [session]);

  const getUserContext = async () => {
    if (!session?.user) return null;

    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preference_type, preference_id')
        .eq('user_id', session.user.id);

      // Get saved offers count
      const { data: savedOffers } = await supabase
        .from('saved_offers')
        .select('offer_id')
        .eq('user_id', session.user.id);

      return {
        location: user.location,
        preferences: preferences || [],
        savedOffersCount: savedOffers?.length || 0,
        userInfo: {
          name: user.name,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  };
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim() || isLoading || !session?.user) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    setIsLoading(true);
    
    try {
      // Get user context for personalized responses
      const context = await getUserContext();
      
      // Call OpenAI via Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: currentInput,
          context: context
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "AI Response",
        description: "Got a personalized response based on your preferences!",
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can browse offers in the home section! 🐒",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What are the best deals near me?",
    "Show me electronics offers",
    "Find grocery deals",
    "What's expiring soon?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-monkeyGreen/5 via-white to-monkeyYellow/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-monkeyGreen to-green-600 text-white p-4 shadow-lg border-b">
        <div className="flex items-center space-x-4">
          <Link to="/home" className="hover:bg-white/10 p-1 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-monkeyYellow rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-monkeyGreen" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
              <p className="text-sm text-green-100">Powered by OpenAI • Personalized for you</p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-1"></div>
            <p className="text-xs text-green-100">Online</p>
          </div>
        </div>
      </div>
      
      {/* Messages container */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className="flex items-start space-x-3 max-w-[85%]">
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                    message.isUser
                      ? 'bg-gradient-to-r from-monkeyGreen to-green-600 text-white rounded-tr-md'
                      : 'bg-white/90 text-gray-800 rounded-tl-md border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-green-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="w-8 h-8 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/90 text-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg border border-gray-100 backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggested questions for new users */}
          {messages.length === 1 && (
            <div className="space-y-3 animate-in fade-in duration-500 delay-500">
              <p className="text-sm text-gray-500 text-center font-medium">Try asking:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm h-auto p-3 text-left justify-start bg-white/50 hover:bg-white/80 border-monkeyGreen/20 hover:border-monkeyGreen/40 transition-all duration-200"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask about deals, offers, or anything else..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12 border-gray-200 focus:border-monkeyGreen bg-white/90 shadow-sm backdrop-blur-sm rounded-xl"
                disabled={isLoading || !session?.user}
                autoFocus
              />
              {input && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setInput('')}
                >
                  ×
                </Button>
              )}
            </div>
            <Button 
              type="button"
              size="icon"
              variant="outline"
              className="bg-white/90 text-monkeyGreen border-monkeyGreen/30 hover:bg-monkeyGreen/10 hover:border-monkeyGreen rounded-xl shadow-sm backdrop-blur-sm"
              disabled={isLoading}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              type="submit" 
              size="icon" 
              className="bg-gradient-to-r from-monkeyGreen to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md rounded-xl"
              disabled={!input.trim() || isLoading || !session?.user}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          
          {!session?.user && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Please <Link to="/auth" className="text-monkeyGreen underline hover:text-green-600">sign in</Link> to use the AI assistant
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotScreen;
