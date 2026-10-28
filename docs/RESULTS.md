# Results: agent audit → reviewed fix → re-audit

Both audits were run by the n8n SEO Growth Agent from a Hostinger VPS against the live
site, https://sakter2618-maker.github.io/sutokotha/.

| | Before (run_47) | After (run_48) |
|---|---|---|
| Date (UTC) | 2026-10-28 04:15 | 2026-10-28 04:23 |
| Pages audited | 35 / 35 | 35 / 35 |
| SEO health score | **91** | **98** |
| Medium findings | 5 | **0** |
| Low findings | 5 | 5 |
| Total findings | 12 | 7 |

The change between the two runs was [pull request #1](https://github.com/sakter2618-maker/sutokotha/pull/1).
`tools/propose-fixes.js` generated it from run_47's findings, and a person reviewed and
merged it. GitHub Actions then rebuilt the site.

## What changed

| Finding (run_47) | Pages | Fix in PR #1 | After |
|---|---|---|---|
| Meta description missing | 6 | Descriptions written from sentences already on each page | ✅ Gone |
| No canonical tag | 5 category pages | Self-referencing canonical | ✅ Gone |
| Images without alt text | 3 | Descriptive alt text | ✅ Gone |
| Duplicate title | 2 | Smaller Nodi throw renamed "Nodi kantha throw, 40 × 55 in" | ✅ Gone |
| No H1 | 1 journal post | Title made a real `<h1>` | ✅ Gone |

## Still open, on purpose

| Finding | Why it was not auto-fixed |
|---|---|
| No H2 subheadings (3 pages) | Editorial: needs someone to decide the page structure |
| Thin content / short title on `/journal/` | Editorial: needs new writing |
| No robots.txt, sitemap not declared | Search engines read robots.txt only at `sakter2618-maker.github.io/`, outside this repo. The fix is to submit the sitemap in Search Console |
| PageSpeed not measured | No API key configured yet. The agent records `RATE_LIMITED` instead of guessing a score |

## Second cycle: speed (PageSpeed Insights, Lighthouse 13.5)

Agent run_49 measured the home page and listed one opportunity: **render-blocking
requests** (the Google Fonts stylesheet). [Pull request #2](https://github.com/sakter2618-maker/sutokotha/pull/2)
made the font stylesheet non-blocking. It was reviewed, merged and re-measured in run_50.

| | Before (run_49) | After (run_50) |
|---|---|---|
| Mobile score | 92 | 92 |
| Desktop score | 99 | 99 |
| Mobile FCP / LCP (lab) | 2.7 s / 2.7 s | 2.7 s / 2.7 s |
| Desktop FCP / LCP (lab) | 683 ms / 683 ms | 712 ms / 712 ms |
| Opportunities listed | Render-blocking requests (~2.1 s mobile, ~500 ms desktop) | **None** |

**What this shows:** the flagged problem is gone. Lighthouse no longer lists any
opportunity, but the scores did not move. The estimated "~2.1 s" saving was an upper
bound. The remaining time is mostly network and server response on GitHub Pages under
Lighthouse's simulated mobile connection, which page code can't fix. Lab numbers also vary
a little between runs (desktop 683 → 712 ms is within normal noise). The site has too
little traffic for Google's real-user (field) data, so only lab data is available.
