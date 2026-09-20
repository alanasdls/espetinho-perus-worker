#!/usr/bin/env bash
set -euo pipefail

DIST="dist"
SOURCE_ORIGIN="${STATIC_ASSET_SOURCE_ORIGIN:-https://espetinhoperus.com.br}"

rm -rf "$DIST"
mkdir -p "$DIST"

# Publica apenas arquivos necessários do frontend na raiz.
for pattern in "*.html" "*.css" "*.js" "*.json" "*.webmanifest" "*.png" "*.jpg" "*.jpeg" "*.webp" "*.wav" "_headers"; do
  for f in $pattern; do
    [ -f "$f" ] || continue
    cp "$f" "$DIST/"
  done
done

# Descobre recursos estáticos relativos referenciados pelo frontend.
TMP_LIST="$(mktemp)"
find . -maxdepth 1 -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.webmanifest' \) -print0 \
  | xargs -0 grep -Eho "([.]/)?[A-Za-z0-9_./-]+\.(png|jpg|jpeg|webp|wav)" \
  | sed 's#^\./##' \
  | grep -vE '^(https?:|data:|[^/]*\.com/|[^/]*\.dev/)' \
  | sort -u > "$TMP_LIST" || true

# Acrescenta os assets essenciais conhecidos da home V105/V107.
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

  if [ -f "$asset" ]; then
    cp "$asset" "$DIST/$asset"
    copied=$((copied+1))
    continue
  fi

  # Compatibilidade: alguns banners antigos estão versionados na raiz,
  # mas o frontend histórico os referencia dentro de assets/.
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

# Torna a home autocontida para evitar tela sem CSS/JS em caso de falha
# de cache/rota de arquivos auxiliares durante deploy/migração de domínio.
node <<'NODE'
const fs = require('fs');
const path = require('path');
const dist = 'dist';
const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const cssPath = path.join(dist, 'styles-v105.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']styles-v105\.css[^"']*["']\s*\/?>(?:\s*)/i, '<style id="ep-critical-styles">\n' + css + '\n</style>\n');
}

const localScripts = ['loyalty.js','app-misticpay-cpf-v102.js','cart-buttons-v60.js'];
for (const file of localScripts) {
  const filePath = path.join(dist, file);
  if (!fs.existsSync(filePath)) continue;
  const js = fs.readFileSync(filePath, 'utf8').replace(/<\/script/gi, '<\\/script');
  const escaped = file.replace(/[.*+?^$(){}|[\]\\]/g, '\\rm -f "$TMP_LIST"

echo "Pages build concluído: copiados=$copied baixados=$downloaded falhas=$failed"
test -f "$DIST/index.html"
');
  const re = new RegExp('<script\\s+[^>]*src=["\\\']' + escaped + '(?:\\?[^"\\\']*)?["\\\'][^>]*>\\s*<\\/script>', 'i');
  html = html.replace(re, '<script data-inline-source="' + file + '">\n' + js + '\n</script>');
}

fs.writeFileSync(indexPath, html);
console.log('Home crítica incorporada ao index.html');
NODE

echo "Pages build concluído: copiados=$copied baixados=$downloaded falhas=$failed"
test -f "$DIST/index.html"
test -s "$DIST/index.html"
