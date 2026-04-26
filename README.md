# PLC Việt Nam

Blog chuyên về tự động hóa công nghiệp, PLC, SCADA, và Siemens Automation.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with CSS variables
- **Authentication**: NextAuth.js with Google OAuth
- **Testing**: Vitest + React Testing Library + fast-check (property-based testing)
- **Image Optimization**: Next.js Image component

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration (Google OAuth credentials, etc.)

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

## Data Provider

The application uses an abstraction layer for data access. Set `DATA_PROVIDER` in `.env`:

- `mock` - Use static JSON files (default)
- `supabase` - Use Supabase database (requires additional configuration)
