#!/usr/bin/env node
/**
 * WA Reply Helper — local server
 *
 * Serves the reply helper UI and proxies Anthropic API calls
 * (avoids browser CORS restrictions on file:// pages).
 *
 * Usage:
 *   node wa-reply-helper.js
 *   → open http://localhost:3001
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = 3001;
const HTML    = fs.readFileSync(path.join(__dirname, 'wa-reply-helper.html'), 'utf8');
const API_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer(async (req, res) => {

  // ── Serve HTML ───────────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(HTML);
  }

  // ── Proxy translate request ──────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/translate') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);

        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method  : 'POST',
          headers : {
            'x-api-key'        : API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type'     : 'application/json',
          },
          body: JSON.stringify({
            model      : 'claude-haiku-4-5-20251001',
            max_tokens : 600,
            messages   : [{
              role    : 'user',
              content : `A Dutch restaurant owner sent this WhatsApp reply to my outreach message:\n\n"${message}"\n\nProvide:\n1. A plain English translation (1-3 sentences)\n2. Three short Dutch reply options suited to the tone of their message. Each under 50 words, WhatsApp-casual, moving toward a demo or next step.\n\nFormat exactly:\nTRANSLATION: [English translation]\n\nREPLY 1: [Dutch reply]\n\nREPLY 2: [Dutch reply]\n\nREPLY 3: [Dutch reply]`
            }]
          })
        });

        const data = await apiRes.json();
        res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`\nWA Reply Helper → http://localhost:${PORT}\n`);
});
