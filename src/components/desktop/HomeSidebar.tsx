import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Tag,
  Filter,
  Star,
  MapPin,
  Clock,
  Percent,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

interface HomeSidebarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dynamicCategories: any[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  userPreferences: any;
}

export const HomeSidebar = ({
  searchQuery,
  onSearchChange,
  dynamicCategories,
  selectedCategory,
  onCategorySelect,
  userPreferences
}: HomeSidebarProps) => {
  return (
    <Sidebar className="w-80 border-r border-border bg-card/50 backdrop-blur-sm">
      <SidebarContent className="p-4 space-y-6">
        {/* Search Section */}
        <SidebarGroup>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={onSearchChange}
              className="pl-10 bg-background border-border/50"
            />
          </div>
        </SidebarGroup>

        {/* Quick Filters */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Quick Filters</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="text-sm">Featured Only</span>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">Nearby Stores</span>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-destructive" />
                  <span className="text-sm">Ending Soon</span>
                </div>
                <Switch />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Discount Range */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2">
            <Percent className="w-4 h-4" />
            <span>Discount Range</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <Slider
                defaultValue={[0]}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%+</span>
                <span>100%</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categories */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Categories</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dynamicCategories.slice(0, 8).map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    onClick={() => onCategorySelect(category.id)}
                    className={`w-full justify-between ${
                      selectedCategory === category.id ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Trending Categories */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {['Electronics', 'Fashion', 'Home & Garden'].map((trend) => (
                <div key={trend} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                  <span className="text-sm font-medium">{trend}</span>
                  <Badge variant="outline" className="text-xs">🔥</Badge>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};