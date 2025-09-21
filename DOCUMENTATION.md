# MonkeyOffers - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Structure](#api-structure)
7. [Setup Instructions](#setup-instructions)
8. [How to Recreate This Project](#how-to-recreate-this-project)
9. [File Structure](#file-structure)
10. [Key Components](#key-components)
11. [Deployment](#deployment)

## Project Overview

MonkeyOffers is a comprehensive deals and offers aggregation platform that allows users to discover, save, and share deals from various merchants. The platform includes user authentication, AI-powered shopping assistance, social features, and an admin panel for content management.

### Key Capabilities
- Browse deals from multiple sources (LinkMyDeals, Cuelink)
- User authentication and profiles
- Save and organize favorite offers
- AI-powered shopping assistant with voice interface
- Social features (community deals, leaderboards)
- Push notifications for deal alerts
- Admin panel for content management
- Real-time updates and notifications

## Features

### User Features
- **Authentication**: Email/password signup and login
- **Deal Discovery**: Browse deals by categories, brands, and stores
- **Search & Filters**: Advanced search with category and price filters
- **Saved Offers**: Personal collection of favorite deals
- **User Preferences**: Customize deal recommendations
- **AI Shopping Assistant**: Chat-based assistance with voice support
- **Social Features**: Community deals sharing and leaderboards
- **Push Notifications**: Real-time deal alerts
- **Responsive Design**: Mobile-first responsive interface

### Admin Features
- **Dashboard**: Analytics and overview
- **Offer Management**: Add, edit, delete offers
- **User Management**: View and manage users
- **Category Management**: Manage deal categories
- **Banner Management**: Control promotional banners
- **Notification Management**: Send targeted notifications

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge functions
  - Storage

### External APIs
- **OpenAI API** - AI chat functionality
- **ElevenLabs API** - Text-to-speech
- **Mistral API** - Alternative AI model
- **Gemini API** - Google's AI model

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Supabase API   │◄──►│  PostgreSQL DB  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌──────────────────┐
         └──────────────►│  Edge Functions  │
                        └──────────────────┘
                                │
                        ┌──────────────────┐
                        │  External APIs   │
                        │ (OpenAI, etc.)   │
                        └──────────────────┘
```

### Component Architecture
- **Context Providers**: AuthContext, DataContext, UserContext
- **Pages**: Route-based page components
- **Components**: Reusable UI components
- **Hooks**: Custom hooks for data and state management
- **Services**: API service layers
- **Utils**: Utility functions and helpers

## Database Schema

### Core Tables

#### Offers_data
Main offers from LinkMyDeals API
```sql
- lmd_id (bigint, PK)
- title (text)
- description (text)
- store (text)
- categories (text)
- offer_value (text)
- start_date (text)
- end_date (text)
- url (text)
- image_url (text)
- featured (text)
- sponsored (boolean)
```

#### Cuelink_data
Offers from Cuelink affiliate network
```sql
- Id (bigint, PK)
- Title (text)
- Description (text)
- Merchant (text)
- Categories (text)
- URL (text)
- Coupon Code (text)
- Start Date (text)
- End Date (text)
```

#### profiles
User profile information
```sql
- id (uuid, PK) references auth.users
- email (text)
- name (text)
- phone (text)
- location (text)
- preferences (jsonb)
- marketing_consent (boolean)
```

#### saved_offers
User's saved offers
```sql
- id (uuid, PK)
- user_id (uuid) references auth.users
- offer_id (text)
- notes (text)
- priority (integer)
```

#### categories
Deal categories
```sql
- id (text, PK)
- name (text)
- icon (text)
```

#### notifications
System notifications
```sql
- id (uuid, PK)
- user_id (uuid)
- title (text)
- message (text)
- type (text)
- read (boolean)
```

## API Structure

### Supabase Services

#### supabaseService.ts
Main service for database operations:
- `fetchOffers()` - Get all offers
- `fetchCategories()` - Get categories
- `saveOfferForUser()` - Save offer for user
- `fetchUserPreferences()` - Get user preferences
- `searchOffers()` - Search functionality

#### Edge Functions
Located in `supabase/functions/`:
- `chat-with-ai` - AI assistant functionality
- `send-daily-notifications` - Daily notification system
- `text-to-speech` - Voice synthesis
- `voice-to-text` - Speech recognition

### External API Integration
- LinkMyDeals API for offers
- Cuelink affiliate network
- OpenAI for AI chat
- ElevenLabs for voice synthesis

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- API keys for external services

### 1. Clone and Install
```bash
git clone <repository-url>
cd monkeyoffers
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Supabase Setup
1. Create new Supabase project
2. Run database migrations
3. Set up authentication
4. Configure storage buckets
5. Add secrets for edge functions

### 4. Database Migration
```sql
-- Run all SQL migrations in sequence
-- See supabase/migrations/ folder
```

### 5. Start Development
```bash
npm run dev
```

## How to Recreate This Project

### Step 1: Initialize React Project
```bash
npm create vite@latest monkeyoffers -- --template react-ts
cd monkeyoffers
npm install
```

### Step 2: Install Dependencies
```bash
# UI and Styling
npm install tailwindcss @tailwindcss/typography
npm install @radix-ui/react-* lucide-react class-variance-authority
npm install clsx tailwind-merge

# Routing and State
npm install react-router-dom @tanstack/react-query

# Backend
npm install @supabase/supabase-js

# Utilities
npm install axios date-fns zod
npm install sonner react-hook-form
```

### Step 3: Configure Tailwind CSS
```bash
npx tailwindcss init -p
```

### Step 4: Set Up Supabase
1. Create Supabase project
2. Configure authentication
3. Create database tables
4. Set up RLS policies
5. Create edge functions

### Step 5: Create Project Structure
```
src/
├── components/          # UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Route pages
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── integrations/       # External integrations
```

### Step 6: Implement Core Features
1. Authentication system
2. Data contexts and providers
3. Component library
4. Routing setup
5. API integration
6. Real-time features

### Step 7: Add Advanced Features
1. AI integration
2. Voice interface
3. Push notifications
4. Admin panel
5. Social features

## File Structure

```
monkeyoffers/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── lovable-uploads/   # Uploaded assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   ├── admin/        # Admin components
│   │   ├── home/         # Home page components
│   │   └── landing/      # Landing page components
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── DataContext.tsx
│   │   └── UserContext.tsx
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── types.ts          # TypeScript definitions
│   ├── integrations/
│   │   └── supabase/     # Supabase integration
│   └── pages/            # Route pages
├── supabase/
│   ├── functions/        # Edge functions
│   ├── migrations/       # Database migrations
│   └── config.toml       # Supabase config
└── package.json
```

## Key Components

### Authentication Flow
- `AuthContext.tsx` - Authentication state management
- `LoginScreen.tsx` - Login/signup interface
- `ProtectedRoute.tsx` - Route protection

### Data Management
- `DataContext.tsx` - Global data state
- `UserContext.tsx` - User-specific data
- `supabaseService.ts` - Database operations

### UI Components
- `OfferCard.tsx` - Deal display component
- `CategoryItem.tsx` - Category navigation
- `AIShoppingAssistant.tsx` - AI chat interface

### Admin Features
- `AdminPanel.tsx` - Admin dashboard
- `AdminOffersManager.tsx` - Offer management
- `AdminUsersManager.tsx` - User management

## Deployment

### Lovable Platform
1. Connect GitHub repository
2. Configure environment variables
3. Deploy via Lovable dashboard

### Custom Deployment
1. Build project: `npm run build`
2. Deploy to hosting platform (Vercel, Netlify, etc.)
3. Configure Supabase edge functions
4. Set up domain and SSL

### Environment Variables
Production environment requires:
- Supabase URL and keys
- External API keys
- Domain configuration

## Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- ESLint and Prettier for code formatting

### Best Practices
- Component composition over inheritance
- Custom hooks for reusable logic
- Context for global state
- Service layer for API calls

### Security
- Row Level Security (RLS) in Supabase
- Input validation with Zod
- Secure API key management
- HTTPS enforcement

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests if applicable
5. Submit pull request

## License

[Add your license information here]

## Support

For support and questions:
- Create GitHub issue
- Contact development team
- Check documentation

---

This documentation provides a complete overview of the MonkeyOffers project. For specific implementation details, refer to the source code and inline comments.