# Seeded SEO issues

Sutokotha was published with some common SEO problems on purpose. This gives the
SEO Growth Agent real issues to find, and the before/after numbers in the portfolio
come from fixing them.

| # | Issue | Where | Expected finding |
|---|---|---|---|
| 1 | Meta description empty or missing | `/shop/cushion-covers/`, 4 product pages, 1 journal post | `MISSING_META_DESCRIPTION` (6 pages) |
| 2 | No canonical tag | All 5 category pages | `MISSING_CANONICAL` (5 pages) |
| 3 | Product image without alt text | Mati throw, Tara scarf, Mini pouch | `IMAGES_MISSING_ALT` (3 pages) |
| 4 | Two products share one title | Both "Nodi kantha throw" sizes | `DUPLICATE_TITLE` (2 pages) |
| 5 | Journal post title styled as text, not an H1 | `/journal/caring-for-hand-stitched-cotton/` | `MISSING_H1` (1 page) |
| 6 | robots.txt does not list the sitemap | `/robots.txt` | `SITEMAP_NOT_DECLARED` |

The switches for issues 2, 3 and 6 are in `src/build.js` (the `SEED` object).
Issues 1, 4 and 5 come from `data/catalog.json` (empty `metaDescription`, the
same `name` on two products, and `noH1: true`).

## Verified on 2026-10-27

The agent's own extraction and findings code was run against a local build. It
crawled all 35 sitemap URLs and found all 6 seeded issues, plus 3 smaller issues
that were not planted:

- `NO_H2_STRUCTURE` on 3 pages
- `THIN_CONTENT` on `/journal/`
- `TITLE_TOO_SHORT` on `/journal/`

A one-level crawl from the home page (how the agent worked in M2) reached 18 pages.
It found only issues 1 (partly), 2 and 6, because the other seeded issues are
deeper in the site.
