# Cloudflare Pages

O frontend estático do Espetinho Perus é publicado pelo projeto Pages `espetinho-perus-site`.

Configuração:

- Production branch: `main`
- Framework preset: `None`
- Build command: `bash pages-build.sh`
- Build output directory: `dist`
- Root directory: vazio

O script copia o frontend versionado e preenche recursos visuais ainda não presentes no repositório usando `https://espetinhoperus.com.br` como origem. A origem pode ser sobrescrita pela variável `STATIC_ASSET_SOURCE_ORIGIN`.
