import re
import html
from typing import List

class TextCleaner:
    """
    NLP text normalization utility tailored for web DOM text extraction.
    """

    @staticmethod
    def clean_text(text: str) -> str:
        if not text or not isinstance(text, str):
            return ""

        # Unescape HTML entities (&amp; -> &, &quot; -> ")
        text = html.unescape(text)

        # Remove HTML tags if present
        text = re.sub(r'<[^>]+>', ' ', text)

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        cleaned = TextCleaner.clean_text(text).lower()
        words = re.findall(r'\b[a-z]{3,}\b', cleaned)
        return list(set(words))
