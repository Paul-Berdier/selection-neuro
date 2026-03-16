"""
seed_database.py – Sélection Neuro
============================================
Remplit toutes les tables de la DB Postgres Railway à partir des données
réelles du Notion (produits, études, bienfaits, stacks).

Usage :
    DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname python seed_database.py

    # Ou avec argument :
    python seed_database.py --db postgresql+psycopg://user:pass@host:5432/dbname

    # Pour reset complet avant seed :
    python seed_database.py --reset

Compatible aussi avec :
    - postgres://...
    - postgresql://...
    - postgresql+psycopg://...

Requirements :
    pip install sqlalchemy psycopg[binary]
"""

from __future__ import annotations

import argparse
import os
import sys
from decimal import Decimal

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


# ──────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────

def normalize_database_url(url: str) -> str:
    """
    Normalise l'URL PostgreSQL pour forcer l'utilisation de psycopg v3.

    Cas gérés :
    - postgres://...                -> postgresql+psycopg://...
    - postgresql://...              -> postgresql+psycopg://...
    - postgresql+psycopg://...      -> inchangé
    """
    if not url:
        raise ValueError("DATABASE_URL est vide ou absente.")

    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]

    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]

    return url


def get_db_url():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", help="postgresql+psycopg://… URL")
    parser.add_argument("--reset", action="store_true", help="Vide toutes les tables avant seed")
    args = parser.parse_args()

    url = args.db or os.environ.get("DATABASE_URL")
    if not url:
        print("❌ Fournir DATABASE_URL env var ou --db postgresql+psycopg://…")
        sys.exit(1)

    try:
        url = normalize_database_url(url)
    except Exception as e:
        print(f"❌ URL de base invalide : {e}")
        sys.exit(1)

    return url, args.reset


# ──────────────────────────────────────────────
# DATA
# ──────────────────────────────────────────────

BENEFITS = [
    {"slug": "attention-vitesse", "name": "Attention & vitesse cognitive",       "sort_order": 10},
    {"slug": "synaptogenese",     "name": "Synaptogenèse & membranes neuronales","sort_order": 20},
    {"slug": "plasticite",        "name": "Plasticité cérébrale",                "sort_order": 30},
    {"slug": "memoire",           "name": "Mémoire & consolidation",             "sort_order": 40},
    {"slug": "humeur",            "name": "Humeur & stabilité émotionnelle",     "sort_order": 50},
    {"slug": "energie",           "name": "Énergie cérébrale & endurance mentale","sort_order": 60},
    {"slug": "metabolisme",       "name": "Métabolisme neuronal & neurotransmission","sort_order": 70},
    {"slug": "neuroprotection",   "name": "Neuroprotection",                     "sort_order": 80},
    {"slug": "anti-stress",       "name": "Anti-stress",                         "sort_order": 90},
]

