
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Bot, User, Sparkles, MessageCircle, Zap, Clock, ExternalLink, History, X } from 'lucide-react';
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
import AIOfferCard from './AIOfferCard';

interface MessageWithOffers extends Message {
  offers?: any[];
  showOnlyCards?: boolean;
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<MessageWithOffers[]>([
    {
      id: 'welcome',
      text: "Hello! 👋 I'm your OffersMonkey AI Assistant powered by Gemini AI. I can help you with anything - from finding amazing deals and offers to answering general questions. What would you like to know today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<MessageWithOffers[]>([]);
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

  // Load chat history when component mounts or when history is toggled
  const loadChatHistory = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const historyMessages: MessageWithOffers[] = [];
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
        
        setChatHistory(historyMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleHistoryToggle = () => {
    if (!showHistory) {
      loadChatHistory();
    }
    setShowHistory(!showHistory);
  };

  const startFreshChat = () => {
    setMessages([
      {
        id: 'welcome',
        text: "Hello! 👋 I'm your OffersMonkey AI Assistant powered by Gemini AI. I can help you with anything - from finding amazing deals and offers to answering general questions. What would you like to know today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setShowHistory(false);
  };

  const getUserContext = async () => {
    if (!session?.user) return null;

    try {
      // Get saved offers count
      const { data: savedOffers } = await supabase
        .from('saved_offers')
        .select('offer_id')
        .eq('user_id', session.user.id);

      return {
        location: user?.location || 'Not specified',
        savedOffersCount: savedOffers?.length || 0,
        userInfo: {
          name: user?.name || 'User',
          email: user?.email || session.user.email
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
    const userMessage: MessageWithOffers = {
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
      
      // Call Gemini AI via Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: currentInput,
          context: context
        }
      });

      if (error) throw error;

      const botMessage: MessageWithOffers = {
        id: `bot-${Date.now()}`,
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        offers: data.offers || [],
        showOnlyCards: data.showOnlyCards || false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "AI Response",
        description: data.offers && data.offers.length > 0 
          ? `Found ${data.offers.length} relevant offers!`
          : "Got a personalized response from Gemini AI!",
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const errorMessage: MessageWithOffers = {
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

  // Function to format bot messages with clickable links
  const formatMessage = (text: string) => {
    // Split the message by lines to handle structured responses better
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check if line contains a link pattern
      const linkRegex = /(🔗 \*\*Get Deal:\*\* \[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s]+)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

        if (match[0].startsWith('🔗 **Get Deal:**')) {
          // Handle formatted deal links
          const linkText = match[2] || 'Get Deal';
          const url = match[3];
          parts.push(
            <a
              key={`link-${index}-${match.index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-monkeyGreen hover:text-green-700 underline font-medium"
            >
              🔗 <strong>Get Deal:</strong> {linkText}
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        } else {
          // Handle plain URLs
          const url = match[0];
          parts.push(
            <a
              key={`link-${index}-${match.index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-monkeyGreen hover:text-green-700 underline break-all"
            >
              {url}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          );
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <div key={index} className="leading-relaxed">
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

  const suggestedQuestions = [
    "What are the best deals today?",
    "Show me electronics offers",
    "Find fashion discounts",
    "Help me with cooking tips",
    "Show me grocery deals",
    "Find mobile phone offers",
    "What's trending in home appliances?",
    "Show me travel deals",
    "Find beauty and skincare offers",
    "Show me book deals",
    "Find fitness equipment offers",
    "What are the latest tech deals?"
  ];

  const displayMessages = showHistory ? chatHistory : messages;

  return (
    <div className={`flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden ${isMobile ? 'h-screen pb-16' : 'h-screen'}`}>
      {/* Header - Fixed and responsive */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
            <Link to="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {showHistory ? 'Chat History' : 'AI Assistant'}
                </h1>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-monkeyGreen flex-shrink-0" />
                  <p className="text-xs text-gray-500 truncate">Powered by Gemini AI</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {showHistory ? (
              <Button
                onClick={startFreshChat}
                size="sm"
                className="bg-monkeyGreen hover:bg-green-700 text-white"
              >
                <X className="w-4 h-4 mr-1" />
                {!isMobile && "New Chat"}
              </Button>
            ) : (
              <Button
                onClick={handleHistoryToggle}
                variant="outline"
                size="sm"
                className="hover:bg-gray-50"
              >
                <History className="w-4 h-4 mr-1" />
                {!isMobile && "History"}
              </Button>
            )}
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium hidden sm:inline">Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages Area - Takes remaining space but leaves room for input and nav */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full">
          <div className="p-3 md:p-4 pb-4 max-w-4xl mx-auto">
            <div className="space-y-4 md:space-y-6">
              {displayMessages.map((message) => (
                <div key={message.id} className="space-y-4">
                  {/* Only show text message if it's not a cards-only response */}
                  {!message.showOnlyCards && (
                    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 md:space-x-3 max-w-[90%] sm:max-w-[85%] md:max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!message.isUser && (
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 min-w-0 overflow-hidden ${
                            message.isUser
                              ? 'bg-monkeyGreen text-white rounded-br-md'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                          }`}
                        >
                          <div className="text-sm leading-relaxed break-words overflow-wrap-anywhere">
                            {message.isUser ? (
                              <p className="whitespace-pre-wrap">{message.text}</p>
                            ) : (
                              <div className="space-y-2">
                                {formatMessage(message.text)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <p className={`text-xs flex-shrink-0 ${message.isUser ? 'text-green-100' : 'text-gray-400'}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {!message.isUser && (
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <Zap className="w-3 h-3 text-monkeyGreen" />
                                <span className="text-xs text-monkeyGreen font-medium">AI</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {message.isUser && (
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Offer Cards Display */}
                  {!message.isUser && message.offers && message.offers.length > 0 && (
                    <div className={message.showOnlyCards ? "" : "ml-6 md:ml-8"}>
                      <div className={`grid gap-3 ${
                        isMobile 
                          ? 'grid-cols-1' 
                          : message.offers.length === 1 
                            ? 'grid-cols-1 max-w-xs' 
                            : message.offers.length === 2 
                              ? 'grid-cols-2 max-w-2xl' 
                              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl'
                      }`}>
                        {message.offers.map((offer, index) => (
                          <AIOfferCard 
                            key={offer.lmd_id || offer.id || index} 
                            offer={offer} 
                            isMobile={isMobile}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && !showHistory && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 md:space-x-3 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 md:px-4 md:py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-xs text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Suggested Questions - Only show for fresh chat with welcome message */}
              {messages.length === 1 && !showHistory && (
                <div className="space-y-4 mt-6 md:mt-8">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">💡 Quick Questions</h3>
                    <p className="text-xs text-gray-500">Ask me anything - deals, general questions, or advice!</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 text-left justify-start bg-white hover:bg-green-50 hover:border-monkeyGreen border-gray-200 text-gray-700 transition-all duration-200"
                        onClick={() => setInput(question)}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-monkeyGreen flex-shrink-0" />
                          <span className="text-sm break-words">{question}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Input Area - Fixed at bottom with proper spacing for mobile nav - Only show for fresh chat */}
      {!showHistory && (
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="p-3 md:p-4 max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex space-x-2 md:space-x-3">
              <div className="flex-1 relative min-w-0">
                <Input
                  placeholder="Ask me anything - deals, questions, or advice..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-10 md:pr-12 border-gray-300 focus:border-monkeyGreen focus:ring-monkeyGreen bg-gray-50 rounded-xl py-2 px-3 md:py-3 md:px-4 text-sm md:text-base w-full"
                  disabled={isLoading || !session?.user}
                />
                {input && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className="bg-monkeyGreen hover:bg-green-700 text-white rounded-xl shadow-sm transition-all duration-200 w-10 h-10 md:w-12 md:h-12 flex-shrink-0"
                disabled={!input.trim() || isLoading || !session?.user}
              >
                {isLoading ? (
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </Button>
            </form>
            
            {!session?.user && (
              <div className="mt-2 md:mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Please <Link to="/login" className="text-monkeyGreen underline font-medium">sign in</Link> to use the AI assistant
                </p>
              </div>
            )}
            
            {session?.user && (
              <div className="mt-2 md:mt-3 text-center">
                <p className="text-xs text-gray-400">
                  Powered by Gemini AI • Press Enter to send
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotScreen;
