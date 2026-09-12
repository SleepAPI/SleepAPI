# Copilot Instructions for Neroli's Lab

## Project Overview

Neroli's Lab (SleepAPI) is a full-stack Pokémon Sleep application with a monorepo structure:

- **backend**: Express API with Bun dev runtime, Node.js production (TypeScript, Knex, MySQL, TSOA)
- **frontend**: Vue 3 SPA with Vuetify 3 (Pinia state, Vite, Chart.js)
- **common**: Shared TypeScript library bundled with Rollup (types, utilities, mocks)
- **docs**: VitePress documentation site
- **guides**: Vitepress player-facing Pokemon Sleep guides

## Development Workflow

### Starting Development

```bash
# Backend (Bun with hot reload)
cd backend && npm run dev

# Frontend (Vite)
cd frontend && npm run dev

# Guides (Vitepress)
cd guides && npm run dev

# Common library watch mode (when changing shared types)
cd common && npm run build-watch
```

### Required Pre-Push Checklist

**Always run these before committing:**

1. **Test**: `npm run test` or `npx vitest --run -- filename.test.ts`
2. **Lint**: `npx eslint .` in the modified package
3. **Type check**:
   - Frontend: `npm run type-check`
   - Backend: `npm run _compile`
   - Guides: `npm run type-check`
4. **Build common** if types changed: `cd common && npm run build`

### Test-Driven Development

**Always run tests after creating/modifying test files:**

```bash
npx vitest --run -- filename.test.ts
```

Use the output to iterate until tests pass. This is non-negotiable for quality assurance.

## Architecture Patterns

### Backend Layer Structure

**Controllers → Services → DAOs → Database**

- **Controllers** (`backend/src/controllers/`): TSOA-decorated endpoints (minimal, non-sensitive routes only)
- **Services** (`backend/src/services/`): Business logic and orchestration
- **DAOs** (`backend/src/database/dao/`): Data access extending `AbstractDAO` with repository pattern
- **Database**: MySQL with Knex query builder

Example DAO pattern:

```typescript
class UserDAO extends AbstractDAO<typeof DBUserSchema, DBUser> {
  get tableName() {
    return 'user';
  }
  protected get schema() {
    return DBUserSchema;
  }
}
```

### Frontend Component Organization

**Pages → Components → Stores → Services**

- **Pages** (`frontend/src/pages/`): Route-level components
- **Components** (`frontend/src/components/`): Reusable UI following atomic design
- **Stores** (`frontend/src/stores/`): Pinia state management
- **Services** (`frontend/src/services/`): API clients matching backend endpoints

### Shared Code (Common Package)

All shared types, utilities, and test mocks live in `common/`:

```typescript
// common/src/types/ - Types used by both backend and frontend
// common/src/utils/ - Shared utility functions
// common/src/vitest/mocks/ - Mock factories for testing
```

**After changing common types:** Always run `cd common && npm run build` to update consumers.

## Testing Conventions

### Vue Component Testing Pattern

**Required structure for all Vue component tests:**

```typescript
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import MyComponent from './my-component.vue';

describe('MyComponent', () => {
  let wrapper: VueWrapper<InstanceType<typeof MyComponent>>;

  beforeEach(() => {
    wrapper = mount(MyComponent, {
      props: { someProp: 'value' }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
```

### Mocking Strategy (Critical)

**Only mock external dependencies:**

✅ **DO Mock:**

- HTTP requests (axios, fetch)
- Browser APIs (IntersectionObserver, matchMedia)

❌ **DON'T Mock:**

- Internal utility functions (formatters, calculators, validators)
- Functions from `sleepapi-common` that work in Node.js test environment
- Internal services without external dependencies

**Use mock factories from `{package}/src/vitest/mocks/` instead of inline hard-coded mocks.**

Example:

```typescript
// Good - using mock factory
import { mocks } from '@/vitest';
const pokemon = mocks.pokemonInstance({ level: 50 });

// Bad - hard-coded inline mock
const pokemon = { level: 50, name: 'Test' } as any;
```

### Test Setup

- Frontend tests use `jsdom` environment with Vuetify/Pinia configured in `frontend/src/vitest/setup.ts`
- All packages use Vitest with coverage reporting
- Common mocks are exported from `sleepapi-common` and extended by package-specific mocks

## Code Style Guidelines

### CSS/Styling

**Always use utility classes from `frontend/src/assets/common.scss`:**