PRODUCTS = [
    {
        "slug": "citicoline",
        "name": "Citicoline (CDP-Choline)",
        "short_desc": "Précurseur de choline — attention, mémoire et intégrité des membranes neuronales.",
        "description_md": """## Citicoline (CDP-Choline)

*Précurseur de choline, fondamental pour les membranes neuronales et la neurotransmission.*

### Effets documentés

- **Mémoire et attention** : améliore la mémoire épisodique et les fonctions attentionnelles chez les personnes âgées et les adolescents, avec des effets observés dès 4 à 12 semaines.
- **Neuroprotection** : stimule la synthèse des membranes neuronales et augmente le métabolisme cérébral.
- **Ralentissement du déclin cognitif** : stabilise les fonctions mentales dans les troubles cognitifs légers d'origine vasculaire.
""",
        "category": "nootropique",
        "price_month_eur": Decimal("12.50"),
        "stock_qty": 50,
        "benefits": ["attention-vitesse", "synaptogenese", "metabolisme"],
    },
    {
        "slug": "dha-omega3",
        "name": "Omega 3 / DHA",
        "short_desc": "Acide docosahexaénoïque — composant structurel majeur des membranes neuronales.",
        "description_md": """## Omega 3 / DHA

*DHA issu d'algues — biodisponibilité maximale, sans métaux lourds.*

### Effets documentés

- Composant structurel essentiel des membranes neuronales (30% des graisses cérébrales).
- Amélioration de la mémoire, de la vitesse de traitement et de la plasticité synaptique.
- Réduction de l'inflammation neurologique et soutien de la neurogenèse hippocampique.
""",
        "category": "acide-gras",
        "price_month_eur": Decimal("11.00"),
        "stock_qty": 40,
        "benefits": ["synaptogenese", "plasticite", "memoire"],
    },
    {
        "slug": "lions-mane",
        "name": "Lion's Mane",
        "short_desc": "Hericium erinaceus — stimule le NGF et la neuroplasticité.",
        "description_md": """## Lion's Mane (Hericium erinaceus)

*Champignon médicinal cultivé — poudre standardisée en érinacines.*

### Effets documentés

- Stimulation de la synthèse du NGF (Nerve Growth Factor), facteur clé de la neuroplasticité.
- Amélioration de l'humeur, réduction de l'anxiété et de la dépression légère.
- Soutien de la mémoire et de la régénération neuronale, notamment chez les seniors.
""",
        "category": "champignon",
        "price_month_eur": Decimal("14.00"),
        "stock_qty": 35,
        "benefits": ["plasticite", "humeur"],
    },
    {
        "slug": "bacopa-monnieri",
        "name": "Bacopa monnieri",
        "short_desc": "Plante ayurvédique — mémoire épisodique et vitesse d'attention.",
        "description_md": """## Bacopa monnieri

*Extrait standardisé à 50% de bacosides — plante ayurvédique.*

### Effets documentés

- Amélioration de la vitesse de traitement de l'information et de l'attention soutenue après ≥12 semaines.
- Amélioration de la mémoire verbale et visuelle chez des adultes et des personnes âgées.
- Effet neuroprotecteur : augmentation du BDNF, réduction du stress oxydatif.
""",
        "category": "plante",
        "price_month_eur": Decimal("8.50"),
        "stock_qty": 45,
        "benefits": ["memoire", "humeur"],
    },
    {
        "slug": "cordyceps-militaris",
        "name": "Cordyceps militaris",
        "short_desc": "Champignon adaptogène — énergie mitochondriale et endurance mentale.",
        "description_md": """## Cordyceps militaris

*Champignon cultivé — riche en cordycépine et adénosine.*

### Effets documentés

- Effet anti-fatigue et amélioration de l'oxygénation cérébrale via la cordycépine.
- Propriétés antioxydantes et anti-inflammatoires cérébrales (données principalement précliniques).
- Amélioration de la mémoire spatiale et de la neurotransmission cholinergique (animal).
""",
        "category": "champignon",
        "price_month_eur": Decimal("13.00"),
        "stock_qty": 30,
        "benefits": ["energie", "plasticite"],
    },
    {
        "slug": "ashwagandha",
        "name": "Ashwagandha",
        "short_desc": "Adaptogène — réduction du cortisol, mémoire et bien-être.",
        "description_md": """## Ashwagandha (Withania somnifera)

*Extrait de racine KSM-66 — forme la plus étudiée.*

### Effets documentés

- Réduction du stress, du cortisol et amélioration du sommeil.
- Amélioration de la mémoire immédiate et générale, de l'attention et des fonctions exécutives.
- Renforcement des performances cognitives chez de jeunes adultes en bonne santé.
""",
        "category": "plante",
        "price_month_eur": Decimal("9.00"),
        "stock_qty": 50,
        "benefits": ["anti-stress", "humeur"],
    },
    {
        "slug": "magnesium-l-threonate",
        "name": "Magnésium L-thréonate",
        "short_desc": "Seule forme de magnésium pénétrant efficacement la barrière hémato-encéphalique.",
        "description_md": """## Magnésium L-thréonate

*Formulation brevetée Magtein® — conçue pour la cognition.*

### Effets documentés

- Augmentation du taux de magnésium cérébral et amélioration de la mémoire de travail.
- Ralentissement de l'âge cérébral estimé : –7,5 ans après 6 semaines (étude 2025).
- Effets neuroprotecteurs dans le vieillissement et amélioration des fonctions exécutives.
""",
        "category": "mineral",
        "price_month_eur": Decimal("16.00"),
        "stock_qty": 25,
        "benefits": ["memoire", "neuroprotection"],
    },
    {
        "slug": "uridine-monophosphate",
        "name": "Uridine monophosphate",
        "short_desc": "Nucléotide clé de la voie Kennedy — synaptogenèse et plasticité.",
        "description_md": """## Uridine monophosphate (UMP)

*Nucléotide naturel impliqué dans la synthèse des phospholipides membranaires.*

### Effets documentés

- Stimule la formation de nouvelles synapses via la voie Kennedy.
- Améliore la mémoire, la rétention et la clarté mentale en combinaison avec choline et DHA.
- Rôle clé dans la régénération neuronale et la plasticité cérébrale.
""",
        "category": "nucleotide",
        "price_month_eur": Decimal("18.00"),
        "stock_qty": 20,
        "benefits": ["synaptogenese", "plasticite"],
    },
    {
        "slug": "ginkgo-biloba",
        "name": "Ginkgo biloba",
        "short_desc": "Extrait EGb761 — circulation cérébrale et mémoire.",
        "description_md": """## Ginkgo biloba

*Extrait standardisé EGb761 — 24% flavonoïdes, 6% terpènes.*

### Effets documentés

- Amélioration modérée de la mémoire chez les personnes âgées, à 240 mg/j.
- Stabilisation voire ralentissement du déclin cognitif dans les démences débutantes.
- Augmentation de la vitesse de traitement et de la vigilance chez l'adulte en bonne santé.
""",
        "category": "plante",
        "price_month_eur": Decimal("7.50"),
        "stock_qty": 40,
        "benefits": ["plasticite", "memoire"],
    },
    {
        "slug": "panax-ginseng",
        "name": "Panax ginseng",
        "short_desc": "Adaptogène majeur — ginsénosides, mémoire et résistance à la fatigue.",
        "description_md": """## Panax ginseng

*Racine séchée standardisée en ginsénosides (ginseng asiatique).*

### Effets documentés

- Légère amélioration de la mémoire, notamment chez les seniors avec troubles cognitifs légers.
- Boost cognitif à court terme : amélioration de l'attention et de la mémoire de travail après prise aiguë.
- Réduction de la fatigue mentale et amélioration du bien-être général.
""",
        "category": "plante",
        "price_month_eur": Decimal("10.00"),
        "stock_qty": 35,
        "benefits": ["attention-vitesse", "energie"],
    },
    {
        "slug": "piracetam",
        "name": "Piracétam",
        "short_desc": "Premier nootropique synthétisé — fluidité membranaire, synergie citicoline.",
        "description_md": """## Piracétam

*Racétam fondateur — modulateur de la fluidité membranaire neuronale.*

### Effets documentés

- Améliore la fluidité des membranes neuronales — extrêmement synergique avec la citicoline.
- Soutien de la mémoire et de la consolidation, notamment dans les troubles d'apprentissage.
- Neuroprotection sans toxicité organique ni atteinte hépatique ou rénale significative.

> ⚠️ S'obtient sous ordonnance hors AMM (dyslexie, dyspraxie, TDAH). Faire ses recherches.
""",
        "category": "nootropique",
        "price_month_eur": Decimal("9.50"),
        "stock_qty": 15,
        "benefits": ["memoire", "plasticite", "metabolisme"],
    },
    {
        "slug": "spiruline",
        "name": "Spiruline",
        "short_desc": "Micro-algue riche en phycocyanine — antioxydant neuroprotecteur.",
        "description_md": """## Spiruline

*Arthrospira platensis — poudre ou comprimés, riche en phycocyanine.*

### Effets documentés

- Propriétés antioxydantes et anti-inflammatoires puissantes via la phycocyanine.
- Protection neuronale contre le stress oxydatif et les dommages cellulaires.
- Soutien général du métabolisme et de l'énergie cellulaire.
""",
        "category": "algue",
        "price_month_eur": Decimal("6.00"),
        "stock_qty": 60,
        "benefits": ["neuroprotection"],
    },
    {
        "slug": "l-tyrosine",
        "name": "L-Tyrosine",
        "short_desc": "Acide aminé précurseur dopamine / noradrénaline — cognition sous stress.",
        "description_md": """## L-Tyrosine

*Acide aminé libre — précurseur de la dopamine et de la noradrénaline.*

### Effets documentés

- Maintien des performances cognitives en conditions de stress aigu (froid, manque de sommeil, multitâche).
- Amélioration de la mémoire de travail et de la multitâche.
- Temps de réaction et attention accrus après prise unique.

> ⚡ Prendre ponctuellement (avant une tâche exigeante), antagoniste à long terme avec la L-Théanine.
""",
        "category": "acide-amine",
        "price_month_eur": Decimal("7.00"),
        "stock_qty": 45,
        "benefits": ["attention-vitesse", "energie"],
    },
    {
        "slug": "l-theanine",
        "name": "L-Théanine",
        "short_desc": "Acide aminé du thé — anxiolytique non sédatif, focus calme.",
        "description_md": """## L-Théanine

*Acide aminé issu du thé vert — anxiolytique non sédatif.*

### Effets documentés

- Réduction de l'anxiété et du stress sans sédation, via modulation GABAergique.
- Amélioration de la concentration et de la qualité de l'attention.
- Induction d'ondes alpha cérébrales — état de "relaxation alerte".

> 🌊 Antagoniste à long terme avec la L-Tyrosine. Usage ponctuel recommandé.
""",
        "category": "acide-amine",
        "price_month_eur": Decimal("7.00"),
        "stock_qty": 45,
        "benefits": ["attention-vitesse", "anti-stress"],
    },
    {
        "slug": "vitamines-b9-b12-d",
        "name": "Vitamines B9, B12, D",
        "short_desc": "Cofacteurs métaboliques cérébraux essentiels — méthylation et neuroprotection.",
        "description_md": """## Vitamines B9, B12, D

*Formes actives : méthylfolate (B9), méthylcobalamine (B12), D3 cholécalciférol.*

### Effets documentés

- B9 & B12 : essentiels à la méthylation cérébrale, synthèse des neurotransmetteurs, myélinisation.
- Prévention du déclin cognitif lié à l'âge via réduction de l'homocystéine.
- Vitamine D : régulation de l'humeur, neuroprotection, soutien de la neuroplasticité.
""",
        "category": "vitamine",
        "price_month_eur": Decimal("8.00"),
        "stock_qty": 55,
        "benefits": ["memoire", "metabolisme", "neuroprotection", "anti-stress"],
    },
    {
        "slug": "creatine",
        "name": "Créatine",
        "short_desc": "Précurseur du phosphocréatine — réservoir d'ATP cérébral.",
        "description_md": """## Créatine monohydrate

*Créatine monohydrate micronisée — forme la plus étudiée.*

### Effets documentés

- Amélioration de la mémoire de travail et de la vitesse de traitement via augmentation de l'ATP cérébral.
- Réduction de la fatigue mentale lors de tâches cognitives exigeantes prolongées.
- Neuroprotection via soutien de la bioénergétique cellulaire.
""",
        "category": "acide-amine",
        "price_month_eur": Decimal("5.50"),
        "stock_qty": 70,
        "benefits": ["attention-vitesse", "energie"],
    },
]

