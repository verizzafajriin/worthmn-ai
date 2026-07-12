# ==================================================
#     WORTHMN AI — DETERMINISTIC SAFETY KEYWORD CHECK
# ==================================================
#
# This runs BEFORE any Gemini call. If any high-risk phrase is found,
# risk is ALWAYS "HIGH" - full stop, no model in the loop, nothing to
# hallucinate or downgrade. Gemini is never asked to re-decide this.
#
# This is intentionally a blunt instrument: a plain substring match
# will occasionally over-trigger on borderline phrasing (e.g. "capek
# hidup" used in an offhand, non-suicidal way). That's an accepted
# tradeoff here - for this specific list of phrases, a false positive
# (showing emergency guidance to someone who didn't need it) is far
# less costly than a false negative (missing someone who did).

import logging
import re

logger = logging.getLogger("worthmn.safety")


# =========================
# HIGH-RISK KEYWORDS / PHRASES
# =========================
#
# Lowercase, no punctuation assumed - matching is done against a
# normalized version of the text (see normalize_text below).
# Add new phrases here as a single source of truth; nothing else in
# the codebase should need to change.

HIGH_RISK_KEYWORDS = [
    # Direct suicidal intent
    "bunuh diri",
    "ingin mati",
    "pengen mati",
    "aku mau mati",
    "mau mati",
    "mati saja",
    "mati aja",
    "mengakhiri hidup",
    "mengakhiri hidupku",
    "tidak ingin hidup",
    "nggak ingin hidup",
    "ga ingin hidup",
    "tidak mau hidup",
    "gak mau hidup",

    # Hopelessness framed as suicidal ideation
    "hidup tidak ada artinya",
    "hidupku tidak ada artinya",
    "hidup ga ada artinya",
    "hidup gak ada artinya",
    "capek hidup",
    "cape hidup",
    "lelah hidup",

    # Self-harm
    "menyakiti diri",
    "menyakiti diri sendiri",
    "melukai diri",
    "melukai diri sendiri",
    "self harm",
    "self-harm",
    "selfharm",
]


def normalize_text(text):
    """
    Lowercases and collapses whitespace/punctuation noise so phrases
    still match even with extra spaces, line breaks, or punctuation
    around them (e.g. "aku... mau mati." still matches "mau mati").
    """

    text = str(text or "").lower()

    # Collapse hyphens/underscores/newlines to spaces so "self-harm"
    # and "self harm" are treated the same, and multi-line stories
    # don't break a phrase across a line boundary.
    text = re.sub(r"[\-_\n\r\t]", " ", text)

    # Collapse repeated whitespace.
    text = re.sub(r"\s+", " ", text).strip()

    return text


def detect_high_risk_keywords(text):
    """
    Returns True if any deterministic high-risk phrase is present in
    `text`. This is a pure function with no network/model calls -
    it's fast, free, and always available even if Gemini is down.
    """

    normalized = normalize_text(text)

    for keyword in HIGH_RISK_KEYWORDS:
        if keyword in normalized:
            logger.info("Deterministic HIGH risk keyword matched: %r", keyword)
            return True

    return False
