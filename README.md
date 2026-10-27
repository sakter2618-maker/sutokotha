# Sutokotha (সুতোকথা) — demo e-commerce store

A fictional online shop for Bangladeshi kantha and jamdani textiles. It is the
authorized test website for the n8n **SEO Growth Agent** portfolio project. The site
says on every page that it is a demo, and checkout is turned off.

- 24 products in 5 categories, with generated product artwork (SVG)
- Home, category, product, journal, about and 404 pages
- Product structured data (schema.org `Product` JSON-LD), `sitemap.xml`, `robots.txt`
- A WooCommerce import file (`data/woocommerce-products.csv`), so the same catalog
  can be loaded into a WordPress store
- Some SEO issues were left in on purpose for the agent to find. They are listed in
  [docs/SEEDED_ISSUES.md](docs/SEEDED_ISSUES.md).

## Build

Building needs only Node.js 18 or newer. There are no dependencies to install.

```bash
SITE_URL=https://sakter2618-maker.github.io/sutokotha node src/build.js
# output is in dist/
cd dist && python3 -m http.server 8080   # preview at http://localhost:8080
```

## Files

| Path | What it is |
|---|---|
| `data/catalog.json` | Products, categories and journal posts: the single source of content |
| `src/build.js` | Static site generator |
| `src/art.js` | Draws each product image from its thread colours |
| `src/styles.css` | All styles |
| `docs/DESIGN.md` | Design tokens and decisions |