STUDIES = [
    {
        "slug": "citicoline-memory-2021",
        "title": "Citicoline and Memory Function in Healthy Older Adults: A Randomized, Double-Blind, Placebo-Controlled Clinical Trial",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8349115/",
        "year": 2021,
        "journal": "Journal of Nutrition",
        "source_type": "RCT",
        "summary": "Essai clinique (100 participants, 50–85 ans). 500 mg/j de citicoline pendant 12 semaines améliore significativement la mémoire globale, en particulier la mémoire épisodique.",
        "products": ["citicoline"],
    },
    {
        "slug": "citicoline-adolescents-2019",
        "title": "The Effect of Citicoline Supplementation on Motor Speed and Attention in Adolescent Males",
        "url": "https://pubmed.ncbi.nlm.nih.gov/26179181/",
        "year": 2019,
        "journal": "Journal of Attention Disorders",
        "source_type": "RCT",
        "summary": "75 adolescents, 28 jours. Amélioration de l'attention, rapidité motrice et diminution de l'impulsivité dans le groupe citicoline vs placebo.",
        "products": ["citicoline"],
    },
    {
        "slug": "citicoline-ideale-2013",
        "title": "Effectiveness and Safety of Citicoline in Mild Vascular Cognitive Impairment: The IDEALE Study",
        "url": "https://pubmed.ncbi.nlm.nih.gov/23403474/",
        "year": 2013,
        "journal": "Clinical Interventions in Aging",
        "source_type": "étude ouverte",
        "summary": "349 patients ≥65 ans, 9 mois. Citicoline 500 mg × 2/j a significativement stabilisé les fonctions cognitives dans les troubles cognitifs légers d'origine vasculaire.",
        "products": ["citicoline"],
    },
    {
        "slug": "magnesium-threonate-brain-age-2025",
        "title": "Magnesium L-Threonate Improves Cognitive Performance and Brain Age",
        "url": "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1729164/full",
        "year": 2025,
        "journal": "Frontiers in Nutrition",
        "source_type": "RCT",
        "summary": "100 adultes (18–45 ans), 6 semaines, 2g/j. Amélioration significative de l'indice cognitif global (NIH Toolbox), cerveau fonctionnellement ~7,5 ans plus jeune.",
        "products": ["magnesium-l-threonate"],
    },
    {
        "slug": "magnesium-threonate-china-2022",
        "title": "Magnesium L-Threonate et mémoire chez l'adulte sain chinois",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9786204/",
        "year": 2022,
        "journal": "Nutrients",
        "source_type": "RCT",
        "summary": "109 adultes. Complexe magnésium L-thréonate, 30 jours. Amélioration dans les 5 sous-tests de mémoire du test clinique standard. Effet particulièrement marqué chez les sujets plus âgés.",
        "products": ["magnesium-l-threonate"],
    },
    {
        "slug": "bacopa-meta-2014",
        "title": "Meta-analysis on Cognitive Effects of Bacopa monnieri",
        "url": "https://pubmed.ncbi.nlm.nih.gov/24252493/",
        "year": 2014,
        "journal": "Journal of Ethnopharmacology",
        "source_type": "méta-analyse",
        "summary": "9 essais (518 participants, ≥12 semaines). Amélioration significative du Trail Making B et du temps de réaction choix.",
        "products": ["bacopa-monnieri"],
    },
    {
        "slug": "bacopa-memory-2024",
        "title": "Effect of Bacopa monnieri Extract on Memory and Cognitive Skills",
        "url": "https://www.gavinpublishers.com/article/view/effect-of-bacopa-monnieri-extract-on-memory-and--cognitive-skills-in-adult-humans-a-randomized-double-blind-placebo-controlled-study",
        "year": 2024,
        "journal": "Journal of Psychology & Cognitive Behavior",
        "source_type": "RCT",
        "summary": "80 adultes (35–65 ans), 300 mg/j pendant 12 semaines. Amélioration de la mémoire verbale, de travail et épisodique, concentration, logique, flexibilité mentale.",
        "products": ["bacopa-monnieri"],
    },
    {
        "slug": "tyrosine-multitasking-1999",
        "title": "Tyrosine Improves Working Memory in a Multitasking Environment",
        "url": "https://pubmed.ncbi.nlm.nih.gov/10548261/",
        "year": 1999,
        "journal": "Pharmacology Biochemistry and Behavior",
        "source_type": "RCT",
        "summary": "20 adultes, 150 mg/kg. Mémoire de travail plus précise et moins d'erreurs lors de tâches multiples par rapport au placebo.",
        "products": ["l-tyrosine"],
    },
    {
        "slug": "tyrosine-stress-review-2015",
        "title": "Tyrosine and Cognitive Performance Under Stress – revue systématique",
        "url": "https://pubmed.ncbi.nlm.nih.gov/26424423/",
        "year": 2015,
        "journal": "Journal of Psychiatric Research",
        "source_type": "revue",
        "summary": "La tyrosine augmente les performances cognitives surtout en situation de stress ou forte demande à court terme. Prévient le ralentissement du temps de réaction sous stress froid ou privation de sommeil.",
        "products": ["l-tyrosine"],
    },
    {
        "slug": "tyrosine-cold-stress-2007",
        "title": "Tyrosine Supplementation Mitigates Cognitive Deficits from Cold Exposure",
        "url": "https://www.sciencedirect.com/science/article/abs/pii/S0031938407001722",
        "year": 2007,
        "journal": "Physiology & Behavior",
        "source_type": "RCT",
        "summary": "19 volontaires. Tyrosine 2×150 mg/kg a annulé les déficits de mémoire et de vigilance provoqués par l'immersion dans l'eau froide.",
        "products": ["l-tyrosine"],
    },
    {
        "slug": "ashwagandha-cognition-2024",
        "title": "Acute and Repeated Ashwagandha Supplementation Improves Cognitive Function and Mood",
        "url": "https://www.mdpi.com/2072-6643/16/12/1813",
        "year": 2024,
        "journal": "Nutrients",
        "source_type": "RCT",
        "summary": "Étudiants adultes, 225 mg/j d'ashwagandha liposomal, 30 jours. Amélioration de la mémoire, de l'attention, des fonctions exécutives et réduction du stress perçu.",
        "products": ["ashwagandha"],
    },
    {
        "slug": "ashwagandha-mci-2017",
        "title": "Efficacy and Safety of Ashwagandha Root Extract in Improving Memory and Cognitive Functions",
        "url": "https://pubmed.ncbi.nlm.nih.gov/28471731/",
        "year": 2017,
        "journal": "Journal of Dietary Supplements",
        "source_type": "RCT",
        "summary": "50 personnes avec trouble cognitif léger, 2×300 mg/j pendant 8 semaines. Amélioration significative de la mémoire, vitesse de traitement, attention et fonctions exécutives.",
        "products": ["ashwagandha"],
    },
    {
        "slug": "uridine-synaptic-2010",
        "title": "Dietary uridine enhances synaptic function and cognition",
        "url": "https://www.pnas.org/doi/10.1073/pnas.1015201107",
        "year": 2010,
        "journal": "PNAS",
        "source_type": "essai préliminaire",
        "summary": "259 adultes âgés. Uridine + choline + DHA pendant 12 semaines : effets significatifs sur la mémoire verbale immédiate et la densité synaptique mesurée par imagerie.",
        "products": ["uridine-monophosphate", "dha-omega3"],
    },
    {
        "slug": "uridine-kennedy-review-2011",
        "title": "Synaptogenesis and memory enhancement with UMP + DHA + choline",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3134387/",
        "year": 2011,
        "journal": "Nutrients",
        "source_type": "revue",
        "summary": "Détaille le mécanisme de la synergie uridine–DHA–citicoline (voie Kennedy) sur la neuroplasticité et la synthèse de phosphatidylcholine.",
        "products": ["uridine-monophosphate", "citicoline", "dha-omega3"],
    },
    {
        "slug": "cordyceps-spatial-memory-2018",
        "title": "Cordyceps militaris améliore la mémoire spatiale chez la souris âgée",
        "url": "",
        "year": 2018,
        "journal": "Experimental Gerontology",
        "source_type": "préclinique",
        "summary": "Amélioration significative de la mémoire spatiale (labyrinthe aquatique) et augmentation des niveaux d'acétylcholine dans l'hippocampe après 8 semaines. Réduction des marqueurs de stress oxydatif.",
        "products": ["cordyceps-militaris"],
    },
    {
        "slug": "ginkgo-mci-2015",
        "title": "Ginkgo biloba extract in Mild Cognitive Impairment",
        "url": "https://pubmed.ncbi.nlm.nih.gov/39474788/",
        "year": 2015,
        "journal": "Journal of Alzheimer's Disease",
        "source_type": "méta-analyse",
        "summary": "EGb761 à 240 mg/j apporte un bénéfice significatif sur la mémoire chez des patients atteints de troubles cognitifs légers ou début de maladie d'Alzheimer.",
        "products": ["ginkgo-biloba"],
    },
    {
        "slug": "ginkgo-dementia-2016",
        "title": "Efficacy of EGb 761 in Dementia with Neuropsychiatric Symptoms",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5138224/",
        "year": 2016,
        "journal": "Current Topics in Medicinal Chemistry",
        "source_type": "revue systématique",
        "summary": "9 essais, ~2400 patients. Ginkgo 240 mg/j améliore significativement les scores cognitifs et les activités quotidiennes. Effet similaire aux inhibiteurs de cholinestérase.",
        "products": ["ginkgo-biloba"],
    },
    {
        "slug": "ginseng-meta-2024",
        "title": "Ginseng et fonction cognitive – méta-analyse",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38977297/",
        "year": 2024,
        "journal": "Phytotherapy Research",
        "source_type": "méta-analyse",
        "summary": "15 essais (671 sujets). Ginseng a un effet significatif sur la mémoire (p<0,05), particulièrement à haute dose (≥240 mg/j d'extrait).",
        "products": ["panax-ginseng"],
    },
    {
        "slug": "creatine-vegetarians-2003",
        "title": "Oral creatine monohydrate supplementation improves brain performance",
        "url": "https://pubmed.ncbi.nlm.nih.gov/14561278/",
        "year": 2003,
        "journal": "Proceedings of the Royal Society B",
        "source_type": "RCT",
        "summary": "45 végétariens, 5g/j pendant 6 semaines. Amélioration significative de la mémoire de travail et de la vitesse de traitement de l'information.",
        "products": ["creatine"],
    },
    {
        "slug": "theanine-caffeine-2008",
        "title": "L-theanine and Caffeine Improve Task Switching and Alertness",
        "url": "https://pubmed.ncbi.nlm.nih.gov/18681988/",
        "year": 2008,
        "journal": "Biological Psychology",
        "source_type": "RCT",
        "summary": "27 adultes. La combinaison L-théanine + caféine améliore la précision de la commutation d'attention et réduit la susceptibilité à la distraction.",
        "products": ["l-theanine"],
    },
    {
        "slug": "omega3-midas-2010",
        "title": "DHA supplementation improves memory in older adults: MIDAS trial",
        "url": "https://pubmed.ncbi.nlm.nih.gov/20434961/",
        "year": 2010,
        "journal": "Alzheimer's & Dementia",
        "source_type": "RCT",
        "summary": "485 adultes avec plaintes mnésiques légères. 900 mg DHA/j pendant 24 semaines : amélioration significative des tests de mémoire par rapport au placebo.",
        "products": ["dha-omega3"],
    },
]

