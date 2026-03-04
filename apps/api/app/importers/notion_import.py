from __future__ import annotations

import csv
import hashlib
import mimetypes
import re
import tempfile
import unicodedata
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.models import (
    Product,
    Stack,
    StackProduct,
    Benefit,
    ProductBenefit,
    Study,
    ProductStudy,
)
from app.models.media import Media


# ============================================================
# Helpers
# ============================================================

def slugify(s: str) -> str:
    """
    Robust slugify:
    - keeps latin letters with accents by normalizing to ascii (Créatine -> creatine)
    - drops emojis/symbols
    - produces stable slugs (no 'cr-atine')
    """
    s = (s or "").strip().lower()
    s = s.replace("’", "'")

    # Normalize accents -> ascii
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")

    # Remove quotes/apostrophes
    s = re.sub(r"[`'’]+", "", s)

    # Replace non-alnum with '-'
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "item"


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def guess_content_type(filename: str) -> str:
    ct, _ = mimetypes.guess_type(filename)
    return ct or "application/octet-stream"


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="ignore")


def split_tags(tags: str) -> list[str]:
    """
    Your Notion CSV uses column 'Étiquettes' like:
      "⚡Attention & réactivité mentale, 🔋 énergie mentale & resistance au stress"
    We split on commas and trim.
    """
    if not tags:
        return []
    parts = [t.strip() for t in tags.split(",")]
    return [p for p in parts if p]


def pick_best_image(dir_path: Path) -> Path | None:
    """
    Notion export often creates 'image.png' alongside the md.
    Sometimes there are multiple images in the directory.
    Strategy:
      1) prefer image.png / image.jpg / image.jpeg
      2) else first png/jpg/jpeg/webp
    """
    preferred = ["image.png", "image.jpg", "image.jpeg", "image.webp"]
    for name in preferred:
        p = dir_path / name
        if p.exists() and p.is_file():
            return p

    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        imgs = sorted(dir_path.glob(ext))
        if imgs:
            return imgs[0]
    return None


# ============================================================
# Upserts
# ============================================================

