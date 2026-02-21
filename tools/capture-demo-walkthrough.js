// Capture demo-product-walkthrough.html as MP4
// Usage: node tools/capture-demo-walkthrough.js
// Output: instagram/videos/demo-product-walkthrough.mp4

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const HTML_FILE   = path.join(__dirname, '..', 'instagram', 'previews', 'demo-product-walkthrough.html');
const FRAMES_DIR  = path.join(__dirname, 'frames-demo-tmp');
const OUTPUT_FILE = path.join(__dirname, '..', 'instagram', 'videos', 'demo-product-walkthrough.mp4');
const FFMPEG      = 'ffmpeg'; // system-wide via homebrew
const WIDTH  = 1080;
const HEIGHT = 1920;
const FPS    = 30;

(async () => {
  // Clean up / create frames dir
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const fileUrl = 'file://' + HTML_FILE;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Strip UI chrome and fix rendering for headless capture
  await page.evaluate(() => {
    const reel = document.querySelector('.reel');
    reel.style.transform = 'none';
    reel.style.marginBottom = '0';
    reel.style.backgroundImage = 'none';
    reel.style.backgroundColor = '#1a202c';

    // Remove ::before if any
    const style = document.createElement('style');
    style.textContent = '.reel::before { display: none !important; }';
    document.head.appendChild(style);

    document.querySelector('.controls').style.display = 'none';
    document.querySelector('.status').style.display = 'none';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = 'transparent';
  });

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1200));

  // Convert inline SVGs to rasterised images so Puppeteer renders them correctly
  await page.evaluate(async () => {
    const svgs = document.querySelectorAll('.reel svg');
    for (const svg of svgs) {
      const parent = svg.parentElement;
      if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const w = parseInt(svg.getAttribute('width')) || svg.viewBox.baseVal.width || 48;
      const h = parseInt(svg.getAttribute('height')) || svg.viewBox.baseVal.height || 48;

      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); resolve(); };
        img.onerror = reject;
        img.src = url;
      });

      const imgEl = document.createElement('img');
      imgEl.src = canvas.toDataURL('image/png');
      imgEl.style.width = w + 'px';
      imgEl.style.height = h + 'px';
      imgEl.style.display = 'inline-block';
      parent.replaceChild(imgEl, svg);
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Install virtual clock so anime.js advances deterministically
  await page.evaluate(() => {
    window.__virtualTime = 0;
    window.__rafCallbacks = [];
    window.__rafId = 0;

    const origDateNow = Date.now;
    const startReal = origDateNow.call(Date);
    Date.now = () => startReal + window.__virtualTime;

    const origPerfNow = performance.now.bind(performance);
    const startPerf = origPerfNow();
    performance.now = () => startPerf + window.__virtualTime;

    window.requestAnimationFrame = (cb) => {
      const id = ++window.__rafId;
      window.__rafCallbacks.push({ id, cb });
      return id;
    };

    window.cancelAnimationFrame = (id) => {
      window.__rafCallbacks = window.__rafCallbacks.filter(c => c.id !== id);
    };

    window.__advanceTime = (ms) => {
      window.__virtualTime += ms;
      const now = performance.now();
      for (let iter = 0; iter < 10; iter++) {
        const cbs = window.__rafCallbacks.splice(0);
        if (cbs.length === 0) break;
        for (const { cb } of cbs) {
          try { cb(now); } catch(e) {}
        }
      }
    };
  });

  // Start animation (frozen at t=0 until we advance)
  await page.evaluate(() => {
    animateParticles();
    playAnimation();
  });

  // Read actual TOTAL_DURATION from the page
  const DURATION_MS = await page.evaluate(() => {
    return typeof TOTAL_DURATION !== 'undefined' ? TOTAL_DURATION : 30000;
  });
  const TOTAL_FRAMES = Math.ceil((DURATION_MS / 1000) * FPS) + FPS; // +1s buffer
  console.log(`  Animation: ${DURATION_MS}ms → capturing ${TOTAL_FRAMES} frames at ${FPS}fps`);

  const reel = await page.$('.reel');
  const frameInterval = 1000 / FPS;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    await page.evaluate((dt) => window.__advanceTime(dt), frameInterval);

    const frameNum = String(i).padStart(5, '0');
    await reel.screenshot({ path: path.join(FRAMES_DIR, `frame-${frameNum}.png`), type: 'png' });

    if (i % FPS === 0) {
      console.log(`  Frame ${i}/${TOTAL_FRAMES} (${Math.round(i / FPS)}s elapsed)`);
    }
  }

  console.log(`  All ${TOTAL_FRAMES} frames captured.`);
  await browser.close();

  // Encode with ffmpeg
  console.log('\nEncoding MP4...');
  const ffmpegCmd = [
    FFMPEG, '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAMES_DIR, 'frame-%05d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'slow',
    '-crf', '18',
    '-movflags', '+faststart',
    OUTPUT_FILE,
  ].join(' ');

  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Clean up frames
  fs.rmSync(FRAMES_DIR, { recursive: true });

  console.log(`\nDone! MP4 saved to:\n  ${OUTPUT_FILE}`);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
