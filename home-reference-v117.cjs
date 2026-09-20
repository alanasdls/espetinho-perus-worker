'use strict';
// Build-only transformation: preserve everything outside the hero and all
// existing business scripts. The resulting page is plain static HTML/CSS.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const VERSION = '20260920-v127-criar-conta';
const ART = 'assets/hero-reference-v117.webp';
const EXPECTED_ART_SHA256 = 'ff59d613e0ac9fa4eefa8c46738c50680a888c2cabc127841675f15aaf20bea7';

function renderHero(original) {
  const benefits = original.match(/<section class="app-benefits"[\s\S]*?<\/section>/);
  const navlinks = original.match(/<div class="navlinks">[\s\S]*?<\/div>/);
  if (!benefits || !navlinks) throw new Error('Hero source changed: preserve benefits/navigation before publishing.');
  return `<header class="hero ep-reference-header" id="inicio" data-hero-version="${VERSION}">
  <div class="ep-reference-art" aria-hidden="true"><img src="${ART}" width="317" height="331" alt="" fetchpriority="high" decoding="async"></div>
  <nav aria-label="Navegação principal">
    <a class="brand brand-logo" href="#inicio" aria-label="Espetinho Perus"><img src="logo-premium.png" alt="Espetinho Perus"></a>
    ${navlinks[0]}
    <span class="ep-reference-slogan">Sabor,<br>cerveja gelada<br>e resenha</span>
  </nav>
  <div class="hero-inner">
    <div class="hero-copy">
      <h1><span class="ep-title-line">O melhor</span><span class="ep-title-line">do espetinho</span><span class="ep-title-line ep-title-accent">no coração</span><span class="ep-title-line ep-title-accent">de Perus</span></h1>
      <p class="ep-reference-summary"><span>Escolha seus itens, monte o carrinho</span><span>e finalize seu pedido com rapidez.</span></p>
    </div>
    <div class="hero-actions">
      <a class="btn primary" href="#cardapio"><svg class="ep-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 2v5c0 3 6 3 6 0V2M7 2v20M20 2c-3 3-4 6-4 10h4V2Zm0 10v10"/></svg><span>Ver cardápio</span><svg class="ep-cta-arrow" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m3 3 6 7-6 7"/></svg></a>
      <a class="btn ghost hero-register-btn" href="cliente.html?mode=register"><svg class="ep-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg><span>Criar conta</span><svg class="ep-cta-arrow" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m3 3 6 7-6 7"/></svg></a>
    </div>
    ${benefits[0]}
  </div>
</header>`;
}

function prepare(dist = 'dist', root = __dirname) {
  const indexPath = path.join(dist, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const matches = [...html.matchAll(/<header class="hero">[\s\S]*?<\/header>/g)];
  if (matches.length !== 1) throw new Error('Expected exactly one original hero; aborting instead of changing another section.');
  const source = matches[0][0];
  html = html.replace(source, () => renderHero(source));
  html = html.replace(/styles-v105\.css\?v=[^"']+/g, () => `styles-v105.css?v=${VERSION}`);
  html = html.replace(/<meta name="ep-build" content="[^"]+">/, () => `<meta name="ep-build" content="${VERSION}">`);
  // A cursive webfont avoids a different system 'cursive' on each phone.
  html = html.replace('</head>', () => '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap">\n</head>');

  const bytes = fs.readFileSync(path.join(root, ART));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== EXPECTED_ART_SHA256 ||
      bytes.subarray(0, 4).toString() !== 'RIFF' || bytes.subarray(8, 12).toString() !== 'WEBP') {
    throw new Error('Approved header image is invalid or corrupted; not publishing.');
  }
  fs.mkdirSync(path.join(dist, 'assets'), {recursive: true});
  fs.writeFileSync(path.join(dist, ART), bytes);
  const cssPath = path.join(dist, 'styles-v105.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  const scopedCss = fs.readFileSync(path.join(root, 'home-reference-v117.css'), 'utf8');
  fs.writeFileSync(cssPath, css + '\n' + scopedCss);
  fs.writeFileSync(indexPath, html);
  const swPath = path.join(dist, 'sw.js');
  const sw = fs.readFileSync(swPath, 'utf8')
    .replace(/const CACHE = '[^']+';/, () => `const CACHE = 'espetinho-perus-${VERSION}';`)
    .replace(/styles-v105\.css\?v=[^'"\s]+/g, () => `styles-v105.css?v=${VERSION}`);
  fs.writeFileSync(swPath, sw);
  console.log('Header reference validated: four lines, preserved photo, original combo unchanged.');
}
if (require.main === module) prepare(process.argv[2] || 'dist');
module.exports = {prepare, renderHero, VERSION, ART};
