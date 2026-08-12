# Archive

Pages pulled out of the live site but kept around.

## shop.html / shop.js — merch (tees), archived 2026-08-12

The Shop page and its PayPal checkout script. Never finished: the products,
prices, and photos were still placeholders, and `PAYPAL_CLIENT_ID` in `shop.js`
was still the `'sb'` sandbox value.

Archived by removing the `Shop` link from the nav on `index.html` and
`music.html`, and moving both files here. The page is marked `noindex`, and its
asset paths were rewritten to point up one level (`../styles.css`, `../main.js`,
`../favicons/…`) so it still renders from this folder.

The `.shop-grid` / `.product` rules were left in `styles.css` — the archived page
needs them, and they cost nothing while unused.

To bring it back: move both files to the repo root, undo the `../` prefixes and
the `noindex` meta in `shop.html`, and add `<a href="shop.html">Shop</a>` back to
the nav on each page.
