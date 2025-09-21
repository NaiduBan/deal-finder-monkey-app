import { Offer, Category, BannerItem, DealPost, LeaderboardMember } from "@/types";
import { mockOffers, mockCategories, mockBanners } from "@/mockData";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage in memory
let mockUserProfiles: any[] = [];
let mockSavedOffers: { userId: string; offerId: string }[] = [];
let mockUserPreferences: { userId: string; preferenceType: string; preferenceId: string }[] = [];
let mockNotifications: any[] = [];
let mockAdminUsers = [
  {
    id: 'admin-1',
    email: 'admin@monkeyoffers.com',
    password: 'AdminMonkey123!',
    name: 'Admin User',
    role: 'admin',
    isActive: true
  }
];
let mockAdminSessions: { adminId: string; token: string; expiresAt: Date }[] = [];

// Categories API
export async function fetchCategories(): Promise<Category[]> {
  await delay(500);
  return mockCategories;
}

// Offers API
export async function fetchOffers(): Promise<Offer[]> {
  await delay(800);
  return mockOffers;
}

export async function searchOffers(query: string): Promise<Offer[]> {
  await delay(400);
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return mockOffers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm) ||
    offer.description.toLowerCase().includes(searchTerm) ||
    offer.store.toLowerCase().includes(searchTerm) ||
    offer.category.toLowerCase().includes(searchTerm)
  );
}

// User Profiles API
export async function fetchUserProfile(userId: string): Promise<any> {
  await delay(300);
  return mockUserProfiles.find(profile => profile.id === userId) || null;
}

export async function upsertUserProfile(profileData: any): Promise<any> {
  await delay(400);
  const existingIndex = mockUserProfiles.findIndex(p => p.id === profileData.id);
  
  if (existingIndex >= 0) {
    mockUserProfiles[existingIndex] = { ...mockUserProfiles[existingIndex], ...profileData };
    return mockUserProfiles[existingIndex];
  } else {
    const newProfile = { ...profileData, created_at: new Date().toISOString() };
    mockUserProfiles.push(newProfile);
    return newProfile;
  }
}

// Saved Offers API
export async function fetchUserSavedOffers(userId: string): Promise<string[]> {
  await delay(300);
  return mockSavedOffers
    .filter(item => item.userId === userId)
    .map(item => item.offerId);
}

export async function saveOfferForUser(userId: string, offerId: string): Promise<boolean> {
  await delay(400);
  const exists = mockSavedOffers.some(item => item.userId === userId && item.offerId === offerId);
  if (!exists) {
    mockSavedOffers.push({ userId, offerId });
  }
  return true;
}

export async function unsaveOfferForUser(userId: string, offerId: string): Promise<boolean> {
  await delay(400);
  mockSavedOffers = mockSavedOffers.filter(
    item => !(item.userId === userId && item.offerId === offerId)
  );
  return true;
}

// User Preferences API
export async function fetchUserPreferences(userId: string, preferenceType?: string): Promise<any[]> {
  await delay(300);
  let preferences = mockUserPreferences.filter(pref => pref.userId === userId);
  if (preferenceType && preferenceType !== 'all') {
    preferences = preferences.filter(pref => pref.preferenceType === preferenceType);
  }
  return preferences;
}

export async function saveUserPreference(userId: string, preferenceType: string, preferenceId: string): Promise<boolean> {
  await delay(400);
  const exists = mockUserPreferences.some(
    pref => pref.userId === userId && pref.preferenceType === preferenceType && pref.preferenceId === preferenceId
  );
  if (!exists) {
    mockUserPreferences.push({ userId, preferenceType, preferenceId });
  }
  return true;
}

export async function removeUserPreference(userId: string, preferenceType: string, preferenceId: string): Promise<boolean> {
  await delay(400);
  mockUserPreferences = mockUserPreferences.filter(
    pref => !(pref.userId === userId && pref.preferenceType === preferenceType && pref.preferenceId === preferenceId)
  );
  return true;
}

export async function removeAllUserPreferencesOfType(userId: string, preferenceType: string): Promise<boolean> {
  await delay(400);
  mockUserPreferences = mockUserPreferences.filter(
    pref => !(pref.userId === userId && pref.preferenceType === preferenceType)
  );
  return true;
}

// Banners API
export async function fetchBanners(): Promise<BannerItem[]> {
  await delay(300);
  return mockBanners;
}

// Admin Authentication API
export async function authenticateAdmin(email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
  await delay(500);
  
  const admin = mockAdminUsers.find(user => 
    user.email === email && 
    user.password === password && 
    user.isActive
  );
  
  if (!admin) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  const sessionToken = Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  mockAdminSessions.push({
    adminId: admin.id,
    token: sessionToken,
    expiresAt
  });
  
  return {
    success: true,
    data: {
      admin_id: admin.id,
      admin_name: admin.name,
      admin_email: admin.email,
      admin_role: admin.role,
      session_token: sessionToken
    }
  };
}

export async function verifyAdminSession(token: string): Promise<any> {
  await delay(200);
  
  const session = mockAdminSessions.find(s => s.token === token && s.expiresAt > new Date());
  if (!session) return null;
  
  const admin = mockAdminUsers.find(u => u.id === session.adminId);
  if (!admin) return null;
  
  return {
    admin_id: admin.id,
    admin_name: admin.name,
    admin_email: admin.email,
    admin_role: admin.role
  };
}

// Mock authentication functions
export async function mockSignIn(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  await delay(1000);
  
  // Mock successful login for any email/password combination
  const mockUser = {
    id: `user-${Math.random().toString(36).substring(2, 15)}`,
    email,
    user_metadata: {
      name: email.split('@')[0],
      avatar_url: ''
    }
  };
  
  return { success: true, user: mockUser };
}

export async function mockSignUp(email: string, password: string, metadata?: any): Promise<{ success: boolean; user?: any; error?: string }> {
  await delay(1000);
  
  const mockUser = {
    id: `user-${Math.random().toString(36).substring(2, 15)}`,
    email,
    user_metadata: {
      name: metadata?.name || email.split('@')[0],
      avatar_url: metadata?.avatar_url || ''
    }
  };
  
  return { success: true, user: mockUser };
}

export async function mockSignOut(): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

// Social features mock data
export async function fetchSocialDealPosts(): Promise<DealPost[]> {
  await delay(600);
  return [];
}

export async function fetchSocialLeaderboard(): Promise<LeaderboardMember[]> {
  await delay(600);
  return [];
}

// Apply preferences to offers (mock implementation)
export function applyPreferencesToOffers(offers: Offer[], preferences: {[key: string]: string[]}): Offer[] {
  if (!preferences || Object.keys(preferences).length === 0) {
    return offers;
  }
  
  return offers.filter(offer => {
    // Filter by categories if preferences exist
    if (preferences.categories && preferences.categories.length > 0) {
      return preferences.categories.some(cat => 
        offer.category.toLowerCase().includes(cat.toLowerCase())
      );
    }
    
    // Filter by stores if preferences exist
    if (preferences.stores && preferences.stores.length > 0) {
      return preferences.stores.some(store => 
        offer.store.toLowerCase().includes(store.toLowerCase())
      );
    }
    
    return true;
  });
}