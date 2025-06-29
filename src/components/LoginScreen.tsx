import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Check, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading: authLoading } = useAuth();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (session && !authLoading) {
      console.log("User already authenticated, redirecting to home");
      navigate('/home', { replace: true });
    }
  }, [navigate, session, authLoading]);

  const detectLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use a geocoding service to get location name from coordinates
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=demo&limit=1`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const locationName = data.results[0].components.country || 'Unknown Location';
              setLocation(locationName);
              setSignUpData(prev => ({ ...prev, location: locationName }));
              setLocationDetected(true);
              toast({
                title: "Location detected",
                description: `We've detected your location as ${locationName}`,
              });
            } else {
              // Fallback to India
              setLocation('India');
              setSignUpData(prev => ({ ...prev, location: 'India' }));
              setLocationDetected(true);
              toast({
                title: "Location detected",
                description: "We've detected your location as India",
              });
            }
          } catch (error) {
            // Fallback to India
            setLocation('India');
            setSignUpData(prev => ({ ...prev, location: 'India' }));
            setLocationDetected(true);
            toast({
              title: "Location detected",
              description: "We've detected your location as India",
            });
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          // Fallback to India
          setLocation('India');
          setSignUpData(prev => ({ ...prev, location: 'India' }));
          setLocationDetected(true);
          setIsLoading(false);
          toast({
            title: "Location detected",
            description: "We've detected your location as India",
          });
        }
      );
    } else {
      // Fallback to India
      setLocation('India');
      setSignUpData(prev => ({ ...prev, location: 'India' }));
      setLocationDetected(true);
      setIsLoading(false);
      toast({
        title: "Location detected",
        description: "We've detected your location as India",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Reset email sent",
        description: "Please check your email for password reset instructions",
      });
      
      setShowForgotPassword(false);
      setResetEmail('');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during password reset",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      navigate('/home', { replace: true });
      
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signUpData.name || signUpData.name.length < 2) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid name (at least 2 characters)",
        variant: "destructive",
      });
      return;
    }
    
    if (!signUpData.email || !signUpData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!signUpData.password || signUpData.password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }
    
    if (!signUpData.location) {
      toast({
        title: "Location required",
        description: "Please enter or detect your location",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
            phone: signUpData.phone,
            location: signUpData.location,
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
          setActiveTab('login');
          setEmail(signUpData.email);
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Account created successfully",
        description: "Please check your email to confirm your account, or you can login directly.",
      });
      
      // Try to sign in automatically
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: signUpData.email,
        password: signUpData.password
      });
      
      if (!signInError) {
        navigate('/home', { replace: true });
      } else {
        // Switch to login tab if auto-login fails
        setActiveTab('login');
        setEmail(signUpData.email);
        setPassword(signUpData.password);
      }
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spring-green-500 via-spring-green-400 to-spring-green-600">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-spring-green-500 via-spring-green-400 to-spring-green-600">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce p-2">
          <img 
            src="https://offersmonkey.com/favicon.ico" 
            alt="OffersMonkey Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome to MonkeyOffers</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset Password</h3>
                  <p className="text-sm text-gray-600">Enter your email address and we'll send you a reset link</p>
                </div>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-spring-green-600 hover:bg-spring-green-700"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Login
                  </Button>
                </form>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-spring-green-600 hover:text-spring-green-700 underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-spring-green-600 hover:bg-spring-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signUpData.name}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Phone Number (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-700">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700">Location</Label>
                      <div className="flex gap-2">
                        <Input
                          id="location"
                          placeholder="Your location"
                          value={signUpData.location}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, location: e.target.value }))}
                          className="h-12 flex-1"
                          readOnly={locationDetected}
                          required
                        />
                        <Button 
                          type="button"
                          onClick={detectLocation}
                          className="bg-spring-green-600 hover:bg-spring-green-700"
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
                      className="w-full h-12 bg-spring-green-600 hover:bg-spring-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center p-4 text-white">
        <p className="text-xs opacity-75">By continuing, you agree to our Terms and Privacy Policy</p>
      </div>
    </div>
  );
};

export default LoginScreen;
