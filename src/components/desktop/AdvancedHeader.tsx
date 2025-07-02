import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  List, 
  Layers, 
  Bell, 
  Search, 
  Settings, 
  PanelRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdvancedHeaderProps {
  offersCount: number;
  cuelinkOffersCount: number;
  layoutMode: 'grid' | 'masonry' | 'list';
  onLayoutModeChange: (mode: 'grid' | 'masonry' | 'list') => void;
  showRightPanel: boolean;
  onToggleRightPanel: () => void;
}

export const AdvancedHeader = ({
  offersCount,
  cuelinkOffersCount,
  layoutMode,
  onLayoutModeChange,
  showRightPanel,
  onToggleRightPanel
}: AdvancedHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Deals Dashboard</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {offersCount} offers
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {cuelinkOffersCount} flash deals
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Quick Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Quick search across all deals..."
              className="pl-10 pr-4 bg-muted/50 border-border/50 focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Layout Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={layoutMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === 'masonry' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutModeChange('masonry')}
              className="h-8 w-8 p-0"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleRightPanel}
            className={`h-8 w-8 p-0 ${showRightPanel ? 'bg-muted' : ''}`}
          >
            <PanelRight className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};