#!/usr/bin/env python3
"""
flag_urgent.py — Layer 3 Execution Script
Surfaces reviews that need immediate attention before the weekly batch.

Urgency criteria:
    - Rating 1–2 stars AND review text mentions staff/hygiene/illness
    - Rating 1–2 stars AND review posted within 48 hours
    - Any review with 20+ upvotes (high visibility)

Usage:
    python scripts/flag_urgent.py [--input data/reviews_classified.json]

Output:
    data/reviews_urgent.json — urgent reviews for immediate review
    Prints summary to stdout for Claude to act on
"""

import json
import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DEFAULT_INPUT = DATA_DIR / "reviews_classified.json"
DEFAULT_OUTPUT = DATA_DIR / "reviews_urgent.json"

URGENT_KEYWORDS = [
    "ziek", "sick", "vergiftigd", "poisoned", "vies", "dirty",
    "hygiene", "hygiëne", "rotten", "bedorven", "nooit meer",
    "never again", "gezondheid", "health",
]
RECENT_HOURS = 48
MIN_UPVOTES_FOR_VISIBILITY = 20


def is_urgent(review: dict) -> tuple[bool, str]:
    """Returns (is_urgent, reason)."""
    rating = review.get("star_rating", 5)
    text = (review.get("review_text") or "").lower()
    upvotes = review.get("like_count", 0)

    # High-visibility review
    if upvotes >= MIN_UPVOTES_FOR_VISIBILITY:
        return True, f"high visibility ({upvotes} upvotes)"

    if rating <= 2:
        # Recent negative review
        posted_at = review.get("review_date")
        if posted_at:
            try:
                posted = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) - posted < timedelta(hours=RECENT_HOURS):
                    return True, f"recent negative (within {RECENT_HOURS}h)"
            except ValueError:
                pass

        # Keyword match
        matched = [kw for kw in URGENT_KEYWORDS if kw in text]
        if matched:
            return True, f"urgent keywords: {', '.join(matched)}"

    return False, ""


def main():
    parser = argparse.ArgumentParser(description="Flag urgent reviews for immediate attention")
    parser.add_argument("--input", default=str(DEFAULT_INPUT))
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: {input_path} not found. Run analyse_sentiment.py first.")
        raise SystemExit(1)

    with open(input_path) as f:
        reviews = json.load(f)

    urgent = []
    for review in reviews:
        flagged, reason = is_urgent(review)
        if flagged:
            urgent.append({**review, "urgent_reason": reason})

    Path(args.output).write_text(json.dumps(urgent, indent=2, ensure_ascii=False))

    print(f"Scanned {len(reviews)} reviews → {len(urgent)} urgent")
    for r in urgent:
        print(f"  ★{r.get('star_rating')} {r.get('reviewer_name', 'Anonymous')}: {r['urgent_reason']}")

    if not urgent:
        print("  No urgent reviews found.")


if __name__ == "__main__":
    main()
