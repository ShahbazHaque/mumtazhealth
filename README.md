# Mumtaz Health

A comprehensive women's wellness platform combining Ayurvedic principles with evidence-based health tracking.

**🌐 Live Demo:** https://mumtazhealth.vercel.app/

## 🌟 Features

- **Daily Wellness Tracking**: Monitor emotional state, physical symptoms, and pain levels
- **Condition-Specific Support**: PCOS, endometriosis, PMDD, arthritis tracking
- **Hormonal Transition Tracker**: Perimenopause and menopause support
- **Content Library**: Yoga poses, educational resources, guided practices
- **AI Companion**: Mumtaz Wisdom Guide for personalized support
- **Dosha Assessment**: Ayurvedic constitution analysis (vata, pitta, kapha)
- **Pregnancy Safety Mode**: Filtered yoga poses by trimester
- **Bookings System**: Appointment scheduling with practitioners
- **Insights Dashboard**: Data visualization and pattern recognition

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShahbazHaque/mumtazhealth.git
cd mumtazhealth

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials
```

### Environment Variables

Create a `.env` file with the following:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Development

```bash
# Start development server (http://localhost:8080)
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **State Management**: React Query (@tanstack/react-query) + Context API
- **UI Framework**: shadcn/ui components + Tailwind CSS
- **Routing**: React Router v6 with code-splitting
- **Testing**: Vitest with jsdom environment

## 📁 Project Structure

```
mumtazhealth/
├── src/
│   ├── assets/          # Images and static files
│   ├── components/      # Reusable React components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase integration
│   ├── lib/             # Utilities and validation
│   ├── pages/           # Route-level page components
│   └── test/            # Test setup and utilities
├── supabase/
│   └── migrations/      # Database migrations
├── public/              # Public static assets
└── dist/                # Production build output
```

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test -- --run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 📦 Building & Deployment

### Build

```bash
# Production build
npm run build

# Development build with source maps
npm run build:dev
```

### Deployment Options

#### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

#### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy`
3. Build command: `npm run build`
4. Publish directory: `dist`

#### Traditional Hosting

1. Build the project: `npm run build`
2. Upload the `dist/` folder to your web server
3. Configure your server to serve `index.html` for all routes

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run migrations: `supabase db push` (requires Supabase CLI)
3. Add your project URL and anon key to `.env`

### Code Quality

```bash
# Run linter
npm run lint

# Optimize images (macOS only)
npm run optimize-images
```

## 📖 Documentation

- See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation
- Check `src/lib/validation.ts` for input validation schemas
- Review `src/App.tsx` for route definitions and code-splitting strategy

## 📋 Project Documents

| Document | Description |
|----------|-------------|
| [UX Accessibility Audit](./Mumtaz_Health_UX_Accessibility_Audit.docx) | Comprehensive UX accessibility audit and implementation roadmap for elderly user accessibility (WCAG 2.1 AA compliance) |
| [Development Roadmap 2026](./Mumtaz_Health_Development_Roadmap_2026.docx) | Strategic development roadmap and feature planning |
| [Review 2026-02-01](./Mumtaz_Health_Review_2026-02-01.docx) | Project review and gap analysis findings |

### UX Design Guidelines

The UX Accessibility Audit establishes the following key design requirements:

- **Typography**: Minimum 18px base font size with Roboto/Open Sans
- **Touch Targets**: Minimum 44x44 pixels for all interactive elements
- **Color Contrast**: 4.5:1 minimum ratio for WCAG 2.1 AA compliance
- **Cognitive Load**: Single-task screens, maximum 3-level navigation depth
- **Target Demographic**: Middle-aged and elderly women (accommodating "brain fog" and motor skill limitations)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

Built with ❤️ for women's wellness and empowerment.

---

**Repository**: https://github.com/ShahbazHaque/mumtazhealth
**Maintainer**: Shahbaz Haque (shahbazhaque@gmail.com)
