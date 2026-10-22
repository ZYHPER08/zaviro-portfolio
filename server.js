const h = require('http'), f = require('fs'), p = require('path')
const root = __dirname
const m = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.webp': 'image/webp' }
h.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0])
  if (u === '/') u = '/index.html'
  const fp = p.join(root, u)
  if (!fp.startsWith(root)) { r.writeHead(403); r.end(); return }
  f.readFile(fp, (e, d) => {
    if (e) { r.writeHead(404); r.end('Not found'); return }
    r.writeHead(200, { 'Content-Type': m[p.extname(fp)] || 'application/octet-stream' })
    r.end(d)
  })
}).listen(8877, '127.0.0.1', () => console.log('ZAVIRO.com site on http://localhost:8877'))
