
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Bot, User, Sparkles, MessageCircle, Zap, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Message } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! 👋 I'm your OffersMonkey AI Assistant powered by Mistral AI. I'm here to help you discover amazing deals, find the best offers, and provide personalized recommendations based on your preferences. What can I help you find today?",
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
  const isMobile = useIsMobile();
  
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
      
      // Call Mistral AI via Edge Function
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
    <div className={`flex flex-col h-screen bg-gray-50 ${isMobile ? '' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative z-10">
        <div className={`flex items-center justify-between ${isMobile ? 'p-4' : 'p-6 max-w-7xl mx-auto'}`}>
          <div className="flex items-center space-x-3">
            <Link to="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className={`text-gray-600 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}>
                  <Bot className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </div>
                <div className={`absolute -bottom-1 -right-1 bg-green-500 rounded-full border-2 border-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}></div>
              </div>
              <div>
                <h1 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>AI Assistant</h1>
                <div className="flex items-center space-x-1">
                  <Sparkles className={`text-monkeyGreen ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Powered by Mistral AI</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full ${isMobile ? 'px-2 py-1' : 'px-3 py-2'}`}>
              <div className={`bg-green-500 rounded-full animate-pulse ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
              <span className={`text-green-700 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className={`space-y-6 ${isMobile ? 'p-4 pb-32' : 'p-6 pb-40 max-w-5xl mx-auto'}`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 ${isMobile ? 'max-w-[85%]' : 'max-w-[75%]'} ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!message.isUser && (
                    <div className={`bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                      <Bot className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-monkeyGreen text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className={`leading-relaxed whitespace-pre-wrap ${isMobile ? 'text-sm' : 'text-base'}`}>{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`${message.isUser ? 'text-green-100' : 'text-gray-400'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {!message.isUser && (
                        <div className="flex items-center space-x-1">
                          <Zap className={`text-monkeyGreen ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                          <span className={`text-monkeyGreen font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>AI</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {message.isUser && (
                    <div className={`bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                      <User className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`flex items-start space-x-3 ${isMobile ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
                  <div className={`bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    <Bot className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className={`bg-monkeyGreen rounded-full animate-bounce ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
                        <div className={`bg-monkeyGreen rounded-full animate-bounce delay-100 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
                        <div className={`bg-monkeyGreen rounded-full animate-bounce delay-200 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
                      </div>
                      <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="space-y-4 mt-8">
                <div className="text-center">
                  <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>💡 Quick Questions</h3>
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Get started with these popular questions</p>
                </div>
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      className="h-auto p-3 text-left justify-start bg-white hover:bg-green-50 hover:border-monkeyGreen border-gray-200 text-gray-700 transition-all duration-200"
                      onClick={() => setInput(question)}
                    >
                      <div className="flex items-center space-x-2">
                        <MessageCircle className={`text-monkeyGreen flex-shrink-0 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        <span className={isMobile ? 'text-sm' : 'text-base'}>{question}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      {/* Input Area */}
      <div className={`border-t border-gray-200 bg-white ${isMobile ? 'fixed bottom-16 left-0 right-0 p-4' : 'p-6'} z-20`}>
        <div className={`${!isMobile ? 'max-w-5xl mx-auto' : ''}`}>
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask me about deals, offers, or anything else..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`pr-12 border-gray-300 focus:border-monkeyGreen focus:ring-monkeyGreen bg-gray-50 rounded-xl ${isMobile ? 'py-3 px-4' : 'py-4 px-5 text-base'}`}
                disabled={isLoading || !session?.user}
              />
              {input && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Clock className={`text-gray-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className={`bg-monkeyGreen hover:bg-green-700 text-white rounded-xl shadow-sm transition-all duration-200 ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}
              disabled={!input.trim() || isLoading || !session?.user}
            >
              {isLoading ? (
                <div className={`border-2 border-white border-t-transparent rounded-full animate-spin ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              ) : (
                <Send className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
              )}
            </Button>
          </form>
          
          {!session?.user && (
            <div className="mt-3 text-center">
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Please <Link to="/auth" className="text-monkeyGreen underline font-medium">sign in</Link> to use the AI assistant
              </p>
            </div>
          )}
          
          {session?.user && (
            <div className="mt-3 text-center">
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Powered by Mistral AI • Press Enter to send
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotScreen;
