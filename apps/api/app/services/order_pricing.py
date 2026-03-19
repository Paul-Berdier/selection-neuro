from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

from app.models.address import Address
from app.models.order import Order

# ── Règles livraison (PDF: 10€ sous 30€, gratuite au-dessus) ────────────────
FREE_SHIPPING_THRESHOLD = Decimal("30.00")
FLAT_SHIPPING_FRANCE = Decimal("10.00")
FLAT_SHIPPING_INTERNATIONAL = Decimal("14.90")


def _d(x: float | str | Decimal) -> Decimal:
    if isinstance(x, Decimal):
        return x
    return Decimal(str(x))


def _round2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class ShippingRate:
    method: str
    label: str
    amount: Decimal


def get_shipping_rates(address: Address | None) -> list[ShippingRate]:
    """
    Règles métier (cahier des charges) :
    - France : livraison 10€, offerte si panier >= 30€
    - International : forfait 14.90€
    Note : le montant retourné ici est le tarif nominal.
    L'application du seuil gratuit se fait dans recompute_order_totals.
    """
    country = (address.country if address else "FR") or "FR"

    if country == "FR":
        return [
            ShippingRate("standard", "Standard (2-4 jours ouvrés)", FLAT_SHIPPING_FRANCE),
            ShippingRate("express", "Express (24-48h)", _d("14.90")),
        ]

    return [
        ShippingRate("standard", "International standard", FLAT_SHIPPING_INTERNATIONAL),
    ]


def get_tax_rate(address: Address | None) -> Decimal:
    country = (address.country if address else "FR") or "FR"
    if country == "FR":
        return _d("0.20")
    return _d("0.00")


def recompute_order_totals(order: Order, *, shipping_address: Address | None) -> None:
    """
    Recalcule les totaux de la commande.

    Règles :
    - Livraison France standard : 10€, OFFERTE si sous-total >= 30€
    - Livraison Express : toujours payante
    - TVA FR 20% sur (sous-total + livraison)
    - Hors France : pas de TVA, livraison forfait international
    """
    subtotal = _d("0")
    for it in order.items:
        subtotal += _d(it.line_total)

    if shipping_address is None:
        shipping = _d("0")
        tax_rate = _d("0")
        tax = _d("0")
        grand_total = _round2(subtotal)
    else:
        rates = get_shipping_rates(shipping_address)
        chosen = next(
            (r for r in rates if r.method == (order.shipping_method or "standard")),
            rates[0],
        )
        shipping = chosen.amount

        # Livraison gratuite si sous-total >= seuil ET méthode standard France
        if (
            shipping_address.country == "FR"
            and chosen.method == "standard"
            and subtotal >= FREE_SHIPPING_THRESHOLD
        ):
            shipping = _d("0")

        tax_rate = get_tax_rate(shipping_address)
        taxable = subtotal + shipping
        tax = _round2(taxable * tax_rate)
        grand_total = _round2(subtotal + shipping + tax)

    order.subtotal_amount = float(_round2(subtotal))
    order.shipping_amount = float(_round2(shipping))
    order.tax_amount = float(_round2(tax))
    order.grand_total_amount = float(_round2(grand_total))
    order.tax_rate = float(tax_rate)
    order.total_amount = float(_round2(grand_total))
