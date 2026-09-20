#!/usr/bin/env bash
set -euo pipefail

DIST="dist"
# Origem dos assets históricos ainda não versionados (mantida).
SOURCE_ORIGIN="${STATIC_ASSET_SOURCE_ORIGIN:-https://espetinho-perus-site.pages.dev}"

rm -rf "$DIST"
mkdir -p "$DIST"
mkdir -p "$DIST/assets"

if [ -s "assets-src/hero-v112.b64" ]; then
  base64 -d "assets-src/hero-v112.b64" > "$DIST/assets/hero-v112.webp"
fi
if [ -s "assets-src/hero-v117.b64" ]; then
  base64 -d "assets-src/hero-v117.b64" > "$DIST/assets/hero-v117.webp"
fi
if [ -s "assets-src/promo-combo-casal.b64" ]; then
  base64 -d "assets-src/promo-combo-casal.b64" > "$DIST/assets/promo-combo-casal.webp"
fi

for pattern in "*.html" "*.css" "*.js" "*.json" "*.webmanifest" "*.png" "*.jpg" "*.jpeg" "*.webp" "*.wav" "_headers"; do
  for file in $pattern; do
    [ -f "$file" ] || continue
    cp "$file" "$DIST/"
  done
done

TMP_LIST="$(mktemp)"
find . -maxdepth 1 -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.webmanifest' \) -print0 \
  | xargs -0 grep -Eho "([.]/)?[A-Za-z0-9_./-]+\.(png|jpg|jpeg|webp|wav)" \
  | sed 's#^\./##' \
  | grep -vE '^(https?:|data:|//)' \
  | grep -vE '^[^/]+\.(com|dev|co|br)/' \
  | sort -u > "$TMP_LIST" || true

cat >> "$TMP_LIST" <<'EOF'
assets/503042.jpg
assets/banner-v105-01-10-desconto.jpg
assets/banner-v105-02-karaoke-double.jpg
assets/banner-v105-03-instagram-musica.jpg
EOF
sort -u "$TMP_LIST" -o "$TMP_LIST"

downloaded=0
copied=0
failed=0

while IFS= read -r asset; do
  [ -n "$asset" ] || continue
  case "$asset" in
    *'..'*) continue ;;
  esac
  mkdir -p "$DIST/$(dirname "$asset")"
  if [ -s "$DIST/$asset" ]; then
    copied=$((copied+1))
    continue
  fi
  if [ -f "$asset" ]; then
    cp "$asset" "$DIST/$asset"
    copied=$((copied+1))
    continue
  fi
  base="$(basename "$asset")"
  if [ -f "$base" ]; then
    cp "$base" "$DIST/$asset"
    copied=$((copied+1))
    continue
  fi
  url="$SOURCE_ORIGIN/$asset"
  if curl -fsSL --retry 3 --connect-timeout 10 --max-time 45 "$url" -o "$DIST/$asset"; then
    downloaded=$((downloaded+1))
  else
    rm -f "$DIST/$asset"
    echo "WARN: não foi possível obter $url" >&2
    failed=$((failed+1))
  fi
done < "$TMP_LIST"
rm -f "$TMP_LIST"

# Cabeçalho isolado e validado. Não altera combo, catálogo nem scripts do negócio.
node home-reference-v117.cjs "$DIST"

# Mantém a incorporação de CSS/JS. Callbacks preservam literalmente $& e $`.
node <<'NODE'
const fs = require('fs');
const path = require('path');
const dist = 'dist';
const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const cssPath = path.join(dist, 'styles-v105.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  html = html.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']styles-v105\.css[^"']*["']\s*\/?>(?:\s*)/i,
    () => '<style id="ep-critical-styles">\n' + css + '\n</style>\n'
  );
}
function inlineScript(file, pattern) {
  const filePath = path.join(dist, file);
  if (!fs.existsSync(filePath)) return;
  const js = fs.readFileSync(filePath, 'utf8').replace(/<\/script/gi, '<\\/script');
  html = html.replace(pattern, () => '<script data-inline-source="' + file + '">\n' + js + '\n</script>');
}
inlineScript('loyalty.js', /<script\s+[^>]*src=["']loyalty\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/i);
inlineScript('app-misticpay-cpf-v102.js', /<script\s+[^>]*src=["']app-misticpay-cpf-v102\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/i);
inlineScript('cart-buttons-v60.js', /<script\s+[^>]*src=["']cart-buttons-v60\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/i);
fs.writeFileSync(indexPath, html);
console.log('Home crítica incorporada ao index.html');
NODE

echo "Pages build concluído: copiados=$copied baixados=$downloaded falhas=$failed"
test -s "$DIST/index.html"
