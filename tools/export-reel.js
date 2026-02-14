#!/usr/bin/env node

/**
 * Export an anime.js reel HTML file to a 1080x1920 MP4 video.
 *
 * Usage:
 *   node tools/export-reel.js tools/ig-reel-35.html
 *   node tools/export-reel.js tools/ig-reel-35.html --fps 60
 *   node tools/export-reel.js tools/ig-reel-35.html --output my-reel.mp4
 *
 * Requirements:
 *   npm install puppeteer   (one-time)
 *   brew install ffmpeg      (one-time, already installed)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// --- Config ---
const args = process.argv.slice(2);
const htmlFile = args.find(a => !a.startsWith('--'));
if (!htmlFile) {
  console.error('Usage: node tools/export-reel.js <path-to-reel.html> [--fps 30] [--output reel.mp4]');
  process.exit(1);
}

const fps = parseInt(args[args.indexOf('--fps') + 1]) || 30;
const outputArg = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
const outputMp4 = outputArg || path.basename(htmlFile, '.html') + '.mp4';
const framesDir = path.join(path.dirname(htmlFile), '.frames-tmp');

(async () => {
  // Resolve HTML file to absolute path for file:// URL
  const absoluteHtml = path.resolve(htmlFile);
  if (!fs.existsSync(absoluteHtml)) {
    console.error(`File not found: ${absoluteHtml}`);
    process.exit(1);
  }

  // Create temp frames directory
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  console.log(`Opening ${path.basename(htmlFile)}...`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport to exact IG Reels dimensions
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  await page.goto(`file://${absoluteHtml}`, { waitUntil: 'networkidle0' });

  // Override the CSS so the .reel element fills the viewport at full size (no scale-down)
  await page.addStyleTag({
    content: `
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #000 !important;
        overflow: hidden !important;
      }
      .controls, .status { display: none !important; }
      .reel {
        transform: none !important;
        margin: 0 !important;
        width: 1080px !important;
        height: 1920px !important;
      }
    `
  });

  // Get the total duration from the page
  const totalDuration = await page.evaluate(() => {
    return typeof TOTAL_DURATION !== 'undefined' ? TOTAL_DURATION : 12000;
  });
  const totalFrames = Math.ceil((totalDuration / 1000) * fps) + fps; // +1s buffer
  const frameInterval = 1000 / fps;

  console.log(`Recording ${totalDuration / 1000}s at ${fps}fps (${totalFrames} frames)...`);

  // Trigger the animation
  await page.evaluate(() => {
    if (typeof animateParticles === 'function') animateParticles();
    if (typeof playAnimation === 'function') playAnimation();
  });

  // Capture frames
  for (let i = 0; i < totalFrames; i++) {
    const framePath = path.join(framesDir, `frame-${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });

    // Wait for next frame
    await new Promise(r => setTimeout(r, frameInterval));

    // Progress
    if (i % fps === 0) {
      process.stdout.write(`  ${Math.round((i / totalFrames) * 100)}%\r`);
    }
  }
  console.log('  100% - Frames captured');

  await browser.close();

  // Stitch frames into MP4 with ffmpeg
  console.log('Encoding MP4...');
  const ffmpegCmd = [
    'ffmpeg', '-y',
    '-framerate', String(fps),
    '-i', path.join(framesDir, 'frame-%05d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-s', '1080x1920',
    '-crf', '18',           // high quality
    '-preset', 'slow',      // better compression
    '-movflags', '+faststart', // optimized for streaming/upload
    outputMp4
  ].join(' ');

  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Clean up frames
  fs.rmSync(framesDir, { recursive: true });

  console.log(`\nDone! Output: ${outputMp4}`);
  console.log('Upload this MP4 directly to Instagram Reels.');
})();
