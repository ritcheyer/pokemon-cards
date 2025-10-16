# Pokemon Card Collection Manager

A modern web application for managing and viewing Pokemon card collections. Built with Next.js 15, TypeScript, and Tailwind CSS v4, featuring offline-first architecture with Supabase sync.

## Features

- **Multi-User Support** - Create and manage multiple user collections
- **Card Search** - Search Pokemon cards using the Pokemon TCG API
- **Collection Management** - Add, edit, and delete cards with quantity and condition tracking
- **Offline-First** - Works offline with localStorage, syncs to Supabase when online
- **Modern UI** - Responsive design with dark mode support
- **Type-Safe** - Full TypeScript coverage with strict type checking

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **API**: Pokemon TCG API
- **Testing**: Jest + React Testing Library (58 tests)
- **Linting**: ESLint, Stylelint, Markdownlint

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Pokemon TCG API key (optional, for higher rate limits)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pokemon-cards
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key
```

4. Set up the database:

Run the SQL schema in your Supabase dashboard (see `supabase-schema.sql`).

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:css` - Run Stylelint
- `npm run lint:md` - Run Markdownlint
- `npm run lint:all` - Run all linters
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # User selection page
│   ├── globals.css        # Global styles
│   └── user/[userId]/     # User collection page
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── AddCard/       # Card search and add
│   │   ├── CardDetail/    # Card detail modal
│   │   └── CardGrid/      # Collection grid
│   └── ui/                # Shared UI components
│       ├── Button/
│       ├── Input/
│       ├── Select/
│       ├── Textarea/
│       └── Modal/
├── lib/
│   ├── api/               # Pokemon TCG API client
│   ├── db/                # Supabase client and sync
│   ├── storage/           # localStorage utilities
│   ├── constants.ts       # Shared constants
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utility functions
└── hooks/                 # Custom React hooks
```

## Key Features

### Offline-First Architecture

The app uses a hybrid approach:

1. **localStorage** - Primary data store for instant access
2. **Supabase** - Cloud sync for persistence and multi-device support
3. **Automatic Sync** - Changes sync to Supabase when online

### Search Performance

- Debounced search (300ms) to reduce API calls
- Multi-word search support (e.g., "emolga ex")
- Cached results for instant repeat searches
- Form submit bypasses debounce for immediate search

### Type Safety

- Full TypeScript coverage
- Strict type checking enabled
- Generated types from Supabase schema
- Type-safe API responses

## Testing

Run the test suite:

```bash
npm test
```

The project includes:

- Unit tests for UI components
- Utility function tests
- 58 tests with 100% pass rate

## Code Quality

All code is linted and formatted:

```bash
npm run lint:all
```

- **ESLint** - JavaScript/TypeScript linting
- **Stylelint** - CSS linting with Tailwind support
- **Markdownlint** - Documentation linting

VS Code auto-fixes on save (see `.vscode/settings.json`).

## Documentation

- **Project Spec**: `.ai/specs/spec.md`
- **Progress Tracker**: `.ai/docs/PROJECT_PROGRESS.md`
- **Testing Checklist**: `.ai/docs/TESTING_CHECKLIST.md`
- **Refactoring Docs**: `.ai/docs/REFACTORING_*.md`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Add your license here]

## Acknowledgments

- [Pokemon TCG API](https://pokemontcg.io/) for card data
- [Next.js](https://nextjs.org/) for the framework
- [Supabase](https://supabase.com/) for the database
- [Tailwind CSS](https://tailwindcss.com/) for styling
