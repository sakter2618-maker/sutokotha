// Builds the Sutokotha demo store into ./dist as plain HTML, CSS and SVG.
// Usage: SITE_URL=https://example.github.io/sutokotha node src/build.js
// The base path for links is taken from SITE_URL, so the same build works on a
// GitHub Pages project site (/sutokotha) or at the root of a custom domain.
const fs = require('fs');
const path = require('path');
const { productSvg, heroSvg } = require('./art');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalog.json'), 'utf8'));
const SITE_URL = (process.env.SITE_URL || 'http://localhost:8080').replace(/\/$/, '');
const BASE = new URL(SITE_URL).pathname.replace(/\/$/, '');
const { site, categories, products, journal } = data;
const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));

// SEO settings live in data/seo-settings.json so that fixes are plain data changes that a
// person can review in a pull request. The starting values reproduce the seeded issues listed
// in docs/SEEDED_ISSUES.md.
const SEED = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/seo-settings.json'), 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = p => BASE + p;
const abs = p => SITE_URL + p;
const money = n => '$' + n.toFixed(0);
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}

const NAV = categories.map(c => `<a href="${url('/shop/' + c.slug + '/')}">${esc(c.name)}</a>`).join('');
function layout({ title, description, pathName, canonical = true, ogImage, body, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ''}
${canonical ? `<link rel="canonical" href="${abs(pathName)}">` : ''}
<meta property="og:title" content="${esc(title)}">
${description ? `<meta property="og:description" content="${esc(description)}">` : ''}
<meta property="og:image" content="${abs(ogImage || '/images/hero.svg')}">
<meta property="og:type" content="website">
<link rel="icon" href="${url('/images/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&family=Rozha+One&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&family=Rozha+One&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&family=Rozha+One&display=swap"></noscript>
<link rel="stylesheet" href="${url('/styles.css')}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<p class="demo-note">This is a demo store built for a portfolio project. Products are not for sale and checkout is turned off.</p>
<header class="site-header">
  <a class="wordmark" href="${url('/')}"><span>Sutokotha</span><span class="bn" lang="bn">${site.bnName}</span></a>
  <nav aria-label="Shop by craft">${NAV}</nav>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div>
    <p class="wordmark small"><span>Sutokotha</span></p>
    <p>A fictional shop of Bangladeshi kantha and jamdani, made as the test site for an SEO automation project.</p>
  </div>
  <nav aria-label="Footer">
    <a href="${url('/shop/')}">All products</a>
    <a href="${url('/journal/')}">Journal</a>
    <a href="${url('/about/')}">About this demo</a>
  </nav>
</footer>
<script>
document.querySelectorAll('[data-add]').forEach(function (b) {
  b.addEventListener('click', function () {
    var m = document.getElementById(b.getAttribute('data-add'));
    if (m) m.textContent = 'Checkout is turned off: Sutokotha is a demo store, so nothing was added.';
  });
});
</script>
</body>
</html>
`;
}

function card(p) {
  const cat = catBySlug[p.category];
  const out = p.stock === 0;
  return `<li class="card">
  <a href="${url('/products/' + p.slug + '/')}">
    <img src="${url('/images/products/' + p.slug + '.svg')}" alt="${esc(p.name)}" width="400" height="400" loading="lazy">
    <span class="card-name">${esc(p.name)}</span>
    <span class="card-meta">${esc(cat.name)}, ${esc(p.size)}</span>
    <span class="price">${money(p.price)}${out ? ' <span class="sold-out">Sold out</span>' : ''}</span>
  </a>
</li>`;
}

// ---------- Home ----------
const featured = products.filter(p => p.featured);
write('index.html', layout({
  title: 'Sutokotha: hand-stitched kantha and jamdani from Bangladesh',
  description: 'Kantha throws, jamdani scarves, cushion covers and table linen, stitched and woven by hand in Bangladesh. A demo store for an SEO automation project.',
  pathName: '/',
  body: `
<section class="hero">
  <div class="hero-text">
    <h1>Every throw holds about forty thousand stitches.</h1>
    <p class="lede">${esc(site.tagline)} Each piece is layered from old cotton saris and quilted by hand with the kantha running stitch.</p>
    <a class="button" href="${url('/shop/kantha-throws/')}">Shop kantha throws</a>
  </div>
  <img class="hero-art" src="${url('/images/hero.svg')}" alt="Rows of indigo and green running stitches with a rose lotus, the Nodi kantha pattern" width="800" height="800">
</section>

<section class="crafts" aria-labelledby="crafts-h">
  <h2 id="crafts-h">Shop by craft</h2>
  <ul class="craft-grid">
    ${categories.map((c, i) => {
      const first = products.find(p => p.category === c.slug);
      return `<li class="craft craft-${i}"><a href="${url('/shop/' + c.slug + '/')}">
        <img src="${url('/images/products/' + first.slug + '.svg')}" alt="" width="400" height="400" loading="lazy">
        <span class="craft-name">${esc(c.name)}</span>
        <span class="craft-count">${products.filter(p => p.category === c.slug).length} pieces</span>
      </a></li>`;
    }).join('')}
  </ul>
</section>

<section aria-labelledby="new-h">
  <h2 id="new-h">New this season</h2>
  <ul class="grid">${featured.map(card).join('')}</ul>
  <p><a class="text-link" href="${url('/shop/')}">See all ${products.length} products</a></p>
</section>

<section class="making" aria-labelledby="making-h">
  <h2 id="making-h">How a kantha is made</h2>
  <ol class="steps">
    <li><h3>Layer</h3><p>Three or four washed cotton saris are laid on top of each other.</p></li>
    <li><h3>Tack</h3><p>The edges are tacked and the main motif is drawn lightly in chalk.</p></li>
    <li><h3>Stitch</h3><p>Rows of small, even running stitches fill the cloth, about six to the inch.</p></li>
    <li><h3>Wash</h3><p>A final wash shrinks the cotton around the thread and gives the rippled texture.</p></li>
  </ol>
  <p><a class="text-link" href="${url('/journal/how-a-kantha-is-made/')}">Read the full story in our journal</a></p>
</section>`
}));

// ---------- Shop (all) and categories ----------
write('shop/index.html', layout({
  title: 'All products | Sutokotha',
  description: 'Browse every Sutokotha piece: kantha throws, jamdani scarves, cushion covers, table linen and tote bags.',
  pathName: '/shop/',
  body: `<div class="page-head"><h1>All products</h1><p class="lede">${products.length} pieces across ${categories.length} crafts.</p></div>
<ul class="grid">${products.map(card).join('')}</ul>`
}));
for (const c of categories) {
  const list = products.filter(p => p.category === c.slug);
  write(`shop/${c.slug}/index.html`, layout({
    title: `${c.name} | Sutokotha`,
    description: c.metaDescription,
    pathName: `/shop/${c.slug}/`,
    canonical: !SEED.categoryPagesWithoutCanonical,
    ogImage: `/images/products/${list[0].slug}.svg`,
    body: `<nav class="crumbs" aria-label="Breadcrumb"><a href="${url('/shop/')}">All products</a></nav>
<div class="page-head"><h1>${esc(c.name)}</h1><p class="lede">${esc(c.intro)}</p></div>
<ul class="grid">${list.map(card).join('')}</ul>`
  }));
}

// ---------- Products ----------
for (const p of products) {
  const c = catBySlug[p.category];
  const out = p.stock === 0;
  const related = products.filter(x => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const img = `/images/products/${p.slug}.svg`;
  const altAttr = SEED.imageWithoutAlt.includes(p.slug) ? '' : ` alt="${esc(p.name)}, ${esc(c.name.toLowerCase())} in ${esc(p.material.toLowerCase())}"`;
  write(`products/${p.slug}/index.html`, layout({
    title: `${p.name} | Sutokotha`,
    description: p.metaDescription,
    pathName: `/products/${p.slug}/`,
    ogImage: img,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku,
      image: abs(img), description: p.description, category: c.name, material: p.material,
      brand: { '@type': 'Brand', name: 'Sutokotha (demo)' },
      offers: { '@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'USD', url: abs(`/products/${p.slug}/`),
        availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' }
    },
    body: `<nav class="crumbs" aria-label="Breadcrumb"><a href="${url('/shop/')}">All products</a> / <a href="${url('/shop/' + c.slug + '/')}">${esc(c.name)}</a></nav>
<article class="product">
  <img class="product-art" src="${url(img)}"${altAttr} width="800" height="800">
  <div class="product-info">
    <h1>${esc(p.name)} <span class="bn" lang="bn">${p.bn}</span></h1>
    <p class="price big">${money(p.price)}</p>
    <p class="stock ${out ? 'out' : ''}">${out ? 'Sold out. A new one is being stitched.' : (p.stock <= 3 ? `Only ${p.stock} left` : 'In stock')}</p>
    <p>${esc(p.description)}</p>
    <dl class="specs">
      <div><dt>Material</dt><dd>${esc(p.material)}</dd></div>
      <div><dt>Size</dt><dd>${esc(p.size)}</dd></div>
      <div><dt>Care</dt><dd>${esc(p.care)}</dd></div>
      <div><dt>SKU</dt><dd>${esc(p.sku)}</dd></div>
    </dl>
    <button class="button" type="button" data-add="msg-${p.sku}" ${out ? 'disabled' : ''}>${out ? 'Sold out' : 'Add to bag'}</button>
    <p class="cart-msg" id="msg-${p.sku}" role="status" aria-live="polite"></p>
  </div>
</article>
${related.length ? `<section aria-labelledby="rel-h"><h2 id="rel-h">More ${esc(c.name.toLowerCase())}</h2><ul class="grid">${related.map(card).join('')}</ul></section>` : ''}`
  }));
}

// ---------- Journal ----------
write('journal/index.html', layout({
  title: 'Journal | Sutokotha',
  description: 'Stories about kantha and jamdani: how the textiles are made and how to look after them.',
  pathName: '/journal/',
  body: `<div class="page-head"><h1>Journal</h1></div>
<ul class="posts">${journal.map(j => `<li><a href="${url('/journal/' + j.slug + '/')}"><span class="post-title">${esc(j.title)}</span><time datetime="${j.date}">${new Date(j.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time></a></li>`).join('')}</ul>`
}));
for (const j of journal) {
  const heading = j.noH1 ? `<p class="h1-look">${esc(j.title)}</p>` : `<h1>${esc(j.title)}</h1>`;
  write(`journal/${j.slug}/index.html`, layout({
    title: `${j.title} | Sutokotha journal`,
    description: j.metaDescription,
    pathName: `/journal/${j.slug}/`,
    body: `<article class="post">${heading}<p class="post-date"><time datetime="${j.date}">${j.date}</time></p>${j.body.map(t => `<p>${esc(t)}</p>`).join('')}
<p><a class="text-link" href="${url('/shop/kantha-throws/')}">Shop kantha throws</a></p></article>`
  }));
}

// ---------- About, 404 ----------
write('about/index.html', layout({
  title: 'About this demo store | Sutokotha',
  description: 'Sutokotha is a fictional store used to test an n8n SEO and e-commerce growth agent. Here is what it is and why it exists.',
  pathName: '/about/',
  body: `<article class="post"><h1>About this demo store</h1>
<p>Sutokotha is not a real shop. It was built as the test website for an n8n automation that audits SEO, measures page speed and suggests improvements.</p>
<p>The crafts are real. Kantha is a Bengali tradition of layering old cotton cloth and quilting it with running stitch, and jamdani is a handloom technique in which motifs are woven into fine cotton. The product names, prices and stock levels are invented.</p>
<p>Some pages were published with common SEO problems on purpose, so the agent has something real to find and fix. Changes to the site go through a pull request and are only published after a person approves them.</p></article>`
}));
write('404.html', layout({
  title: 'Page not found | Sutokotha', description: '', pathName: '/404.html', canonical: false,
  body: `<div class="page-head"><h1>That page is not here</h1><p class="lede">The link may be old, or the product may have been renamed.</p><a class="button" href="${url('/shop/')}">Browse all products</a></div>`
}));

// ---------- Images ----------
for (const p of products) write(`images/products/${p.slug}.svg`, productSvg(p, catBySlug[p.category].art));
write('images/hero.svg', heroSvg());
write('images/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#22306A"/><path d="M5 11h22M5 16h22M5 21h22" stroke="#DFA422" stroke-width="2.4" stroke-dasharray="3 2.5" stroke-linecap="round"/></svg>`);

