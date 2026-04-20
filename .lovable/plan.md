
# PLATO — Plateau Digital Cultural Archive

A mobile-first cultural archive for Plateau State's 17 LGAs, featuring dialect lessons, stories, proverbs, and media, with contributor submissions and admin moderation.

## Visual direction
- **Palette**: warm terracotta, ochre, deep forest green, cream background
- **Type**: serif display headings (e.g. Fraunces/Playfair), clean sans for body
- **Feel**: textured, organic, image-forward cards with generous whitespace; mobile-first layouts with bottom nav

## Auth & Roles
- Email/password sign up & login (Lovable Cloud)
- `profiles` table (display name, avatar, bio)
- Separate `user_roles` table with `admin`, `contributor`, `user` enum + `has_role()` security-definer function
- Protected routes via `_authenticated` layout; admin-only via `_admin` layout

## Screens

**Public / Onboarding**
- Splash → animated PLATO logo with tagline "Where Culture Lives On"
- Onboarding carousel (3 slides): Discover culture · Learn your language · Explore Plateau → "Get Started"
- Login / Sign up

**Main app (bottom nav: Home · Explore · Learn · Library · Profile)**
- **Home**: Featured LGA hero, "Continue Learning" strip (resumes last lesson), Latest Content feed, category shortcuts (Languages, Stories, Media, Proverbs)
- **Explore**: Grid of 17 LGAs with cover image + dialect count; "Content coming soon" state for empty LGAs
- **LGA Detail**: Hero image + overview, tabs for *Overview · Dialects · Stories · Proverbs · Media*
- **Dialect page**: ordered lesson list, phrasebook (categorized phrases with audio), quizzes
- **Lesson player**: text + inline audio + video, mark complete, next lesson CTA
- **Quiz**: multiple-choice, score screen, saves progress
- **Story/Proverb reader**: text with optional audio narration
- **Media player**: audio & video with title, LGA tag, description
- **Library**: bookmarks, completed lessons, continue-learning items
- **Profile**: display name, avatar, progress stats, sign out; "Become a contributor" request button
- **Search**: across LGAs, dialects, stories, media

**Contributor**
- Submit content form (type selector: story/proverb/phrase/lesson/media), target LGA/dialect, upload audio/video/image, text body → enters moderation queue

**Admin**
- Dashboard: pending submissions, users, content counts
- Moderation queue: approve / reject / edit submissions
- Manage LGAs, dialects, lessons, quizzes, stories, proverbs, media (full CRUD with uploads)
- Manage users & roles (promote to contributor/admin)

## Data model (high level)
- `profiles`, `user_roles`
- `lgas` (17 pre-seeded), `dialects` (belong to LGA)
- `lessons` (belong to dialect, ordered), `lesson_items` (text/audio/video blocks)
- `quizzes`, `quiz_questions`, `quiz_options`
- `phrases` (category, text, translation, audio)
- `stories`, `proverbs` (LGA-tagged, optional audio)
- `media` (audio/video/image, LGA-tagged)
- `submissions` (contributor uploads with status: pending/approved/rejected)
- `lesson_progress`, `quiz_attempts`, `bookmarks`
- Storage buckets: `media` (public), `avatars` (public), `submissions` (private)
- RLS everywhere: public reads on approved content, writes gated by role

## Seed content
17 LGAs pre-seeded (Jos North, Jos South, Jos East, Barkin Ladi, Bassa, Bokkos, Kanam, Kanke, Langtang North, Langtang South, Mangu, Mikang, Pankshin, Qua'an Pan, Riyom, Shendam, Wase) with placeholder cover images and overview stubs. Admin can fill in content later; empty sections show "Content coming soon".

## Tech
TanStack Start + Tailwind, Lovable Cloud (auth, DB, storage), TanStack Query, Zod validation, shadcn/ui primitives styled to the earthy theme, native `<audio>`/`<video>` players.

## Build order
1. Theme + shell + bottom nav + splash/onboarding
2. Auth + profiles + roles
3. LGA schema & seed + Explore + LGA Detail
4. Dialects, lessons, quizzes, progress
5. Stories, proverbs, phrases, media + players
6. Library, bookmarks, search
7. Contributor submissions + admin moderation & CRUD
