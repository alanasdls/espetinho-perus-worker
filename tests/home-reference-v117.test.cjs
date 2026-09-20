'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {prepare, renderHero, VERSION} = require('../home-reference-v117.cjs');
const root = path.resolve(__dirname, '..');
const benefits = '<section class="app-benefits" id="como-funciona"><article>Benefício original</article></section>';
const nav = '<div class="navlinks"><a href="cliente.html">Minha conta</a></div>';
const header = '<header class="hero"><nav>' + nav + '</nav><div id="inicio"><h1>Original</h1>' + benefits + '</div></header>';
const suffix = '<main><section id="combo">Combo original R$ 39,90</section><div id="cardapio"></div><div id="cartOverlay"></div></main><script>const value = "$&";</script>';
function fixture() {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-header-'));
  fs.writeFileSync(path.join(dist, 'index.html'), '<html><head><meta name="ep-build" content="OLD"><link rel="stylesheet" href="styles-v105.css?v=old"></head><body>' + header + suffix + '</body></html>');
  fs.writeFileSync(path.join(dist, 'styles-v105.css'), '/* original CSS */');
  fs.writeFileSync(path.join(dist, 'sw.js'), "const CACHE = 'old';\nconst url = './styles-v105.css?v=old';");
  return dist;
}
test('four headline lines; original anchors and benefits retained', () => {
  const result = renderHero(header);
  assert.equal((result.match(/ep-title-line/g)||[]).length, 4);
  assert.equal((result.match(/id="inicio"/g)||[]).length, 1);
  assert.ok(result.includes(benefits));
  assert.ok(result.includes(nav));
  assert.ok(result.includes('href="#cardapio"'));
  assert.ok(result.includes('href="cliente.html?mode=register"'));
  assert.ok(result.includes('width="317" height="331"'));
});
test('build transforms only header and its versioned resources', () => {
  const dist=fixture();
  try {
    prepare(dist,root);
    const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
    assert.ok(html.includes(suffix),'Combo, cart and original script bytes must not change');
    assert.ok(html.includes(VERSION));
    assert.equal((html.match(/<h1>/g)||[]).length,1);
    assert.ok(!html.includes('class="hero-art"'));
    assert.ok(fs.readFileSync(path.join(dist,'styles-v105.css'),'utf8').startsWith('/* original CSS */'));
    assert.ok(fs.readFileSync(path.join(dist,'sw.js'),'utf8').includes(VERSION));
    assert.ok(fs.statSync(path.join(dist,'assets/hero-reference-v117.webp')).size>10000);
    assert.throws(()=>prepare(dist,root),/exactly one original hero/,'Never duplicate the header on a second pass');
  } finally { fs.rmSync(dist,{recursive:true,force:true}); }
});
test('unexpected source markup fails closed before overwriting output', () => {
  const dist=fixture();
  try {
    const original='<html><head></head><body>Another page</body></html>';
    fs.writeFileSync(path.join(dist,'index.html'),original);
    assert.throws(()=>prepare(dist,root),/exactly one original hero/);
    assert.equal(fs.readFileSync(path.join(dist,'index.html'),'utf8'),original);
  } finally { fs.rmSync(dist,{recursive:true,force:true}); }
});
