#!/usr/bin/env node

/**
 * Instagram Reels MP4 Exporter
 * Opens an animated reels.html in Puppeteer and records it as an MP4 video.
 *
 * Usage: node execution/ig-reels-exporter.js tools/ig-posts/post-10/reels.html
 * Output: tools/ig-posts/post-10/slides/reel.mp4
 */

const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

const RECORDING_CONFIG = {
  followNewTab: false,
  fps: 30,
  videoFrame: {
    width: 1080,
    height: 1080,
  },
  aspectRatio: '1:1',
};

async function exportReel(htmlPath) {
  const absolutePath = path.resolve(htmlPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`HTML file not found: ${absolutePath}`);
    process.exit(1);
  }

  const outputDir = path.join(path.dirname(absolutePath), 'slides');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'reel.mp4');

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1080,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });

  // Initialize recorder
  const recorder = new PuppeteerScreenRecorder(page, RECORDING_CONFIG);

  // Navigate to the reels HTML
  await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });

  // Wait for fonts
  await page.evaluateHandle('document.fonts.ready');

  console.log('Recording reel...');
  await recorder.start(outputPath);

  // Wait for the reel to complete (signaled by data-reel-complete attribute)
  await page.waitForFunction(
    () => document.body.getAttribute('data-reel-complete') === 'true',
    { timeout: 120000, polling: 500 }
  );

  // Small buffer after completion
  await new Promise(resolve => setTimeout(resolve, 500));

  await recorder.stop();
  await browser.close();

  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  console.log(`\nDone! Reel saved to: ${outputPath}`);
  console.log(`  File size: ${sizeMB} MB`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node execution/ig-reels-exporter.js <reels.html>');
    console.log('Example: node execution/ig-reels-exporter.js tools/ig-posts/post-10/reels.html');
    process.exit(1);
  }
  exportReel(args[0]).catch(err => {
    console.error('Export failed:', err.message);
    process.exit(1);
  });
}

module.exports = { exportReel };
