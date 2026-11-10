# Storefront visual direction

This is an original design for the existing Next.js/React + Supabase e-commerce application. Its design process was informed by the public [MotionSites Web Builder skill](https://github.com/Motionsites-AI/claude-skill), especially its craft, example index, and review guidance. No third-party example page or media library was copied.

## Creative brief

- Audience: everyday retail buyers in India, and approved wholesale buyers.
- Mood: considered, tactile, optimistic.
- Signature: oversized editorial headline alongside an original CSS-rendered still life of essential-product packaging, with sculptural depth rather than video-heavy effects.
- Voice: clear, calm and direct. No claims of verified reviews or shipping speeds before the relevant capabilities exist.
- Brand: "yourstore." is temporary until the business chooses the final public brand identity.

## Design tokens and layout

| Element | Specification |
| --- | --- |
| Page background | #f6f4ed |
| Forest ink | #193b30 / #10271f |
| Product accent | #e5b779 |
| Muted secondary copy | #6f786c |
| Display type | Geist, ~64–112px desktop hero, negative tracking |
| Serif accents | Georgia, italic, limited to standout phrases |
| Desktop hero | 54/46 split, ~710px minimum |
| Product grid | 3 across desktop, 2 tablet, 1 narrow mobile |
| Animation | 0.85s one-shot entrance, staggered by ~0.1s |
| Reduced motion | animations disabled via prefers-reduced-motion |
| Responsive nav | visible links desktop; accessible disclosure menu on mobile |

## Scope

- Shared storefront header and footer
- New homepage
- Searchable/filterable catalog drawing real product data from Supabase
- Individual product details showing safe retail or authorized wholesale prices
- Shopping cart integrated into the storefront shell

The previous authenticated admin, product management, storage, wholesale approval and database actions remain in place. This design milestone does not enable checkout or payments.

## Review checklist

- [ ] Run ESLint, TypeScript and production build in GitHub Actions
- [ ] Check 1440px desktop screenshot and ~390px mobile screenshot
- [ ] Check no horizontal overflow, missing imagery or visible layout shifts
- [ ] Confirm header links and mobile nav are usable by keyboard
- [ ] Confirm product search and filter state works
- [ ] Confirm product detail/cart flows and unchanged wholesale permissions
- [ ] Confirm no customer-facing claim suggests checkout is active

Screenshots have **not** yet been taken from the running Next.js site; desktop/mobile visual sign-off is pending.
