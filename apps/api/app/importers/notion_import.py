from __future__ import annotations

import csv
import hashlib
import mimetypes
import re
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Product, Stack, StackProduct, Benefit, ProductBenefit, Study, ProductStudy
from app.models.media import Media


def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[’'`]", "", s)
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


def upsert_product(db: Session, slug: str, **fields) -> Product:
    obj = db.query(Product).filter(Product.slug == slug).first()
    if obj:
        for k, v in fields.items():
            setattr(obj, k, v)
        return obj
    obj = Product(slug=slug, **fields)
    db.add(obj)
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


def import_benefits_csv(db: Session, csv_path: Path) -> None:
    with csv_path.open("r", encoding="utf-8", errors="ignore", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        return

    def find_col(candidates: list[str]) -> str | None:
        for c in candidates:
            for k in rows[0].keys():
                if k and k.lower().strip() == c:
                    return k
        for c in candidates:
            for k in rows[0].keys():
                if k and c in k.lower():
                    return k
        return None

    col_benefit = find_col(["benefit", "bienfait", "fonction", "category"])
    col_product = find_col(["product", "produit", "ingredient", "name"])
    if not col_benefit or not col_product:
        return

    for r in rows:
        bname = (r.get(col_benefit) or "").strip()
        pname = (r.get(col_product) or "").strip()
        if not bname or not pname:
            continue

        b = upsert_benefit(db, slugify(bname), name=bname, description="", sort_order=100, is_active=True)
        p = upsert_product(
            db,
            slugify(pname),
            name=pname,
            short_desc="",
            description_md="",
            category="",
            image_path="",
            is_active=True,
        )
        db.flush()
        upsert_product_benefit(db, p.id, b.id)


def stable_study_slug(title: str, url: str) -> str:
    base = (title.strip() + "|" + (url or "").strip()).encode("utf-8")
    h = hashlib.sha1(base).hexdigest()[:12]
    return slugify(title)[:140] + "-" + h


def import_studies_csv(db: Session, csv_path: Path) -> None:
    with csv_path.open("r", encoding="utf-8", errors="ignore", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        return

    def find_col_contains(substrs: list[str]) -> str | None:
        for k in rows[0].keys():
            kl = (k or "").lower()
            if any(s in kl for s in substrs):
                return k
        return None

    col_product = find_col_contains(["product", "produit", "ingredient", "name"])
    col_title = find_col_contains(["title", "titre", "study", "étude", "etude"])
    col_url = find_col_contains(["url", "link", "lien"])
    if not col_product or not col_title:
        return

    for r in rows:
        pname = (r.get(col_product) or "").strip()
        title = (r.get(col_title) or "").strip()
        url = (r.get(col_url) or "").strip() if col_url else ""
        if not pname or not title:
            continue

        p = upsert_product(
            db,
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


def import_markdowns(db: Session, md_files: list[Path]) -> None:
    for p in md_files:
        fname = p.name.lower()
        parent = str(p.parent).lower()
        text = read_text(p)

        # stacks
        if "stack" in fname:
            title = ""
            for line in text.splitlines():
                if line.startswith("#"):
                    title = line.lstrip("#").strip()
                    break
            title = title or p.stem
            st = upsert_stack(db, slugify(title), title=title, subtitle="", description_md=text, is_active=True)
            db.flush()

            dosages = extract_dosages_from_stack_md(text)
            sort = 10
            for prod_name, val, unit in dosages:
                pr = upsert_product(
                    db,
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
                sort += 10
            continue

        # product pages
        if any(x in parent for x in ["produit", "product", "etude", "study", "ingredient", "bienfait"]):
            title = ""
            for line in text.splitlines():
                if line.startswith("#"):
                    title = line.lstrip("#").strip()
                    break
            title = title or p.stem
            pslug = slugify(title)

            image_media_id = None
            img = p.parent / "image.png"
            if img.exists():
                m = upsert_media(db, img.read_bytes(), img.name)
                image_media_id = m.id

            upsert_product(
                db,
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
            continue


def run_import(db: Session, zip_path: Path) -> dict:
    exp = extract_zip_to_temp(zip_path)

    benefits_csv = pick_csv(exp.csv_files, "bienfaits")
    studies_csv = pick_csv(exp.csv_files, "études") or pick_csv(exp.csv_files, "etudes") or pick_csv(exp.csv_files, "studies")

    if benefits_csv:
        import_benefits_csv(db, benefits_csv)
    if studies_csv:
        import_studies_csv(db, studies_csv)

    import_markdowns(db, exp.md_files)

    return {
        "work_dir": str(exp.work_dir),
        "md_files": len(exp.md_files),
        "csv_files": len(exp.csv_files),
        "benefits_csv": benefits_csv.name if benefits_csv else None,
        "studies_csv": studies_csv.name if studies_csv else None,
    }