# Roamark
Travel places, hiking routes and monasteries, with contextual traveler opinions. Owned by **Naman Sinha**. Contact: naman@roamark.in.

## Stack
Node.js 22+, Express, MongoDB Atlas / Mongoose, SMTP / Nodemailer. Responsive Poppins-based frontend, retaining the existing travel design. The framework choice keeps one deployable service for Render and Vercel; no Next.js migration is required to run it.

## Run
1. `npm ci`
2. Copy `.env.example` to `.env` and configure values.
3. `npm run build`
4. `npm start`

Browse http://localhost:3000. Set APP_URL to the canonical public URL. Same-deployment browser requests are also recognized automatically. Without MongoDB/SMTP settings, browsing works and account requests fail clearly; no fake OTP fallback exists. OTP_SECRET must be a long random secret. Use a verified SMTP sender.

## Hosting
Render: import this repo as a Node web service, build `npm ci && npm run build`, start `npm start`, health path `/api/health`. A render.yaml is included. Configure environment values in the host, never commit secrets.

Vercel: import repo, Node 22+, build `npm run build`; server.js exports the Express application for Vercel's native Express support. Set the same environment values, including APP_URL for the chosen deployment origin. Preview deployments accept their own same-origin browser requests; keep APP_URL set to your canonical URL. Configure MongoDB Atlas network access for the deployment host.

## Coverage and integrity
497 India directory entries cover all 28 states and 8 UTs. Each has an internal linked profile generated at build time. Six existing longer guides are retained, including Bali and Kyoto. Most India profiles still await researched information. No exhaustive-coverage or item-level verification claim is made. No fabricated scores are displayed.

Dedicated `/profile/` supports real email OTP sign-in, saved places, review submission, pending review status, logout and account deletion. OTP expires after 10 minutes, has five verification attempts, and is hashed with OTP_SECRET. Sessions expire after seven days; only hashed tokens are stored. Mutation requests require the deployment’s own origin or the configured APP_URL origin; foreign and missing browser origins are rejected. Rate limits are persisted in MongoDB and remain consistent across serverless instances.

## Moderation and launch prerequisites
New reviews are **pending**. There is no admin dashboard yet. An authorized operator must review records and set `status` to `published` in MongoDB before public review endpoints return them. Published review feeds are available via `/api/places/:slug/reviews` and linked place pages. Existing detailed guides calculate their Feel Index from published reviews; homepage cards show no invented score. No fake legacy scores are used.

Ages 14–17 are intended for future participation, but registration is blocked until verifiable guardian consent is implemented. Adult eligibility is currently self-declared, not an identity verification service. Photo upload, visit evidence, analytics SDKs, advertising, affiliate links and bookings are not integrated. Legal pages describe actual behavior and require deployment-specific legal review, provider/backup retention details and operating-address disclosures before broad public launch.

Tests cover route generation, syntax, safe deployment without credentials and origin validation. Actual MongoDB transactions and SMTP delivery require configured integration checks before accepting public reviews. Hosting and images/fonts may process technical requests. External photographs are illustrative, not verified images of every named stop.

## Temporary access
Set `ENABLE_TEMP_ACCESS=true` on a private evaluation deployment to enable Param / `param123` and Sachin / `sachin123`. Optional `PARAM_ACCESS_PASSWORD` and `SACHIN_ACCESS_PASSWORD` override these defaults. MongoDB is required; accounts are created on their first successful sign-in. SMTP is not required for this path. Sessions expire in one hour. Temporary accounts can save places and submit reviews for evaluation. Their reviews remain pending moderation and carry a temporary-account indicator; they are never labeled email-verified. Set the flag to false or remove it to immediately invalidate this access, including existing sessions. Do not enable these shared simple credentials on a public production deployment.

## Troubleshoot service errors
Open `/api/readiness` on your deployed URL. It checks the actual MongoDB connection without exposing credentials. Responses distinguish missing URI, invalid URI, authentication failure, missing database permissions, DNS failure and an unreachable cluster. `emailConfigured` reports whether required email settings exist, not that delivery has been validated. `/api/health` remains a lightweight process health check. Server logs include a sanitized error type/code and request reference, never the MongoDB URI or passwords. Atlas Network Access must permit the deployment’s outbound network, and the database user needs readWrite permissions. A profile visitor without a session now gets the sign-in form without a database connection attempt.
