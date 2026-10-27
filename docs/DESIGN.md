# Sutokotha — design plan

**Concept.** Sutokotha (সুতোকথা, "thread stories") is a demo online shop for Bangladeshi
kantha and jamdani textiles: throws, scarves, cushion covers, table linen and totes,
sold to homes in the US. It is a fictional store, built as the authorized test site for
the n8n SEO Growth Agent. The site says it is a demo, and checkout is turned off.

**Audience.** People furnishing a home who care who made the things they buy and how.

**Primary job.** Help someone browse by craft, understand what makes a piece handmade
and choose one.

## Tokens

| Name | Hex | Use |
|---|---|---|
| Cotton | `#F7F8F5` | Page background. Cool undyed cotton, deliberately not cream |
| Indigo | `#22306A` | Text, header, primary buttons |
| Turmeric | `#DFA422` | The stitch: dashed lines, focus ring, price tags |
| Leaf | `#3C7A57` | Stock status, success |
| Rose thread | `#C4426B` | Sparing second thread colour in art and sale notes |
| Slate | `#5D6275` | Secondary text |

**Type.**
- Rozha One for display: high-contrast and influenced by South Asian lettering.
- Hind Siliguri for body: covers Latin and Bengali, so product names can carry their Bengali names.
- Scale: 1.25 ratio on a 17px base.

**Layout.**

```
Home
┌──────────────────────────────────────────────┐
│ header: wordmark · Throws Scarves Cushions…  │
├───────────────────────┬──────────────────────┤
│ Headline (left)       │  big kantha panel    │
│ one sentence          │  (generated SVG,     │
│ [Shop throws]         │   stitch border)     │
├───────────────────────┴──────────────────────┤
│ Shop by craft: 5 tiles, uneven sizes (1 big) │
├──────────────────────────────────────────────┤
│ New pieces: product grid, stitched frames    │
├──────────────────────────────────────────────┤
│ How a kantha is made: a real 4-step sequence │
└──────────────────────────────────────────────┘
```

Everything is left aligned. Product grids are 4 columns on desktop, 2 on mobile.

**Principles.**
- The running stitch is the one bold element. It appears as dashed turmeric lines
  for section rules, product frames and the focus ring. There are no drop shadows
  and no gradients.
- Corners are square except for buttons, which get a 2px radius.
- The product art is the colour on the page. The interface itself stays indigo on cotton.
- The numbered steps are used only for the making process, because that is a real sequence.

**Review against defaults.** The first idea was a warm cream page with a terracotta accent.
That is a recognisable AI default, so the page uses cool cotton white and turmeric instead.
Uppercase eyebrow labels were also cut.
