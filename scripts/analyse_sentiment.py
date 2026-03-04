#!/usr/bin/env python3
"""
analyse_sentiment.py — Layer 3 Execution Script
Classifies reviews by rating bucket and sentiment for response generation.

Usage:
    python scripts/analyse_sentiment.py [--input data/reviews_raw.json]

Output:
    data/reviews_classified.json — reviews with added sentiment/tier fields

Classification:
    positive  → 4–5 stars  (thank + invite return + suggest booking)
    mixed     → 3 stars    (acknowledge + highlight positives + invite back)
    negative  → 1–2 stars  (apologise + address + offer direct contact)
"""

import json
import argparse
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DEFAULT_INPUT = DATA_DIR / "reviews_raw.json"
DEFAULT_OUTPUT = DATA_DIR / "reviews_classified.json"


def classify_review(review: dict) -> dict:
    """Add sentiment tier based on star rating."""
    rating = review.get("star_rating", 0)

    if rating >= 4:
        sentiment = "positive"
        response_strategy = "thank_invite_book"
    elif rating == 3:
        sentiment = "mixed"
        response_strategy = "acknowledge_highlight_invite"
    else:
        sentiment = "negative"
        response_strategy = "apologise_address_contact"

    return {
        **review,
        "sentiment": sentiment,
        "response_strategy": response_strategy,
        "classified_at": __import__("datetime").datetime.utcnow().isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Classify reviews by sentiment")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Input reviews JSON file")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output classified JSON file")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"Error: input file not found at {input_path}")
        print("Run fetch_reviews.py first.")
        raise SystemExit(1)

    with open(input_path) as f:
        reviews = json.load(f)

    print(f"Classifying {len(reviews)} reviews...")
    classified = [classify_review(r) for r in reviews]

    counts = {}
    for r in classified:
        counts[r["sentiment"]] = counts.get(r["sentiment"], 0) + 1
    for sentiment, count in counts.items():
        print(f"  {sentiment}: {count}")

    output_path.write_text(json.dumps(classified, indent=2, ensure_ascii=False))
    print(f"\nSaved → {output_path}")


if __name__ == "__main__":
    main()
