"""
HTML sanitizer — strip dangerous tags/attributes from user-submitted HTML.
Used for product descriptions rendered via dangerouslySetInnerHTML.
"""
from __future__ import annotations

import re

# Allowed tags — safe subset for product descriptions
ALLOWED_TAGS = {
    "p", "br", "strong", "b", "em", "i", "u", "s",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
    "blockquote", "code", "pre", "hr",
    "sup", "sub", "small",
}

# Allowed attributes per tag
ALLOWED_ATTRS = {
    "a": {"href", "title", "target", "rel"},
    "span": {"class"},
    "div": {"class"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan"},
}

# Dangerous patterns
_SCRIPT_RE = re.compile(r"<script[\s>].*?</script>", re.IGNORECASE | re.DOTALL)
_EVENT_RE = re.compile(r"\s+on\w+\s*=\s*[\"'][^\"']*[\"']", re.IGNORECASE)
_STYLE_RE = re.compile(r"<style[\s>].*?</style>", re.IGNORECASE | re.DOTALL)
_IFRAME_RE = re.compile(r"<iframe[\s>].*?</iframe>", re.IGNORECASE | re.DOTALL)
_OBJECT_RE = re.compile(r"<(object|embed|applet|form|input|button|textarea|select)[\s>/].*?(?:</\1>)?", re.IGNORECASE | re.DOTALL)
_JS_URL_RE = re.compile(r"(href|src|action)\s*=\s*[\"']\s*javascript:", re.IGNORECASE)
_DATA_URL_RE = re.compile(r"(href|src)\s*=\s*[\"']\s*data:", re.IGNORECASE)


def sanitize_html(html: str) -> str:
    """
    Strip dangerous HTML constructs while preserving safe formatting.
    This is NOT a full-blown parser — for production, consider bleach or nh3.
    But it catches the most common XSS vectors.
    """
    if not html:
        return ""

    # Remove script/style/iframe/form tags entirely
    result = _SCRIPT_RE.sub("", html)
    result = _STYLE_RE.sub("", result)
    result = _IFRAME_RE.sub("", result)
    result = _OBJECT_RE.sub("", result)

    # Remove event handlers (onclick, onload, onerror, etc.)
    result = _EVENT_RE.sub("", result)

    # Remove javascript: and data: URLs
    result = _JS_URL_RE.sub(r'\1=""', result)
    result = _DATA_URL_RE.sub(r'\1=""', result)

    # Force target="_blank" links to have rel="noopener noreferrer"
    result = re.sub(
        r'(<a\s[^>]*target\s*=\s*["\']_blank["\'][^>]*)>',
        r'\1 rel="noopener noreferrer">',
        result,
        flags=re.IGNORECASE,
    )

    return result.strip()
