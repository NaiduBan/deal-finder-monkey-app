import React, { useState, useEffect } from 'react';
import { Users, Share2, Heart, MessageCircle, Star, Trophy, Gift, Clock, MapPin, Tag, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroupBuy {
  id: number;
  title: string;
  description: string;
  currentParticipants: number;
  targetParticipants: number;
  pricePerPerson: string;
  originalPrice: string;
  savings: string;
  endTime: string;
  organizer: string;
  category: string;
  location: string;
  imageUrl: string;
  tags: string[];
  isJoined: boolean;
}

interface DealPost {
  id: number;
  user: string;
  avatar: string;
  dealTitle: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  verified: boolean;
  rating: number;
  timeAgo: string;
  image: string;
  store: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  category: string;
  isLiked: boolean;
}

interface LeaderboardMember {
  id: number;
  name: string;
  points: number;
  deals: number;
  rank: number;
  badge: string;
  avatar: string;
  savings: string;
  level: string;
}

const SocialShopping = () => {
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
  const [dealPosts, setDealPosts] = useState<DealPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]);
  const [newDealUrl, setNewDealUrl] = useState('');
  const [activeTab, setActiveTab] = useState('community');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { toast } = useToast();

  // Enhanced mock data with more realistic content
  const mockGroupBuys: GroupBuy[] = [
    {
      id: 1,
      title: "iPhone 15 Pro Group Buy",
      description: "Get additional 8% off when 15 people join. Original Apple warranty included.",
      currentParticipants: 12,
      targetParticipants: 15,
      pricePerPerson: "₹1,15,000",
      originalPrice: "₹1,25,000",
      savings: "₹10,000",
      endTime: "2 days 14 hours left",
      organizer: "Priya Sharma",
      category: "Electronics",
      location: "Mumbai, Delhi NCR",
      imageUrl: "/placeholder.svg",
      tags: ["Premium", "Apple", "Latest"],
      isJoined: false
    },
    {
      id: 2,
      title: "Bulk Organic Grocery Purchase",
      description: "Premium organic groceries at wholesale prices. Direct from farms.",
      currentParticipants: 18,
      targetParticipants: 25,
      pricePerPerson: "₹2,200",
      originalPrice: "₹3,200",
      savings: "₹1,000",
      endTime: "4 days 8 hours left",
      organizer: "Rahul Kumar",
      category: "Groceries",
      location: "Bangalore, Hyderabad",
      imageUrl: "/placeholder.svg",
      tags: ["Organic", "Fresh", "Bulk"],
      isJoined: true
    },
    {
      id: 3,
      title: "Designer Sneakers Collection",
      description: "Limited edition Nike & Adidas sneakers. Authentic guaranteed.",
      currentParticipants: 8,
      targetParticipants: 12,
      pricePerPerson: "₹8,500",
      originalPrice: "₹11,000",
      savings: "₹2,500",
      endTime: "1 day 6 hours left",
      organizer: "Anjali Patel",
      category: "Fashion",
      location: "Pan India",
      imageUrl: "/placeholder.svg",
      tags: ["Designer", "Limited", "Authentic"],
      isJoined: false
    }
  ];

  const mockDealPosts: DealPost[] = [
    {
      id: 1,
      user: "Anita Patel",
      avatar: "AP",
      dealTitle: "MacBook Air M3 - Lowest Price Ever!",
      description: "Found this amazing deal at Flipkart. Usually costs ₹1,15,000. Grabbed it for ₹95,000! Use code APPLE15 for extra cashback.",
      likes: 247,
      comments: 34,
      shares: 89,
      verified: true,
      rating: 4.8,
      timeAgo: "2 hours ago",
      image: "/placeholder.svg",
      store: "Flipkart",
      originalPrice: "₹1,15,000",
      discountedPrice: "₹95,000",
      discount: "17% OFF",
      category: "Electronics",
      isLiked: false
    },
    {
      id: 2,
      user: "Vikram Singh",
      avatar: "VS",
      dealTitle: "Nike Air Max 270 - Flash Sale",
      description: "Incredible 60% off on Nike shoes! Perfect for running and casual wear. Size 7-11 available.",
      likes: 189,
      comments: 23,
      shares: 56,
      verified: true,
      rating: 4.6,
      timeAgo: "4 hours ago",
      image: "/placeholder.svg",
      store: "Myntra",
      originalPrice: "₹12,995",
      discountedPrice: "₹5,200",
      discount: "60% OFF",
      category: "Fashion",
      isLiked: true
    },
    {
      id: 3,
      user: "Meera Joshi",
      avatar: "MJ",
      dealTitle: "Samsung 55\" 4K Smart TV Deal",
      description: "Amazing price drop on Samsung Neo QLED TV. Crystal clear picture quality. Perfect for movie nights!",
      likes: 156,
      comments: 19,
      shares: 41,
      verified: false,
      rating: 4.4,
      timeAgo: "6 hours ago",
      image: "/placeholder.svg",
      store: "Amazon",
      originalPrice: "₹85,000",
      discountedPrice: "₹58,000",
      discount: "32% OFF",
      category: "Electronics",
      isLiked: false
    }
  ];

  const mockLeaderboard: LeaderboardMember[] = [
    { id: 1, name: "Priya Sharma", points: 15420, deals: 89, rank: 1, badge: "Deal Ninja", avatar: "PS", savings: "₹2,45,000", level: "Platinum" },
    { id: 2, name: "Rahul Kumar", points: 13890, deals: 76, rank: 2, badge: "Bargain Master", avatar: "RK", savings: "₹1,98,000", level: "Gold" },
    { id: 3, name: "Anita Patel", points: 12750, deals: 68, rank: 3, badge: "Smart Saver", avatar: "AP", savings: "₹1,76,000", level: "Gold" },
    { id: 4, name: "Vikram Singh", points: 11200, deals: 54, rank: 4, badge: "Deal Hunter", avatar: "VS", savings: "₹1,34,000", level: "Silver" },
    { id: 5, name: "You", points: 8950, deals: 42, rank: 5, badge: "Rising Star", avatar: "YU", savings: "₹98,000", level: "Silver" }
  ];

  useEffect(() => {
    // Simulate real-time data loading
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroupBuys(mockGroupBuys);
      setDealPosts(mockDealPosts);
      setLeaderboard(mockLeaderboard);
      setIsLoading(false);
    };

    loadData();

    // Set up real-time updates simulation
    const interval = setInterval(() => {
      // Simulate real-time updates to group buys
      setGroupBuys(prevBuys => 
        prevBuys.map(buy => ({
          ...buy,
          currentParticipants: Math.min(buy.currentParticipants + Math.random() > 0.8 ? 1 : 0, buy.targetParticipants)
        }))
      );

      // Simulate real-time updates to deal posts
      setDealPosts(prevPosts => 
        prevPosts.map(post => ({
          ...post,
          likes: post.likes + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0),
          comments: post.comments + (Math.random() > 0.9 ? 1 : 0)
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const joinGroupBuy = (groupId: number) => {
    setGroupBuys(groupBuys.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            currentParticipants: Math.min(group.currentParticipants + 1, group.targetParticipants),
            isJoined: true
          }
        : group
    ));
    
    toast({
      title: "Successfully joined!",
      description: "You've joined the group buy. You'll be notified about updates.",
    });
  };

  const likeDealPost = (postId: number) => {
    setDealPosts(dealPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          }
        : post
    ));
  };

  const shareDeal = async (deal: DealPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: deal.dealTitle,
          text: `Amazing deal: ${deal.dealTitle} at ${deal.store} for just ${deal.discountedPrice}!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(
          `${deal.dealTitle} at ${deal.store} for ${deal.discountedPrice}. Check it out on our app!`
        );
        toast({
          title: "Link copied!",
          description: "Deal link has been copied to clipboard.",
        });
      }
      
      // Update share count
      setDealPosts(dealPosts.map(post => 
        post.id === deal.id ? { ...post, shares: post.shares + 1 } : post
      ));
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const submitDeal = () => {
    if (newDealUrl.trim()) {
      const newPost: DealPost = {
        id: dealPosts.length + 1,
        user: user.name || "You",
        avatar: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "YU",
        dealTitle: "New deal shared",
        description: newDealUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        verified: false,
        rating: 0,
        timeAgo: "Just now",
        image: "/placeholder.svg",
        store: "Unknown",
        originalPrice: "₹0",
        discountedPrice: "₹0",
        discount: "0% OFF",
        category: "General",
        isLiked: false
      };
      setDealPosts([newPost, ...dealPosts]);
      setNewDealUrl('');
      
      toast({
        title: "Deal shared!",
        description: "Your deal has been shared with the community.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'flex justify-center items-center p-8'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-monkeyGreen"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'flex justify-center px-8 py-10'}`}>
      <div className={`${isMobile ? '' : 'w-full max-w-6xl flex flex-col gap-8'}`}>
        {/* Header */}
        <div className={`${isMobile ? 'mb-6' : 'mb-8 flex items-center space-x-3'}`}>
          <div className="w-12 h-12 bg-gradient-to-r from-monkeyGreen to-green-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Shopping</h1>
            <p className="text-gray-600">Shop together, save more together</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`${isMobile ? 'grid grid-cols-3 gap-4 mb-6' : 'flex gap-6 mb-8'}`}>
          <Card className="text-center flex-1">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-monkeyGreen">1.2K+</div>
              <div className="text-sm text-gray-600">Active Groups</div>
            </CardContent>
          </Card>
          <Card className="text-center flex-1">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-monkeyGreen">₹45L+</div>
              <div className="text-sm text-gray-600">Total Savings</div>
            </CardContent>
          </Card>
          <Card className="text-center flex-1">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-monkeyGreen">8.5K+</div>
              <div className="text-sm text-gray-600">Members</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className={isMobile ? "mb-6" : "mb-12"}>
          <TabsList className={isMobile ? "grid w-full grid-cols-3" : "flex w-full"}>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="groups">Group Buys</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className={`${isMobile ? "space-y-4" : "space-y-8"}`}>
            {/* Share a Deal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5" />
                  <span>Share a Deal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Paste deal URL or describe the amazing deal you found..."
                    value={newDealUrl}
                    onChange={(e) => setNewDealUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={submitDeal}
                    className="bg-monkeyGreen hover:bg-monkeyGreen/90"
                  >
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Community Feed */}
            <div className={`space-y-4 ${isMobile ? '' : 'grid grid-cols-2 gap-6'}`}>
              {dealPosts.map((post, idx) => (
                <div key={post.id} className={isMobile ? '' : 'col-span-1'}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-monkeyGreen text-white font-semibold">
                            {post.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{post.user}</h4>
                            {post.verified && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {post.timeAgo}
                          </p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">{post.category}</Badge>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-lg mb-2">{post.dealTitle}</h3>
                        <p className="text-gray-700 mb-3">{post.description}</p>
                        
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-green-100 text-green-800 font-bold">
                              {post.discount}
                            </Badge>
                            <div>
                              <div className="text-xl font-bold text-monkeyGreen">{post.discountedPrice}</div>
                              <div className="text-sm text-gray-500 line-through">{post.originalPrice}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-600">at {post.store}</div>
                            {post.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{post.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t pt-3">
                        <div className="flex space-x-6">
                          <button 
                            onClick={() => likeDealPost(post.id)}
                            className={`flex items-center space-x-2 transition-colors ${
                              post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span className="font-medium">{post.likes}</span>
                          </button>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MessageCircle className="w-5 h-5" />
                            <span>{post.comments}</span>
                          </div>
                          <button 
                            onClick={() => shareDeal(post)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-monkeyGreen transition-colors"
                          >
                            <Share2 className="w-5 h-5" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                        <Button size="sm" className="bg-monkeyGreen hover:bg-monkeyGreen/90">
                          View Deal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups" className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'}`}>
            {groupBuys.map((group) => (
              <div key={group.id} className={isMobile ? '' : 'col-span-1'}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold">{group.title}</h3>
                          {group.isJoined && (
                            <Badge className="bg-green-100 text-green-800">Joined</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{group.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {group.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{group.category}</Badge>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress: {group.currentParticipants}/{group.targetParticipants} people</span>
                          <span className="text-monkeyGreen font-medium">
                            {Math.round((group.currentParticipants / group.targetParticipants) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(group.currentParticipants / group.targetParticipants) * 100} 
                          className="h-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-monkeyGreen">{group.pricePerPerson}</div>
                          <div className="text-sm text-gray-500 line-through">{group.originalPrice}</div>
                          <div className="text-sm font-medium text-green-600">Save {group.savings}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {group.endTime}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {group.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-xs">
                            {group.organizer.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Organized by</p>
                          <p className="text-xs text-gray-600">{group.organizer}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => joinGroupBuy(group.id)}
                        disabled={group.currentParticipants >= group.targetParticipants || group.isJoined}
                        className="bg-monkeyGreen hover:bg-monkeyGreen/90"
                      >
                        {group.currentParticipants >= group.targetParticipants ? 'Full' : 
                         group.isJoined ? 'Joined' : 'Join Group'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="leaderboard" className={isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'}>
            <div className={isMobile ? '' : 'col-span-2'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Top Deal Hunters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard.map((member) => (
                      <div 
                        key={member.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          member.name === 'You' 
                            ? 'bg-gradient-to-r from-monkeyGreen/10 to-green-50 border-monkeyGreen shadow-md' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            member.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                            member.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                            member.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}>
                            #{member.rank}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-monkeyGreen text-white font-semibold">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-lg">{member.name}</p>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                {member.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{member.deals} deals shared</p>
                            <p className="text-xs text-green-600 font-medium">Total saved: {member.savings}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-monkeyGreen">{member.points.toLocaleString()}</p>
                          <Badge variant="secondary" className="text-xs">{member.badge}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialShopping;
