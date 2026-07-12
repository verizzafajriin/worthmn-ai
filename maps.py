# ==================================================
#     WORTHMN AI — LOCAL PSYCHOLOGIST RECOMMENDATIONS
# ==================================================

import json
import logging
import math
import os
import re

logger = logging.getLogger("worthmn.maps")


# =========================
# CONSTANTS
# =========================

DATA_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "data",
    "mental_health_services_clean.json",
)

MAX_RESULTS = 3


# =========================
# IN-MEMORY CACHE
# =========================
_SERVICES_CACHE = None


def load_services(force_reload=False):
    """
    Loads data/mental_health_services_clean.json into memory ONCE.

    Call this explicitly at Flask app startup (see app.py) so the
    file is read a single time rather than on every request. Safe to
    call again later (e.g. in tests) via force_reload=True.

    Returns the cached list of service dicts. Returns an empty list
    (and logs a warning) if the file is missing or invalid, so a bad
    dataset never crashes the app - it just means recommendations
    come back empty everywhere.
    """

    global _SERVICES_CACHE

    if _SERVICES_CACHE is not None and not force_reload:
        return _SERVICES_CACHE

    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError("Expected a JSON array of service objects.")

        _SERVICES_CACHE = data
        logger.info("Loaded %d services from %s", len(data), DATA_PATH)

    except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
        logger.warning("Failed to load %s: %r", DATA_PATH, e)
        _SERVICES_CACHE = []

    return _SERVICES_CACHE


# =========================
# PROVINCE NAME NORMALIZATION
# =========================


PROVINCE_ALIASES = {
    # Jakarta
    "daerah khusus ibukota jakarta": "dki jakarta",
    "dki jakarta": "dki jakarta",
    "jakarta": "dki jakarta",

    # Yogyakarta
    "daerah istimewa yogyakarta": "di yogyakarta",
    "di yogyakarta": "di yogyakarta",
    "diy": "di yogyakarta",
    "yogyakarta": "di yogyakarta",

    # Bangka Belitung
    "kepulauan bangka belitung": "bangka belitung",
    "bangka belitung": "bangka belitung",

    # Nusa Tenggara Barat
    "nusa tenggara barat": "nusa tenggara barat",
    "ntb": "nusa tenggara barat",

    # Nusa Tenggara Timur
    "nusa tenggara timur": "nusa tenggara timur",
    "ntt": "nusa tenggara timur",
}


def normalize_province(value):
    """
    Reduces a province name to a canonical, comparison-safe key:
    - lower-cased and trimmed
    - internal whitespace collapsed to single spaces
    - a leading "provinsi " prefix stripped, if present
    - known aliases (see PROVINCE_ALIASES) resolved to one shared key

    Provinces without a known alias simply normalize to their own
    lower-cased/trimmed form, which is enough because their names
    already match between provinsi.json and the dataset (e.g. "Aceh",
    "Bali", "Riau", "Jawa Barat", ...).

    Always returns a string ("" for empty/None input), so callers
    never need to null-check the result.
    """

    if not value:
        return ""

    cleaned = re.sub(r"\s+", " ", str(value)).strip().lower()
    cleaned = re.sub(r"^provinsi\s+", "", cleaned)

    return PROVINCE_ALIASES.get(cleaned, cleaned)


# =========================
# HELPERS
# =========================

def _safe_rating(entry):
    """
    Returns a numeric rating usable for sorting.

    Some entries have rating = NaN (missing data in the source sheet).
    NaN breaks naive sort comparisons, so anything missing/NaN is
    treated as the lowest possible rating - unrated places sort to
    the bottom of their priority tier instead of corrupting the sort.
    This is also what makes rated entries automatically "preferred"
    over unrated ones whenever their priority ties (requirement: sort
    by priority first, then prefer entries that have a rating).
    """

    rating = entry.get("rating")

    try:
        rating = float(rating)
    except (TypeError, ValueError):
        return float("-inf")

    if math.isnan(rating):
        return float("-inf")

    return rating


def _safe_priority(entry):
    """
    Returns a numeric priority for sorting (ascending = better).
    Missing/invalid priority is pushed to the end.
    """

    priority = entry.get("priority")

    try:
        return float(priority)
    except (TypeError, ValueError):
        return float("inf")


def _dedupe_key(entry):
    """
    Key used to collapse duplicate listings of the same place. Prefers
    the Google Maps URL (the most reliable unique identifier in this
    dataset); falls back to normalized name + address when a URL is
    missing so entries without one can still be deduplicated.
    """

    maps_url = str(entry.get("google_maps_url") or "").strip().lower()

    if maps_url:
        return maps_url

    name = re.sub(r"\s+", " ", str(entry.get("name") or "")).strip().lower()
    address = re.sub(r"\s+", " ", str(entry.get("address") or "")).strip().lower()

    return f"{name}|{address}"


def _dedupe(entries):
    """
    Removes duplicate entries while preserving order. Because callers
    always sort BEFORE calling this, the first occurrence of a given
    key is the best-ranked one, so it's the one that gets kept.
    """

    seen = set()
    unique = []

    for entry in entries:
        key = _dedupe_key(entry)

        if key in seen:
            continue

        seen.add(key)
        unique.append(entry)

    return unique


# ==================================================
# MAIN ENTRY POINT
# ==================================================

def get_top_services_by_province(province, limit=MAX_RESULTS):
    """
    Given a province name, returns the best `limit` psychologist/mental
    health service recommendations from that province only.

    Rules:
    - Only entries whose "province" matches (normalized - see
      normalize_province - so formatting/aliasing differences between
      provinsi.json and the dataset don't cause false negatives).
    - City and district are intentionally ignored: this dataset is
      matched at the province level only.
    - Entries without a "name" are ignored entirely.
    - Duplicate listings (same Google Maps place, or same
      name+address) are collapsed to a single entry.
    - Sorted by priority ascending, then rating descending (so, among
      equal priorities, rated entries are preferred over unrated
      ones).
    - Returns [] if the province is empty or has no data - never
      raises.

    Returned shape (per the frontend contract):
        {"name", "category", "address", "phone", "website", "google_maps_url"}
    """

    target_province = normalize_province(province)

    if not target_province:
        return []

    services = load_services()

    candidates = [
        entry for entry in services
        if entry.get("name")  # ignore unnamed entries
        and normalize_province(entry.get("province")) == target_province
    ]

    candidates.sort(key=lambda e: (_safe_priority(e), -_safe_rating(e)))

    unique_candidates = _dedupe(candidates)

    top = unique_candidates[:limit]

    return [
        {
            "name": entry.get("name", ""),
            "category": entry.get("category", ""),
            "address": entry.get("address", ""),
            "phone": entry.get("phone", ""),
            "website": entry.get("website", ""),
            "google_maps_url": entry.get("google_maps_url", ""),
        }
        for entry in top
    ]


# ==================================================
# MANUAL TEST (only runs when this file is executed directly)
# ==================================================

if __name__ == "__main__":

    import sys

    logging.basicConfig(level=logging.INFO)

    # Usage: python maps.py "Aceh"
    test_province = sys.argv[1] if len(sys.argv) >= 2 else "Aceh"

    print(f"Testing local lookup for province={test_province!r}\n")

    results = get_top_services_by_province(test_province)

    if not results:
        print("No services found for this province.")
    else:
        for place in results:
            print(place)