STACKS = [
    {
        "slug": "stack-premium",
        "title": "Stack Nootropique Premium",
        "subtitle": "Plasticité, Synaptogenèse, Régulation, Cognition",
        "description_md": """## Stack Nootropique Premium

Augmentation durable des performances cognitives via des apports impossibles à atteindre par l'alimentation seule, reposant sur la **synergie citicoline–uridine–DHA** (Kennedy Pathway, membranes neuronales, synaptogenèse), complétée par le bacopa, le lion's mane, le cordyceps, la créatine et les vitamines B.

> Les quantités recommandées sont établies à partir des **doses optimales** pour lesquelles on observe le plus de gains de performances.
""",
        "products": [
            {"slug": "citicoline",          "dosage_value": Decimal("1000"),  "dosage_unit": "mg",  "note": "→ Attention & vitesse cognitive, Synaptogenèse, Neurotransmission", "sort_order": 10},
            {"slug": "dha-omega3",          "dosage_value": Decimal("600"),   "dosage_unit": "mg",  "note": "→ Synaptogenèse, Plasticité, Mémoire", "sort_order": 20},
            {"slug": "lions-mane",          "dosage_value": Decimal("2000"),  "dosage_unit": "mg",  "note": "→ Plasticité cérébrale, Humeur", "sort_order": 30},
            {"slug": "bacopa-monnieri",     "dosage_value": Decimal("300"),   "dosage_unit": "mg",  "note": "→ Mémoire & consolidation, Humeur", "sort_order": 40},
            {"slug": "creatine",            "dosage_value": Decimal("5000"),  "dosage_unit": "mg",  "note": "→ Attention, Énergie cérébrale", "sort_order": 50},
            {"slug": "cordyceps-militaris", "dosage_value": Decimal("2000"),  "dosage_unit": "mg",  "note": "→ Énergie & endurance mentale", "sort_order": 60},
            {"slug": "vitamines-b9-b12-d",  "dosage_value": None,             "dosage_unit": "",    "note": "B9 400µg + B12 1000µg/j → Mémoire, Métabolisme", "sort_order": 70},
        ],
    },
    {
        "slug": "stack-anti-thc",
        "title": "Stack Anti THC",
        "subtitle": "Protection cognitive — exposition répétée aux cannabinoïdes",
        "description_md": """## Stack Anti THC

Conçu pour **préserver les fonctions cognitives et la stabilité neuronale** dans un contexte d'exposition répétée au THC. Repose sur la **synergie citicoline–DHA** (membranes neuronales, intégrité synaptique, efficacité frontale), complétée par le **NAC** pour le soutien du stress oxydatif et de l'équilibre neurochimique.

> ⚠️ Les informations fournies sont à titre informatif uniquement et ne constituent pas un avis médical. Consultez un professionnel de santé qualifié.
""",
        "products": [
            {"slug": "citicoline",  "dosage_value": Decimal("1000"),  "dosage_unit": "mg",  "note": "→ Attention, Synaptogenèse, Neurotransmission", "sort_order": 10},
            {"slug": "dha-omega3", "dosage_value": Decimal("600"),   "dosage_unit": "mg",  "note": "→ Synaptogenèse, Plasticité, Mémoire", "sort_order": 20},
        ],
    },
]


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def exec(session: Session, sql: str, **params):
    return session.execute(text(sql), params)


