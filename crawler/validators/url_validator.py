import re
from urllib.parse import urlparse

def is_valid_url(url: str) -> bool:
    """
    Validates if a given string is a syntactically valid HTTP/HTTPS URL.
    """
    if not url or not isinstance(url, str):
        return False

    url = url.strip()
    if not (url.startswith('http://') or url.startswith('https://')):
        url = 'https://' + url

    try:
        parsed = urlparse(url)
        if not parsed.netloc:
            return False
        # Basic domain validation (allows localhost, IP addresses, standard domains)
        domain_pattern = re.compile(
            r'^(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,6}$|' # Domain name
            r'^localhost$|'                            # localhost
            r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'     # IPv4
        )
        hostname = parsed.hostname or ""
        return bool(domain_pattern.match(hostname))
    except Exception:
        return False

def sanitize_url(url: str) -> str:
    """
    Ensures URL has a protocol and trims whitespace.
    """
    url = url.strip()
    if not (url.startswith('http://') or url.startswith('https://')):
        return 'https://' + url
    return url

def extract_domain(url: str) -> str:
    """
    Extracts canonical domain name from URL.
    """
    sanitized = sanitize_url(url)
    parsed = urlparse(sanitized)
    return parsed.hostname or parsed.netloc or "unknown"
