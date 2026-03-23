"""
Seed complet — Sélection Neuro
Source : Notion export + tableau pricing PDF

Règles business :
  - price_month_eur = prix de référence mensuelle, affiché sur la page Stack UNIQUEMENT
  - price_1m / price_3m / price_1y = variantes de vente sur les fiches produit
  - qty_g_*  = quantité en grammes livrée pour chaque variante
  - Créatine exception : variante "3 mois" = 4 mois (610g)
  - Livraison 10€ sous 30€, offerte au-dessus

Usage : DATABASE_URL=postgresql+psycopg://... python -m app.scripts.seed
"""
from __future__ import annotations

import os, sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def normalize_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


# ─────────────────────────────────────────────────────────────────────────────
# PRODUITS
# Tuple : (slug, name, category, short_desc, description,
#          price_month_eur,
#          price_1m, qty_g_1m,
#          price_3m, qty_g_3m,   ← créatine = 4 mois
#          price_1y, qty_g_1y)
# ─────────────────────────────────────────────────────────────────────────────

PRODUCTS = [
    (
        "creatine",
        "Créatine monohydrate",
        "acide-amine",
        "Précurseur du phosphocréatine — réservoir d'ATP cérébral.",
        """Créatine monohydrate

Effets documentés :
- Amélioration de la mémoire de travail et de la vitesse de traitement via augmentation de l'ATP cérébral.
- Réduction de la fatigue mentale lors de tâches cognitives exigeantes prolongées.
- Neuroprotection via soutien de la bioénergétique cellulaire.

Preuves scientifiques :
- Oral creatine monohydrate supplementation improves brain performance (2003) — 45 végétariens, 5g/j pendant 6 semaines. Amélioration significative de la mémoire de travail et de la vitesse de traitement. (Proceedings of the Royal Society B)

⚠️ Variante 3 mois = 4 mois de stock (610g) — exception tarifaire créatine.""",
        # price_month_eur   1m              3m(=4m)         1y
        5.77,  5.77, 150,   23.47, 610,    70.20, 1825,
    ),
    (
        "ashwagandha",
        "Ashwagandha",
        "plante",
        "Adaptogène — réduction du cortisol, mémoire et bien-être.",
        """Ashwagandha (Withania somnifera KSM-66®)

Effets documentés :
- Réduction du stress et amélioration du bien-être psychologique, avec baisse du cortisol et meilleur sommeil.
- Amélioration de la mémoire immédiate et générale, de l'attention et des fonctions exécutives, notamment chez des personnes présentant un déclin cognitif modéré.
- Renforcement de certaines performances cognitives (réaction, vigilance, mémoire visuelle) chez de jeunes adultes en bonne santé.

Preuves scientifiques :
- Acute and Repeated Ashwagandha Supplementation Improves Markers of Cognitive Function and Mood (2024) — 225 mg/j d'ashwagandha liposomal, 30 jours. Amélioration de la mémoire, de l'attention et réduction du stress perçu. (Nutrients, 2024)
- Efficacy and Safety of Ashwagandha Root Extract in Improving Memory and Cognitive Functions (2017) — 50 personnes avec trouble cognitif léger, 2×300 mg/j pendant 8 semaines. Amélioration significative de la mémoire et des fonctions exécutives. (J. Diet. Suppl., 2017)""",
        6.26,  6.26, 18,    15.45, 54,     53.75, 219,
    ),
    (
        "bacopa-monnieri",
        "Bacopa monnieri",
        "plante",
        "Plante ayurvédique — mémoire épisodique et vitesse d'attention.",
        """Bacopa monnieri (extrait standardisé 50% bacosides)

Effets documentés :
- Amélioration de la vitesse de traitement de l'information et de l'attention soutenue, constatée après au moins 12 semaines de supplémentation.
- Amélioration de la mémoire verbale et visuelle chez des personnes âgées ou des patients avec oubli bénin.
- Effet neuroprotecteur potentiel : augmentation des taux de BDNF et réduction du stress oxydatif.

Preuves scientifiques :
- Meta-analysis on Cognitive Effects of Bacopa monnieri (2014) — 9 essais, 518 participants, ≥12 semaines. Amélioration du Trail Making B et du temps de réaction choix. (J. Ethnopharmacol., 2014)
- Effect of Bacopa monnieri Extract on Memory and Cognitive Skills (2024) — 80 adultes (35–65 ans), 300 mg/j pendant 12 semaines. Amélioration de la mémoire verbale, de travail et épisodique, concentration, logique, flexibilité mentale. (J. Psych. Cogn. Behav., 2024)""",
        7.44,  7.44, 9,     16.54, 27,     63.88, 109.5,
    ),
    (
        "citicoline",
        "Citicoline (CDP-Choline)",
        "nootropique",
        "Précurseur de choline — attention, mémoire et intégrité des membranes neuronales.",
        """Citicoline (CDP-Choline) — Cognizin®

Effets documentés :
- Mémoire et attention : améliore la mémoire épisodique et les fonctions attentionnelles chez les personnes âgées et les adolescents, avec des effets observés dès 4 à 12 semaines.
- Neuroprotection : stimule la synthèse des membranes neuronales et augmente le métabolisme cérébral.
- Ralentissement du déclin cognitif : stabilise les fonctions mentales dans les troubles cognitifs légers d'origine vasculaire.

Preuves scientifiques :
- Citicoline and Memory Function in Healthy Older Adults (2021) — 100 participants, 50–85 ans, 500 mg/j pendant 12 semaines. Amélioration significative de la mémoire épisodique. (J. Nutr., 2021)
- The Effect of Citicoline Supplementation on Motor Speed and Attention in Adolescent Males (2019) — 75 adolescents, 28 jours, 250 ou 500 mg/j. Amélioration de l'attention et de la rapidité motrice. (J. Atten. Disord., 2019)
- Effectiveness and Safety of Citicoline in Mild Vascular Cognitive Impairment — IDEALE Study (2013) — 349 patients ≥65 ans, 9 mois, 500 mg×2/j. Stabilisation des fonctions cognitives. (Clin. Interv. Aging, 2013)""",
        22.86, 22.86, 15,   56.47, 45,     196.37, 182.5,
    ),
    (
        "cordyceps-militaris",
        "Cordyceps militaris",
        "champignon",
        "Champignon adaptogène — énergie mitochondriale et endurance mentale.",
        """Cordyceps militaris (champignon cultivé)

Effets documentés :
- Effet anti-fatigue et amélioration potentielle de l'oxygénation cérébrale via la cordycépine et l'adénosine.
- Propriétés antioxydantes et anti-inflammatoires dans le cerveau (données principalement précliniques).
- Amélioration de l'apprentissage spatial et de la mémoire dans des modèles animaux, en lien avec une augmentation de la neurotransmission cholinergique.

Preuves scientifiques :
- Étude préclinique – Cordyceps et mémoire spatiale (2018) — Souris âgées, 8 semaines. Amélioration significative de la mémoire spatiale et augmentation de l'acétylcholine hippocampique. (Exp. Gerontol., 2018)
- Cordyceps militaris – Effets neurocognitifs, Revue (2020) — Les composés actifs (cordycépine, polysaccharides) stimulent les facteurs neurotrophiques et la neurogenèse. (J. Ginseng Res., 2020)""",
        48.34, 48.34, 90,   119.38, 270,   415.06, 1095,
    ),
    (
        "ginkgo-biloba",
        "Ginkgo biloba",
        "plante",
        "Extrait EGb761 — circulation cérébrale et mémoire.",
        """Ginkgo biloba (extrait standardisé EGb761 — 24% flavonoïdes, 6% terpènes)

Effets documentés :
- Amélioration modérée de la mémoire chez les personnes âgées présentant un déclin cognitif lié à l'âge, en particulier à 240 mg/j.
- Stabilisation voire ralentissement du déclin cognitif dans les démences débutantes.
- Augmentation de la vitesse de traitement et de la vigilance chez l'adulte en bonne santé.

Preuves scientifiques :
- Ginkgo biloba extract in Mild Cognitive Impairment — méta-analyse (2015) — EGb761 à 240 mg/j : bénéfice significatif sur la mémoire dans les troubles cognitifs légers et la maladie d'Alzheimer débutante. (J. Alzheimers Dis., 2015)
- Efficacy of EGb 761 in Dementia with Neuropsychiatric Symptoms (2016) — 9 essais, ~2400 patients. Ginkgo 240 mg/j améliore significativement les scores cognitifs et les activités quotidiennes. Effet similaire aux inhibiteurs de cholinestérase. (Curr. Top. Med. Chem., 2016)""",
        10.13, 10.13, 7.2,  25.03, 21.6,   87.02, 87.6,
    ),
    (
        "lions-mane",
        "Lion's Mane",
        "champignon",
        "Hericium erinaceus — stimule le NGF et la neuroplasticité.",
        """Lion's Mane (Hericium erinaceus — poudre standardisée en érinacines)

Effets documentés :
- Amélioration des scores cognitifs chez des patients avec trouble cognitif léger (MCI) : un essai de 16 semaines a montré une progression significative des scores cognitifs.
- Effet neurotrophique : stimulation de la production du NGF (nerve growth factor) et du BDNF, favorisant la survie neuronale et la synaptogenèse.
- Amélioration de la rapidité cognitive et de la concentration après 8 semaines.

Preuves scientifiques :
- Yamabushitake (Hericium) et trouble cognitif léger (2009) — 30 patients japonais avec MCI, 4×750 mg/j pendant 16 semaines. Scores cognitifs significativement supérieurs vs placebo. (Phytother. Res., 2009)
- Lion's Mane – Étude pilote randomisée (2024) — 33 adultes, 8 semaines, extrait enrichi en érinacine A. Accélération significative des opérations cognitives de base + augmentation du BDNF sanguin. (J. Funct. Foods, 2024)""",
        43.48, 43.48, 90,   107.34, 270,   373.34, 1095,
    ),
    (
        "l-theanine",
        "L-Théanine",
        "acide-amine",
        "Acide aminé du thé — anxiolytique non sédatif, focus calme.",
        """L-Théanine (acide aminé issu du thé vert)

Effets documentés :
- Réduction de l'anxiété et du stress sans sédation, via modulation GABAergique.
- Amélioration de la concentration et de la qualité de l'attention.
- Induction d'ondes alpha cérébrales — état de "relaxation alerte".

Preuves scientifiques :
- L-theanine reduces acute stress and anxiety — étude clinique. Une dose de 200 mg a réduit les réponses au stress (rythme cardiaque, IgA) lors d'une tâche mentale.
- Méta-analyse (2025) — 5 RCTs : L-théanine seule ou avec caféine améliore modestement la performance cognitive et l'humeur. Amélioration de l'attention et du temps de réaction.

⚠️ Antagoniste à long terme avec la L-Tyrosine. Usage ponctuel recommandé (avant une tâche exigeante).""",
        9.73,  9.73, 6,     24.05, 18,     83.58, 73,
    ),
    (
        "l-tyrosine",
        "L-Tyrosine",
        "acide-amine",
        "Acide aminé précurseur dopamine / noradrénaline — cognition sous stress.",
        """L-Tyrosine (acide aminé précurseur de la dopamine et de la noradrénaline)

Effets documentés :
- Maintien des performances cognitives en conditions de stress aigu (froid, manque de sommeil, multitâche intense).
- Amélioration de la mémoire de travail et de la multitâche.
- Temps de réaction et attention accrus après une prise unique.

Preuves scientifiques :
- Tyrosine Improves Working Memory in a Multitasking Environment (1999) — 20 adultes, 150 mg/kg. Mémoire de travail plus précise et moins d'erreurs lors de tâches multiples. (Pharmacol. Biochem. Behav., 1999)
- Tyrosine and Cognitive Performance Under Stress — revue systématique (2015) — Augmentation des performances cognitives surtout en situation de stress ou forte demande à court terme. (J. Psychiatr. Res., 2015)
- Tyrosine Supplementation Mitigates Cognitive Deficits from Cold Exposure (2007) — 19 volontaires. Tyrosine 2×150 mg/kg a annulé les déficits de mémoire et de vigilance provoqués par l'immersion en eau froide. (Physiol. Behav., 2007)

⚠️ Antagoniste à long terme avec la L-Théanine. Prendre ponctuellement selon les besoins.""",
        106.16, 106.16, 315,  262.71, 945,  1290.44, 3832.5,
    ),
    (
        "magnesium-l-threonate",
        "Magnésium L-thréonate",
        "mineral",
        "Seule forme de magnésium pénétrant efficacement la barrière hémato-encéphalique.",
        """Magnésium L-thréonate (formulation brevetée Magtein®)

Effets documentés :
- Augmentation du taux de magnésium cérébral et amélioration de la mémoire de travail et de la mémoire épisodique en quelques semaines.
- Ralentissement de l'âge cérébral : réduction d'environ 7,5 ans de l'âge cognitif estimé après 6 semaines.
- Effets neuroprotecteurs dans le vieillissement : amélioration du métabolisme cérébral et des fonctions exécutives.

Preuves scientifiques :
- Magnesium L-Threonate Improves Cognitive Performance and Brain Age (2025) — 100 adultes (18–45 ans), 6 semaines, 2g/j. Amélioration significative de l'indice cognitif global NIH Toolbox. Cerveau fonctionnellement ~7,5 ans plus jeune. (Front. Nutr., 2025)
- Magnesium L-Threonate et mémoire – étude en Chine (2022) — 109 adultes, 30 jours. Amélioration significative dans les 5 sous-tests de mémoire. Effet particulièrement marqué chez les sujets plus âgés. (Nutrients, 2022)""",
        21.06, 21.06, 60,    52.03, 180,    181.14, 730,
    ),
    (
        "dha-omega3",
        "Omega 3 / DHA",
        "acide-gras",
        "Acide docosahexaénoïque — composant structurel majeur des membranes neuronales.",
        """Omega 3 / DHA (DHA issu d'algues — biodisponibilité maximale, sans métaux lourds)

Effets documentés :
- Composant structurel essentiel des membranes neuronales (30% des graisses cérébrales).
- Amélioration de la mémoire, de la vitesse de traitement et de la plasticité synaptique.
- Réduction de l'inflammation neurologique et soutien de la neurogenèse hippocampique.

Preuves scientifiques :
- DHA supplementation improves memory in older adults — MIDAS trial (2010) — 485 adultes avec plaintes mnésiques légères, 900 mg DHA/j pendant 24 semaines. Amélioration significative des tests de mémoire. (Alzheimer's & Dementia, 2010)
- Omega-3 fatty acids and cognitive function — revue systématique (2023). (Pubmed)
- A systematic review and dose response meta-analysis of Omega-3 supplementation on cognitive function (2024). (Pubmed)""",
        16.11, 16.11, 27,    39.74, 81,     138.35, 328.5,
    ),
    (
        "panax-ginseng",
        "Panax ginseng",
        "plante",
        "Adaptogène majeur — ginsénosides, mémoire et résistance à la fatigue.",
        """Panax ginseng (racine séchée standardisée en ginsénosides)

Effets documentés :
- Légère amélioration de la mémoire, notamment chez les seniors avec troubles cognitifs légers.
- Effet boost cognitif à court terme : amélioration de l'attention et de la mémoire de travail après prise aiguë.
- Réduction de la fatigue mentale et amélioration du bien-être général.

Preuves scientifiques :
- Ginseng et fonction cognitive – méta-analyse (2024) — 15 essais, 671 sujets. Effet significatif sur la mémoire (p<0,05), particulièrement à haute dose (≥240 mg/j d'extrait). (Phytother. Res., 2024)""",
        1.78,  1.78, 12,     4.39, 36,      15.22, 146,
    ),
    (
        "piracetam",
        "Piracétam",
        "nootropique",
        "Premier nootropique synthétisé — fluidité membranaire, synergie citicoline.",
        """Piracétam (2-oxo-1-pyrrolidine acétamide — racétam fondateur)

Effets documentés :
- Amélioration de la mémoire, de l'attention et de la vitesse cognitive chez les adultes et les seniors.
- Renforcement de la fluidité membranaire et de l'activité neuronale par modulation des membranes phospholipidiques.
- Extrêmement synergique avec la Citicoline — les deux se potentialisent mutuellement.
- Bien toléré à long terme, sans toxicité organique ni atteinte hépatique ou rénale significative.

Preuves scientifiques :
- Piracetam and other racetams — revue (2016). Améliorations notables de la mémoire de travail, de la fluidité verbale et de la cognition globale jusqu'à 4800 mg/j. (PMC)
- Cognitive enhancement with Piracetam in older adults (2015) — 96 sujets ≥65 ans, 8 semaines à 2400 mg/j. Amélioration des tests de mémoire visuelle et d'apprentissage verbal. (Pubmed)

⚠️ S'obtient sous ordonnance hors AMM (dyslexie, dyspraxie, TDAH). Peut dans de rares cas favoriser une certaine irritabilité, provoquer des troubles digestifs et déranger le sommeil. Faites vos recherches.""",
        21.17, 21.17, 144,   52.27, 432,    181.33, 1752,
    ),
    (
        "spiruline",
        "Spiruline",
        "algue",
        "Micro-algue riche en phycocyanine — antioxydant neuroprotecteur.",
        """Spiruline (Arthrospira platensis — comprimés standardisés)

Effets documentés :
- Effet antioxydant cérébral et anti-inflammatoire, protégeant les neurones du stress oxydatif.
- Amélioration de la mémoire visuelle et de la mémoire de travail chez des personnes présentant un trouble cognitif léger, après 12 semaines.
- Effets bénéfiques rapportés chez des patients Alzheimer : amélioration des scores cognitifs et diminution de l'inflammation systémique.

Preuves scientifiques :
- Spirulina maxima extract and Mild Cognitive Impairment (2022) — 80 sujets ≥60 ans avec MCI, 1g/j pendant 12 semaines. Amélioration de la mémoire visuelle et du travail visuel. (Mar. Drugs, 2022)
- Spiruline et maladie d'Alzheimer – essai pilote (2018) — 68 patients, 1g/j pendant 12 semaines. Amélioration des scores MMSE (+2 points) + baisse de l'inflammation. (Phytother. Res., 2018)""",
        5.49,  5.49, 90,     16.48, 270,    66.83, 1095,
    ),
    (
        "uridine-monophosphate",
        "Uridine monophosphate",
        "nucleotide",
        "Nucléotide clé de la voie Kennedy — synaptogenèse et plasticité.",
        """Uridine monophosphate (UMP — nucléotide naturel)

Effets documentés :
- Stimule la formation de nouvelles synapses via la voie Kennedy (synthèse des phospholipides membranaires).
- Améliore la mémoire, la rétention et la clarté mentale en combinaison avec la choline et le DHA.
- Rôle clé dans la régénération neuronale et la plasticité cérébrale.

Preuves scientifiques :
- Dietary uridine enhances synaptic function and cognition — essai préliminaire (2010) — 259 adultes âgés, uridine + choline + DHA pendant 12 semaines. Effets significatifs sur la mémoire verbale immédiate et la densité synaptique par imagerie. (PNAS, 2010)
- Synaptogenesis and memory enhancement with UMP + DHA + choline — revue (2011) — détaille le mécanisme de la synergie uridine–DHA–citicoline sur la neuroplasticité. (Nutrients, 2011)
- Uridine effects on phospholipid metabolism in the brain (2015) — 44 adultes, 4 semaines. Augmentation des précurseurs de membranes neuronales mesurée par spectroscopie. (Pubmed, 2015)""",
        16.43, 16.43, 18.75, 40.67, 56.25,  141.21, 228.125,
    ),
    (
        "vitamine-b9",
        "Vitamine B9",
        "vitamine",
        "Méthylfolate — méthylation cérébrale et synthèse des neurotransmetteurs.",
        """Vitamine B9 (méthylfolate — forme active)

Effets documentés :
- Indispensable au métabolisme neuronal. Améliore la cognition globale, la mémoire et la vitesse psychomotrice chez les personnes déficientes.
- Réduit l'homocystéine (facteur de risque vasculaire et cognitif).
- En association avec la B12, ralentit l'atrophie cérébrale chez les patients avec MCI.

Preuves scientifiques :
- Folate plus B12 vs Placebo — FACIT Trial (2007) — 818 sujets (50–70 ans), 3 ans. Amélioration de la mémoire et de la vitesse de traitement. L'homocystéine a diminué de 25%. (Lancet, 2007)
- Métanalyse vitamines B et déclin cognitif (2022) — 31 études. Supplémentation B9/B12 réduit de 15% le taux de déclin cognitif sur 5 ans. (Nutrients, 2022)""",
        # qty en grammes (mg → g)
        5.63,  5.63, 0.030,  16.91, 0.090,  68.51, 0.365,
    ),
    (
        "vitamine-b12",
        "Vitamine B12",
        "vitamine",
        "Méthylcobalamine — myélinisation et protection neuronale.",
        """Vitamine B12 (méthylcobalamine — forme active vegan)

Effets documentés :
- Les carences en B12 provoquent des troubles mnésiques et de l'attention. Un apport adéquat contribue au maintien des fonctions cognitives.
- En association avec l'acide folique (B9), ralentit l'atrophie cérébrale chez les patients avec MCI en abaissant l'homocystéine.
- Essentielle à la myélinisation des axones et à la synthèse des neurotransmetteurs.

Preuves scientifiques :
- FACIT Trial (2007) — voir Vitamine B9 pour la synergie B9/B12. (Lancet, 2007)
- Métanalyse vitamines B et déclin cognitif (2022) — B12 combinée aux folates offre une neuroprotection additive. (Nutrients, 2022)""",
        # qty en grammes (µg → g)
        4.63,  4.63, 0.030,  13.74, 0.090,  39.79, 0.365,
    ),
]