def upsert_product(
    db: Session,
    slug: str,
    **fields,
) -> Product:
    obj = db.query(Product).filter(Product.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj
    obj = Product(slug=slug, **fields)
    db.add(obj)
    return obj


def upsert_product_cached(
    db: Session,
    cache: dict[str, Product],
    slug: str,
    **fields,
) -> Product:
    """
    Use this version when you might touch the same product many times
    within the same transaction (avoids duplicate inserts & extra queries).
    """
    if slug in cache:
        obj = cache[slug]
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj

    obj = db.query(Product).filter(Product.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        cache[slug] = obj
        return obj

    obj = Product(slug=slug, **fields)
    db.add(obj)
    db.flush()  # make it "real" immediately (id available)
    cache[slug] = obj
    return obj


def upsert_stack(db: Session, slug: str, **fields) -> Stack:
    obj = db.query(Stack).filter(Stack.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj
    obj = Stack(slug=slug, **fields)
    db.add(obj)
    return obj


def upsert_benefit(db: Session, slug: str, **fields) -> Benefit:
    obj = db.query(Benefit).filter(Benefit.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj
    obj = Benefit(slug=slug, **fields)
    db.add(obj)
    return obj


def upsert_study(db: Session, slug: str, **fields) -> Study:
    obj = db.query(Study).filter(Study.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj
    obj = Study(slug=slug, **fields)
    db.add(obj)
    return obj


def upsert_media(db: Session, content: bytes, filename: str) -> Media:
    h = sha256_bytes(content)
    obj = db.query(Media).filter(Media.sha256 == h).first()
    if obj:
        return obj
    obj = Media(
        sha256=h,
        filename=filename,
        content_type=guess_content_type(filename),
        bytes=content,
        size_bytes=len(content),
    )
    db.add(obj)
    db.flush()
    return obj


def upsert_stack_product(
    db: Session,
    stack_id: int,
    product_id: int,
    dosage_value: float | None,
    dosage_unit: str,
    note: str = "",
    sort_order: int = 100,
) -> None:
    obj = (
        db.query(StackProduct)
        .filter(StackProduct.stack_id == stack_id, StackProduct.product_id == product_id)
        .first()
    )
    if obj:
        obj.dosage_value = dosage_value
        obj.dosage_unit = dosage_unit
        obj.note = note
        obj.sort_order = sort_order
        return
    db.add(
        StackProduct(
            stack_id=stack_id,
            product_id=product_id,
            dosage_value=dosage_value,
            dosage_unit=dosage_unit,
            note=note,
            sort_order=sort_order,
        )
    )


def upsert_product_benefit(
    db: Session,
    product_id: int,
    benefit_id: int,
    note: str = "",
    evidence_level: int | None = None,
) -> None:
    obj = (
        db.query(ProductBenefit)
        .filter(ProductBenefit.product_id == product_id, ProductBenefit.benefit_id == benefit_id)
        .first()
    )
    if obj:
        obj.note = note
        obj.evidence_level = evidence_level
        return
    db.add(
        ProductBenefit(
            product_id=product_id,
            benefit_id=benefit_id,
            note=note,
            evidence_level=evidence_level,
        )
    )


def upsert_product_study(db: Session, product_id: int, study_id: int, note: str = "") -> None:
    obj = (
        db.query(ProductStudy)
        .filter(ProductStudy.product_id == product_id, ProductStudy.study_id == study_id)
        .first()
    )
    if obj:
        obj.note = note
        return
    db.add(ProductStudy(product_id=product_id, study_id=study_id, note=note))


# ============================================================
# Stack dosage parser
# ============================================================

DOSAGE_LINE = re.compile(
    r"^\s*[-•]?\s*(?P<name>[^:]+)\s*:\s*(?P<value>[0-9]+(?:[.,][0-9]+)?)\s*(?P<unit>mg|g|µg|mcg)\s*$",
    re.IGNORECASE,
)


def extract_dosages_from_stack_md(md: str) -> list[tuple[str, float, str]]:
    out: list[tuple[str, float, str]] = []
    for line in md.splitlines():
        m = DOSAGE_LINE.match(line.strip())
        if not m:
            continue
        name = m.group("name").strip()
        val = float(m.group("value").replace(",", "."))
        unit = m.group("unit").lower()
        unit = "µg" if unit in ("µg", "mcg") else unit
        out.append((name, val, unit))
    return out


# ============================================================
# Zip extraction
# ============================================================

@dataclass
class ExportPaths:
    work_dir: Path
    md_files: list[Path]
    csv_files: list[Path]


def extract_zip_to_temp(zip_path: Path) -> ExportPaths:
    tmp_dir = Path(tempfile.mkdtemp(prefix="notion_export_"))
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(tmp_dir)

    return ExportPaths(
        work_dir=tmp_dir,
        md_files=list(tmp_dir.rglob("*.md")),
        csv_files=list(tmp_dir.rglob("*.csv")),
    )


def pick_csv(csv_files: list[Path], contains: str) -> Path | None:
    contains = contains.lower()
    for p in csv_files:
        n = p.name.lower()
        if contains in n and not n.endswith("_all.csv"):
            return p
    for p in csv_files:
        if contains in p.name.lower():
            return p
    return None


# ============================================================
# CSV import
# ============================================================

def import_benefits_csv(db: Session, csv_path: Path, product_cache: dict[str, Product]) -> int:
    """
    In YOUR Notion export, the CSV is basically:
      columns: Nom | Date de création | Étiquettes
    We interpret:
      - Nom => Product name
      - Étiquettes => Benefits (tags), possibly multiple separated by commas
    """
    with csv_path.open("r", encoding="utf-8", errors="ignore", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        return 0

    # detect columns
    cols = { (k or "").strip().lower(): k for k in rows[0].keys() if k }
    col_name = cols.get("nom") or cols.get("name") or cols.get("product") or cols.get("produit")
    col_tags = cols.get("étiquettes") or cols.get("etiquettes") or cols.get("tags") or cols.get("labels")

    if not col_name or not col_tags:
        # nothing to do; schema doesn't match
        return 0

    links = 0
    for r in rows:
        pname = (r.get(col_name) or "").strip()
        tags = (r.get(col_tags) or "").strip()
        if not pname or not tags:
            continue

        pslug = slugify(pname)
        p = upsert_product_cached(
            db,
            product_cache,
            pslug,
            name=pname,
            short_desc="",
            description_md="",
            category="",
            image_path="",
            is_active=True,
        )

        for tag in split_tags(tags):
            # keep original tag label as benefit name (including emoji),
            # but slugify will remove emoji and keep text
            bslug = slugify(tag)
            if not bslug:
                continue
            b = upsert_benefit(db, bslug, name=tag, description="", sort_order=100, is_active=True)
            db.flush()
            upsert_product_benefit(db, p.id, b.id)
            links += 1

    return links


def stable_study_slug(title: str, url: str) -> str:
    base = (title.strip() + "|" + (url or "").strip()).encode("utf-8")
    h = hashlib.sha1(base).hexdigest()[:12]
    return slugify(title)[:140] + "-" + h


def import_studies_csv(db: Session, csv_path: Path, product_cache: dict[str, Product]) -> int:
    """
    Only imports if the CSV actually contains study fields.
    Your current export "produits et études" does NOT contain studies (it contains tags),
    so this function will typically do nothing (by design).
    """
    with csv_path.open("r", encoding="utf-8", errors="ignore", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        return 0

    def find_col_contains(substrs: list[str]) -> str | None:
        for k in rows[0].keys():
            kl = (k or "").lower()
            if any(s in kl for s in substrs):
                return k
        return None

    col_product = find_col_contains(["product", "produit", "ingredient", "name", "nom"])
    col_title = find_col_contains(["title", "titre", "study", "étude", "etude"])
    col_url = find_col_contains(["url", "link", "lien"])

    # if we can't find a study-title column, we skip
    if not col_product or not col_title:
        return 0

    links = 0
    for r in rows:
        pname = (r.get(col_product) or "").strip()
        title = (r.get(col_title) or "").strip()
        url = (r.get(col_url) or "").strip() if col_url else ""
        if not pname or not title:
            continue

        p = upsert_product_cached(
            db,
            product_cache,
            slugify(pname),
            name=pname,
            short_desc="",
            description_md="",
            category="",
            image_path="",
            is_active=True,
        )

        sslug = stable_study_slug(title, url)
        s = upsert_study(
            db,
            sslug,
            title=title,
            url=url,
            authors="",
            year=None,
            journal="",
            source_type="",
            summary="",
        )

        db.flush()
        upsert_product_study(db, p.id, s.id)
        links += 1

    return links


# ============================================================
# Markdown import
# ============================================================

def import_markdowns(db: Session, md_files: list[Path], product_cache: dict[str, Product]) -> dict[str, int]:
    """
    - Stacks: any md file whose filename contains 'stack'
    - Product pages: md files located under folders containing keywords
      (produit, product, etude, study, ingredient, bienfait)
    """
    created_stacks = 0
    linked_stack_products = 0
    upserted_products = 0
    media_count = 0

    for p in md_files:
        fname = p.name.lower()
        parent = str(p.parent).lower()
        text = read_text(p)

        # --- stacks ---
        if "stack" in fname:
            title = ""
            for line in text.splitlines():
                if line.startswith("#"):
                    title = line.lstrip("#").strip()
                    break
            title = title or p.stem
            st = upsert_stack(
                db,
                slugify(title),
                title=title,
                subtitle="",
                description_md=text,
                is_active=True,
            )
            db.flush()
            created_stacks += 1

            dosages = extract_dosages_from_stack_md(text)
            sort = 10
            for prod_name, val, unit in dosages:
                pr = upsert_product_cached(
                    db,
                    product_cache,
                    slugify(prod_name),
                    name=prod_name,
                    short_desc="",
                    description_md="",
                    category="",
                    image_path="",
                    is_active=True,
                )
                db.flush()
                upsert_stack_product(db, st.id, pr.id, val, unit, sort_order=sort)
                linked_stack_products += 1
                sort += 10
            continue

        # --- product pages ---
        if any(x in parent for x in ["produit", "product", "etude", "study", "ingredient", "bienfait"]):
            title = ""
            for line in text.splitlines():
                if line.startswith("#"):
                    title = line.lstrip("#").strip()
                    break
            title = title or p.stem
            pslug = slugify(title)

            image_media_id = None
            img = pick_best_image(p.parent)
            if img and img.exists():
                m = upsert_media(db, img.read_bytes(), img.name)
                image_media_id = m.id
                media_count += 1

            upsert_product_cached(
                db,
                product_cache,
                pslug,
                name=title,
                short_desc="",
                description_md=text,
                category="",
                image_path="",
                price_month_eur=None,
                image_media_id=image_media_id,
                is_active=True,
            )
            upserted_products += 1
            continue

    return {
        "stacks_upserted": created_stacks,
        "stack_products_linked": linked_stack_products,
        "products_upserted_from_md": upserted_products,
        "media_upserted": media_count,
    }


# ============================================================
# Entry point
# ============================================================

def run_import(db: Session, zip_path: Path) -> dict:
    exp = extract_zip_to_temp(zip_path)

    # Cache to avoid duplicate inserts inside the same import
    product_cache: dict[str, Product] = {}

    benefits_csv = pick_csv(exp.csv_files, "bienfaits")
    studies_csv = pick_csv(exp.csv_files, "études") or pick_csv(exp.csv_files, "etudes") or pick_csv(exp.csv_files, "studies")

    benefit_links = 0
    study_links = 0

    if benefits_csv:
        benefit_links = import_benefits_csv(db, benefits_csv, product_cache)

    if studies_csv:
        study_links = import_studies_csv(db, studies_csv, product_cache)

    md_stats = import_markdowns(db, exp.md_files, product_cache)

    return {
        "work_dir": str(exp.work_dir),
        "md_files": len(exp.md_files),
        "csv_files": len(exp.csv_files),
        "benefits_csv": benefits_csv.name if benefits_csv else None,
        "studies_csv": studies_csv.name if studies_csv else None,
        "benefit_links_created": benefit_links,
        "study_links_created": study_links,
        **md_stats,
    }