def fetchone(session: Session, sql: str, **params):
    row = session.execute(text(sql), params).fetchone()
    return row[0] if row else None


# ──────────────────────────────────────────────
# SEED FUNCTIONS
# ──────────────────────────────────────────────

def reset_tables(session: Session):
    print("🗑️ Reset des tables (truncate cascade)…")
    tables = [
        "product_study", "product_benefit", "stack_product",
        "study", "benefit", "stack", "product",
        "cart_items", "carts", "order_items", "orders",
    ]
    for t in tables:
        try:
            session.execute(text(f"TRUNCATE TABLE {t} RESTART IDENTITY CASCADE"))
        except Exception as e:
            print(f"   ⚠️ {t}: {e}")
            session.rollback()
    session.commit()
    print("   ✅ Tables vidées")


def seed_benefits(session: Session) -> dict[str, int]:
    print("\n📚 Seed benefits…")
    slug_to_id = {}
    for b in BENEFITS:
        existing = fetchone(session, "SELECT id FROM benefit WHERE slug = :slug", slug=b["slug"])
        if existing:
            slug_to_id[b["slug"]] = existing
            print(f"   ↩ {b['name']} (déjà présent)")
            continue
        row = session.execute(
            text("""
                INSERT INTO benefit (slug, name, description, sort_order, is_active)
                VALUES (:slug, :name, :desc, :sort_order, true)
                RETURNING id
            """),
            {"slug": b["slug"], "name": b["name"], "desc": b.get("description", ""), "sort_order": b["sort_order"]}
        ).fetchone()
        slug_to_id[b["slug"]] = row[0]
        print(f"   ✅ {b['name']}")
    session.commit()
    return slug_to_id


