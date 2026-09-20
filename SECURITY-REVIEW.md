# Security review — 2026-09-20

Implemented V148:
- Payment status requires the bearer tracking token matching the requested payment. Pix sends it in X-Order-Token.
- PagBank notifications never authorize payment from caller-supplied status; known checkout is queried with server credentials and lookup failures return 503. AUTHORIZED is no longer treated as captured/paid. Official status reference: https://developer.pagbank.com.br/reference/objeto-charge
- Provider synchronization binds Mistic payments and PagBank checkouts to their stored IDs; Mercado Pago additionally checks amount and BRL.
- Checkout rejects unknown products and already stored order IDs; prices remain server-owned. This KV duplicate check is not atomic and is not a distributed idempotency guarantee.
- Public cash confirmation blocked. Only a server-validated, authenticated zero-total reward checkout can use that path. A future cash workflow must require staff confirmation before points/payment approval.
- Account order reads require authenticated customer ID, not an email supplied on an order.
- Order item HTML is escaped; security headers added; service worker avoids caching tracking requests and protected/document responses.
- Push sends allow only recognized HTTPS push-service hosts and reject redirects; checkout return URLs are fixed to the storefront.

Validation: Node regression and security tests with isolated mocks. No real payments or customer point changes used for testing. No Supabase schema or production data changed in this release.

Remaining work / limits:
- V149 replaces shared-key access with individual Supabase-verified accounts, server-side role enforcement, revocable 8-hour sessions, rate limits and audit. MFA omitted at the owner's request. See ADMIN-ACCESS.md. Old independently deployed Workers still require decommissioning in Cloudflare.
- Configure and verify edge rate limits/WAF and bot protection; code changes alone do not provide abuse or DDoS protection.
- Supabase audit reported leaked-password protection disabled and trigger-function privilege/search-path hardening opportunities; review/apply separately, preserving existing loyalty migrations.
- Legacy normal-order checkout uses KV rather than atomic reservation. Concurrent duplicate order IDs remain a risk; migrate to transactional creation like reward checkout.
- Full strict script CSP needs removal/nonces for existing inline scripts; current policy covers framing, objects and base URLs only.
- Reconcile provider failure/reversal/race cases, webhook retries, pending reward reservations and provider amount checks across all integrations.
- This is a targeted remediation, not a complete penetration test or certification.
