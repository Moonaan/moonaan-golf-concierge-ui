# Known Issues & Technical Debt

Identified during the repo extraction from the `golf-concierge` monorepo. Each issue is tagged with a severity and the ticket that should address it (where known).

---

## Critical

### 1. Mobile dual directory structure (migration incomplete)
**Severity:** Critical | **Ticket:** TBD

Mobile has two parallel directory structures:
- **Legacy (root-level):** `components/`, `hooks/`, `lib/` — original layout
- **New (`src/` subdirs):** `src/components/`, `src/hooks/`, `src/lib/`, `src/screens/` — partial migration

Both directories contain active code. The `app/` directory (Expo Router) imports from both locations. This creates:
- Import path ambiguity
- Confusion for developers about where to add new code
- Risk of stale duplicate files

**Resolution:** Pick one structure and complete the migration. Recommended: consolidate everything under `src/` to match the web package pattern.

---

## Major

### 2. TripPlanner.tsx is oversized (560 lines)
**Severity:** Major | **Package:** web

`packages/web/src/components/TripPlanner.tsx` is 560 lines with mixed concerns (state management, API calls, rendering, sub-component logic). Should be split into:
- `TripPlannerForm.tsx` — input/search form
- `TripPlannerResults.tsx` — results display
- `TripPlannerMap.tsx` — map integration
- `useTripPlanner.ts` — hook for state/logic

### 3. Audio utilities duplicated across web and mobile
**Severity:** Major

Both packages have their own copies of:
- `audio-capture.ts` — microphone recording
- `audio-player.ts` — audio playback

These should be consolidated into `packages/shared` with platform-specific adapters (Web Audio API vs Expo AV).

### 4. Chat components duplicated with naming inconsistencies
**Severity:** Major

| Web (`components/chat/`) | Mobile (`components/` + `src/components/`) | Notes |
|---|---|---|
| `AgentChatBubble.tsx` | `ChatBubble.tsx` | Different names, similar purpose |
| `BookingConfirmationCard.tsx` | `BookingConfirmationCard.tsx` | Same name, different implementations |
| `CourseOptionCard.tsx` | `CourseOptionCard.tsx` | Same name, different implementations |
| `TripItineraryCard.tsx` | `TripItineraryCard.tsx` | Same name, different implementations |
| `QuickReplies.tsx` | `QuickReplies.tsx` | Same name, different implementations |
| `VoiceButton.tsx` | `VoiceButton.tsx` | Same name, different implementations |

Consider extracting shared logic into hooks or a shared component abstraction layer.

---

## Minor

### 5. No Prettier config
**Severity:** Minor

No `.prettierrc` exists. Code formatting is inconsistent across packages. Add a shared Prettier config and integrate with ESLint via `eslint-config-prettier`.

### 6. No pre-commit hooks
**Severity:** Minor

No husky + lint-staged setup. Linting and formatting are not enforced before commits.

### 7. React version mismatch
**Severity:** Minor | **Ticket:** MGC-E6-1

Web uses React `^18.3.1`, mobile uses `18.2.0` (pinned for Expo compatibility). Both will be upgraded to React 19 in MGC-E6-1.

### 8. Web Vite proxy hardcoded to localhost:4000
**Severity:** Minor

`packages/web/vite.config.ts` proxies `/api` to `http://localhost:4000`. No environment-based configuration for staging/prod API endpoints. Dev-only concern for now since the architecture uses SigV4 WebSocket (not REST).
