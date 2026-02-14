const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const HTML_FILE = path.join(__dirname, 'ig-reel-35.html');
const FRAMES_DIR = path.join(__dirname, 'frames-tmp');
const OUTPUT_FILE = path.join(__dirname, 'reel-35-procent.mp4');
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION_MS = 18000;
const TOTAL_FRAMES = Math.ceil((DURATION_MS / 1000) * FPS) + FPS; // +1s buffer

(async () => {
  // Clean up / create frames dir
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true });
  }
  fs.mkdirSync(FRAMES_DIR);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // Override the CSS so the reel renders at full 1080x1920 without scaling
  const fileUrl = 'file://' + HTML_FILE;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Remove the scale transform and hide controls so we capture at native resolution
  await page.evaluate(() => {
    const reel = document.querySelector('.reel');
    reel.style.transform = 'none';
    reel.style.marginBottom = '0';
    document.querySelector('.controls').style.display = 'none';
    document.querySelector('.status').style.display = 'none';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = 'transparent';
  });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  console.log('Starting animation and capturing frames...');

  // Install virtual clock so animation advances in sync with frame capture
  await page.evaluate(() => {
    // Virtual time state
    window.__virtualTime = 0;
    window.__rafCallbacks = [];
    window.__rafId = 0;

    // Override timing functions so anime.js uses our virtual clock
    const origDateNow = Date.now;
    const startReal = origDateNow.call(Date);
    Date.now = () => startReal + window.__virtualTime;

    const origPerfNow = performance.now.bind(performance);
    const startPerf = origPerfNow();
    performance.now = () => startPerf + window.__virtualTime;

    // Override requestAnimationFrame to collect callbacks
    window.requestAnimationFrame = (cb) => {
      const id = ++window.__rafId;
      window.__rafCallbacks.push({ id, cb });
      return id;
    };

    window.cancelAnimationFrame = (id) => {
      window.__rafCallbacks = window.__rafCallbacks.filter(c => c.id !== id);
    };

    // Function to advance virtual time and flush all rAF callbacks
    window.__advanceTime = (ms) => {
      window.__virtualTime += ms;
      const now = performance.now();
      // Process rAF callbacks (may enqueue new ones)
      const maxIterations = 10;
      for (let iter = 0; iter < maxIterations; iter++) {
        const cbs = window.__rafCallbacks.splice(0);
        if (cbs.length === 0) break;
        for (const { cb } of cbs) {
          try { cb(now); } catch(e) {}
        }
      }
    };
  });

  // Start particles + animation (they'll be frozen at t=0 until we advance)
  await page.evaluate(() => {
    animateParticles();
    playAnimation();
  });

  // Capture frames using virtual time stepping
  const reel = await page.$('.reel');
  const frameInterval = 1000 / FPS;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // Advance virtual clock by one frame interval
    await page.evaluate((dt) => window.__advanceTime(dt), frameInterval);

    const frameNum = String(i).padStart(5, '0');
    const framePath = path.join(FRAMES_DIR, `frame-${frameNum}.png`);

    await reel.screenshot({ path: framePath, type: 'png' });

    if (i % FPS === 0) {
      console.log(`  Captured ${i}/${TOTAL_FRAMES} frames (${Math.round(i / FPS)}s)`);
    }
  }

  console.log(`  Captured ${TOTAL_FRAMES}/${TOTAL_FRAMES} frames. Done.`);
  await browser.close();

  // Encode with ffmpeg
  console.log('Encoding MP4 with ffmpeg...');
  const ffmpegCmd = [
    'ffmpeg', '-y',
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

  console.log(`\nDone! MP4 saved to: ${OUTPUT_FILE}`);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
