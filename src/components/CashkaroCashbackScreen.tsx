
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const CashkaroCashbackScreen = () => {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const periods = ['This Week', 'This Month', 'Last Month', 'Last 3 Months'];

  const cashbackStats = {
    totalEarned: '₹12,450',
    thisMonth: '₹2,850',
    pending: '₹1,200',
    withdrawn: '₹11,250'
  };

  const recentTransactions = [
    {
      id: 1,
      store: 'Amazon',
      amount: '₹450',
      cashback: '₹11.25',
      status: 'Confirmed',
      date: '2 days ago',
      logo: '🛒',
      color: 'bg-orange-100'
    },
    {
      id: 2,
      store: 'Flipkart',
      amount: '₹1,200',
      cashback: '₹36',
      status: 'Pending',
      date: '5 days ago',
      logo: '🛍️',
      color: 'bg-blue-100'
    },
    {
      id: 3,
      store: 'Myntra',
      amount: '₹800',
      cashback: '₹32',
      status: 'Confirmed',
      date: '1 week ago',
      logo: '👕',
      color: 'bg-pink-100'
    },
    {
      id: 4,
      store: 'Nykaa',
      amount: '₹600',
      cashback: '₹36',
      status: 'Confirmed',
      date: '1 week ago',
      logo: '💄',
      color: 'bg-rose-100'
    },
    {
      id: 5,
      store: 'Swiggy',
      amount: '₹250',
      cashback: '₹20',
      status: 'Pending',
      date: '2 weeks ago',
      logo: '🍔',
      color: 'bg-orange-100'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`bg-gray-50 min-h-screen ${isMobile ? 'pb-16' : 'pt-20'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : 'px-4'} py-8`}>
          <h1 className="text-2xl font-bold mb-2">My Cashback</h1>
          <p className="opacity-90">Track your earnings and withdrawals</p>
        </div>
      </div>

      <div className={`${!isMobile ? 'max-w-7xl mx-auto px-6' : 'px-4'} py-6 space-y-6`}>
        {/* Stats Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{cashbackStats.totalEarned}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{cashbackStats.thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{cashbackStats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{cashbackStats.withdrawn}</div>
              <div className="text-sm text-gray-600">Withdrawn</div>
            </CardContent>
          </Card>
        </div>

        {/* Withdraw Section */}
        <Card>
          <CardContent className="p-6">
            <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
              <div>
                <h3 className="text-lg font-bold">Available Balance</h3>
                <p className="text-3xl font-bold text-green-600">₹1,800</p>
                <p className="text-sm text-gray-600">Minimum withdrawal: ₹100</p>
              </div>
              <div className={`flex space-x-2 ${isMobile ? 'w-full' : ''}`}>
                <Button className="bg-green-500 hover:bg-green-600 flex-1">
                  Withdraw to Bank
                </Button>
                <Button variant="outline" className="flex-1">
                  Paytm Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 overflow-x-auto">
            {periods.map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="whitespace-nowrap"
              >
                {period}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} p-4 bg-gray-50 rounded-lg`}>
                  <div className={`w-12 h-12 ${transaction.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xl">{transaction.logo}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'items-center justify-between'}`}>
                      <div>
                        <h4 className="font-semibold text-gray-900">{transaction.store}</h4>
                        <p className="text-sm text-gray-600">Purchase: {transaction.amount}</p>
                      </div>
                      <div className={`flex items-center space-x-2 ${isMobile ? 'justify-between' : ''}`}>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{transaction.cashback}</div>
                          <div className="text-xs text-gray-500">{transaction.date}</div>
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">💡 Cashback Tips</h3>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span>1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Always shop through CashKaro</h4>
                  <p className="text-sm text-gray-600">Click through our links to ensure cashback tracking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span>2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Clear cookies before shopping</h4>
                  <p className="text-sm text-gray-600">Ensure proper tracking for maximum cashback</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashkaroCashbackScreen;
