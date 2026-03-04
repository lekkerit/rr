#!/usr/bin/env node
/**
 * Apify → prospects.csv converter
 *
 * Converts a Google Maps Apify export to the format expected by wa-outreach.js.
 *
 * Usage:
 *   node apify-to-prospects.js apify-export.csv          # writes to prospects.csv
 *   node apify-to-prospects.js apify-export.csv out.csv  # writes to custom output
 */

const fs = require('fs');
const path = require('path');

const inputFile  = process.argv[2];
const outputFile = process.argv[3] || path.join(__dirname, 'prospects.csv');

if (!inputFile) {
  console.error('Usage: node apify-to-prospects.js <apify-export.csv>');
  process.exit(1);
}

// ─── CSV parser (handles quoted fields with commas inside) ────────────────────

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(raw) {
  const lines = raw.trim().split('\n');
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
    });
}

// ─── Phone extractor ──────────────────────────────────────────────────────────
// Apify stores phones as a JSON array string: ["0201234567"] or ["+31201234567"]
// Falls back to plain string if not JSON.

function extractPhone(raw) {
  if (!raw) return '';
  const cleaned = raw.trim();

  // Try JSON array
  if (cleaned.startsWith('[')) {
    try {
      const arr = JSON.parse(cleaned);
      if (Array.isArray(arr) && arr.length > 0) return normalisePhone(arr[0]);
    } catch (_) {}
  }

  // Comma-separated list — take first number only
  if (cleaned.includes(',')) {
    return normalisePhone(cleaned.split(',')[0].trim());
  }

  // Plain string
  return normalisePhone(cleaned);
}

// Ensure phone starts with + for international format
function normalisePhone(phone) {
  const digits = phone.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return '+' + digits.slice(2);
  if (digits.startsWith('31') && digits.length >= 11) return '+' + digits; // NL without leading +
  if (digits.startsWith('0')) return '+31' + digits.slice(1); // Dutch local format
  return digits;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const raw = fs.readFileSync(inputFile, 'utf8');
const rows = parseCsv(raw);

const output = ['name,restaurant,phone,rating,unanswered_count,city'];
let skipped = 0;

for (const row of rows) {
  const restaurant = (row['Restaurant'] || row['title'] || '').trim();
  const phone      = extractPhone(row['Phones'] || row['phone'] || '');
  const rating     = (row['totalScore'] || row['rating'] || '').toString().trim();
  const city       = (row['city'] || 'Hilversum').trim(); // default to Hilversum if blank

  if (!restaurant || !phone) {
    skipped++;
    continue;
  }

  // Use restaurant name as the contact name (no owner name available)
  output.push(`${restaurant},${restaurant},${phone},${rating},,${city}`);
}

fs.writeFileSync(outputFile, output.join('\n') + '\n');

console.log(`Done. ${output.length - 1} prospects written to ${outputFile}`);
if (skipped > 0) console.log(`Skipped ${skipped} rows (missing restaurant name or phone).`);
