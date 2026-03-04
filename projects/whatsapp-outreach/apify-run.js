#!/usr/bin/env node
/**
 * Apify Google Maps Scraper → Airtable Pipeline
 *
 * Triggers an Apify run, waits for results, transforms them, and loads
 * new restaurant prospects directly into Airtable (skipping duplicates).
 *
 * Usage:
 *   node apify-run.js "restaurants Amersfoort" "restaurants Utrecht"
 *   node apify-run.js --dry-run "restaurants Amersfoort"
 *
 * Requires in .env:
 *   APIFY_API_KEY
 *   AIRTABLE_API_KEY
 *   AIRTABLE_BASE_ID
 *   AIRTABLE_TABLE_NAME  (defaults to "Prospects")
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN   = process.argv.includes('--dry-run');
const searches  = process.argv.slice(2).filter(a => !a.startsWith('--'));

if (searches.length === 0) {
  console.error('Usage: node apify-run.js [--dry-run] "restaurants Amersfoort" "restaurants Utrecht"');
  process.exit(1);
}

const APIFY_KEY       = process.env.APIFY_API_KEY;
const AIRTABLE_KEY    = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE   = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE  = process.env.AIRTABLE_TABLE_NAME || 'Prospects';
const ACTOR_ID        = 'compass~crawler-google-places';
const MAX_PER_SEARCH  = 100;
const POLL_INTERVAL   = 5000; // ms

// ─── Phone helpers ────────────────────────────────────────────────────────────

function normalisePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return '+' + digits.slice(2);
  if (digits.startsWith('31') && digits.length >= 11) return '+' + digits;
  if (digits.startsWith('0')) return '+31' + digits.slice(1);
  return digits;
}

// ─── City extractor ───────────────────────────────────────────────────────────
// Apify address: "Stationsplein 9, 3818 LE Amersfoort, Netherlands"
// → "Amersfoort"

function extractCity(item) {
  if (item.city) return item.city.trim();
  const addr = item.address || item.addressParsed?.city || '';
  // Match Dutch postcode pattern: "1234 AB CityName, Country"
  const match = addr.match(/\d{4}\s?[A-Z]{2}\s+([^,]+)/);
  if (match) return match[1].trim();
  // Fallback: second-to-last comma segment
  const parts = addr.split(',');
  if (parts.length >= 2) return parts[parts.length - 2].trim();
  return '';
}

// ─── Apify API ────────────────────────────────────────────────────────────────

async function startRun(searchStrings) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_KEY}`,
    {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        searchStringsArray        : searchStrings,
        maxCrawledPlacesPerSearch : MAX_PER_SEARCH,
        language                  : 'nl',
        countryCode               : 'nl',
        includeHistogram          : false,
        includeOpeningHours       : false,
        includePeopleAlsoSearch   : false
      })
    }
  );
  if (!res.ok) throw new Error(`Apify start failed: ${await res.text()}`);
  const data = await res.json();
  return data.data;
}

async function pollRun(runId) {
  while (true) {
    const res  = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_KEY}`);
    const data = await res.json();
    const status = data.data?.status;
    if (status === 'SUCCEEDED') return data.data;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(`Apify run ${status}: ${runId}`);
    }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }
}

async function downloadDataset(datasetId) {
  const res = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&token=${APIFY_KEY}`
  );
  if (!res.ok) throw new Error(`Dataset download failed: ${await res.text()}`);
  return res.json();
}

// ─── Airtable helpers ─────────────────────────────────────────────────────────

async function airtableFetch(endpoint, options = {}) {
  const base = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`;
  const res  = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      Authorization  : `Bearer ${AIRTABLE_KEY}`,
      'Content-Type' : 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchExistingPhones() {
  const phones = new Set();
  let offset   = null;
  do {
    const params = new URLSearchParams({ pageSize: '100' });
    params.append('fields[]', 'Phone');
    if (offset) params.set('offset', offset);
    const data = await airtableFetch(`?${params}`);
    for (const r of data.records) {
      if (r.fields.Phone) phones.add(r.fields.Phone);
    }
    offset = data.offset || null;
  } while (offset);
  return phones;
}

async function createBatch(records) {
  const data = await airtableFetch('', {
    method : 'POST',
    body   : JSON.stringify({ records, typecast: true })
  });
  return data.records;
}

// ─── Transform ────────────────────────────────────────────────────────────────

function transform(items) {
  const out = [];
  for (const item of items) {
    const name  = (item.title || '').trim();
    const phone = normalisePhone(item.phone || item.phoneUnformatted || '');
    const rating = item.totalScore ? parseFloat(item.totalScore) : null;
    const city   = extractCity(item);
    if (!name || !phone) continue;
    out.push({ name, phone, rating, city });
  }
  return out;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!APIFY_KEY)    { console.error('Error: APIFY_API_KEY not set in .env'); process.exit(1); }
  if (!AIRTABLE_KEY) { console.error('Error: AIRTABLE_API_KEY not set in .env'); process.exit(1); }

  console.log(`\nApify → Airtable Pipeline${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('─'.repeat(45));
  console.log(`Searches: ${searches.join(', ')}`);
  console.log(`Max per search: ${MAX_PER_SEARCH}\n`);

  // 1. Start Apify run
  process.stdout.write('Starting Apify run ... ');
  const run = await startRun(searches);
  console.log(`started (${run.id})`);

  // 2. Poll until done
  process.stdout.write('Waiting for results ');
  const finished = await pollRun(run.id);
  console.log(` done (${finished.status})`);

  // 3. Download dataset
  process.stdout.write('Downloading dataset ... ');
  const items = await downloadDataset(finished.defaultDatasetId);
  console.log(`${items.length} items`);

  // 4. Transform
  const prospects = transform(items);
  console.log(`Valid prospects (name + phone): ${prospects.length}`);

  if (DRY_RUN) {
    console.log('\nDry run preview (first 10):');
    prospects.slice(0, 10).forEach(p =>
      console.log(`  → ${p.name} | ${p.phone} | ${p.city}${p.rating ? ` | ★${p.rating}` : ''}`)
    );
    console.log('\nRun without --dry-run to push to Airtable.');
    return;
  }

  // 5. Deduplicate against Airtable
  process.stdout.write('Fetching existing Airtable phones ... ');
  const existing = await fetchExistingPhones();
  console.log(`${existing.size} already in Airtable`);

  const toCreate = prospects.filter(p => !existing.has(p.phone));
  console.log(`New prospects to add: ${toCreate.length}\n`);

  if (toCreate.length === 0) {
    console.log('Nothing new to add.');
    return;
  }

  // 6. Push to Airtable in batches of 10
  let created = 0;
  for (let i = 0; i < toCreate.length; i += 10) {
    const batch   = toCreate.slice(i, i + 10);
    const records = batch.map(p => ({
      fields: {
        Name   : p.name,
        Phone  : p.phone,
        City   : p.city || '',
        Status : 'not contacted',
        ...(p.rating ? { Rating: p.rating } : {})
      }
    }));
    process.stdout.write(`Creating records ${i + 1}–${Math.min(i + 10, toCreate.length)} ... `);
    try {
      const result = await createBatch(records);
      created += result.length;
      console.log('done');
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
    }
    if (i + 10 < toCreate.length) await new Promise(r => setTimeout(r, 250));
  }

  console.log('\n' + '─'.repeat(45));
  console.log(`✓ Done. Added: ${created} | Skipped (duplicates): ${prospects.length - toCreate.length}`);
  console.log('\nNext: node wa-generate-html.js\n');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
