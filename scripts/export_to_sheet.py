#!/usr/bin/env python3
"""
export_to_sheet.py — Layer 3 Execution Script
Exports classified/responded reviews to Google Sheets for client reporting.

Usage:
    python scripts/export_to_sheet.py [--input data/reviews_classified.json] [--sheet-id SHEET_ID]

Prerequisites:
    - Google Sheets API enabled in Google Cloud Console
    - credentials.json in project root (in .gitignore)
    - pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client

Output:
    Appends rows to the target Google Sheet.
    Columns: date, restaurant, reviewer, rating, review_text, response_text, status
"""

import json
import argparse
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DEFAULT_INPUT = DATA_DIR / "reviews_classified.json"
CREDENTIALS_FILE = Path(__file__).parent.parent / "credentials.json"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

COLUMNS = [
    "review_date", "restaurant_name", "reviewer_name",
    "star_rating", "sentiment", "review_text",
    "response_text", "response_posted",
]


def get_sheets_service():
    """Authenticate and return Google Sheets API service."""
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
    except ImportError:
        raise ImportError(
            "Missing dependencies. Run: pip install google-auth google-auth-oauthlib "
            "google-auth-httplib2 google-api-python-client"
        )

    token_file = Path(__file__).parent.parent / "token.json"
    creds = None

    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
        creds = flow.run_local_server(port=0)
        token_file.write_text(creds.to_json())

    return build("sheets", "v4", credentials=creds)


def reviews_to_rows(reviews: list[dict]) -> list[list]:
    rows = []
    for r in reviews:
        row = [str(r.get(col, "")) for col in COLUMNS]
        rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser(description="Export reviews to Google Sheets")
    parser.add_argument("--input", default=str(DEFAULT_INPUT))
    parser.add_argument("--sheet-id", default=os.getenv("GOOGLE_SHEET_ID"), help="Target Sheet ID")
    parser.add_argument("--tab", default="Reviews", help="Tab/sheet name (default: Reviews)")
    args = parser.parse_args()

    if not args.sheet_id:
        print("Error: provide --sheet-id or set GOOGLE_SHEET_ID env var")
        raise SystemExit(1)

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: {input_path} not found.")
        raise SystemExit(1)

    with open(input_path) as f:
        reviews = json.load(f)

    print(f"Exporting {len(reviews)} reviews to sheet {args.sheet_id}...")

    service = get_sheets_service()
    rows = reviews_to_rows(reviews)

    body = {"values": rows}
    result = service.spreadsheets().values().append(
        spreadsheetId=args.sheet_id,
        range=f"{args.tab}!A1",
        valueInputOption="RAW",
        body=body,
    ).execute()

    updated = result.get("updates", {}).get("updatedRows", 0)
    print(f"  ✓ {updated} rows appended to '{args.tab}'")


if __name__ == "__main__":
    main()
