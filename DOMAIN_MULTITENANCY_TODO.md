# Domain-Based Multi-Tenant Sketch

## Goal
Serve multiple customer domains from one deployed Biz Nest app by resolving the incoming domain to a `Business` record and loading the correct branding, content, leads, and admin context.

## High-Level Approach
- Keep one codebase and one running app instance.
- Point multiple domains at the same server/app.
- Read the request host/domain on each request.
- Map that domain to a business in the database.
- Render the correct site and business data for that domain.

## Example
- `acmeplumbing.com` -> Business A
- `besthvacpros.com` -> Business B
- `localhost:3000` -> default dev business

## Suggested Data Model Changes
- Add a `Domain` model or add domain fields to `Business`.
- Prefer a separate `Domain` table so each business can have:
- primary domain
- www variant
- staging/test domain
- future extra domains

## Prisma Sketch
- `Domain`
- `id`
- `businessId`
- `host`
- `isPrimary`
- `isActive`
- `createdAt`

## Request Resolution Flow
1. Incoming request hits app.
2. Read `Host` header.
3. Normalize host:
strip port
lowercase
handle `www.`
4. Look up matching domain record.
5. Load associated business.
6. Store business context for the request.
7. Render the right public pages and metadata.

## Main Implementation Areas

### 1. Database
- Add a `Domain` model linked to `Business`
- Seed local dev domain mappings
- Add admin CRUD for domains per business

### 2. Host Resolution
- Create a shared helper like `getBusinessFromHost(host)`
- Normalize host safely
- Support local development hosts:
- `localhost`
- `127.0.0.1`
- optional custom dev subdomains

### 3. Middleware
- Add middleware to inspect the host early
- Attach tenant/business context through:
- request headers
- rewrite strategy
- route matching logic
- Exclude:
- `/api/auth`
- static assets
- Next internal assets
- admin routes if they should stay app-global

### 4. Public Site Routing
- Make public routes resolve business by domain instead of URL-only assumptions
- Load:
- logo
- colors/theme
- services
- published pages
- lead forms
- Ensure page slugs are unique per business, not globally

### 5. Admin Experience
- Decide whether admin stays on:
- one central domain like `app.biznest.com`
- or works on customer domains too
- Recommended:
- keep admin on one central app domain
- keep public sites on customer domains

### 6. Auth/Cookies
- Review NextAuth cookie/domain behavior
- Avoid sharing customer-domain auth cookies unless truly needed
- Keep admin auth scoped to the central app domain if possible

### 7. API Changes
- Make public APIs tenant-aware via resolved host
- Prevent cross-tenant reads/writes
- Validate that lead submissions always attach to the resolved business

### 8. SEO / Metadata
- Generate canonical URLs from the active domain
- Per-domain metadata:
- title
- description
- OG tags
- sitemap
- robots.txt if needed

### 9. Assets / Uploads
- Ensure uploaded logos and page assets work across domains
- Consider business-scoped asset paths
- Make generated links use the correct host

### 10. Error Handling
- Unknown domain -> friendly fallback page
- Inactive domain -> maintenance or inactive notice
- Missing business mapping -> safe default behavior, not data leakage

## Security / Isolation Checklist
- Never infer business from client input if host already determines tenant
- Scope all public queries by resolved `businessId`
- Validate admin actions against authorized business access
- Add tests for cross-tenant isolation

## Local Development Plan
- Start with `localhost` mapping to one business
- Add optional support for hosts file entries like:
- `acme.localtest.me`
- `hvac.localtest.me`
- Use wildcard-friendly dev domains if helpful

## Deployment / Infra Tasks
- Configure multiple domains to point to one app
- Add domains to hosting provider
- Set up SSL for each domain
- Confirm reverse proxy forwards correct host header
- Add domain verification flow if customers can self-connect domains later

## Recommended Rollout Plan
1. Add `Domain` model and migration
2. Build `getBusinessFromHost()` helper
3. Support one public route resolving by host
4. Keep admin on one central domain
5. Make lead capture tenant-aware
6. Add admin UI for domain management
7. Add SEO/canonical support
8. Add tests for tenant isolation

## Open Decisions
- Should admin always live on one central domain?
- Can one business have multiple public domains?
- Do we want custom domains only, or also subdomains like `customer.biznest.com`?
- Should unknown domains show a landing page or 404?

## Nice-to-Have Later
- Customer self-serve domain connection
- DNS verification flow
- Auto-SSL provisioning docs
- Per-domain analytics
- Per-domain email sending identities

## First Practical Build Target
- One central admin domain
- One or more custom public domains
- Domain table in DB
- Middleware/helper to resolve host -> business
- Public pages and lead forms scoped by resolved business