def seed_products(session: Session, benefit_ids: dict[str, int]) -> dict[str, int]:
    print("\n📦 Seed products…")
    slug_to_id = {}
    for p in PRODUCTS:
        existing = fetchone(session, "SELECT id FROM product WHERE slug = :slug", slug=p["slug"])
        if existing:
            slug_to_id[p["slug"]] = existing
            print(f"   ↩ {p['name']} (déjà présent)")
        else:
            row = session.execute(
                text("""
                    INSERT INTO product (slug, name, short_desc, description_md, category,
                                        price_month_eur, is_active, stock_qty)
                    VALUES (:slug, :name, :short_desc, :desc_md, :category,
                            :price, true, :stock)
                    RETURNING id
                """),
                {
                    "slug": p["slug"],
                    "name": p["name"],
                    "short_desc": p["short_desc"],
                    "desc_md": p["description_md"],
                    "category": p["category"],
                    "price": p.get("price_month_eur"),
                    "stock": p.get("stock_qty"),
                }
            ).fetchone()
            slug_to_id[p["slug"]] = row[0]
            print(f"   ✅ {p['name']}")

        prod_id = slug_to_id[p["slug"]]

        for b_slug in p.get("benefits", []):
            b_id = benefit_ids.get(b_slug)
            if not b_id:
                continue
            existing_pb = fetchone(
                session,
                "SELECT id FROM product_benefit WHERE product_id=:pid AND benefit_id=:bid",
                pid=prod_id,
                bid=b_id,
            )
            if not existing_pb:
                session.execute(
                    text("INSERT INTO product_benefit (product_id, benefit_id, evidence_level) VALUES (:pid, :bid, 3)"),
                    {"pid": prod_id, "bid": b_id},
                )

    session.commit()
    return slug_to_id


