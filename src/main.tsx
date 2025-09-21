import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { DataProvider } from '@/contexts/DataContext'
import { UserProvider } from '@/contexts/UserContext'
import { MockAuthProvider } from '@/contexts/MockAuthContext'
import { MockAdminProvider } from '@/contexts/MockAdminContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        <MockAdminProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <DataProvider>
              <UserProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </UserProvider>
            </DataProvider>
          </ThemeProvider>
        </MockAdminProvider>
      </MockAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);