```scss
.flex-center      // display: flex; align-items: center; justify-content: center
.flex-between     // display: flex; align-items: center; justify-content: space-between
.flex-column      // display: flex; flex-direction: column
.flex-wrap        // display: flex; flex-wrap: wrap
```

**Rules:**

- Never use inline styles
- Prefer utility classes over Vuetify utilities or custom CSS
- Use scoped styles for component-specific CSS

### TypeScript

- Never use `any` unless working with generics
- Prefer type inference over explicit types when clear
- Use strict type checking (enabled in all packages)

### Code Comments

**Only add comments when necessary:**

- Explain WHY, not WHAT (code should be self-documenting)
- Document complex business logic or non-obvious decisions
- Remove obvious comments like `// Mock the module` or `// Set variable to X`

## Environment Setup

### Database

```bash
docker-compose up -d  # Starts MySQL
# Migrations run automatically when backend starts with DATABASE_MIGRATION=UP
```

### Environment Files

Copy `.env.example` to `.env` in both frontend and backend directories. Key variables:

- Backend: `DATABASE_MIGRATION=UP` for auto-migrations
- Frontend: API endpoint configuration

### Package Installation

```bash
npm install              # Root (installs git hooks)
cd backend && bun install
cd frontend && npm install
cd common && npm install
```

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint):

- `feat:` new features
- `fix:` bug fixes
- `style:` design/UI changes
- `chore:` maintenance tasks
- `refactor:` code restructuring
- `test:` test changes
- `perf:` performance improvements

**Rules:**

- Header ≤72 characters
- No sentence case (lowercase unless proper nouns)
- No period at end
- No AI tool references in messages

## Pokémon Sleep Game Mechanics

This application simulates Pokémon Sleep mechanics. Key concepts:

### Core Gameplay

- Players track sleep (max 100 Sleep Score per session)
- Helper Pokémon gather berries/ingredients throughout the day
- Cook meals 3x daily (breakfast 04:00-12:00, lunch 12:00-18:00, dinner 18:00-04:00)
- Feed Snorlax to increase strength
- Weekly cycle resets Monday 04:00

### Helper Pokémon System

**Energy & Frequency** (`backend/src/services/simulation-service/team-simulator/member-state/`):

- Energy decreases 1 per 10 minutes linearly
- Energy affects helping speed (80+ energy = 45% faster, 0 energy = slowest)
- Helping frequency measured in seconds (e.g., 2400s = 40 minutes between helps)

**Specialties**:

- Berry Specialist: 2 berries/drop, lower ingredients (1 at level 1)
- Ingredient Specialist: 1 berry/drop, more ingredients (2 at level 1)
- Skill Specialist: Higher skill rate, can store 2 skill triggers

**Production**: Pokémon collect berries or ingredients. When carry limit reached, they auto-deliver (sneaky snacking).

### Simulation Engine

**Location**: `backend/src/services/simulation-service/team-simulator/`

- Monte Carlo simulations for predictions
- Handles energy decay, help timing, skill activations, cooking
- Pre-generated random numbers for performance (`pre-generated-random.ts`)

### Natures, Subskills, & Instance Properties

- **Natures** (`common/src/types/nature/`): Affect 5 stats (speed, energy recovery, exp, ingredient rate, skill chance)
- **Subskills** (`common/src/types/subskill/`): Unlocked at levels 10, 25, 50, 75, 100 (unchangeable after catch)
- **Instance Properties** (`common/src/types/instance/`): Nature, subskills, ingredient sets rolled at catch time

## Key File References

- **Types**: `common/src/types/{pokemon,mainskill,subskill,nature,instance}/`
- **Simulation**: `backend/src/services/simulation-service/team-simulator/`
- **API Controllers**: `backend/src/controllers/`
- **Frontend Pages**: `frontend/src/pages/`
- **Shared Mocks**: `common/src/vitest/mocks/`
- **CSS Utilities**: `frontend/src/assets/common.scss`

## Multi-Workspace Structure

This VS Code workspace uses a multi-folder setup (`sleepapi.code-workspace`):

- Root folder for shared configs (ESLint, Prettier, commitlint)
- Individual folders for each package (backend, frontend, common, docs, guides)
- Relative imports configured via TypeScript path aliases (`@src/`, `@/`)

**Import preference**: Use path aliases, not relative imports (configured in workspace settings).
