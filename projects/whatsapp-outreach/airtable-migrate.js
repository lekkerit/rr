#!/usr/bin/env node
/**
 * Airtable Migration Script — One-time import
 *
 * Reads prospects.csv + sent-log.json and creates records in Airtable.
 * Idempotent: fetches existing records first and skips phones already present.
 *
 * Usage:
 *   node airtable-migrate.js           # dry run (preview only)
 *   node airtable-migrate.js --write   # actually create records in Airtable
 *
 * Requires in .env:
 *   AIRTABLE_API_KEY
 *   AIRTABLE_BASE_ID
 *   AIRTABLE_TABLE_NAME   (defaults to "Prospects")
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const WRITE   = process.argv.includes('--write');
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE   = process.env.AIRTABLE_TABLE_NAME || 'Prospects';

const PROSPECTS_FILE = path.join(__dirname, 'prospects.csv');
const SENT_LOG_FILE  = path.join(__dirname, 'sent-log.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadProspects() {
  const raw     = fs.readFileSync(PROSPECTS_FILE, 'utf8').trim();
  const lines   = raw.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
    })
    .filter(p => p.phone);
}

function loadSentLog() {
  if (!fs.existsSync(SENT_LOG_FILE)) return {};
  return JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8'));
}

async function airtableFetch(endpoint, options = {}) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}${endpoint}`;
  const res  = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
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

// Fetch all existing records (handles pagination)
async function fetchExistingPhones() {
  const phones = new Set();
  let offset   = null;

  do {
    const params = new URLSearchParams({ pageSize: '100' });
    params.append('fields[]', 'Phone');
    if (offset) params.set('offset', offset);

    const data = await airtableFetch(`?${params}`);
    for (const record of data.records) {
      if (record.fields.Phone) phones.add(record.fields.Phone);
    }
    offset = data.offset || null;
  } while (offset);

  return phones;
}

// Create records in batches of 10 (Airtable limit)
async function createBatch(records) {
  const data = await airtableFetch('', {
    method: 'POST',
    body: JSON.stringify({ records, typecast: true })
  });
  return data.records;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nAirtable Migration${WRITE ? '' : ' (DRY RUN — pass --write to commit)'}`);
  console.log('─'.repeat(50));

  if (!API_KEY || !BASE_ID) {
    console.error('Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in .env');
    process.exit(1);
  }

  const prospects = loadProspects();
  const sentLog   = loadSentLog();
  console.log(`Prospects loaded : ${prospects.length}`);
  console.log(`Sent-log entries : ${Object.keys(sentLog).length}`);

  // Check for existing records so we don't duplicate
  let existingPhones = new Set();
  if (WRITE) {
    process.stdout.write('Fetching existing Airtable records ... ');
    existingPhones = await fetchExistingPhones();
    console.log(`${existingPhones.size} found`);
  }

  // Build records to create
  const toCreate = [];
  const skipped  = [];

  for (const p of prospects) {
    if (existingPhones.has(p.phone)) {
      skipped.push(p.phone);
      continue;
    }

    const logEntry = sentLog[p.phone];
    const fields   = {
      Name   : p.restaurant,
      Phone  : p.phone,
      City   : p.city || 'Hilversum',
      Status : logEntry ? logEntry.status === 'generated' ? 'generated' : 'sent' : 'not contacted'
    };

    if (p.rating) fields.Rating = parseFloat(p.rating);
    if (logEntry?.sentAt) fields['Generated At'] = logEntry.sentAt;

    toCreate.push({ fields });
  }

  console.log(`\nTo create : ${toCreate.length}`);
  console.log(`Skipped   : ${skipped.length} (already in Airtable)`);

  if (!WRITE) {
    console.log('\nDry run preview (first 5):');
    toCreate.slice(0, 5).forEach(r => {
      const f = r.fields;
      console.log(`  → ${f.Name} | ${f.Phone} | ${f.City} | ${f.Status}${f.Rating ? ` | ★${f.Rating}` : ''}`);
    });
    console.log('\nRun with --write to commit to Airtable.');
    return;
  }

  // Create in batches of 10
  let created = 0;
  for (let i = 0; i < toCreate.length; i += 10) {
    const batch = toCreate.slice(i, i + 10);
    process.stdout.write(`Creating records ${i + 1}–${Math.min(i + 10, toCreate.length)} ... `);
    try {
      const result = await createBatch(batch);
      created += result.length;
      console.log('done');
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
    }
    // Airtable rate limit: 5 requests/second
    if (i + 10 < toCreate.length) await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n✓ Migration complete. Created: ${created} | Skipped: ${skipped.length}`);
  console.log(`  View your base: https://airtable.com/${BASE_ID}\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
