"""
Security middleware — rate limiting, secure headers, request validation.
"""
from __future__ import annotations

import time
import hashlib
from collections import defaultdict
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse


# ── In-memory rate limiter (swap for Redis in prod if needed) ────────────────

class _TokenBucket:
    """Simple per-IP token-bucket rate limiter."""

    def __init__(self, rate: float = 60, burst: int = 120):
        self.rate = rate      # tokens per second
        self.burst = burst    # max bucket size
        self._buckets: dict[str, tuple[float, float]] = {}  # ip -> (tokens, last_time)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        tokens, last = self._buckets.get(key, (self.burst, now))
        elapsed = now - last
        tokens = min(self.burst, tokens + elapsed * self.rate)
        if tokens >= 1:
            self._buckets[key] = (tokens - 1, now)
            return True
        self._buckets[key] = (tokens, now)
        return False

    def cleanup(self) -> None:
        """Periodic cleanup of stale entries."""
        now = time.monotonic()
        stale = [k for k, (_, t) in self._buckets.items() if now - t > 300]
        for k in stale:
            del self._buckets[k]


_global_limiter = _TokenBucket(rate=10, burst=60)  # 10 req/s, burst 60

# Stricter limiter for auth endpoints
_auth_limiter = _TokenBucket(rate=0.5, burst=5)    # 0.5 req/s, burst 5

# Track failed login attempts per IP
_failed_logins: dict[str, list[float]] = defaultdict(list)
_FAILED_LOGIN_WINDOW = 900   # 15 min
_FAILED_LOGIN_MAX = 10       # max attempts per window


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        ip = _client_ip(request)
        path = request.url.path.lower()

        # Auth endpoints get stricter limits
        if path in ("/auth/login", "/auth/register"):
            if not _auth_limiter.allow(ip):
                return JSONResponse(
                    {"detail": "Too many requests. Please try again later."},
                    status_code=429,
                    headers={"Retry-After": "30"},
                )
            # Check brute-force on login
            if path == "/auth/login":
                now = time.time()
                _failed_logins[ip] = [
                    t for t in _failed_logins[ip] if now - t < _FAILED_LOGIN_WINDOW
                ]
                if len(_failed_logins[ip]) >= _FAILED_LOGIN_MAX:
                    return JSONResponse(
                        {"detail": "Too many failed attempts. Account temporarily locked."},
                        status_code=429,
                        headers={"Retry-After": "900"},
                    )
        else:
            if not _global_limiter.allow(ip):
                return JSONResponse(
                    {"detail": "Too many requests"},
                    status_code=429,
                    headers={"Retry-After": "5"},
                )

        response = await call_next(request)

        # Track failed logins
        if path == "/auth/login" and response.status_code == 401:
            _failed_logins[ip].append(time.time())

        return response


class SecureHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Clickjacking protection
        response.headers["X-Frame-Options"] = "DENY"

        # XSS filter (legacy but still useful)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions policy — disable stuff we don't need
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=(self)"
        )

        # HSTS — only on non-localhost
        if "localhost" not in request.url.hostname:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # Remove server header
        response.headers.pop("server", None)

        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validate request size and content type."""

    MAX_BODY_SIZE = 20 * 1024 * 1024  # 20MB

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check content length
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_BODY_SIZE:
            return JSONResponse(
                {"detail": "Request too large"},
                status_code=413,
            )

        return await call_next(request)
