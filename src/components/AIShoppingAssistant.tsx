
import React, { useState, useEffect } from 'react';
import { Bot, Mic, MicOff, Bell, TrendingUp, Search, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const AIShoppingAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [voiceText, setVoiceText] = useState('');
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { offers } = useData();

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        setSearchQuery(transcript);
        handleVoiceSearch(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      if (isListening) {
        recognition.start();
      }

      return () => {
        recognition.stop();
      };
    }
  }, [isListening]);

  // Generate AI recommendations based on user behavior
  useEffect(() => {
    const generateRecommendations = () => {
      if (offers && offers.length > 0) {
        // Simple ML-like algorithm based on user's saved offers and browsing patterns
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
        ).slice(0, 5);

        setRecommendations(recommended);
      }
    };

    generateRecommendations();
  }, [offers, user.savedOffers]);

  const handleVoiceSearch = (query: string) => {
    console.log('Voice search:', query);
    // Implement voice-based deal discovery logic here
  };

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening);
  };

  const createPriceAlert = (offerId: string) => {
    const newAlert = {
      id: Date.now(),
      offerId,
      createdAt: new Date(),
      threshold: 'any_price_drop'
    };
    setPriceAlerts([...priceAlerts, newAlert]);
  };

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'max-w-6xl mx-auto p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-monkeyGreen rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Shopping Assistant</h1>
            <p className="text-gray-600">Your personal deal finder powered by AI</p>
          </div>
        </div>
      </div>

      {/* Voice Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Voice Deal Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                placeholder="Say something like 'Find me laptop deals under 50000'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              {voiceText && (
                <p className="text-sm text-gray-600">Heard: "{voiceText}"</p>
              )}
            </div>
            <Button
              onClick={toggleVoiceRecognition}
              variant={isListening ? "destructive" : "default"}
              className={isListening ? "bg-red-500 hover:bg-red-600" : "bg-monkeyGreen hover:bg-monkeyGreen/90"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Smart Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
            {recommendations.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{offer.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {offer.discount}% off
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2">{offer.store}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-monkeyGreen">₹{offer.price}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createPriceAlert(offer.id)}
                    className="text-xs"
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    Alert
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Start saving offers to get personalized recommendations!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Active Price Alerts</span>
            <Badge variant="secondary">{priceAlerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceAlerts.length > 0 ? (
            <div className="space-y-3">
              {priceAlerts.map((alert: any) => (
                <div key={alert.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Price alert active</p>
                    <p className="text-sm text-gray-600">Created {alert.createdAt.toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active price alerts. Create one from recommendations above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIShoppingAssistant;
