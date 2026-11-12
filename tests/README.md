# Tests

Nothing here talks to Supabase, Vercel or any job provider.

| Suite | Command | What it covers |
|---|---|---|
| Unit (Node 22) | `node --experimental-strip-types --test tests/unit/*.test.ts` | Relevance filter (legitimate roles kept, unrelated dropped), salary text, provider normalisers, check outcomes, environment guard |
| Database | `tests/db/run.sh` | The verification proposal SQL on a throwaway local Postgres 16: outages, partial imports, two-miss removal, reappearance, closing dates, broken links, rate limits, duplicates, 2,500-job pagination, public access, concurrency |

`tests/db/run.sh` refuses any host other than a local socket or localhost. Start a local server first, e.g.

```sh
initdb -D /tmp/pgtest-data -U wta --auth=trust && pg_ctl -D /tmp/pgtest-data -o '-p 55432 -k /tmp' start
```
