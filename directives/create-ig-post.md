# Directive: Create Instagram Post

> Creates a new Instagram carousel or single-image post for @reviewrecovery using the template system.

## Goal

Generate a new IG post with slides and captions, ready for publishing. Output: static PNGs for carousel posts and/or animated MP4 for Reels/Stories.

## Inputs

- Post topic / key message
- Post type: `single` | `carousel`
- Number of slides (if carousel)
- Key stats or data points to include
- Target emotion: `educational` | `urgency` | `social-proof` | `how-it-works`

## Slide Type Catalog

| Slide Type | Best For | Themes |
|---|---|---|
| `hook-stat` | Opening with a big number (e.g. "9/10", "+35%", "73%") | dark, white |
| `hook-text` | Opening with a bold statement | dark, gold |
| `body-text` | Statement + subtitle, quotes | gold, dark |
| `body-stat` | Stat with icon and source | dark |
| `body-step` | Numbered process steps | dark, green |
| `body-fout` | Error/mistake item | white |
| `body-split` | Before/after comparison | white (fixed) |
| `body-review` | Review card display | light |
| `body-response` | Response card display | light |
| `body-stat-bars` | Progress bar visualization | white |
| `cta` | Closing call-to-action | gold, green |

## Common Carousel Patterns

- **Educational**: `hook-stat` → `body-fout` (x2-3) → `cta`
- **How-it-works**: `hook-text` → `body-step` (x2-3) → `cta`
- **Social proof**: `hook-stat` → `body-review` → `body-response` → `cta`
- **Data-driven**: `hook-text` → `body-stat-bars` → `cta`
- **Single stat**: `hook-stat` (one slide)
- **Single quote**: `body-text` (one slide)

## Steps

### 1. Create content.json

Create `instagram/posts/post-N/content.json` with this structure:

```json
{
  "post_id": "post-N",
  "type": "carousel",
  "slides": [
    {
      "type": "hook-stat",
      "theme": "dark",
      "data": {
        "number": "94%",
        "text": "van gasten vertrouwt online reviews",
        "source": "BrightLocal"
      }
    }
  ]
}
```

All text must be in Dutch.

### 2. Generate static HTML

```bash
node instagram/scripts/ig-generator.js instagram/posts/post-N/content.json
```

Output: `instagram/posts/post-N/post.html`

### 3. Review in browser

Open `instagram/posts/post-N/post.html` in browser. Check:
- Text fits within slide boundaries (no overflow)
- Theme colors are correct
- Content reads naturally in Dutch

### 4. Export PNGs

```bash
node instagram/scripts/ig-exporter.js instagram/posts/post-N/post.html
```

Output: `instagram/posts/post-N/slides/slide-1.png` ... `slide-N.png` (1080x1080)

### 5. Generate animated Reel (optional)

```bash
node instagram/scripts/ig-reels-generator.js instagram/posts/post-N/content.json
```

Output: `instagram/posts/post-N/reels.html`

### 6. Export MP4 (optional)

```bash
node instagram/scripts/ig-reels-exporter.js instagram/posts/post-N/reels.html
```

Output: `instagram/posts/post-N/slides/reel.mp4`

### 7. Write caption

Add caption to `marketing/ig-captions.md` following existing format. Include hashtags: `#googlereviews #horeca #hetgooi` + topic-specific.

## Outputs

- `content.json` — content definition (source of truth)
- `post.html` — static preview with all slides
- `reels.html` — animated version with anime.js
- `slides/*.png` — exported images at 1080x1080
- `slides/reel.mp4` — exported video
- Caption appended to `marketing/ig-captions.md`

## Data Reference per Slide Type

### hook-stat
```json
{ "number": "9/10", "number_suffix": "", "text": "gasten leest reviews", "number_color": "gold", "text_size": "big-text", "source": "Harvard Business Review", "divider": true }
```

### hook-text
```json
{ "heading": "3 fouten die restaurants maken", "subtitle": "En hoe je ze vermijdt →" }
```

### body-text
```json
{ "heading": "Elke review is een reserveringskans", "subtitle": "Reageer je niet? Dan kiest je gast voor de concurrent.", "pre_text": "\u201c", "post_text": "\u201d" }
```

### body-stat
```json
{ "icon": "⭐", "label": "Investering vs. resultaat", "pre_text": "Restaurants die reageren krijgen", "number": "35%", "number_color": "gold", "post_text": "meer boekingen", "subtitle": "door professionele review responses", "badge": "ROI: 2.6x in de eerste maand", "source": "Harvard Business Review", "divider": true }
```

### body-step
```json
{ "step_number": "1", "heading": "Wij monitoren je Google reviews", "subtitle": "Elke nieuwe review wordt automatisch opgepikt." }
```

### body-fout
```json
{ "fout_number": "1", "title": "Niet reageren", "detail": "53% van klanten verwacht een reactie binnen 7 dagen.", "example": "\"Bedankt voor uw review. We hopen u snel weer te zien.\"", "badge": "✗ 73% reageert niet" }
```

### body-split
```json
{ "header": "Wat zien jouw gasten?", "left_label": "Zonder response", "right_label": "Met response", "reviewer_initials": "MK", "reviewer_name": "Maria K.", "star_rating": 4, "review_text": "Lekker gegeten, mooie sfeer.", "no_response_text": "Geen reactie van eigenaar", "response_label": "Reactie van eigenaar", "response_text": "Bedankt Maria! Fijn dat het eten en de sfeer goed waren." }
```

### body-review
```json
{ "label": "De review", "reviewer_initials": "JV", "reviewer_name": "Jan Vermeer", "meta": "2 dagen geleden", "star_rating": 4, "review_text": "Lekker gegeten, mooie sfeer. Service was iets traag." }
```

### body-response
```json
{ "label": "Onze response", "badge_text": "Professionele Response", "response_text": "Bedankt Jan! Fijn om te horen dat je hebt genoten." }
```

### body-stat-bars
```json
{ "number": "73%", "number_color": "#e53e3e", "text": "reageert niet op Google reviews", "bars": [{ "label": "Reageert niet", "value": "73%", "value_color": "red", "bar_class": "stat-bar-fill-red" }, { "label": "Reageert wel", "value": "27%", "value_color": "green", "bar_class": "stat-bar-fill", "bar_color": "#38a169" }], "footnote": "Analyse van 171 restaurants in Het Gooi" }
```

### cta
```json
{ "heading": "Wil je weten hoe?", "subtitle": "Ontdek hoe professionele review responses jouw restaurant laten groeien", "button_text": "Link in bio →", "icon": "✓" }
```

## Edge Cases

- **Text overflow**: reduce text or switch to smaller typography class (`medium-text` instead of `big-text`)
- **Custom layouts**: if no template fits, create the slide manually in `post.html` and consider adding a new template type
- **Background image**: dark/gold/green themes require `assets/images/hero-restaurant.jpg`
- **Animation override**: add `"animation": "preset-name"` to a slide in content.json to override default

## Learnings

(Updated as directive is used)
