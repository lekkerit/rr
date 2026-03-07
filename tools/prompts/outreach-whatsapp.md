# WhatsApp Follow-up Templates — Post-Walk-in

Outreach is done in person (walk-in). These templates are for WhatsApp messages sent **after** the visit.

Variables: `{{restaurant_name}}`, `{{owner_name}}`, `{{what_was_discussed}}`

---

## Template 1 — Same-day follow-up

Send within a few hours of the visit.

```
Hoi {{owner_name}},

Leuk gesprek vandaag bij {{restaurant_name}}! Zoals beloofd stuur ik je even 2 voorbeeldreacties op recente Google-reviews — gewoon om te laten zien hoe het werkt.

[VOORBEELDREACTIES HIER]

Geen verplichtingen, gewoon even kijken. Wat vind je ervan?
```

**Tone notes:**
- Informeel, gebruik voornaam
- Refereer aan het gesprek (toont dat je luisterde)
- Concrete volgende stap: de voorbeeldreacties
- Eindig met open vraag

---

## Template 2 — Day 3 nudge (geen reactie)

```
Hoi {{owner_name}}, nog even terug over de voorbeeldreacties voor {{restaurant_name}}. Nog vragen, of wil je dat ik er nog wat maak op basis van jullie eigen reviews?
```

**Tone notes:**
- Kort en luchtig, geen druk
- Biedt extra waarde aan (meer voorbeelden)
- Geen "ik wilde even checken" — direct

---

## Template 3 — Day 7 (laatste poging)

```
Hoi {{owner_name}}, begrijp dat het druk is. Als de timing niet goed uitkomt, geen probleem — ik probeer het later nog een keer. Succes de komende weken bij {{restaurant_name}}!
```

**Tone notes:**
- Laat de deur open zonder opdringerig te zijn
- Toont begrip voor de drukke horeca-realiteit
- Positief afsluiten

---

## Generate-on-the-fly (via Claude)

For a personalised opening message based on the specific visit, use the prompt in `projects/whatsapp-outreach/wa-outreach.js`:

```
Schrijf een WhatsApp openingsbericht voor de eigenaar van {{restaurant_name}} in {{city}}.
- Nederlands, informeel maar professioneel
- Focus op waarde: meer vertrouwen bij nieuwe gasten
- Bied 2 gratis voorbeelden aan als eerste stap
- Geen AI/software/prijzen noemen
- Max 80 woorden, eindig met open vraag
```

Model: `claude-sonnet-4-6`, max_tokens: 200
