# StudyForge AI

A Next.js/TypeScript student learning platform. The existing quadratic demo remains accessible at `/visuals`.

## Environment
1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project; apply `supabase/migrations/20261103010100_initial.sql`.
3. Set the Supabase URL and anon/publishable key in Vercel's **Environment Variables** (and `.env.local` for local development).
4. In Supabase Auth, configure the Site URL, callback URL `https://YOUR_DOMAIN/auth/callback`, email provider, and optionally Google OAuth.
5. Run `npm install && npm run dev`. Never commit credentials.

## Current implementation
- Email registration/sign-in, password reset request, optional Google OAuth and callback; requires Supabase configuration.
- Secure session-aware personalized dashboard and onboarding.
- Authenticated course creation/list/delete with RLS migration.
- Preserved interactive quadratic demo at `/visuals`.
- Foundation database tables for future notes and chat.

## Important limitations
Course materials upload supports TXT/PDF/DOCX/PNG/JPEG (8 MB limit) after a Supabase storage migration is applied. Only TXT extraction and source grounding are implemented; PDF/DOCX/image parsing is pending. Tutor requests are limited to 40 user messages per 24 hours as a basic cost safeguard, not a production-grade atomic rate limiter.\n\nThe Supabase project and external keys are NOT set up by these source files. Do not call the account workflow production-ready until the migration is applied and signup/logout/login persistence is verified. Document upload processing, source retrieval, AI teaching, practice generation, adaptive reviews and Forge Architect's code-editing agent remain unimplemented.

## Production controls
Use Vercel's protected settings to enter keys; never paste them into an ordinary chat. Review and merge feature PRs only after passing CI checks.
