
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading User Profiles...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
