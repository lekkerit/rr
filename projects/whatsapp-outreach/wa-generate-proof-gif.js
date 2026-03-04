#!/usr/bin/env node
/**
 * WhatsApp Proof GIF Generator
 *
 * Renders the Google Maps review card with CSS animations and captures it as
 * an animated GIF using Puppeteer. WhatsApp autoplays GIFs, making this more
 * engaging than the static proof.png.
 *
 * Animation timeline:
 *   0–800ms   card fades + slides in
 *   800–1200ms  hold on review only (shows the "problem")
 *   1200–2700ms owner response section reveals (shows the "solution")
 *   2600–3200ms CTA footer slides in
 *   3200–4000ms hold on complete card
 *   → loops
 *
 * Usage:
 *   node wa-generate-proof-gif.js
 *
 * Output: scripts/whatsapp-outreach/proof-images/proof.gif
 *
 * Requires (already installed via npm):
 *   gif-encoder-2, pngjs, puppeteer
 */

const puppeteer  = require('puppeteer');
const GifEncoder = require('gif-encoder-2');
const { PNG }    = require('pngjs');
const path       = require('path');
const fs         = require('fs');

// ─── Config ───────────────────────────────────────────────────────────────────

const OUTPUT_PATH    = path.join(__dirname, 'proof-images', 'proof.gif');
const WIDTH          = 540;   // half of 1080 — keeps file size manageable
const HEIGHT         = 675;   // same 4:5 ratio as the PNG
const FPS            = 10;
const DURATION_MS    = 4000;
const FRAME_COUNT    = Math.round(DURATION_MS / 1000 * FPS); // 40
const FRAME_DELAY_MS = Math.round(1000 / FPS);               // 100ms

// ─── Example content (keep in sync with wa-generate-proof-image.js) ──────────

