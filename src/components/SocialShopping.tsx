
import React, { useState, useEffect } from 'react';
import { Users, Share2, Heart, MessageCircle, Star, Trophy, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';

const SocialShopping = () => {
  const [groupBuys, setGroupBuys] = useState([]);
  const [dealPosts, setDealPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newDealUrl, setNewDealUrl] = useState('');
  const isMobile = useIsMobile();
  const { user } = useUser();

  // Mock data for social features
  const mockGroupBuys = [
    {
      id: 1,
      title: "iPhone 15 Group Buy",
      description: "Get additional 5% off when 10 people join",
      currentParticipants: 7,
      targetParticipants: 10,
      pricePerPerson: "₹65,000",
      originalPrice: "₹68,000",
      savings: "₹3,000",
      endTime: "2 days left",
      organizer: "Priya Sharma",
      category: "Electronics"
    },
    {
      id: 2,
      title: "Bulk Grocery Purchase",
      description: "Organic groceries at wholesale prices",
      currentParticipants: 15,
      targetParticipants: 20,
      pricePerPerson: "₹2,500",
      originalPrice: "₹3,000",
      savings: "₹500",
      endTime: "5 days left",
      organizer: "Rahul Kumar",
      category: "Groceries"
    }
  ];

  const mockDealPosts = [
    {
      id: 1,
      user: "Anita Patel",
      avatar: "AP",
      dealTitle: "Amazing laptop deal at Flipkart",
      description: "Found this amazing laptop for just ₹35,000. Usually costs ₹45,000!",
      likes: 24,
      comments: 8,
      shares: 12,
      verified: true,
      rating: 4.5,
      timeAgo: "2 hours ago",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      user: "Vikram Singh",
      avatar: "VS",
      dealTitle: "Nike shoes 40% off",
      description: "Grabbed these for my morning runs. Great quality!",
      likes: 18,
      comments: 5,
      shares: 8,
      verified: true,
      rating: 5,
      timeAgo: "4 hours ago",
      image: "/placeholder.svg"
    }
  ];

  const mockLeaderboard = [
    { id: 1, name: "Priya Sharma", points: 1250, deals: 45, rank: 1, badge: "Deal Hunter" },
    { id: 2, name: "Rahul Kumar", points: 1180, deals: 42, rank: 2, badge: "Bargain Master" },
    { id: 3, name: "Anita Patel", points: 1050, deals: 38, rank: 3, badge: "Smart Saver" },
    { id: 4, name: "You", points: 890, deals: 32, rank: 4, badge: "Rising Star" }
  ];

  useEffect(() => {
    setGroupBuys(mockGroupBuys);
    setDealPosts(mockDealPosts);
    setLeaderboard(mockLeaderboard);
  }, []);

  const joinGroupBuy = (groupId) => {
    setGroupBuys(groupBuys.map(group => 
      group.id === groupId 
        ? { ...group, currentParticipants: group.currentParticipants + 1 }
        : group
    ));
  };

  const likeDealPost = (postId) => {
    setDealPosts(dealPosts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const shareDeal = (dealTitle) => {
    if (navigator.share) {
      navigator.share({
        title: dealTitle,
        text: `Check out this amazing deal I found on OffersMonkey!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${dealTitle} - Check it out on OffersMonkey!`);
      alert('Deal link copied to clipboard!');
    }
  };

  const submitDeal = () => {
    if (newDealUrl.trim()) {
      const newPost = {
        id: dealPosts.length + 1,
        user: user.name || "You",
        avatar: user.name ? user.name.split(' ').map(n => n[0]).join('') : "YU",
        dealTitle: "New deal shared",
        description: newDealUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        verified: false,
        rating: 0,
        timeAgo: "Just now",
        image: "/placeholder.svg"
      };
      setDealPosts([newPost, ...dealPosts]);
      setNewDealUrl('');
    }
  };

  return (
    <div className={`bg-monkeyBackground min-h-screen ${isMobile ? 'p-4 pb-20' : 'max-w-6xl mx-auto p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-monkeyGreen rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Shopping</h1>
            <p className="text-gray-600">Shop together, save together</p>
          </div>
        </div>
      </div>

      {/* Share a Deal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share a Deal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Input
              placeholder="Paste deal URL or describe the deal..."
              value={newDealUrl}
              onChange={(e) => setNewDealUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={submitDeal}
              className="bg-monkeyGreen hover:bg-monkeyG
              reen/90"
            >
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Group Buying */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Group Buying</span>
            <Badge variant="secondary">Save More Together</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {groupBuys.map((group) => (
              <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{group.title}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{group.category}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span>{group.currentParticipants}/{group.targetParticipants} people</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-monkeyGreen h-2 rounded-full" 
                      style={{ width: `${(group.currentParticipants / group.targetParticipants) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-monkeyGreen">{group.pricePerPerson}</p>
                      <p className="text-sm text-gray-500 line-through">{group.originalPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">Save {group.savings}</p>
                      <p className="text-xs text-gray-500">{group.endTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">By {group.organizer}</p>
                  <Button 
                    size="sm"
                    onClick={() => joinGroupBuy(group.id)}
                    disabled={group.currentParticipants >= group.targetParticipants}
                    className="bg-monkeyGreen hover:bg-monkeyGreen/90"
                  >
                    {group.currentParticipants >= group.targetParticipants ? 'Full' : 'Join Group'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Feed */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Community Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dealPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-monkeyGreen text-white rounded-full flex items-center justify-center font-semibold">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{post.user}</h4>
                      {post.verified && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{post.timeAgo}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="font-medium mb-1">{post.dealTitle}</h3>
                  <p className="text-gray-600 text-sm">{post.description}</p>
                  {post.rating > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{post.rating}/5</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => likeDealPost(post.id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                    <button 
                      onClick={() => shareDeal(post.dealTitle)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-monkeyGreen transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Community Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((member) => (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  member.name === 'You' ? 'bg-monkeyGreen/10 border border-monkeyGreen' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    member.rank === 1 ? 'bg-yellow-500' : 
                    member.rank === 2 ? 'bg-gray-400' : 
                    member.rank === 3 ? 'bg-orange-500' : 'bg-gray-300'
                  }`}>
                    <span className="text-white font-bold text-sm">#{member.rank}</span>
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.deals} deals shared</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-monkeyGreen">{member.points} pts</p>
                  <Badge variant="secondary" className="text-xs">{member.badge}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialShopping;