// ---------- robots.txt and sitemap ----------
const pages = ['/', '/shop/', ...categories.map(c => `/shop/${c.slug}/`), ...products.map(p => `/products/${p.slug}/`), '/journal/', ...journal.map(j => `/journal/${j.slug}/`), '/about/'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${abs(p)}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nDisallow: /cart/\n${SEED.robotsWithoutSitemapLine ? '' : `Sitemap: ${abs('/sitemap.xml')}\n`}`);

// ---------- Exports ----------
fs.copyFileSync(path.join(ROOT, 'src/styles.css'), path.join(OUT, 'styles.css'));
write('.nojekyll', '');
const csvRows = [['SKU', 'Name', 'Type', 'Published', 'Short description', 'Description', 'In stock?', 'Stock', 'Regular price', 'Categories', 'Images', 'Attribute 1 name', 'Attribute 1 value(s)', 'Attribute 2 name', 'Attribute 2 value(s)']];
for (const p of products) csvRows.push([p.sku, p.name, 'simple', '1', p.metaDescription, p.description, p.stock > 0 ? '1' : '0', String(p.stock), p.price.toFixed(2), catBySlug[p.category].name, abs(`/images/products/${p.slug}.svg`), 'Material', p.material, 'Size', p.size]);
fs.writeFileSync(path.join(ROOT, 'data/woocommerce-products.csv'), csvRows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n') + '\n');
console.log(`Built ${pages.length} pages and ${products.length} product images for ${SITE_URL}`);