def seed_studies(session: Session, product_ids: dict[str, int]):
    print("\n🔬 Seed études scientifiques…")
    for s in STUDIES:
        existing = fetchone(session, "SELECT id FROM study WHERE slug = :slug", slug=s["slug"])
        if existing:
            study_id = existing
            print(f"   ↩ {s['title'][:60]}… (déjà présent)")
        else:
            row = session.execute(
                text("""
                    INSERT INTO study (slug, title, url, year, journal, source_type, summary)
                    VALUES (:slug, :title, :url, :year, :journal, :source_type, :summary)
                    RETURNING id
                """),
                {
                    "slug": s["slug"],
                    "title": s["title"],
                    "url": s.get("url", ""),
                    "year": s.get("year"),
                    "journal": s.get("journal", ""),
                    "source_type": s.get("source_type", ""),
                    "summary": s["summary"],
                }
            ).fetchone()
            study_id = row[0]
            print(f"   ✅ {s['title'][:60]}…")

        for p_slug in s.get("products", []):
            p_id = product_ids.get(p_slug)
            if not p_id:
                continue
            existing_ps = fetchone(
                session,
                "SELECT id FROM product_study WHERE product_id=:pid AND study_id=:sid",
                pid=p_id,
                sid=study_id,
            )
            if not existing_ps:
                session.execute(
                    text("INSERT INTO product_study (product_id, study_id) VALUES (:pid, :sid)"),
                    {"pid": p_id, "sid": study_id},
                )

    session.commit()


