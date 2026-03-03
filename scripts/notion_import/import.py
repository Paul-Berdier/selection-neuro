"""
Script placeholder: importer un export Notion (markdown/html) vers la DB.
- parse fichiers
- map -> Product / Stack
- upsert via SQLAlchemy
"""

from __future__ import annotations

import argparse


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", required=True, help="Chemin vers export Notion")
    args = parser.parse_args()

    print(f"[TODO] Import Notion depuis: {args.path}")
    # Ici tu ajoutes ton parsing, puis upsert en DB


if __name__ == "__main__":
    main()