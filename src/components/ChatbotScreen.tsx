
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Bot, User, Sparkles, MessageCircle } from 'lucide-react';
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
      text: "Hi there! 👋 I'm your OffersMonkey Assistant powered by Mistral AI. I can help you find the best deals, answer questions about offers, and provide personalized recommendations based on your preferences. What would you like to know?",
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-monkeyGreen to-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/home" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Assistant</h1>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <p className="text-sm text-green-100">Powered by Mistral AI</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="w-3 h-3 bg-green-400 rounded-full mb-1 animate-pulse"></div>
            <p className="text-xs text-green-100">Online</p>
          </div>
        </div>
      </div>
      
      {/* Messages container */}
      <ScrollArea className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-5 py-3 shadow-md ${
                    message.isUser
                      ? 'bg-gradient-to-r from-monkeyGreen to-green-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-green-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="w-10 h-10 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-5 py-3 shadow-md border border-gray-200">
                  <div className="flex space-x-1">
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
            <div className="space-y-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">💡 Try asking:</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start bg-white hover:bg-monkeyGreen hover:text-white border-gray-200 text-gray-700 transition-all duration-200 shadow-sm"
                    onClick={() => setInput(question)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
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
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Ask about deals, offers, or anything else..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-gray-300 focus:border-monkeyGreen focus:ring-monkeyGreen bg-white rounded-full py-3 px-4 shadow-sm"
              disabled={isLoading || !session?.user}
            />
          </div>
          <Button 
            type="submit" 
            size="icon" 
            className="bg-gradient-to-r from-monkeyGreen to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-md transition-all duration-200 w-12 h-12"
            disabled={!input.trim() || isLoading || !session?.user}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {!session?.user && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Please <Link to="/auth" className="text-monkeyGreen underline font-medium">sign in</Link> to use the AI assistant
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatbotScreen;
