from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

from app.models.address import Address
from app.models.order import Order


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
    # MVP rules; extensible later (zones, carriers, weight, etc.)
    country = (address.country if address else "FR") or "FR"

    if country == "FR":
        return [
            ShippingRate("standard", "Standard (2-4 jours)", _d("4.90")),
            ShippingRate("express", "Express (24-48h)", _d("9.90")),
        ]

    return [
        ShippingRate("standard", "International standard", _d("14.90")),
    ]


def get_tax_rate(address: Address | None) -> Decimal:
    country = (address.country if address else "FR") or "FR"
    if country == "FR":
        return _d("0.20")
    return _d("0.00")


def recompute_order_totals(order: Order, *, shipping_address: Address | None) -> None:
    """
    Recompute totals from order items.
    Policy:
      - shipping/tax = 0 if no shipping address
      - VAT on (subtotal + shipping)
      - free FR standard shipping if subtotal >= 60
      - keep order.total_amount in sync with grand_total_amount
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
        chosen = next((r for r in rates if r.method == (order.shipping_method or "standard")), rates[0])
        shipping = chosen.amount

        # free shipping threshold FR standard only
        if shipping_address.country == "FR" and subtotal >= _d("60") and chosen.method == "standard":
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

    # keep legacy in sync
    order.total_amount = float(_round2(grand_total))