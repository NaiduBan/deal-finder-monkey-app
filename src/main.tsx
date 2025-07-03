
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Clean up any stale localStorage data that might cause conflicts
const cleanupLocalStorage = () => {
  try {
    // Check for stale auth tokens
    const authTokens = [
      'supabase.auth.token',
      'sb-vtxtnyivbmvcmxuuqknn-auth-token'
    ];
    
    authTokens.forEach(key => {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const parsed = JSON.parse(token);
          // If token is expired or invalid, remove it
          if (!parsed || !parsed.access_token || !parsed.expires_at) {
            localStorage.removeItem(key);
          } else {
            const expiresAt = new Date(parsed.expires_at * 1000);
            if (expiresAt < new Date()) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
};

// Run cleanup before initializing app
cleanupLocalStorage();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
