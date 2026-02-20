#!/usr/bin/env node

/**
 * Instagram Post Generator
 * Reads a content.json file and generates a complete HTML post file
 * using the template system in instagram/templates/
 *
 * Usage: node instagram/scripts/ig-generator.js instagram/posts/post-10/content.json
 * Output: instagram/posts/post-10/post.html
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'instagram', 'templates');
const SLIDES_DIR = path.join(TEMPLATES_DIR, 'slides');

function loadTemplate(name) {
  const filePath = path.join(SLIDES_DIR, `${name}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: ${name} (looked in ${filePath})`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function loadBaseTemplate() {
  return fs.readFileSync(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');
}

/**
 * Simple mustache-like template engine.
 * Supports:
 *   {{key}}           - value substitution
 *   {{#key}}...{{/key}} - conditional block (truthy) or array iteration
 */
function render(template, data) {
  // Handle conditional/iteration blocks: {{#key}}...{{/key}}
  let result = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    const value = data[key];
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.map(item => render(content, item)).join('\n');
    }
    // Truthy scalar — render the block once, replacing nested {{key}} with the value if it's a string
    if (typeof value === 'string') {
      return render(content, { ...data, [key]: value });
    }
    return render(content, data);
  });

  // Handle simple value substitution: {{key}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : '';
  });

  return result;
}

/**
 * Generate star characters from a number (e.g. 4 → ★★★★☆)
 */
function generateStars(rating) {
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return filled + empty;
}

function buildSlideHtml(slide) {
  const template = loadTemplate(slide.type);
  const data = {
    theme: slide.theme || 'dark',
    ...slide.data,
  };

  // Default number_color to gold if not specified
  if (!data.number_color) data.number_color = 'gold';

  // Default text_size for hook-stat
  if (!data.text_size) data.text_size = 'big-text';

  // Generate stars string if star_rating is provided
  if (data.star_rating) {
    data.stars = generateStars(data.star_rating);
  }

  // Default bar_class for stat bars
  if (data.bars) {
    data.bars = data.bars.map(bar => ({
      ...bar,
      bar_class: bar.bar_class || (bar.bar_color ? 'stat-bar-fill' : 'stat-bar-fill'),
      value_color: bar.value_color || '',
    }));
  }

  return render(template, data);
}

function generate(contentPath) {
  const absolutePath = path.resolve(contentPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Content file not found: ${absolutePath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  const outputDir = path.dirname(absolutePath);

  // Build all slides
  const slidesHtml = content.slides.map((slide, i) => {
    try {
      return buildSlideHtml(slide);
    } catch (err) {
      console.error(`Error generating slide ${i + 1} (${slide.type}): ${err.message}`);
      process.exit(1);
    }
  }).join('\n\n');

  // Wrap in post-group with label
  const postType = content.type === 'single' ? 'Single image' : `Carousel (${content.slides.length} slides)`;
  const wrappedSlides = `<div class="post-group">
  <div class="post-label">${content.post_id} &mdash; ${postType}</div>
  <div class="slides-row">
${slidesHtml}
  </div>
</div>`;

  // Insert into base template
  const base = loadBaseTemplate();
  const title = content.title || content.post_id;
  const html = base
    .replace('{{title}}', title)
    .replace('{{slides}}', wrappedSlides);

  // Write output
  const outputPath = path.join(outputDir, 'post.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`Generated: ${outputPath}`);
  console.log(`  ${content.slides.length} slide(s), type: ${content.type}`);

  return outputPath;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node instagram/scripts/ig-generator.js <content.json>');
    console.log('Example: node instagram/scripts/ig-generator.js instagram/posts/post-10/content.json');
    process.exit(1);
  }
  generate(args[0]);
}

module.exports = { generate, render, buildSlideHtml, generateStars };