# ─────────────────────────────────────────────────────────────────────────────
# BIENFAITS (tags)
# ─────────────────────────────────────────────────────────────────────────────

PRODUCT_BENEFITS = {
    "creatine":              ["Attention & réactivité mentale", "Énergie mentale & résistance au stress"],
    "ashwagandha":           ["Anti-stress", "Mémoire et consolidation"],
    "bacopa-monnieri":       ["Mémoire et consolidation", "Plasticité et neurogenèse"],
    "citicoline":            ["Attention & réactivité mentale", "Mémoire et consolidation", "Plasticité et neurogenèse"],
    "cordyceps-militaris":   ["Énergie mentale & résistance au stress", "Plasticité et neurogenèse"],
    "ginkgo-biloba":         ["Mémoire et consolidation", "Plasticité et neurogenèse"],
    "lions-mane":            ["Anti-stress", "Plasticité et neurogenèse"],
    "l-theanine":            ["Anti-stress", "Attention & réactivité mentale"],
    "l-tyrosine":            ["Attention & réactivité mentale", "Énergie mentale & résistance au stress"],
    "magnesium-l-threonate": ["Mémoire et consolidation", "Neuroprotection"],
    "dha-omega3":            ["Mémoire et consolidation", "Plasticité et neurogenèse"],
    "panax-ginseng":         ["Attention & réactivité mentale", "Énergie mentale & résistance au stress"],
    "piracetam":             ["Mémoire et consolidation", "Plasticité et neurogenèse"],
    "spiruline":             ["Neuroprotection"],
    "uridine-monophosphate": ["Mémoire et consolidation", "Plasticité et neurogenèse"],
    "vitamine-b9":           ["Anti-stress", "Mémoire et consolidation", "Neuroprotection"],
    "vitamine-b12":          ["Mémoire et consolidation", "Neuroprotection"],
}


