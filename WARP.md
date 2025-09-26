# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Ace Paste Cleaner (React + TypeScript + Tailwind, built and served with Bun)

Quick commands

- Install dependencies
  - macOS (Homebrew): brew install oven-sh/bun/bun
  - Install packages: bun install
- Start dev (hot-reload): bun run dev
- Build production bundle: bun run build
- Preview built app (serves ./dist): bun run preview

Notes

- This project uses Bun (not Vite) for dev server, bundling, and preview. The README references Vite, but the actual scripts and build pipeline are Bun-based. Commands above reflect the current setup.
- Build output goes to dist/. The build script compiles Tailwind CSS, bundles TS/TSX, and copies static assets (index.html, public/*, CNAME).

Architecture overview

- Entry and mounting
  - index.html loads /src/main.tsx, which mounts <App /> into #root
  - src/main.tsx enables React StrictMode and imports global styles from src/index.css
- Application composition (src/App.tsx)
  - Wraps UI in ErrorBoundary and SecurityProvider
  - Assembles the main UX: header, usage indicator, security options, feature toggles, input/output panes, stats, and paywall/privacy/security modals
  - Authentication gating: cleaning actions and some UI elements depend on a lightweight local auth layer (see Auth below)
  - Cleaning pipeline:
    - User-configurable CleanOptions state controls what transformations run
    - cleanText(text, opts) performs normalization, markdown strip, punctuation/URL/email/phone/timestamp removal, whitespace fixes, case conversion, etc.
    - For enhanced privacy settings, stripInvisibleCharacters from utils/advancedInvisibleCharacters.ts is applied for more robust invisible char handling
  - Paywall integration: on over-limit or unauthenticated use, triggers PaywallModal with upgrade flows linking to Gumroad products
- State and context
  - SecurityContext (src/contexts/SecurityContext.tsx)
    - Persists terms acceptance and security settings in localStorage (dataRetention, encryptionLevel, logging, etc.)
    - Provides acceptTerms, updateSecuritySettings, resetToDefaults
  - Auth (lightweight, local)
    - Hook: src/hooks/useSimpleAuth.ts wraps simpleAuth and exposes user, usage, signIn/signUp/signOut, recordCleaning, canClean, updateUserTier
    - Storage-backed implementation: src/utils/simpleAuth.ts stores a base64-encoded token and user/usage in localStorage; includes updateUserTier and usage tracking helpers
    - Pricing/limits: src/types/pricing.ts defines PRICING_TIERS (free, monthly, quarterly, six_months, yearly, two_years) and upsells; logic uses these to enforce daily/length limits
    - A separate, not currently wired provider exists (src/contexts/AuthContext.tsx) with a subscriptionManager helper; the app primarily uses useSimpleAuth
  - Usage and limits
    - UsageIndicator displays remaining daily cleanings based on user tier and usage
    - recordCleaning increments counters and enforces caps via canClean(textLength)
- Payments and subscriptions
  - Gumroad webhook utilities: src/utils/gumroadWebhook.ts
    - Maps Gumroad product IDs to internal tier IDs and updates user tier via simpleAuth.updateUserTier
    - Contains helpers to process payloads from postMessage, URL hash, or storage events
  - GumroadWebhookHandler component wires window listeners and invokes processing; provides a simulateGumroadWebhook helper for manual testing
  - subscriptionManager (src/utils/subscriptionManager.ts) offers a localStorage model for subscriptions (ID, tier, dates) with calculateEndDate helpers; used by the unused AuthContext and usage hook
- Text processing utilities
  - advancedInvisibleCharacters.ts defines character classes and provides detectInvisibleCharacters, stripInvisibleCharacters, and an INVISIBLE_REGEX for broad, performant removal
- Styling and assets
  - Tailwind configured via tailwind.config.js and postcss.config.js; source styles in src/index.css
  - Public assets in public/ are copied into dist/ during build
- Build pipeline (build.js)
  - Cleans dist/
  - CSS: bunx tailwindcss -i ./src/index.css -o ./dist/main.css --minify
  - JS: Bun’s bundler builds src/main.tsx -> dist/ with minify/splitting/sourcemaps
  - Copies index.html, public/*, and CNAME into dist/

Linting

- ESLint is declared in devDependencies, but no ESLint config or script is present in the repo. If/when a config is added, you can lint with:
  - bunx eslint . --ext .ts,.tsx

Testing

- No Node-based test framework is configured. For manual/in-browser checks of auth and Gumroad flows, open the app in a browser and use the console helpers exposed by src/utils/testAuth.ts:
  - window.testAuth.runAllTests()
  - window.testAuth.testUserRegistration()
  - window.testAuth.testGumroadPayment()
  - window.testAuth.testSubscriptionValidation()

Reference file map (non-exhaustive)

- package.json: Bun dev/build/preview scripts
- build.js: orchestrates Tailwind + Bun bundling + asset copy
- src/App.tsx: main UI and cleaning logic
- src/utils/simpleAuth.ts, src/hooks/useSimpleAuth.ts: lightweight auth + usage tracking
- src/contexts/SecurityContext.tsx: persisted security/terms settings
- src/utils/gumroadWebhook.ts, src/components/GumroadWebhookHandler.tsx: Gumroad integration
- src/types/pricing.ts: tiers/limits/upsells used across UI and logic
- tailwind.config.js, postcss.config.js, src/index.css: styling

Repository-specific caveats

- README.md mentions Vite; this repo currently runs with Bun (dev/build/preview). Prefer the commands in this WARP.md.
- There is no vite.config.ts checked in; tsconfig.node.json references it, but it’s not used by the current Bun-based pipeline.
