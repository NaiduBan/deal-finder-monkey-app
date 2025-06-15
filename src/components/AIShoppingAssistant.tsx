import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Search, Heart, TrendingUp, Zap, MessageCircle, Volume2, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import VoiceInterface from './VoiceInterface';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasAudio?: boolean;
}

const AIShoppingAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! 👋 I'm your OffersMonkey AI Assistant. I can help you find amazing deals, answer questions, and even have voice conversations! Try asking me about deals or use the voice feature below.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState<'text' | 'voice'>('text');
  const [recommendations, setRecommendations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { offers } = useData();
  const { session } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate AI recommendations based on user behavior
  useEffect(() => {
    const generateRecommendations = () => {
      if (offers && offers.length > 0) {
        const userCategories = user.savedOffers.length > 0 
          ? offers.filter(offer => user.savedOffers.includes(offer.id))
                  .map(offer => offer.category)
                  .filter(Boolean)
          : [];

        const categoryPreferences = [...new Set(userCategories.flat())];
        
        const recommended = offers.filter(offer => 
          categoryPreferences.some(cat => 
            offer.category && offer.category.toLowerCase().includes(cat.toLowerCase())
          )
        ).slice(0, 4);

        setRecommendations(recommended);
      }
    };

    generateRecommendations();
  }, [offers, user.savedOffers]);

  const getUserContext = async () => {
    if (!session?.user) return null;

    try {
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

  const sendMessage = async (text: string, fromVoice = false) => {
    if (!text.trim() || isProcessing || !session?.user) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    setIsTyping(true);

    try {
      const context = await getUserContext();
      
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: text,
          context: context
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        hasAudio: fromVoice
      };

      setMessages(prev => [...prev, botMessage]);

      // If request came from voice, play audio response
      if (fromVoice) {
        await playAudioResponse(data.response);
      }

      toast({
        title: "AI Response",
        description: "Got a personalized response!",
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: "I'm having trouble connecting right now. Please try again in a moment! 🐒",
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
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  const playAudioResponse = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInputText(text);
    sendMessage(text, true);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const quickActions = [
    "Show me today's best deals",
    "Find electronics offers",
    "What's trending now?",
    "Help me save money"
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${!isMobile ? 'pt-16' : ''}`}>
      {/* Fixed Header - adjusted padding for desktop */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className={`max-w-7xl mx-auto px-4 ${isMobile ? 'py-3' : 'py-2'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-br from-monkeyGreen to-green-600 rounded-full flex items-center justify-center`}>
                    <Bot className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-2 h-2'} bg-green-500 rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-base'}`}>
                    AI Assistant
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2'} text-monkeyGreen`} />
                    <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      Powered by AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center space-x-1">
              <Button
                variant={currentMode === 'text' ? 'default' : 'outline'}
                size={isMobile ? 'sm' : 'sm'}
                onClick={() => setCurrentMode('text')}
                className={isMobile ? 'px-2' : 'px-3'}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {!isMobile && 'Text'}
              </Button>
              <Button
                variant={currentMode === 'voice' ? 'default' : 'outline'}
                size={isMobile ? 'sm' : 'sm'}
                onClick={() => setCurrentMode('voice')}
                className={isMobile ? 'px-2' : 'px-3'}
              >
                <Mic className="w-4 h-4 mr-1" />
                {!isMobile && 'Voice'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pb-20">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          
          {/* Chat Area - Takes more space on desktop */}
          <div className={`${isMobile ? 'order-1' : 'lg:col-span-3'} space-y-4`}>
            
            {/* Chat Messages Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-monkeyGreen" />
                    <span className={isMobile ? 'text-base' : 'text-lg'}>Conversation</span>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center space-x-1 text-monkeyGreen">
                      <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-200"></div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className={`${isMobile ? 'h-80' : 'h-96'} p-4`}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} gap-3`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isUser ? 'order-2 bg-gray-400' : 'order-1 bg-monkeyGreen'
                        }`}>
                          {message.isUser ? (
                            <span className="text-white text-xs font-medium">
                              {user?.name?.charAt(0) || 'U'}
                            </span>
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-xs lg:max-w-sm ${message.isUser ? 'order-1' : 'order-2'}`}>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              message.isUser
                                ? 'bg-monkeyGreen text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${message.isUser ? 'text-green-100' : 'text-gray-400'}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.hasAudio && !message.isUser && (
                                <Volume2 className="w-3 h-3 text-monkeyGreen" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start gap-3">
                        <div className="order-1 w-8 h-8 rounded-full bg-monkeyGreen flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="order-2 max-w-xs">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-monkeyGreen rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Input Interface */}
            {currentMode === 'text' ? (
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Ask me about deals, offers, or anything else..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isProcessing || !session?.user}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={!inputText.trim() || isProcessing || !session?.user}
                        className="bg-monkeyGreen hover:bg-monkeyGreen/90"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputText(action)}
                          className="text-xs hover:bg-monkeyGreen/10"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <VoiceInterface
                onTranscription={handleVoiceTranscription}
                onAudioResponse={() => {}}
                isProcessing={isProcessing}
              />
            )}
          </div>

          {/* Sidebar - Responsive positioning */}
          <div className={`space-y-4 ${isMobile ? 'order-2' : 'lg:col-span-1'}`}>
            
            {/* Smart Recommendations */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <TrendingUp className="w-4 h-4 text-monkeyGreen" />
                  <span>Smart Picks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.slice(0, isMobile ? 2 : 3).map((offer: any) => (
                  <div key={offer.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm line-clamp-2 flex-1 mr-2">{offer.title}</h4>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {offer.discount}%
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">{offer.store}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-monkeyGreen text-sm">₹{offer.price}</span>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                        <Heart className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
                
                {recommendations.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Save offers to get personalized recommendations!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Zap className="w-4 h-4 text-monkeyGreen" />
                  <span>AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Mic className="w-4 h-4 text-monkeyGreen flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">Voice Chat</p>
                    <p className="text-xs text-gray-600">Talk naturally with AI</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">Smart Search</p>
                    <p className="text-xs text-gray-600">Find deals with AI</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">Predictions</p>
                    <p className="text-xs text-gray-600">AI-powered insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIShoppingAssistant;
