
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  ThumbsUp, 
  Star, 
  ShoppingCart,
  Gift,
  TrendingUp,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SocialDeal {
  id: string;
  offerId: string;
  title: string;
  store: string;
  savings: string;
  sharedBy: {
    id: string;
    name: string;
    avatar?: string;
    level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  groupBuying?: {
    target: number;
    current: number;
    discount: string;
  };
  verificationScore: number;
  tags: string[];
  createdAt: Date;
}

interface GroupBuyingDeal {
  id: string;
  title: string;
  description: string;
  targetMembers: number;
  currentMembers: number;
  discount: string;
  timeLeft: string;
  organizer: string;
  participants: string[];
}

const SocialShoppingFeatures = () => {
  const [socialDeals, setSocialDeals] = useState<SocialDeal[]>([]);
  const [groupDeals, setGroupDeals] = useState<GroupBuyingDeal[]>([]);
  const [activeTab, setActiveTab] = useState<'social' | 'groups'>('social');
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    loadSocialData();
  }, [session]);

  const loadSocialData = async () => {
    try {
      setIsLoading(true);
      
      // Mock social deals data (in real app, this would come from Supabase)
      const mockSocialDeals: SocialDeal[] = [
        {
          id: '1',
          offerId: 'deal-1',
          title: 'iPhone 15 Pro Max - 15% off',
          store: 'Amazon',
          savings: '₹18,000',
          sharedBy: {
            id: 'user1',
            name: 'Priya Sharma',
            avatar: '/placeholder.svg',
            level: 'Gold'
          },
          likes: 45,
          comments: 12,
          isLiked: false,
          verificationScore: 95,
          tags: ['Electronics', 'Apple', 'Verified'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '2',
          offerId: 'deal-2',
          title: 'Nike Air Max - Buy 2 Get 1 Free',
          store: 'Myntra',
          savings: '₹4,999',
          sharedBy: {
            id: 'user2',
            name: 'Rahul Kumar',
            avatar: '/placeholder.svg',
            level: 'Silver'
          },
          likes: 32,
          comments: 8,
          isLiked: true,
          groupBuying: {
            target: 10,
            current: 7,
            discount: 'Extra 5% off'
          },
          verificationScore: 88,
          tags: ['Fashion', 'Shoes', 'Group Deal'],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        }
      ];

      const mockGroupDeals: GroupBuyingDeal[] = [
        {
          id: '1',
          title: 'MacBook Air M2 - Group Purchase',
          description: 'Get additional 8% off when we reach 15 members',
          targetMembers: 15,
          currentMembers: 11,
          discount: '8% extra off',
          timeLeft: '2 days',
          organizer: 'Anita Patel',
          participants: ['You', 'Priya S.', 'Rahul K.', '+8 others']
        },
        {
          id: '2',
          title: 'Premium Gym Supplements Bundle',
          description: 'Bulk order for premium supplements with group discount',
          targetMembers: 20,
          currentMembers: 16,
          discount: '25% off',
          timeLeft: '18 hours',
          organizer: 'Fitness Club Delhi',
          participants: ['Amit R.', 'Sarah M.', 'Dev P.', '+13 others']
        }
      ];

      setSocialDeals(mockSocialDeals);
      setGroupDeals(mockGroupDeals);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (dealId: string) => {
    try {
      const updatedDeals = socialDeals.map(deal => {
        if (deal.id === dealId) {
          return {
            ...deal,
            isLiked: !deal.isLiked,
            likes: deal.isLiked ? deal.likes - 1 : deal.likes + 1
          };
        }
        return deal;
      });
      setSocialDeals(updatedDeals);
      
      toast({
        title: "Deal " + (socialDeals.find(d => d.id === dealId)?.isLiked ? "unliked" : "liked"),
        description: "Your feedback helps the community!",
      });
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleShare = async (deal: SocialDeal) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: deal.title,
          text: `Check out this amazing deal: ${deal.savings} off!`,
          url: window.location.href
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${deal.title} - ${deal.savings} off! Check it out on OffersMonkey`);
        toast({
          title: "Link copied!",
          description: "Share this deal with your friends",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const joinGroupDeal = async (groupId: string) => {
    try {
      const updatedGroups = groupDeals.map(group => {
        if (group.id === groupId && group.currentMembers < group.targetMembers) {
          return {
            ...group,
            currentMembers: group.currentMembers + 1,
            participants: ['You', ...group.participants.filter(p => p !== 'You')]
          };
        }
        return group;
      });
      setGroupDeals(updatedGroups);
      
      toast({
        title: "Joined Group Deal!",
        description: "You'll get notified when the target is reached",
      });
    } catch (error) {
      console.error('Error joining group deal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-monkeyGreen animate-pulse" />
          <h2 className="text-lg font-semibold">Loading community deals...</h2>
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-monkeyGreen" />
          <h2 className="text-xl font-bold">Social Shopping</h2>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Community Driven
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'social' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('social')}
          className={activeTab === 'social' ? 'bg-monkeyGreen text-white' : ''}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Community Deals
        </Button>
        <Button
          variant={activeTab === 'groups' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('groups')}
          className={activeTab === 'groups' ? 'bg-monkeyGreen text-white' : ''}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Group Buying
        </Button>
      </div>

      {/* Social Deals Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          {socialDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={deal.sharedBy.avatar} />
                    <AvatarFallback>{deal.sharedBy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{deal.sharedBy.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {deal.sharedBy.level === 'Gold' && <Crown className="w-3 h-3 mr-1 text-yellow-500" />}
                        {deal.sharedBy.level}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {Math.floor((Date.now() - deal.createdAt.getTime()) / (1000 * 60 * 60))}h ago
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{deal.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">{deal.store}</Badge>
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                              Save {deal.savings}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{deal.verificationScore}%</span>
                        </div>
                      </div>
                      
                      {deal.groupBuying && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-800">Group Deal</span>
                            <span className="text-xs text-blue-600">
                              {deal.groupBuying.current}/{deal.groupBuying.target} joined
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${(deal.groupBuying.current / deal.groupBuying.target) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-700 mt-1 block">
                            {deal.groupBuying.discount} when target reached
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(deal.id)}
                          className={`text-xs ${deal.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          <ThumbsUp className={`w-4 h-4 mr-1 ${deal.isLiked ? 'fill-current' : ''}`} />
                          {deal.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {deal.comments}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(deal)}
                          className="text-xs text-gray-500"
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Button size="sm" className="bg-monkeyGreen hover:bg-green-700 text-white text-xs">
                        Get Deal
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Group Buying Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {groupDeals.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{group.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {group.timeLeft} left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {group.currentMembers}/{group.targetMembers} members
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {group.discount}
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-monkeyGreen h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(group.currentMembers / group.targetMembers) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500">Organized by: </span>
                    <span className="text-xs font-medium">{group.organizer}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500">Participants: </span>
                    <span className="text-xs">{group.participants.join(', ')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-monkeyGreen hover:bg-green-700 text-white"
                      onClick={() => joinGroupDeal(group.id)}
                      disabled={group.participants.includes('You')}
                    >
                      {group.participants.includes('You') ? 'Joined' : 'Join Group'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed border-2 border-monkeyGreen/30">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-monkeyGreen mx-auto mb-2" />
              <h4 className="font-medium mb-2">Start a Group Deal</h4>
              <p className="text-sm text-gray-600 mb-4">
                Found a great deal? Organize a group purchase to save even more!
              </p>
              <Button className="bg-monkeyGreen hover:bg-green-700 text-white">
                Create Group Deal
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SocialShoppingFeatures;