# ─────────────────────────────────────────────────────────────────────────────
# STACKS
# ─────────────────────────────────────────────────────────────────────────────

STACKS = [
    {
        "slug": "stack-premium",
        "title": "Stack Nootropique Premium",
        "subtitle": "Plasticité, Synaptogenèse, Régulation, Cognition",
        "description": """Stack Nootropique Premium

Ce stack vise une augmentation durable des performances cognitives via des apports impossibles à atteindre par l'alimentation seule, reposant sur la synergie citicoline–uridine–DHA (Kennedy Pathway, membranes neuronales, synaptogenèse), complétée par le bacopa (mémoire et consolidation), le lion's mane (NGF, neuroplasticité et humeur), le cordyceps (énergie mitochondriale et endurance mentale), la créatine et les vitamines B9 et B12 (cofacteurs métaboliques cérébraux).

Les quantités recommandées sont établies à partir des doses optimales pour lesquelles on observe le plus de gains de performances (vitesse d'exécution, mémoire, résolution de problème).

Composition :
- Citicoline 1 000 mg/j → Attention & vitesse cognitive, Synaptogenèse, Neurotransmission
- DHA 600 mg/j → Synaptogenèse, Plasticité, Mémoire
- Lion's Mane 2 000 mg/j → Plasticité cérébrale, Humeur
- Bacopa monnieri 300 mg/j → Mémoire & consolidation, Humeur
- Créatine 5 g/j → Attention, Énergie cérébrale
- Cordyceps militaris 2 000 mg/j → Énergie & endurance mentale
- B9 400 µg/j + B12 1 000 µg/j → Mémoire, Métabolisme

À compléter de votre côté par :
- Vitamine D 4 000 UI/j (humeur, métabolisme neuronal)
- Uridine monophosphate 500 mg/j (synaptogenèse, plasticité) — je ne peux pas battre les prix en pharmacie

En bonus (usage ponctuel) :
- L-Tyrosine → Précurseur dopamine/noradrénaline, boost cognitif ponctuel
- L-Théanine → Régulateur GABA, anxiolytique non sédatif
- Piracétam 4 800 mg/j → Modulateur de la fluidité membranaire, extrêmement synergique avec la citicoline

⚠️ L-Tyrosine et L-Théanine sont antagonistes sur le long terme. Prendre ponctuellement selon les tâches.
⚠️ Les informations fournies sont à titre informatif uniquement et ne constituent pas un avis médical.""",
        "products": [
            ("citicoline",          1000, "mg", "→ Attention & vitesse cognitive, Synaptogenèse, Neurotransmission", 10),
            ("dha-omega3",          600,  "mg", "→ Synaptogenèse, Plasticité, Mémoire", 20),
            ("lions-mane",          2000, "mg", "→ Plasticité cérébrale, Humeur", 30),
            ("bacopa-monnieri",     300,  "mg", "→ Mémoire & consolidation, Humeur", 40),
            ("creatine",            5000, "mg", "→ Attention, Énergie cérébrale", 50),
            ("cordyceps-militaris", 2000, "mg", "→ Énergie & endurance mentale", 60),
            ("vitamine-b9",         None, "",   "B9 400µg/j + B12 1 000µg/j → Mémoire, Métabolisme neuronal", 70),
            ("vitamine-b12",        None, "",   "Voir B9 ci-dessus", 80),
        ],
    },
    {
        "slug": "stack-anti-thc",
        "title": "Stack Anti THC",
        "subtitle": "Protection cognitive — exposition répétée aux cannabinoïdes",
        "description": """Stack Anti THC

Ce stack est conçu pour préserver les fonctions cognitives et la stabilité neuronale dans un contexte d'exposition répétée au THC, via des apports ciblés impossibles à atteindre par l'alimentation seule.

Il repose sur la synergie citicoline–DHA (membranes neuronales, intégrité synaptique, efficacité frontale).

Composition :
- Citicoline 1 000 mg/j → Attention & vitesse cognitive, Synaptogenèse, Neurotransmission
- DHA 600 mg/j → Synaptogenèse, Plasticité, Mémoire

En bonus :
- EPA (acide eicosapentaénoïque) 2 000 mg/j → Régulation de l'inflammation neuro-périphérique, stabilisation de l'humeur

⚠️ Les informations fournies sont à titre informatif uniquement et ne constituent pas un avis médical. Consultez toujours un professionnel de santé qualifié.""",
        "products": [
            ("citicoline",  1000, "mg", "→ Attention, Synaptogenèse, Neurotransmission", 10),
            ("dha-omega3",  600,  "mg", "→ Synaptogenèse, Plasticité, Mémoire", 20),
        ],
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# SEED
# ─────────────────────────────────────────────────────────────────────────────

def upsert_benefit(db: Session, name: str) -> int:
    import re, unicodedata
    slug = name.lower().strip()
    slug = unicodedata.normalize("NFKD", slug).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")

    row = db.execute(text("SELECT id FROM benefit WHERE slug=:s"), {"s": slug}).fetchone()
    if row:
        return row[0]
    r = db.execute(text(
        "INSERT INTO benefit (slug, name, description, sort_order, is_active) VALUES (:s,:n,'',100,true) RETURNING id"
    ), {"s": slug, "n": name}).fetchone()
    return r[0]


def main():
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        print("❌ DATABASE_URL requis")
        sys.exit(1)
    url = normalize_url(url)
    engine = create_engine(url, echo=False)

    with Session(engine) as db:
        # ── Produits ──────────────────────────────────────────────────────────
        print("\n📦 Produits...")
        for row in PRODUCTS:
            (slug, name, cat, short_desc, desc,
             pmois, p1m, q1m, p3m, q3m, p1y, q1y) = row

            exists = db.execute(text("SELECT id FROM product WHERE slug=:s"), {"s": slug}).fetchone()
            if exists:
                db.execute(text("""
                    UPDATE product SET
                        name=:name, category=:cat, short_desc=:sd, description=:desc,
                        price_month_eur=:pm,
                        price_1m=:p1m, qty_g_1m=:q1m,
                        price_3m=:p3m, qty_g_3m=:q3m,
                        price_1y=:p1y, qty_g_1y=:q1y,
                        is_active=true
                    WHERE slug=:s
                """), {"name": name, "cat": cat, "sd": short_desc, "desc": desc,
                       "pm": pmois, "p1m": p1m, "q1m": q1m,
                       "p3m": p3m, "q3m": q3m,
                       "p1y": p1y, "q1y": q1y, "s": slug})
                print(f"   ↩  {name}")
            else:
                db.execute(text("""
                    INSERT INTO product
                        (slug, name, category, short_desc, description,
                         price_month_eur, price_1m, qty_g_1m, price_3m, qty_g_3m, price_1y, qty_g_1y, is_active)
                    VALUES
                        (:s, :name, :cat, :sd, :desc,
                         :pm, :p1m, :q1m, :p3m, :q3m, :p1y, :q1y, true)
                """), {"s": slug, "name": name, "cat": cat, "sd": short_desc, "desc": desc,
                       "pm": pmois, "p1m": p1m, "q1m": q1m,
                       "p3m": p3m, "q3m": q3m,
                       "p1y": p1y, "q1y": q1y})
                print(f"   ✅ {name}")

        db.commit()

        # ── Bienfaits ──────────────────────────────────────────────────────────
        print("\n🏷️  Bienfaits...")
        for slug, tags in PRODUCT_BENEFITS.items():
            p_row = db.execute(text("SELECT id FROM product WHERE slug=:s"), {"s": slug}).fetchone()
            if not p_row:
                print(f"   ⚠️  Produit manquant : {slug}")
                continue
            p_id = p_row[0]
            for tag in tags:
                b_id = upsert_benefit(db, tag)
                exists = db.execute(
                    text("SELECT id FROM product_benefit WHERE product_id=:pid AND benefit_id=:bid"),
                    {"pid": p_id, "bid": b_id}
                ).fetchone()
                if not exists:
                    db.execute(
                        text("INSERT INTO product_benefit (product_id, benefit_id, note) VALUES (:pid,:bid,'')"),
                        {"pid": p_id, "bid": b_id}
                    )
        db.commit()
        print(f"   ✅ Bienfaits associés")

        # ── Stacks ─────────────────────────────────────────────────────────────
        print("\n🏗️  Stacks...")
        for s in STACKS:
            exists = db.execute(text("SELECT id FROM stack WHERE slug=:s"), {"s": s["slug"]}).fetchone()
            if not exists:
                db.execute(text("""
                    INSERT INTO stack (slug, title, subtitle, description, is_active)
                    VALUES (:slug, :title, :subtitle, :desc, true)
                """), {"slug": s["slug"], "title": s["title"],
                       "subtitle": s["subtitle"], "desc": s["description"]})
                db.commit()
                print(f"   ✅ {s['title']}")
            else:
                db.execute(text("""
                    UPDATE stack SET title=:title, subtitle=:subtitle, description=:desc
                    WHERE slug=:slug
                """), {"title": s["title"], "subtitle": s["subtitle"],
                       "desc": s["description"], "slug": s["slug"]})
                db.commit()
                print(f"   ↩  {s['title']}")

            stack_id = db.execute(text("SELECT id FROM stack WHERE slug=:s"), {"s": s["slug"]}).fetchone()[0]

            for p_slug, dosage_val, dosage_unit, note, sort_order in s["products"]:
                p_row = db.execute(text("SELECT id FROM product WHERE slug=:s"), {"s": p_slug}).fetchone()
                if not p_row:
                    print(f"      ⚠️  Produit manquant : {p_slug}")
                    continue
                p_id = p_row[0]
                sp_exists = db.execute(
                    text("SELECT id FROM stack_product WHERE stack_id=:sid AND product_id=:pid"),
                    {"sid": stack_id, "pid": p_id}
                ).fetchone()
                if not sp_exists:
                    db.execute(text("""
                        INSERT INTO stack_product
                            (stack_id, product_id, dosage_value, dosage_unit, note, sort_order)
                        VALUES (:sid, :pid, :dv, :du, :note, :so)
                    """), {"sid": stack_id, "pid": p_id, "dv": dosage_val,
                           "du": dosage_unit, "note": note, "so": sort_order})
                else:
                    db.execute(text("""
                        UPDATE stack_product SET dosage_value=:dv, dosage_unit=:du, note=:note, sort_order=:so
                        WHERE stack_id=:sid AND product_id=:pid
                    """), {"dv": dosage_val, "du": dosage_unit, "note": note, "so": sort_order,
                           "sid": stack_id, "pid": p_id})
            db.commit()

    print(f"\n🎉 Seed terminé")
    print(f"   {len(PRODUCTS)} produits")
    print(f"   {sum(len(v) for v in PRODUCT_BENEFITS.values())} associations bienfaits")
    print(f"   {len(STACKS)} stacks")


if __name__ == "__main__":
    main()