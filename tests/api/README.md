Route-level tests run without Next.js or a database: bundle with esbuild,
aliasing `@/lib/supabase` to the stub and `next/server` to a minimal stub, then run with node.
`report-security-test.ts` covers the "Report an unavailable job" endpoint:
input validation, note scrubbing, no personal data sent, flood control,
and safe errors before/after the SQL is applied.
