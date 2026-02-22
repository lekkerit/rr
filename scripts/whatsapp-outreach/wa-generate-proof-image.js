#!/usr/bin/env node
/**
 * WhatsApp Proof Image Generator
 *
 * Generates a Google Maps-style review card screenshot showing an example
 * unanswered review alongside a polished AI-crafted owner response.
 * Run once to produce proof-images/proof.png, then commit to repo.
 *
 * Usage:
 *   node wa-generate-proof-image.js
 *
 * Output: scripts/whatsapp-outreach/proof-images/proof.png (1080x1350)
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const OUTPUT_PATH = path.join(__dirname, 'proof-images', 'proof.png');

// ─── Example content (edit freely to update the proof image) ─────────────────

const EXAMPLE = {
  reviewer   : 'Jan Pietersen',
  timeAgo    : '3 maanden geleden',
  rating     : 3,
  review     : 'Het eten was goed, maar de bediening liet wat te wensen over. We moesten bijna 40 minuten wachten op onze bestelling terwijl het restaurant niet eens vol zat. Jammer, want de sfeer is wel leuk.',
  response   : 'Bedankt voor uw eerlijke feedback, Jan. Het spijt ons dat u zo lang heeft moeten wachten — dat is absoluut niet de ervaring die wij willen bieden. We hebben dit intern besproken en zijn bezig met concrete verbeteringen in onze keukenplanning. We hopen u snel weer te mogen verwelkomen en een veel soepelere avond te bezorgen!',
};

// ─── HTML template ────────────────────────────────────────────────────────────

function buildHtml(ex) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < ex.rating ? 'filled' : 'empty'}">${i < ex.rating ? '★' : '☆'}</span>`
  ).join('');

  const initials = ex.reviewer.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Product+Sans:wght@400;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: 1080px;
      height: 1350px;
      background: #f8f9fa;
      font-family: 'Inter', 'Roboto', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
    }

    /* ── Card ── */
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,.10), 0 0 1px rgba(0,0,0,.06);
      width: 100%;
      overflow: hidden;
    }

    /* ── Google branding bar ── */
    .g-bar {
      background: #fff;
      border-bottom: 1px solid #e8eaed;
      padding: 28px 40px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .g-logo {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -.5px;
    }
    .g-logo .g { color: #4285f4; }
    .g-logo .o1 { color: #ea4335; }
    .g-logo .o2 { color: #fbbc04; }
    .g-logo .g2 { color: #4285f4; }
    .g-logo .l { color: #34a853; }
    .g-logo .e { color: #ea4335; }
    .g-tagline {
      font-size: 22px;
      color: #5f6368;
      font-weight: 400;
    }

    /* ── Review section ── */
    .review-section { padding: 40px 40px 36px; }

    .reviewer-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    .avatar {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: #4285f4;
      color: #fff;
      font-size: 24px;
      font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .reviewer-info { flex: 1; }
    .reviewer-name { font-size: 26px; font-weight: 600; color: #202124; }
    .time-ago { font-size: 20px; color: #70757a; margin-top: 4px; }

    .stars { display: flex; gap: 4px; margin-bottom: 20px; }
    .star { font-size: 34px; }
    .star.filled { color: #fbbc04; }
    .star.empty  { color: #dadce0; }

    .review-text {
      font-size: 24px;
      line-height: 1.65;
      color: #3c4043;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: #e8eaed;
      margin: 0 40px;
    }

    /* ── Response section ── */
    .response-section {
      padding: 36px 40px 40px;
      background: #f8f9fa;
    }
    .response-label {
      font-size: 20px;
      font-weight: 600;
      color: #5f6368;
      text-transform: uppercase;
      letter-spacing: .8px;
      margin-bottom: 16px;
    }
    .response-text {
      font-size: 24px;
      line-height: 1.65;
      color: #3c4043;
    }

    /* ── CTA footer ── */
    .cta-footer {
      background: #1a73e8;
      padding: 32px 40px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .cta-icon { font-size: 32px; }
    .cta-text {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      line-height: 1.4;
    }
    .cta-sub {
      font-size: 20px;
      font-weight: 400;
      color: rgba(255,255,255,.85);
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="card">

    <div class="g-bar">
      <div class="g-logo">
        <span class="g">G</span><span class="o1">o</span><span class="o2">o</span><span class="g2">g</span><span class="l">l</span><span class="e">e</span>
      </div>
      <div class="g-tagline">Maps — klantbeoordeling</div>
    </div>

    <div class="review-section">
      <div class="reviewer-row">
        <div class="avatar">${initials}</div>
        <div class="reviewer-info">
          <div class="reviewer-name">${ex.reviewer}</div>
          <div class="time-ago">${ex.timeAgo}</div>
        </div>
      </div>
      <div class="stars">${stars}</div>
      <div class="review-text">${ex.review}</div>
    </div>

    <div class="divider"></div>

    <div class="response-section">
      <div class="response-label">Reactie van de eigenaar</div>
      <div class="response-text">${ex.response}</div>
    </div>

    <div class="cta-footer">
      <div class="cta-icon">✦</div>
      <div>
        <div class="cta-text">Dit is wat wij voor uw restaurant doen</div>
        <div class="cta-sub">Professionele reacties op elke Google-beoordeling</div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nWA Proof Image Generator');
  console.log('─'.repeat(40));

  const html = buildHtml(EXAMPLE);

  // Write temp HTML
  const tmpHtml = path.join(__dirname, '_proof_tmp.html');
  fs.writeFileSync(tmpHtml, html);

  const browser = await puppeteer.launch({
    headless : 'new',
    args     : ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 600)); // ensure fonts + layout settle

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    await page.screenshot({ path: OUTPUT_PATH, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350 } });

    console.log(`✓ Saved: ${OUTPUT_PATH}`);
    console.log('\nNext steps:');
    console.log('  1. Open the PNG and verify it looks good');
    console.log('  2. git add scripts/whatsapp-outreach/proof-images/proof.png && git commit');
    console.log('  3. Run wa-generate-html.js — each card will now include a download button\n');
  } finally {
    await browser.close();
    fs.unlinkSync(tmpHtml);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
