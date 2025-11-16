# RosterUp - Sports Team Management Platform

A modern, full-stack web application for managing youth sports teams, tournaments, tryouts, and player profiles. Built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

### Core Functionality
- **Multi-Team Management**: Organize multiple teams, manage rosters, and track attendance
- **Player Profiles**: Comprehensive player profiles with stats, positions, and ratings
- **Tournament System**: Create and manage tournaments with geolocation and applications
- **Tryout Management**: Post tryouts, accept applications, and evaluate players
- **Calendar & Scheduling**: Coordinate games, practices, and events
- **Messaging System**: Real-time team communication
- **Website Builder**: Drag-and-drop website builder for organizations

### User Types
- **Organizations**: Sports clubs and leagues managing multiple teams
- **Players**: Individual athletes with profiles and application capabilities

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool
- **React Router v7** - Routing
- **Tailwind CSS 3.4** - Styling
- **Leaflet** - Maps integration

### Backend
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Row Level Security (RLS)** - Database-level security

### Testing & Quality
- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/EasyE-base/RosterUPnew.git
cd RosterUPnew
```

2. Install dependencies:
```bash
npm install
```

3. **Set up Supabase** (Required):

   a. Create a new Supabase project:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name it "RosterUp" and set a strong database password
   - Wait ~2 minutes for provisioning

   b. Get your credentials:
   - Go to Project Settings → API
   - Copy the **Project URL** and **anon public** key

   c. Set up the database:
   - Go to the SQL Editor in your Supabase dashboard
   - Open `supabase/setup_database.sql` from this repo
   - Copy and paste the entire contents
   - Click "Run" to create all tables and policies

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   ├── ErrorBoundary.tsx
│   ├── ProtectedRoute.tsx
│   └── OnboardingCheck.tsx
├── config/             # Application configuration
│   └── app.config.ts   # Centralized config management
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── WebsiteEditorContext.tsx
├── lib/                # Utilities and helpers
│   ├── supabase.ts    # Supabase client & types
│   ├── geocoding.ts   # Location services
│   └── toast.ts       # Toast notifications
├── pages/             # Page components (22 pages)
│   ├── Dashboard.tsx
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── onboarding/
│   └── ...
├── tests/             # Test configuration
│   ├── setup.ts
│   └── utils/
├── App.tsx           # Main app component with routing
└── main.tsx         # Application entry point
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test            # Run tests
npm run test:ui     # Run tests with UI
npm run test:coverage # Generate coverage report
npm run test:watch  # Run tests in watch mode

# Code Quality
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript type checking
```

## Database Schema

### Core Tables
- `profiles` - User profiles
- `organizations` - Sports organizations
- `players` - Player profiles
- `teams` - Team information
- `tournaments` - Tournament data
- `tryouts` - Tryout events
- `tryout_applications` - Player applications
- `events` - Calendar events
- `messages` - Messaging system
- `conversations` - Message threads

### Website Builder Tables
- `organization_websites` - Website configurations
- `website_pages` - Individual pages
- `website_content_blocks` - Content blocks
- `website_templates` - Pre-built templates
- `website_themes` - Theme configurations

## Security Features

- **Environment Variables**: No hardcoded credentials
- **Row Level Security**: Database-level access control
- **Authentication**: Supabase Auth with email verification
- **Protected Routes**: Authentication guards
- **Error Boundaries**: Graceful error handling
- **Input Validation**: Form validation and sanitization

## Testing

The project includes a comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Structure
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for auth flows
- Mock implementations for external services

## Error Handling

The application includes:
- Global error boundary for catching React errors
- Toast notifications for user feedback
- Centralized error handling utilities
- Proper error logging in development

## Performance Optimizations

### Current
- Lazy loading for routes
- Optimized bundle size with Vite
- Efficient database queries with indexes

### Planned
- React.memo for expensive components
- Virtual scrolling for long lists
- Image optimization
- Code splitting for large components

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for all new code
- Follow the existing code style
- Write tests for new features
- Update documentation as needed

## Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `dist` directory.

### Environment Variables
Ensure all required environment variables are set in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Hosting Options
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any static hosting service

## Known Issues

- Large components (Calendar, Tryouts) need refactoring
- No pagination for large datasets yet
- Limited offline functionality

## Roadmap

### Phase 1 (Current)
- [x] Core authentication and profiles
- [x] Team management
- [x] Tournament system
- [x] Messaging platform
- [x] Website builder

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Video analysis tools
- [ ] Advanced scheduling AI

### Phase 3 (Future)
- [ ] API for third-party integrations
- [ ] Marketplace for coaches
- [ ] Live streaming integration
- [ ] AR/VR training tools

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@rosterup.com or open an issue in the repository.

## Acknowledgments

- Supabase for the backend infrastructure
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All open source contributors

---

Built with ❤️ by the RosterUp Team# Trigger rebuild
