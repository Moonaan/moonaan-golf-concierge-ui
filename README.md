# moonaan-golf-concierge-ui

AI Golf Concierge — UI monorepo containing web, mobile, and shared packages.

## Packages

| Package | Description | Tech Stack |
|---------|-------------|------------|
| `packages/shared` | Shared types, hooks, utils, protocol, validation | TypeScript |
| `packages/web` | Web application | React 18 + Vite + Tailwind + React Router |
| `packages/mobile` | Mobile application | React Native 0.74 + Expo 51 + Expo Router |

## Setup

```bash
# Prerequisites: Node.js >= 24.0.0
npm install

# Build shared (required before web/mobile)
npm run build:shared

# Start web dev server
npm run dev:web

# Start mobile (Expo)
npm run dev:mobile
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build shared + web |
| `npm run build:shared` | Build shared package only |
| `npm run build:web` | Build web package only |
| `npm run dev:web` | Start web dev server |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Typecheck web + mobile |

## Known Issues

See [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) for identified technical debt and structural issues carried over from the monorepo extraction.

<!-- TODO: Implemented in MGC-12 — Configure GitHub Actions CI for UI repo -->
