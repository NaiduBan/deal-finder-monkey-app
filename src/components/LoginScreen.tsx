
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const detectLocation = () => {
    setIsLoading(true);
    
    // Simulate location detection
    setTimeout(() => {
      setLocation('San Francisco, CA');
      setLocationDetected(true);
      setIsLoading(false);
      toast({
        title: "Location detected",
        description: "We've detected your location as San Francisco, CA",
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    if (!location) {
      toast({
        title: "Location required",
        description: "Please enter or detect your location",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigate('/home');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-monkeyGreen via-monkeyGreen-light to-monkeyBackground">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
          <span className="text-4xl">🐵</span>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">Welcome!</h1>
        <p className="text-white text-sm mb-8">Enter your details to continue</p>
        
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-white">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (000) 000-0000"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="bg-white/90 h-12"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-white">Location</label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Your location"
                value={location}
                onChange={handleLocationChange}
                className="bg-white/90 h-12 flex-1"
                readOnly={locationDetected}
              />
              <Button 
                type="button"
                onClick={detectLocation}
                className="bg-white text-monkeyGreen hover:bg-white/90"
                disabled={isLoading || locationDetected}
              >
                {locationDetected ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 monkey-button"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Continue'}
          </Button>
        </form>
      </div>
      
      <div className="text-center p-4 text-monkeyGreen">
        <p className="text-xs">By continuing, you agree to our Terms and Privacy Policy</p>
      </div>
    </div>
  );
};

export default LoginScreen;
