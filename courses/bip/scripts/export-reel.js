#!/usr/bin/env node

/**
 * Bots in Public — Reel MP4 Exporter
 * Records an animated reel HTML as a 1080x1920 (9:16) MP4.
 *
 * Usage: node courses/bip/scripts/export-reel.js courses/bip/day1-reel.html
 * Output: courses/bip/day1-reel.mp4
 */

const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

const W = 1080;
const H = 1920;

async function exportReel(htmlPath) {
  const absolutePath = path.resolve(htmlPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const outputPath = absolutePath.replace(/\.html$/, '.mp4');

  console.log(`Input:  ${absolutePath}`);
  console.log(`Output: ${outputPath}`);
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${W},${H}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H });

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 30,
    videoFrame: { width: W, height: H },
    aspectRatio: '9:16',
  });

  await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  console.log('Recording...');
  await recorder.start(outputPath);

  await page.waitForFunction(
    () => document.body.getAttribute('data-reel-complete') === 'true',
    { timeout: 180000, polling: 500 }
  );

  await new Promise(r => setTimeout(r, 500));
  await recorder.stop();
  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`\nDone! ${outputPath}`);
  console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(1)} MB`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node courses/bip/scripts/export-reel.js <reel.html>');
  process.exit(1);
}

exportReel(args[0]).catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
