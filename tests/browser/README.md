Browser checks for the Job Portal, run against a local static harness
(`job-portal-harness.tsx` renders `app/job-portal/page.tsx` with the API
mocked over 26 real listings). Build it with esbuild and serve on :8767, then
`node job-portal-trust.spec.cjs` (Playwright). No live site or database is used.
