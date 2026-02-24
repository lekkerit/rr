#!/usr/bin/env node
/**
 * WhatsApp Outreach — HTML Queue Generator (Airtable-backed)
 *
 * Pulls "not contacted" prospects from Airtable, generates personalised
 * messages via Claude, updates status to "generated" in Airtable, and
 * writes an HTML queue file for manual send.
 *
 * Open the HTML in your browser → click "Open WhatsApp" → paste → send.
 * Clicking "✓ Sent" updates the Airtable record to status "sent" live.
 *
 * Usage:
 *   node wa-generate-html.js             # generate up to 20 messages
 *   node wa-generate-html.js --limit 5   # smaller batch
 *
 * Requires in .env:
 *   ANTHROPIC_API_KEY
 *   AIRTABLE_API_KEY
 *   AIRTABLE_BASE_ID
 *   AIRTABLE_TABLE_NAME   (defaults to "Prospects")
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const fs        = require('fs');
const path      = require('path');
const Anthropic  = require('@anthropic-ai/sdk');

// ─── Config ──────────────────────────────────────────────────────────────────

const limitArg    = process.argv.indexOf('--limit');
const DAILY_LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : 20;

const AIRTABLE_API_KEY    = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID    = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Prospects';

const OUTPUT_FILE = path.join(__dirname, `queue-${today()}.html`);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function airtableFetch(endpoint, options = {}) {
  const base = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
  const res  = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable ${res.status}: ${body}`);
  }
  return res.json();
}

// Fetch unsent prospects from Airtable
async function fetchUnsent(limit) {
  const filter = `{Status} = "not contacted"`;
  const params = new URLSearchParams({
    filterByFormula : filter,
    pageSize        : String(limit)
  });
  params.append('sort[0][field]', 'Name');
  params.append('sort[0][direction]', 'asc');
  const data = await airtableFetch(`?${params}`);
  return data.records
    .map(r => ({
      id         : r.id,
      name       : r.fields.Name   || '',
      restaurant : r.fields.Name   || '',
      phone      : r.fields.Phone  || '',
      rating     : r.fields.Rating || '',
      city       : r.fields.City   || 'Hilversum'
    }));
}

// Update a single record in Airtable
async function updateRecord(recordId, fields) {
  await airtableFetch(`/${recordId}`, {
    method : 'PATCH',
    body   : JSON.stringify({ fields })
  });
}

// ─── Message Generation ───────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateMessage(prospect) {
  const { restaurant, rating, city } = prospect;
  const ratingLine = rating ? `- Google-beoordeling: ${rating}★\n` : '';

  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
      process.stdout.write(`(retry ${attempt}, waiting ${delay/1000}s) `);
      await sleep(delay);
    }
    try {
      const result = await anthropic.messages.create({
    model      : 'claude-sonnet-4-6',
    max_tokens : 200,
    messages   : [{
      role    : 'user',
      content : `Schrijf een WhatsApp openingsbericht voor de eigenaar van ${restaurant} in ${city}.

Context:
${ratingLine}- Ik help restaurants met het professioneel beantwoorden van Google-reviews
- Ik wil 2 gratis voorbeeldreacties aanbieden, geen verplichtingen
- Nooit prijzen noemen in het eerste bericht

Strenge regels:
- Nederlands, informeel maar professioneel
- Noem de restaurantnaam${rating ? ' en de beoordeling' : ''}
- Focus op de waarde: meer vertrouwen bij nieuwe gasten, betere reputatie
- Bied 2 gratis voorbeelden aan als concrete eerste stap
- Mag NIET bevatten: AI, geautomatiseerd, bot, software, algoritme, prijzen, €
- Maximaal 80 woorden
- WhatsApp-toon: korte alinea's, geen formele aanhef
- Eindig met een open vraag

Geef alleen de berichttekst terug, niets anders.`
    }]
      });
      return result.content[0].text.trim();
    } catch (err) {
      const isOverloaded = err.status === 529 || (err.message && err.message.includes('529'));
      if (isOverloaded && attempt < maxRetries - 1) continue;
      throw err;
    }
  }
}

// ─── Proof images ─────────────────────────────────────────────────────────────

function loadProofImageDataUri() {
  const imgPath = path.join(__dirname, 'proof-images', 'proof.png');
  if (!fs.existsSync(imgPath)) return null;
  const buf = fs.readFileSync(imgPath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function loadProofGifDataUri() {
  const gifPath = path.join(__dirname, 'proof-images', 'proof.gif');
  if (!fs.existsSync(gifPath)) return null;
  const buf = fs.readFileSync(gifPath);
  return `data:image/gif;base64,${buf.toString('base64')}`;
}

// ─── HTML Builder ─────────────────────────────────────────────────────────────

function buildHtml(cards) {
  const proofDataUri = loadProofImageDataUri();
  const gifDataUri   = loadProofGifDataUri();

  const cardHtml = cards.map((c, i) => {
    const waPhone  = c.phone.replace(/\D/g, '');
    const waUrl    = `https://web.whatsapp.com/send?phone=${waPhone}`;
    const isMobile = c.phone.startsWith('+316');
    const escaped = c.message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `
    <div class="card" id="card-${i}" data-phone="${c.phone}" data-record-id="${c.id}">
      <div class="card-header">
        <div class="card-title">
          <span class="idx">${i + 1}</span>
          <strong>${c.restaurant}</strong>
          ${c.rating ? `<span class="rating">★ ${c.rating}</span>` : ''}
          <span class="city">${c.city}</span>
          <span class="badge ${isMobile ? 'badge-mobile' : 'badge-land'}">${isMobile ? 'mobile' : 'landline'}</span>
        </div>
        <div class="card-actions">
          <a href="${waUrl}" target="_blank" class="btn-wa" onclick="markOpened(${i})">
            Open WhatsApp
          </a>
          <button class="btn-sent" id="sent-btn-${i}" onclick="markSent(${i})">✓ Sent</button>
          <button class="btn-nowa" id="nowa-btn-${i}" onclick="markNoWA(${i})">No WA</button>
        </div>
      </div>
      <div class="message-wrap">
        <textarea class="message" readonly onclick="this.select()">${escaped}</textarea>
        <button class="btn-copy" onclick="copyMsg(${i})">Copy</button>
      </div>
      ${(gifDataUri || proofDataUri) ? `
      <div class="proof-wrap">
        <img class="proof-thumb" src="${gifDataUri || proofDataUri}" alt="Voorbeeld reactie" />
        <div style="display:flex;gap:8px;flex-shrink:0">
          ${gifDataUri ? `<a class="btn-dl" download="proof-reactie.gif" href="${gifDataUri}">↓ GIF</a>` : ''}
          ${proofDataUri ? `<a class="btn-dl" download="proof-reactie.png" href="${proofDataUri}">↓ PNG</a>` : ''}
        </div>
      </div>` : ''}
    </div>`;
  }).join('\n');

  // Airtable credentials embedded for browser-side status updates
  const airtableConfig = JSON.stringify({
    apiKey    : AIRTABLE_API_KEY,
    baseId    : AIRTABLE_BASE_ID,
    tableName : AIRTABLE_TABLE_NAME
  });

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WA Outreach — ${today()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f0f2f5; padding: 24px; color: #111; }
    h1   { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #666; margin-bottom: 24px; }
    .progress { background: #e0e0e0; border-radius: 99px; height: 8px;
                margin-bottom: 24px; overflow: hidden; }
    .progress-bar { background: #25d366; height: 100%; width: 0%;
                    transition: width 0.3s; border-radius: 99px; }
    .progress-label { font-size: 13px; color: #444; margin-bottom: 8px; }

    .card { background: #fff; border-radius: 12px; padding: 16px 20px;
            margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.08);
            transition: opacity .3s; }
    .card.sent { opacity: .4; }
    .card-header { display: flex; justify-content: space-between;
                   align-items: center; gap: 12px; flex-wrap: wrap; }
    .card-title  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .idx  { background: #f0f2f5; border-radius: 50%; width: 26px; height: 26px;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 600; color: #555; flex-shrink: 0; }
    .rating { background: #fff8e1; color: #b8860b; font-size: 12px;
              padding: 2px 8px; border-radius: 99px; font-weight: 500; }
    .city { font-size: 12px; color: #888; }
    .phone { font-size: 12px; color: #555; font-family: monospace; background: #f0f2f5;
             padding: 2px 8px; border-radius: 4px; cursor: pointer; user-select: all; }
    .phone:hover { background: #e0e0e0; }
    .card-actions { display: flex; gap: 8px; flex-shrink: 0; }

    .btn-wa { display: inline-block; background: #25d366; color: #fff;
              padding: 8px 16px; border-radius: 8px; text-decoration: none;
              font-size: 13px; font-weight: 600; }
    .btn-wa:hover { background: #1ebe5a; }
    .btn-sent { background: #f0f2f5; border: none; padding: 8px 14px;
                border-radius: 8px; font-size: 13px; cursor: pointer; color: #333; }
    .btn-sent:hover { background: #e0e0e0; }
    .btn-sent.saving { opacity: .5; cursor: default; }
    .btn-sent.saved  { color: #25d366; }
    .btn-nowa { background: #f0f2f5; border: none; padding: 8px 14px;
                border-radius: 8px; font-size: 13px; cursor: pointer; color: #888; }
    .btn-nowa:hover  { background: #ffe0e0; color: #c0392b; }
    .btn-nowa.saving { opacity: .5; cursor: default; }
    .btn-nowa.saved  { color: #c0392b; }
    .badge { font-size: 11px; padding: 2px 7px; border-radius: 99px; font-weight: 500; }
    .badge-mobile { background: #e6f4ea; color: #2d7a3a; }
    .badge-land   { background: #f0f2f5; color: #888; }

    .message-wrap { position: relative; margin-top: 14px; }
    .message { width: 100%; min-height: 90px; padding: 12px 44px 12px 12px;
               border: 1px solid #e8e8e8; border-radius: 8px; font-size: 13px;
               line-height: 1.6; resize: none; background: #fafafa;
               color: #222; cursor: text; font-family: inherit; }
    .message:focus { outline: none; border-color: #25d366; background: #fff; }
    .btn-copy { position: absolute; top: 8px; right: 8px; background: #fff;
                border: 1px solid #ddd; border-radius: 6px; padding: 4px 10px;
                font-size: 12px; cursor: pointer; color: #444; }
    .btn-copy:hover { background: #f5f5f5; }
    .btn-copy.copied { color: #25d366; border-color: #25d366; }

    .proof-wrap { display: flex; align-items: center; gap: 14px; margin-top: 14px;
                  padding-top: 14px; border-top: 1px solid #f0f0f0; }
    .proof-thumb { height: 120px; border-radius: 8px; border: 1px solid #e8e8e8;
                   box-shadow: 0 1px 4px rgba(0,0,0,.08); object-fit: cover; cursor: pointer; }
    .btn-dl { background: #f0f2f5; border: 1px solid #ddd; padding: 7px 14px;
              border-radius: 8px; font-size: 13px; text-decoration: none; color: #333;
              white-space: nowrap; }
    .btn-dl:hover { background: #e4e6e9; }
  </style>
</head>
<body>
  <h1>WhatsApp Outreach — ${today()}</h1>
  <p class="meta">${cards.length} restaurants · Click message to select · Open WhatsApp → paste → send</p>

  <p class="progress-label" id="progress-label">0 / ${cards.length} sent</p>
  <div class="progress"><div class="progress-bar" id="progress-bar"></div></div>

  ${cardHtml}

  <script>
    const AT = ${airtableConfig};
    const STORAGE_KEY = 'wa-sent-${today()}';
    const total = ${cards.length};

    // ── Airtable helpers ──────────────────────────────────────────────────────

    async function updateAirtable(recordId, fields) {
      const url = \`https://api.airtable.com/v0/\${AT.baseId}/\${encodeURIComponent(AT.tableName)}/\${recordId}\`;
      const res = await fetch(url, {
        method  : 'PATCH',
        headers : {
          Authorization  : \`Bearer \${AT.apiKey}\`,
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ fields })
      });
      if (!res.ok) throw new Error(\`Airtable \${res.status}\`);
      return res.json();
    }

    // ── Progress ──────────────────────────────────────────────────────────────

    function getSent() {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    }

    function updateProgress() {
      const count = Object.keys(getSent()).length;
      document.getElementById('progress-label').textContent = count + ' / ' + total + ' sent';
      document.getElementById('progress-bar').style.width = (count / total * 100) + '%';
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    async function markSent(i) {
      const card     = document.getElementById('card-' + i);
      const btn      = document.getElementById('sent-btn-' + i);
      const phone    = card.dataset.phone;
      const recordId = card.dataset.recordId;

      // Optimistic UI
      btn.textContent = 'Saving...';
      btn.classList.add('saving');
      btn.disabled = true;

      try {
        await updateAirtable(recordId, {
          Status   : 'sent',
          'Sent At': new Date().toISOString()
        });
        btn.textContent = '✓ Sent';
        btn.classList.remove('saving');
        btn.classList.add('saved');
      } catch (err) {
        // Fallback: still mark locally if Airtable fails
        console.warn('Airtable update failed, marking locally only:', err.message);
        btn.textContent = '✓ Sent (local)';
        btn.classList.remove('saving');
      }

      // Always update local state + UI
      const sent = getSent();
      sent[phone] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sent));
      card.classList.add('sent');
      updateProgress();
    }

    async function markNoWA(i) {
      const card     = document.getElementById('card-' + i);
      const btn      = document.getElementById('nowa-btn-' + i);
      const recordId = card.dataset.recordId;

      btn.textContent = 'Saving...';
      btn.classList.add('saving');
      btn.disabled = true;

      try {
        await updateAirtable(recordId, { Status: 'no whatsapp' });
        btn.textContent = 'No WA';
        btn.classList.remove('saving');
        btn.classList.add('saved');
      } catch (err) {
        console.warn('Airtable update failed:', err.message);
        btn.textContent = 'No WA (local)';
        btn.classList.remove('saving');
      }

      card.classList.add('sent');
      updateProgress();
    }

    function markOpened(i) {
      setTimeout(() => {
        const cards = document.querySelectorAll('.card:not(.sent)');
        if (cards.length > 0) cards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }

    function copyMsg(i) {
      const textarea = document.querySelector('#card-' + i + ' .message');
      navigator.clipboard.writeText(textarea.value).then(() => {
        const btn = document.querySelector('#card-' + i + ' .btn-copy');
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
      });
    }

    // ── Inject phone numbers into card titles ─────────────────────────────────
    document.querySelectorAll('.card').forEach(card => {
      const phone = card.dataset.phone;
      const title = card.querySelector('.card-title');
      if (phone && title) {
        const span = document.createElement('span');
        span.className = 'phone';
        span.textContent = phone;
        span.title = 'Click to copy';
        span.onclick = () => {
          navigator.clipboard.writeText(phone);
          span.textContent = 'Copied!';
          setTimeout(() => span.textContent = phone, 1500);
        };
        title.appendChild(span);
      }
    });

    // ── Restore sent state from localStorage on load ──────────────────────────
    (function() {
      const sent = getSent();
      document.querySelectorAll('.card').forEach(card => {
        if (sent[card.dataset.phone]) {
          card.classList.add('sent');
          const btn = card.querySelector('.btn-sent');
          if (btn) { btn.textContent = '✓ Sent'; btn.classList.add('saved'); btn.disabled = true; }
        }
      });
      updateProgress();
    })();
  </script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set in .env');
    process.exit(1);
  }
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in .env');
    process.exit(1);
  }

  console.log(`\nWA Outreach — HTML Generator (Airtable)`);
  console.log('─'.repeat(42));

  process.stdout.write('Fetching unsent prospects from Airtable ... ');
  const prospects = await fetchUnsent(DAILY_LIMIT);
  console.log(`${prospects.length} found\n`);

  if (prospects.length === 0) {
    console.log('No unsent prospects. All done or check Airtable filters.');
    return;
  }

  const cards = [];

  for (const prospect of prospects) {
    process.stdout.write(`→ ${prospect.restaurant} ... `);
    try {
      const message = await generateMessage(prospect);
      cards.push({ ...prospect, message });

      // Update Airtable: status → generated, store message
      await updateRecord(prospect.id, {
        Status          : 'generated',
        Message         : message,
        'Generated At'  : new Date().toISOString()
      });

      console.log('done');
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
    }
  }

  const html = buildHtml(cards);
  fs.writeFileSync(OUTPUT_FILE, html);

  console.log(`\n✓ HTML written to: ${OUTPUT_FILE}`);
  console.log(`  Open in browser and work through the list.\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
