# PLC Việt Nam

Blog chuyên về tự động hóa công nghiệp, PLC, SCADA, và Siemens Automation.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with CSS variables
- **Authentication**: NextAuth.js with Google & Facebook OAuth
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + React Testing Library + fast-check (property-based testing)
- **Image Optimization**: Next.js Image component

## Getting Started

⚡ **Quick Start**: [QUICK-START.md](./QUICK-START.md)

### Detailed Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. **Setup Social Login (Google & Facebook OAuth)**:

📖 **Hướng dẫn đầy đủ**: [docs/oauth/README.md](./docs/oauth/README.md)

**Google OAuth** (✅ Đã setup):

- Client ID và Secret đã có trong `.env.local`
- Đã deploy lên Vercel production
- Cần restart server: `npm run dev`

**Facebook OAuth** (⏳ Chưa setup):

- Xem hướng dẫn: [docs/oauth/facebook-setup.md](./docs/oauth/facebook-setup.md)

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
app/                    # Next.js App Router pages
features/              # Feature-based modules
  ├── navigation/      # Navigation tree component
  ├── posts/          # Post listing and detail
  ├── comments/       # Comment system
  ├── books/          # Books page
  ├── search/         # Search functionality
  └── tags/           # Tag system
lib/                   # Shared utilities and data layer
  ├── data/           # Data abstraction layer
  ├── auth/           # NextAuth configuration
  ├── theme/          # Theme provider
  └── types/          # Shared TypeScript types
public/                # Static assets
  └── mock-data/      # Mock JSON data files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Environment Variables

See `.env.example` for required environment variables.

### Required for Social Login

```env
# Google OAuth (✅ Đã có)
GOOGLE_CLIENT_ID=1099143255402-u74fhvk8tahn63md5a47315dd5c69m.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Facebook OAuth (⏳ Chưa setup)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

📖 **Setup guide**: [docs/oauth/README.md](./docs/oauth/README.md)

## Data Provider

The application uses an abstraction layer for data access. Set `DATA_PROVIDER` in `.env`:

- `mock` - Use static JSON files (default)
- `supabase` - Use Supabase database (requires additional configuration)
