
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Check, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const detectLocation = () => {
    setIsLoading(true);
    
    // Simulate location detection
    setTimeout(() => {
      setLocation('India');
      setLocationDetected(true);
      setIsLoading(false);
      toast({
        title: "Location detected",
        description: "We've detected your location as India",
      });
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters",
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
    
    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              location,
            }
          }
        });
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully. Please check your email for verification.",
        });
        
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // If we get here, authentication was successful
      setIsLoading(false);
      navigate('/home');
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSkipLogin = () => {
    navigate('/home');
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
            <label htmlFor="email" className="text-white">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className="bg-white/90 h-12 pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-white">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className="bg-white/90 h-12 pl-10"
              />
            </div>
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
            {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white underline text-sm"
            >
              {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}
            </button>
          </div>
          
          <Button 
            type="button"
            variant="outline"
            onClick={handleSkipLogin}
            className="w-full h-12 bg-transparent border border-white text-white hover:bg-white/10"
          >
            Skip Login
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
