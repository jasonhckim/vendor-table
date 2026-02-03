# Datables

**Next-Generation Restaurant Reservation & Table Management Platform**

A modern, beautiful web application built for I Can Barbecue's multi-location restaurant management needs. Datables eliminates the pain of managing multiple locations through separate logins and provides intelligent automation through Firebase real-time sync and AI-powered table recommendations.

![Datables](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🌟 Key Features

### 1. Unified Multi-Location Hub
- **Single Sign-On**: Manage Tustin, Santa Ana, and all future locations from one dashboard
- **Instant Location Switching**: Sub-2-second context switching between locations
- **Cross-Location Search**: Find reservations and guests across all locations
- **Consolidated Analytics**: Compare performance across locations

### 2. Firebase Real-Time Sync
- **iOS App Integration**: Automatically syncs reservations from your iOS app
- **< 500ms Latency**: Real-time updates appear instantly
- **Smart Table Recommendations**: AI suggests optimal table assignments for new reservations
- **Connection Status**: Always-visible sync indicator

### 3. Modern, Beautiful UI/UX
- **Clean Design System**: Inter font, blue primary color (#2563EB), generous whitespace
- **Card-Based Interfaces**: No more dense data tables - everything is easy to scan
- **Touch-Optimized**: Works perfectly on iPad at the host stand
- **Accessible**: WCAG 2.1 AA compliant with proper contrast and keyboard navigation
- **Responsive**: Looks amazing on desktop, tablet, and mobile

### 4. Intelligent Features
- **Table Recommendation Engine**: AI-powered suggestions based on party size, preferences, availability
- **Guest CRM**: Unified profiles across locations with visit history and preferences
- **Smart Waitlist**: Estimated wait times with SMS notifications
- **Interactive Floor Plan**: Drag-and-drop seating with real-time status updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account (for iOS app sync)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   cd datables
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (optional for development)
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📱 Features Overview

### Dashboard
- Real-time metrics: covers, seated guests, waitlist depth, table utilization
- Upcoming reservations (next 2 hours)
- Current waitlist with wait times
- Quick actions for walk-ins

### Reservations
- Card-based reservation list with filters
- Status badges: Pending, Confirmed, Seated, Completed, No-Show
- Source indicators: iOS App, Phone, Walk-in, Web
- Quick actions: Check-in, Seat with AI recommendation, Call
- Timeline view (coming soon)

### Floor Plan
- Interactive visual layout with zoom and pan
- Color-coded table status:
  - Gray: Available
  - Blue: Reserved
  - Amber: Occupied
  - Green: Finishing (pulsing)
  - Red: Blocked (striped)
- Click for table details and actions
- List/Grid view toggle

### Waitlist
- Queue management with position numbers
- Real-time wait time tracking
- SMS notification ready buttons
- Drag-to-reorder for VIP prioritization (coming soon)

### Guest Profiles (CRM)
- Unified profiles across all locations
- Visit history and preferences
- Tags: VIP, Regular, Birthday, etc.
- Dietary restrictions and special requests

### Analytics
- Reservation source breakdown
- Peak hours heatmap
- Table utilization trends
- No-show tracking (coming soon)

## 🎨 Design System

### Colors
- **Primary**: `#2563EB` (Blue) - Actions, links, active states
- **Success**: `#10B981` (Green) - Confirmed, seated, available
- **Warning**: `#F59E0B` (Amber) - Pending, attention needed
- **Error**: `#EF4444` (Red) - Cancelled, no-show, errors
- **Neutral**: `#F3F4F6` to `#1F2937` (Gray scale)

### Typography
- **Font**: Inter (body), JetBrains Mono (monospace for times/tables)
- **Scale**: 14px base with 1.5 line height

### Spacing
- 8px base unit (all spacing is multiples of 8)

## 🔥 Firebase Integration

Datables listens to your iOS app's Firebase Firestore collection in real-time:

### Expected Data Structure
```typescript
// Collection: reservations
{
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  dateTime: Timestamp;
  locationId: "tustin" | "santa-ana";
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no-show";
  specialRequests?: string;
  seatingPreference: "patio" | "inside" | "bar" | "any";
  source: "ios-app";
  highChairs?: number;
  kidsInParty?: number;
}
```

### Setup
1. Add Firebase credentials to `.env.local`
2. Ensure your iOS app writes to the `reservations` collection
3. Map `locationId` values in Settings > Firebase Integration

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Real-time**: [Firebase](https://firebase.google.com/)
- **Date Utilities**: [date-fns](https://date-fns.org/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## 📂 Project Structure

```
datables/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Dashboard
│   ├── reservations/page.tsx    # Reservations list
│   ├── waitlist/page.tsx        # Waitlist management
│   ├── floor-plan/page.tsx      # Interactive floor plan
│   ├── guests/page.tsx          # Guest CRM
│   ├── analytics/page.tsx       # Analytics & reports
│   ├── settings/page.tsx        # Settings hub
│   ├── layout.tsx               # Root layout with sidebar
│   └── globals.css              # Global styles & design tokens
├── components/
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   └── header.tsx           # Top header with location switcher
│   ├── table-recommendation.tsx # AI table suggestion dialog
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── store.ts                 # Zustand state management
│   ├── firebase.ts              # Firebase configuration & sync
│   ├── mock-data.ts             # Development mock data
│   └── utils.ts                 # Utility functions
├── types/
│   └── index.ts                 # TypeScript type definitions
└── public/                      # Static assets
```

## 🎯 Roadmap

### Phase 1: MVP (Complete)
- ✅ Multi-location authentication and switching
- ✅ Firebase real-time sync
- ✅ Reservation list with card-based UI
- ✅ Basic floor plan visualization
- ✅ Table recommendation engine
- ✅ Dashboard with metrics

### Phase 2: Enhanced Features
- ⏳ Waitlist SMS notifications
- ⏳ Advanced guest profile management
- ⏳ Drag-and-drop floor plan seating
- ⏳ Advanced analytics and reporting
- ⏳ Settings configuration UI

### Phase 3: Polish & Scale
- ⏳ Floor plan editor
- ⏳ Cross-location reporting
- ⏳ Mobile app (React Native)
- ⏳ API for third-party integrations
- ⏳ Performance optimization

### Phase 4: Advanced Intelligence & Expansion
- ⏳ AI/ML predictive analytics for busy times
- ⏳ No-show prediction model
- ⏳ Multi-restaurant white-label support
- ⏳ Advanced CRM with email marketing campaigns
- ⏳ Loyalty program integration
- ⏳ Revenue forecasting and BI dashboards
- ⏳ Role-based access control (RBAC)
- ⏳ Multi-language support
- ⏳ Automated guest sentiment analysis

## 🤝 Contributing

This is a private project for I Can Barbecue. For questions or support, contact the development team.

## 📄 License

Proprietary - © 2026 I Can Barbecue

## 🙏 Acknowledgments

Built with modern best practices and inspired by the PRD's vision for exceptional user experience.

---

**Made with ❤️ for I Can Barbecue**
