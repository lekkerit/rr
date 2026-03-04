#!/usr/bin/env python3
"""
fetch_reviews.py — Layer 3 Execution Script
Fetches new reviews from Google My Business API for all active restaurants.

Usage:
    python scripts/fetch_reviews.py [--restaurant-id rest_001] [--days 7]

Output:
    data/reviews_raw.json — fetched reviews ready for analyse_sentiment.py

Directive: directives/fetch-reviews.md (create when edge cases are discovered)
"""

import json
import os
import argparse
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
RESTAURANTS_FILE = DATA_DIR / "restaurants.json"
OUTPUT_FILE = DATA_DIR / "reviews_raw.json"


def load_restaurants(restaurant_id: str | None = None) -> list[dict]:
    with open(RESTAURANTS_FILE) as f:
        restaurants = json.load(f)
    if restaurant_id:
        return [r for r in restaurants if r["id"] == restaurant_id]
    return [r for r in restaurants if r["status"] in ("active", "pilot")]


def fetch_reviews_for_restaurant(restaurant: dict, since_days: int = 7) -> list[dict]:
    """
    Fetch reviews from Google My Business API.
    TODO: implement OAuth token refresh + API call.
    See docs/setup-instructions.md for auth setup.
    """
    # Placeholder — replace with real API call
    raise NotImplementedError(
        f"Google My Business API call not yet implemented for {restaurant['name']}. "
        "See docs/setup-instructions.md."
    )


def main():
    parser = argparse.ArgumentParser(description="Fetch Google reviews for restaurants")
    parser.add_argument("--restaurant-id", help="Fetch for a specific restaurant only")
    parser.add_argument("--days", type=int, default=7, help="Lookback window in days (default: 7)")
    args = parser.parse_args()

    restaurants = load_restaurants(args.restaurant_id)
    print(f"Fetching reviews for {len(restaurants)} restaurant(s), last {args.days} days...")

    all_reviews = []
    for restaurant in restaurants:
        try:
            reviews = fetch_reviews_for_restaurant(restaurant, since_days=args.days)
            all_reviews.extend(reviews)
            print(f"  ✓ {restaurant['name']}: {len(reviews)} reviews fetched")
        except NotImplementedError as e:
            print(f"  ⚠ {restaurant['name']}: {e}")
        except Exception as e:
            print(f"  ✗ {restaurant['name']}: Error — {e}")

    OUTPUT_FILE.write_text(json.dumps(all_reviews, indent=2, ensure_ascii=False))
    print(f"\nSaved {len(all_reviews)} reviews → {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
