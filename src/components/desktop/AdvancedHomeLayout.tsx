import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HomeSidebar } from './HomeSidebar';
import { MainContentArea } from './MainContentArea';
import { RightPanel } from './RightPanel';
import { AdvancedHeader } from './AdvancedHeader';

interface AdvancedHomeLayoutProps {
  children?: React.ReactNode;
  homeScreenData: any;
}

export const AdvancedHomeLayout = ({ homeScreenData }: AdvancedHomeLayoutProps) => {
  const isMobile = useIsMobile();
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry' | 'list'>('grid');
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Return mobile layout if on mobile
  if (isMobile) {
    return null; // Let HomeScreen handle mobile layout
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/50 to-background">
        {/* Advanced Header */}
        <AdvancedHeader 
          offersCount={homeScreenData.offers?.length || 0}
          cuelinkOffersCount={homeScreenData.cuelinkOffers?.length || 0}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          showRightPanel={showRightPanel}
          onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        />
        
        <div className="flex w-full pt-16">
          {/* Left Sidebar */}
          <HomeSidebar 
            searchQuery={homeScreenData.searchQuery}
            onSearchChange={homeScreenData.handleSearch}
            dynamicCategories={homeScreenData.dynamicCategories}
            selectedCategory={homeScreenData.selectedCategory}
            onCategorySelect={homeScreenData.handleCategoryClick}
            userPreferences={homeScreenData.userPreferences}
          />

          {/* Main Content Area */}
          <MainContentArea 
            layoutMode={layoutMode}
            homeScreenData={homeScreenData}
            showRightPanel={showRightPanel}
          />

          {/* Right Panel */}
          {showRightPanel && (
            <RightPanel 
              offers={homeScreenData.offers}
              userPreferences={homeScreenData.userPreferences}
              cuelinkOffers={homeScreenData.cuelinkOffers}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};