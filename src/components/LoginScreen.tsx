
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Check, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from '@/components/ui/label';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("User already authenticated, redirecting to home");
          navigate('/home');
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setAuthChecked(true);
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
    
    // Location is only required for sign up
    if (isSignUp && !location) {
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
        // First check if user already exists
        const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!checkError && existingUser?.user) {
          // User already exists, show message and switch to login
          toast({
            title: "Account exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
          setIsSignUp(false);
          setIsLoading(false);
          return;
        }
        
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
          if (error.message.includes('already') || error.message.includes('exists')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        
        // Automatically log in after sign up
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          toast({
            title: "Login failed after signup",
            description: "Account created but couldn't log you in automatically. Please login manually.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Successfully signed up and logged in
        navigate('/home');
        
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. If you don't have an account, please sign up.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
          setIsLoading(false);
          return;
        }
        
        // If we get here, authentication was successful
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        navigate('/home');
      }
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipLogin = () => {
    navigate('/home');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-monkeyGreen via-monkeyGreen-light to-monkeyBackground">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-monkeyGreen via-monkeyGreen-light to-monkeyBackground">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
          <span className="text-4xl">🐵</span>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">{isSignUp ? "Create Account" : "Welcome Back!"}</h1>
        <p className="text-white text-sm mb-8">{isSignUp ? "Sign up to get started" : "Enter your details to login"}</p>
        
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
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
            <Label htmlFor="password" className="text-white">Password</Label>
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
          
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Location</Label>
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
          )}
          
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
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
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
      
      <div className="text-center p-4 text-white">
        <p className="text-xs">By continuing, you agree to our Terms and Privacy Policy</p>
      </div>
    </div>
  );
};

export default LoginScreen;
