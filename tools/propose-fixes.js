// Turns SEO Growth Agent findings into concrete changes to this store's data files,
// and writes a pull-request description that links every change to the finding behind it.
//
// Usage: node tools/propose-fixes.js findings.json [pr-body.md]
// findings.json is an array of findings from the agent (findingId, title, severity,
// evidence, affectedUrls). Only data/catalog.json and data/seo-settings.json are edited.
// Nothing is published: the changes go live only after a person merges the pull request.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const catalogPath = path.join(ROOT, 'data/catalog.json');
const settingsPath = path.join(ROOT, 'data/seo-settings.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const findings = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bodyPath = process.argv[3] || path.join(ROOT, 'pr-body.md');

const slugFrom = (u, kind) => { const m = String(u).match(new RegExp('/' + kind + '/([a-z0-9-]+)/')); return m ? m[1] : null; };
const urlsOf = f => (Array.isArray(f.affectedUrls) ? f.affectedUrls : String(f.affectedUrls || '').split(/\s*\|\s*|\s*,\s*|\s+/)).filter(Boolean);

// A description built only from text already on the page: whole sentences, at most 155 characters.
function describe(text, suffix) {
  const sentences = String(text).match(/[^.!?]+[.!?]/g) || [String(text)];
  let out = '';
  for (const s of sentences) { const next = (out + ' ' + s.trim()).trim(); if (next.length > 155 - (suffix ? suffix.length + 1 : 0)) break; out = next; }
  if (!out) out = sentences[0].trim().slice(0, 150);
  return suffix ? `${out} ${suffix}` : out;
}

const changes = [];   // { findingId, change }
const skipped = [];   // { findingId, reason }
const note = (f, change) => changes.push({ findingId: f.findingId, change });

for (const f of findings) {
  const urls = urlsOf(f);
  switch (f.findingId) {
    case 'MISSING_META_DESCRIPTION':
      for (const u of urls) {
        const ps = slugFrom(u, 'products'), cs = slugFrom(u, 'shop'), js = slugFrom(u, 'journal');
        const p = ps && catalog.products.find(x => x.slug === ps);
        const c = cs && catalog.categories.find(x => x.slug === cs);
        const j = js && catalog.journal.find(x => x.slug === js);
        if (p && !p.metaDescription) { p.metaDescription = describe(p.description, `${p.size}.`); note(f, `Product \`${p.slug}\`: meta description "${p.metaDescription}"`); }
        else if (c && !c.metaDescription) { c.metaDescription = describe(c.intro); note(f, `Category \`${c.slug}\`: meta description "${c.metaDescription}"`); }
        else if (j && !j.metaDescription) { j.metaDescription = describe(j.body.join(' ')); note(f, `Journal \`${j.slug}\`: meta description "${j.metaDescription}"`); }
      }
      break;
    case 'MISSING_CANONICAL':
      if (settings.categoryPagesWithoutCanonical && urls.some(u => slugFrom(u, 'shop'))) { settings.categoryPagesWithoutCanonical = false; note(f, 'Category pages: add self-referencing `rel="canonical"`'); }
      break;
    case 'IMAGES_MISSING_ALT':
      for (const u of urls) {
        const s = slugFrom(u, 'products');
        if (s && settings.imageWithoutAlt.includes(s)) { settings.imageWithoutAlt = settings.imageWithoutAlt.filter(x => x !== s); note(f, `Product \`${s}\`: add descriptive alt text to the main image`); }
      }
      break;
    case 'DUPLICATE_TITLE': {
      const prods = urls.map(u => catalog.products.find(x => x.slug === slugFrom(u, 'products'))).filter(Boolean);
      const byName = {};
      for (const p of prods) (byName[p.name] = byName[p.name] || []).push(p);
      for (const group of Object.values(byName)) group.slice(1).forEach(p => {
        const old = p.name; p.name = `${p.name}, ${p.size}`;
        note(f, `Product \`${p.slug}\`: rename "${old}" to "${p.name}" so its title is unique`);
      });
      break;
    }
    case 'MISSING_H1':
      for (const u of urls) {
        const j = catalog.journal.find(x => x.slug === slugFrom(u, 'journal'));
        if (j && j.noH1) { j.noH1 = false; note(f, `Journal \`${j.slug}\`: make the title a real \`<h1>\``); }
      }
      break;
    case 'SITEMAP_NOT_DECLARED':
      if (settings.robotsWithoutSitemapLine) { settings.robotsWithoutSitemapLine = false; note(f, 'robots.txt: add the `Sitemap:` line'); }
      break;
    default:
      skipped.push({ findingId: f.findingId, reason: 'No automatic fix. Needs a person to decide (content, design or server change).' });
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 1) + '\n');
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

const fixedIds = [...new Set(changes.map(c => c.findingId))];
const body = [
  '## SEO fixes proposed by the SEO Growth Agent',
  '',
  `${changes.length} changes for ${fixedIds.length} findings. Only \`data/catalog.json\` and \`data/seo-settings.json\` are edited.`,
  '**Nothing goes live until this pull request is reviewed and merged.**',
  '',
  ...fixedIds.flatMap(id => {
    const f = findings.find(x => x.findingId === id);
    return [`### ${f.severity} · ${f.title} (\`${id}\`)`, '', `Evidence: ${String(f.evidence).slice(0, 400)}`, '', ...changes.filter(c => c.findingId === id).map(c => `- ${c.change}`), ''];
  }),
  ...(skipped.length ? ['### Not changed automatically', '', ...skipped.map(s => `- \`${s.findingId}\`: ${s.reason}`), ''] : []),
  'Meta descriptions are built from sentences already on each page. Please check the wording before merging.'
].join('\n');
fs.writeFileSync(bodyPath, body + '\n');
console.log(`${changes.length} changes for ${fixedIds.length} findings; ${skipped.length} left for review. PR body: ${bodyPath}`);