const EXAMPLE = {
  reviewer : 'Jan Pietersen',
  timeAgo  : '3 maanden geleden',
  rating   : 3,
  review   : 'Het eten was goed, maar de bediening liet wat te wensen over. We moesten bijna 40 minuten wachten op onze bestelling terwijl het restaurant niet eens vol zat. Jammer, want de sfeer is wel leuk.',
  response : 'Bedankt voor uw eerlijke feedback, Jan. Het spijt ons dat u zo lang heeft moeten wachten — dat is absoluut niet de ervaring die wij willen bieden. We hebben dit intern besproken en zijn bezig met concrete verbeteringen in onze keukenplanning. We hopen u snel weer te mogen verwelkomen en een veel soepelere avond te bezorgen!',
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function loadLogoDataUri() {
  const logoPath = path.join(__dirname, 'proof-images', 'logo.png');
  if (!fs.existsSync(logoPath)) return null;
  const buf = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// ─── Animated HTML template ───────────────────────────────────────────────────

function buildAnimatedHtml(ex) {
  const logoDataUri = loadLogoDataUri();
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < ex.rating ? 'filled' : 'empty'}">${i < ex.rating ? '★' : '☆'}</span>`
  ).join('');

  const initials = ex.reviewer.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      background: #f8f9fa;
      font-family: 'Inter', 'Roboto', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      overflow: hidden;
    }

    /* ── Card ── */
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,.10), 0 0 1px rgba(0,0,0,.06);
      width: 100%;
      overflow: hidden;
      animation: cardIn 0.8s ease-out both;
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Google branding bar ── */
    .g-bar {
      background: #fff;
      border-bottom: 1px solid #e8eaed;
      padding: 14px 20px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .g-logo     { font-size: 15px; font-weight: 700; }
    .g-logo .g  { color: #4285f4; }
    .g-logo .o1 { color: #ea4335; }
    .g-logo .o2 { color: #fbbc04; }
    .g-logo .g2 { color: #4285f4; }
    .g-logo .l  { color: #34a853; }
    .g-logo .e  { color: #ea4335; }
    .g-tagline  { font-size: 12px; color: #5f6368; }

    /* ── Review section ── */
    .review-section { padding: 18px 20px 16px; }
    .reviewer-row {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #4285f4; color: #fff; font-size: 12px; font-weight: 600;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .reviewer-name { font-size: 13px; font-weight: 600; color: #202124; }
    .time-ago      { font-size: 11px; color: #70757a; margin-top: 2px; }
    .stars         { display: flex; gap: 2px; margin-bottom: 10px; }
    .star          { font-size: 17px; }
    .star.filled   { color: #fbbc04; }
    .star.empty    { color: #dadce0; }
    .review-text   { font-size: 12px; line-height: 1.6; color: #3c4043; }

    /* ── Divider ── */
    .divider { height: 1px; background: #e8eaed; margin: 0 20px; }

    /* ── Response section — animated reveal ── */
    .response-section {
      background: #f8f9fa;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      animation: responseReveal 1.5s ease-out 1.2s both;
    }
    .response-inner { padding: 16px 20px 18px; }
    .response-label {
      font-size: 10px; font-weight: 600; color: #5f6368;
      text-transform: uppercase; letter-spacing: .6px; margin-bottom: 8px;
    }
    .response-text { font-size: 12px; line-height: 1.6; color: #3c4043; }
    @keyframes responseReveal {
      from { max-height: 0; opacity: 0; }
      to   { max-height: 320px; opacity: 1; }
    }

    /* ── CTA footer ── */
    .cta-footer {
      background: #1a73e8;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      animation: ctaIn 0.6s ease-out 2.6s both;
    }
    .cta-icon { font-size: 16px; color: #fff; }
    .cta-text { font-size: 12px; font-weight: 600; color: #fff; line-height: 1.35; }
    .cta-sub  { font-size: 10px; font-weight: 400; color: rgba(255,255,255,.85); margin-top: 2px; }
    @keyframes ctaIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
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
        <div>
          <div class="reviewer-name">${ex.reviewer}</div>
          <div class="time-ago">${ex.timeAgo}</div>
        </div>
      </div>
      <div class="stars">${stars}</div>
      <div class="review-text">${ex.review}</div>
    </div>

    <div class="divider"></div>

    <div class="response-section">
      <div class="response-inner">
        <div class="response-label">Reactie van de eigenaar</div>
        <div class="response-text">${ex.response}</div>
      </div>
    </div>

    <div class="cta-footer">
      ${logoDataUri ? `<img src="${logoDataUri}" alt="ReviewRecovery" style="height:36px;width:auto;object-fit:contain;flex-shrink:0" />` : '<div class="cta-icon">✦</div>'}
      <div>
        <div class="cta-text">Dit is wat wij voor uw restaurant doen</div>
        <div class="cta-sub">Professionele reacties op elke Google-beoordeling</div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ─── Frame capture ────────────────────────────────────────────────────────────

async function captureFrames(page) {
  // Wait for animations to initialise, then pause them all at time 0
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => {
    document.getAnimations().forEach(a => { a.pause(); a.currentTime = 0; });
    resolve();
  })));

  const frames = [];

  for (let i = 0; i < FRAME_COUNT; i++) {
    const timeMs = i * FRAME_DELAY_MS;

    await page.evaluate((t) => {
      document.getAnimations().forEach(a => { a.currentTime = t; });
    }, timeMs);

    const buf = await page.screenshot({ type: 'png' });
    frames.push(buf);

    process.stdout.write(`  frame ${String(i + 1).padStart(2)} / ${FRAME_COUNT}\r`);
  }

  process.stdout.write('\n');
  return frames;
}

// ─── GIF encoding ─────────────────────────────────────────────────────────────

function encodeGif(frames) {
  const encoder = new GifEncoder(WIDTH, HEIGHT, 'neuquant', true);
  encoder.setDelay(FRAME_DELAY_MS);
  encoder.setRepeat(0);  // infinite loop
  encoder.setQuality(10);
  encoder.start();

  for (const buf of frames) {
    const png = PNG.sync.read(buf);
    encoder.addFrame(png.data);
  }

  encoder.finish();
  return encoder.out.getData();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nWA Proof GIF Generator');
  console.log('─'.repeat(40));
  console.log(`${FRAME_COUNT} frames · ${FPS}fps · ${DURATION_MS / 1000}s · ${WIDTH}×${HEIGHT}px\n`);

  const html    = buildAnimatedHtml(EXAMPLE);
  const tmpHtml = path.join(__dirname, '_proof_gif_tmp.html');
  fs.writeFileSync(tmpHtml, html);

  const browser = await puppeteer.launch({
    headless : 'new',
    args     : ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let gifData;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 300)); // let animations register

    console.log('Capturing frames...');
    const frames = await captureFrames(page);

    console.log('Encoding GIF...');
    gifData = encodeGif(frames);
  } finally {
    await browser.close();
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, gifData);

  const sizeMb = (gifData.length / 1024 / 1024).toFixed(2);
  console.log(`\n✓ Saved: ${OUTPUT_PATH} (${sizeMb} MB)`);
  console.log('\nNext steps:');
  console.log('  1. Open proof-images/proof.gif and verify the animation');
  console.log('  2. git add scripts/whatsapp-outreach/proof-images/proof.gif && git commit');
  console.log('  3. Re-run wa-generate-html.js — cards will include an animated GIF download\n');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