def seed_stacks(session: Session, product_ids: dict[str, int]):
    print("\n🏗️ Seed stacks…")
    for s in STACKS:
        existing = fetchone(session, "SELECT id FROM stack WHERE slug = :slug", slug=s["slug"])
        if existing:
            stack_id = existing
            print(f"   ↩ {s['title']} (déjà présent)")
        else:
            row = session.execute(
                text("""
                    INSERT INTO stack (slug, title, subtitle, description_md, is_active)
                    VALUES (:slug, :title, :subtitle, :desc_md, true)
                    RETURNING id
                """),
                {
                    "slug": s["slug"],
                    "title": s["title"],
                    "subtitle": s.get("subtitle", ""),
                    "desc_md": s.get("description_md", ""),
                }
            ).fetchone()
            stack_id = row[0]
            print(f"   ✅ {s['title']}")

        for sp in s.get("products", []):
            p_id = product_ids.get(sp["slug"])
            if not p_id:
                print(f"      ⚠️ Produit inconnu : {sp['slug']}")
                continue
            existing_sp = fetchone(
                session,
                "SELECT id FROM stack_product WHERE stack_id=:sid AND product_id=:pid",
                sid=stack_id,
                pid=p_id,
            )
            if not existing_sp:
                session.execute(
                    text("""
                        INSERT INTO stack_product
                            (stack_id, product_id, dosage_value, dosage_unit, note, sort_order)
                        VALUES (:sid, :pid, :dv, :du, :note, :so)
                    """),
                    {
                        "sid": stack_id,
                        "pid": p_id,
                        "dv": sp.get("dosage_value"),
                        "du": sp.get("dosage_unit", ""),
                        "note": sp.get("note", ""),
                        "so": sp.get("sort_order", 100),
                    }
                )
                print(f"      → {sp['slug']} {sp.get('dosage_value', '')} {sp.get('dosage_unit', '')}")

    session.commit()


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────

def main():
    db_url, do_reset = get_db_url()

    print("\n🔗 Connexion à la base…")
    print(f"   Driver SQLAlchemy : {db_url.split('://', 1)[0]}")
    engine = create_engine(db_url, echo=False)

    with Session(engine) as session:
        try:
            session.execute(text("SELECT 1"))
            print("   ✅ Connexion OK")
        except Exception as e:
            print(f"   ❌ Impossible de se connecter : {e}")
            sys.exit(1)

        if do_reset:
            reset_tables(session)

        benefit_ids = seed_benefits(session)
        product_ids = seed_products(session, benefit_ids)
        seed_studies(session, product_ids)
        seed_stacks(session, product_ids)

    print("\n🎉 Seed terminé !\n")
    print("Résumé :")
    print(f"  {len(BENEFITS)} bienfaits")
    print(f"  {len(PRODUCTS)} produits")
    print(f"  {len(STUDIES)} études")
    print(f"  {len(STACKS)} stacks")


if __name__ == "__main__":
    main()