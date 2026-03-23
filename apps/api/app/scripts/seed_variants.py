"""
seed_variants.py — Peuple les variantes 1 mois / 3 mois / 1 an
à partir des données du cahier des charges Bisous Nours.

Usage :
    DATABASE_URL=postgresql+psycopg://... python seed_variants.py
"""
from __future__ import annotations

import os, sys, re
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def normalize_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


# ── Données du tableau ────────────────────────────────────────────────────────
# (slug, price_1m, qty_g_1m, price_3m, qty_g_3m, price_1y, qty_g_1y, price_month_eur)
VARIANTS = [
    # slug                    1m prix  1m qty    3m prix   3m qty   1y prix    1y qty   /mois
    ("creatine",              5.77,    150,      23.47,    610,     70.20,     1825,    5.77),
    ("ashwagandha",           6.26,    18,       15.45,    54,      53.75,     219,     6.26),
    ("bacopa-monnieri",       7.44,    9,        16.54,    27,      63.88,     109.5,   7.44),
    ("citicoline",            22.86,   15,       56.47,    45,      196.37,    182.5,   22.86),
    ("cordyceps-militaris",   48.34,   90,       119.38,   270,     415.06,    1095,    48.34),
    ("ginkgo-biloba",         10.13,   7.2,      25.03,    21.6,    87.02,     87.6,    10.13),
    ("lions-mane",            43.48,   90,       107.34,   270,     373.34,    1095,    43.48),
    ("l-theanine",            9.73,    6,        24.05,    18,      83.58,     73,      9.73),
    ("l-tyrosine",            106.16,  315,      262.71,   945,     1290.44,   3832.5,  106.16),
    ("magnesium-l-threonate", 21.06,   60,       52.03,    180,     181.14,    730,     21.06),
    ("dha-omega3",            16.11,   27,       39.74,    81,      138.35,    328.5,   16.11),
    ("panax-ginseng",         1.78,    12,       4.39,     36,      15.22,     146,     1.78),
    ("piracetam",             21.17,   144,      52.27,    432,     181.33,    1752,    21.17),
    ("spiruline",             5.49,    90,       16.48,    270,     66.83,     1095,    5.49),
    ("uridine-monophosphate", 16.43,   18.75,    40.67,    56.25,   141.21,    228.125, 16.43),
    # Vitamines séparées (B9, B12) — qty en grammes équivalent (mg → g)
    ("vitamines-b9-b12-d",   14.26,   0.060,    30.65,    0.180,   108.30,    0.730,   14.26),
]


def main():
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        print("❌ DATABASE_URL requis")
        sys.exit(1)
    url = normalize_url(url)

    engine = create_engine(url, echo=False)
    updated = 0
    not_found = []

    with Session(engine) as db:
        for row in VARIANTS:
            slug, p1m, q1m, p3m, q3m, p1y, q1y, pmois = row
            result = db.execute(text("""
                UPDATE product SET
                    price_1m  = :p1m,  qty_g_1m  = :q1m,
                    price_3m  = :p3m,  qty_g_3m  = :q3m,
                    price_1y  = :p1y,  qty_g_1y  = :q1y,
                    price_month_eur = :pmois
                WHERE slug = :slug
            """), {
                "p1m": p1m, "q1m": q1m,
                "p3m": p3m, "q3m": q3m,
                "p1y": p1y, "q1y": q1y,
                "pmois": pmois, "slug": slug,
            })
            if result.rowcount == 0:
                not_found.append(slug)
            else:
                updated += 1
                print(f"   ✅ {slug}")

        db.commit()

    print(f"\n✓ {updated} produits mis à jour")
    if not_found:
        print(f"⚠️  Non trouvés : {not_found}")


if __name__ == "__main__":
    main()
