# Dekor Eventos — PWA
1. Hospede esta pasta em um servidor HTTPS (GitHub Pages, Netlify, Vercel etc.).
2. Abra o endereço no Chrome do celular.
3. Use o botão "Instalar" ou o menu do navegador > Instalar aplicativo.
4. O app funciona offline depois do primeiro carregamento.

Arquivos:
- public/index.html: aplicativo (arquivos estáticos ficam em public/)
- netlify/functions/clientes.ts: API do cadastro de clientes (Netlify Database)
- db/schema.ts: estrutura do banco de dados
- data.js: dados convertidos da planilha
- manifest.webmanifest: configuração PWA
- sw.js: cache/offline
- icon-192.png e icon-512.png: ícones
