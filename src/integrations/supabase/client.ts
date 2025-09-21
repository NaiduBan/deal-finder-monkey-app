// Complete mock replacement for Supabase client
import { apiService } from '@/services';

// Mock Supabase client that provides the same interface
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const result = await apiService.auth.signIn(email, password);
      if (result.success) {
        localStorage.setItem('mock-user', JSON.stringify(result.user));
        return {
          data: { user: result.user, session: result.session },
          error: null
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: result.error }
      };
    },
    
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      const name = options?.data?.name || email.split('@')[0];
      const result = await apiService.auth.signUp(email, password, name);
      if (result.success) {
        localStorage.setItem('mock-user', JSON.stringify(result.user));
        return {
          data: { user: result.user, session: result.session },
          error: null
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: result.error }
      };
    },
    
    signOut: async () => {
      localStorage.removeItem('mock-user');
      await apiService.auth.signOut();
      return { error: null };
    },
    
    getSession: async () => {
      const result = await apiService.auth.getSession();
      return {
        data: { session: result.session, user: result.user },
        error: null
      };
    },

    resetPasswordForEmail: async (email: string, options?: any) => {
      // Mock password reset
      return { data: {}, error: null };
    },

    onAuthStateChange: (callback: Function) => {
      // Mock auth state change listener
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  
  from: (table: string) => {
    const createQueryBuilder = () => ({
      data: [],
      error: null,
      count: 0,
      select: (columns?: string) => createQueryBuilder(),
      eq: (column: string, value: any) => createQueryBuilder(),
      neq: (column: string, value: any) => createQueryBuilder(),
      not: (column: string, operator: string, value: any) => createQueryBuilder(),
      order: (column: string, options?: any) => createQueryBuilder(),
      or: (query: string) => createQueryBuilder(),
      ilike: (column: string, pattern: string) => createQueryBuilder(),
      in: (column: string, values: any[]) => createQueryBuilder(),
      limit: (count: number) => createQueryBuilder(),
      insert: (data: any) => createQueryBuilder(),
      update: (data: any) => ({
        ...createQueryBuilder(),
        eq: (column: string, value: any) => createQueryBuilder()
      }),
      upsert: (data: any) => createQueryBuilder(),
      delete: () => ({
        ...createQueryBuilder(),
        eq: (column: string, value: any) => createQueryBuilder()
      }),
      single: () => createQueryBuilder()
    });

    return createQueryBuilder();
  },
  
  rpc: (functionName: string, params?: any) => ({
    data: null,
    error: null
  }),

  functions: {
    invoke: async (functionName: string, options?: any) => {
      // Mock function calls
      if (functionName === 'chat-with-ai') {
        const message = options?.body?.message || '';
        const result = await apiService.ai.chat(message);
        return {
          data: { response: result.response, offers: result.offers, showOnlyCards: result.showOnlyCards, audioContent: result.audioContent },
          error: null
        };
      }
      
      if (functionName === 'text-to-speech') {
        // Mock TTS - return a mock audio URL
        return {
          data: { audioUrl: 'data:audio/wav;base64,mock-audio-data', audioContent: 'mock-audio-content' },
          error: null
        };
      }
      
      if (functionName === 'voice-to-text') {
        // Mock STT - return mock text
        return {
          data: { text: 'Hello, this is mock voice recognition' },
          error: null
        };
      }
      
      return { data: null, error: null };
    }
  },

  channel: (channelName: string) => ({
    on: (event: string, callback: Function) => ({
      subscribe: (callback?: Function) => ({}),
      unsubscribe: () => ({})
    }),
    subscribe: (callback?: Function) => ({}),
    unsubscribe: () => ({}),
    removeChannel: () => ({})
  }),

  removeChannel: () => ({})
};