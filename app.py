# ==================================================
#           WORTHMN AI — FLASK BACKEND
# ==================================================

import os
import json
import logging

from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
from google import genai
from google.genai import types

from maps import load_services, get_top_services_by_province
from safety import detect_high_risk_keywords


# =========================
# FLASK CONFIGURATION
# =========================

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worthmn")


# =========================
# LOAD LOCAL DATASET (ONCE)
# =========================


load_services()


# =========================
# GEMINI CONFIGURATION
# =========================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=GEMINI_API_KEY
)

GEMINI_MODEL = "gemini-3.5-flash"

VALID_RISK_LEVELS = {"LOW", "MEDIUM", "HIGH"}


GEMINI_GENERATION_CONFIG = types.GenerateContentConfig(
    thinking_config=types.ThinkingConfig(thinking_level="low"),
    max_output_tokens=2048,
    response_mime_type="application/json",
)


# ==================================================
# SHARED HELPERS
# ==================================================

def parse_json_from_gemini(raw_text):
    """
    Gemini sometimes wraps JSON in ```json fences even when told not
    to. This strips that off before parsing. If the text still isn't
    valid JSON, json.loads() raises — callers are expected to catch
    that and use a fallback.
    """

    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()

    return json.loads(cleaned)


def call_gemini_for_json(prompt):
    """
    Shared low-level call used by BOTH Gemini steps (classification and
    content generation). Sends the prompt, then parses the response as
    strict JSON — Gemini is only ever allowed to hand back one JSON
    object, never plain text or prose.

    Raises on any failure (network error, unparsable response, etc.) -
    callers are expected to catch the exception and fall back to a
    safe default rather than surface a broken response to the user.
    """

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=GEMINI_GENERATION_CONFIG,
    )

    return parse_json_from_gemini(response.text)


# ==================================================
# 1. STEP 1 — RISK CLASSIFIER (Gemini, semantic only)
# ==================================================

def build_classification_prompt(name, city, district, emotion, story):
    """
    Asks Gemini to read the story IN CONTEXT and decide emotional risk.
    No keyword rules — Gemini is explicitly told to judge meaning, not
    isolated words.
    """

    return f"""Kamu adalah sistem klasifikasi keamanan emosional untuk Worthmn AI,
sebuah platform refleksi emosional untuk perempuan. Kamu BUKAN alat
diagnosis medis atau psikologis, dan kamu TIDAK memberi skor numerik
apa pun — hanya salah satu dari tiga level: LOW, MEDIUM, atau HIGH.

Baca cerita pengguna dan PAHAMI MAKNANYA SECARA UTUH — jangan pernah
mencocokkan kata per kata atau mengandalkan daftar kata kunci. Contoh
cara berpikir yang benar:
- "Aku tidak mau mati sia-sia" -> BUKAN keinginan bunuh diri (LOW/MEDIUM
  tergantung konteks lain).
- "Aku pengen menghilang saja" -> HIGH.
- "Rasanya nggak ada yang bakal kangen aku" -> HIGH.
- "Aku udah nggak pengen bangun lagi besok" -> HIGH.
- "Semua orang mungkin lebih bahagia tanpa aku" -> HIGH.
- "Aku capek banget belakangan ini" (tanpa indikasi keputusasaan
  mendalam) -> LOW atau MEDIUM, tergantung konteks lain.

DATA PENGGUNA:
- Nama: {name}
- Lokasi: {district}, {city}
- Emosi yang dipilih: {emotion}
- Cerita: "{story}"

Tentukan:
- risk: HARUS salah satu dari "LOW", "MEDIUM", "HIGH" saja
- theme: satu-dua kata yang menggambarkan inti emosinya (bebas, dalam
  Bahasa Indonesia atau Inggris), misalnya "burnout", "kesepian",
  "keputusasaan", dsb — ini hanya untuk membantu menulis refleksi
  nanti, bukan label klinis
- reason: alasan singkat (1 kalimat) kenapa kamu memilih risk ini

ATURAN PENTING:
- Jika ada indikasi keinginan bunuh diri, menyakiti diri sendiri, atau
  keputusasaan berat yang genuine, risk HARUS "HIGH".
- Jangan menurunkan risk hanya karena kalimatnya sopan, halus, atau
  singkat — nilai makna sebenarnya.
- Kalau ragu antara dua level, pilih yang lebih tinggi (lebih hati-hati).

Balas HANYA dengan JSON valid, tanpa markdown, tanpa teks tambahan,
persis dengan bentuk ini:
{{"risk":"HIGH","theme":"...","reason":"..."}}"""


def classify_risk(name, city, district, emotion, story):
    """
    STEP 1. Determines emotional risk level.

    Order of operations:
    1. DETERMINISTIC KEYWORD CHECK (safety.py) runs first, before any
       Gemini call. If a high-risk phrase is found, risk is ALWAYS
       "HIGH" — Gemini is not consulted at all for the risk decision,
       so there's nothing for it to downgrade or hallucinate away.
    2. Only if no keyword matches do we ask Gemini to classify the
       remaining nuance (LOW vs MEDIUM vs genuinely-implicit HIGH
       phrasing that doesn't use any of the listed keywords).

    Gemini is never allowed to lower a risk level that the
    deterministic check already set to HIGH.

    Returns {"risk": ..., "theme": ...}.

    If Gemini can't be reached or returns something unusable, we do
    NOT default to LOW — an unreadable response isn't evidence of
    safety. We default to a cautious MEDIUM instead.
    """

    # ---- Deterministic rule FIRST, always, before touching Gemini ----
    if detect_high_risk_keywords(story):
        logger.info("classify_risk: deterministic HIGH (keyword match), skipping Gemini.")
        return {"risk": "HIGH", "theme": "keputusasaan", "keyword_triggered": True}

    prompt = build_classification_prompt(name, city, district, emotion, story)

    try:
        parsed = call_gemini_for_json(prompt)

        risk = str(parsed.get("risk", "")).upper()
        theme = str(parsed.get("theme", "")).strip() or "self_acceptance"

        if risk not in VALID_RISK_LEVELS:
            raise ValueError("Gemini returned an unrecognized risk value.")

        return {"risk": risk, "theme": theme}

    except Exception as e:
        # Gemini unreachable / bad response — cautious fallback, not a
        # text-based guess. See safety note above. Logged (not just
        # swallowed) so a real problem - like a truncated/empty Gemini
        # response - doesn't silently look like "every story is MEDIUM".
        logger.warning("classify_risk fell back to MEDIUM: %r", e)
        return {"risk": "MEDIUM", "theme": "unknown", "gemini_unavailable": True}


# ==================================================
# 2. STEP 2 — CONTENT WRITER (reflection + coping + quote)
# ==================================================

def build_content_prompt(risk, theme, name, city, district, emotion, story):
    """
    Uses the STEP 1 result to ask Gemini for the reflection, 3 coping
    suggestions, and 1 matching quote — all in one call, all tailored
    to this specific story rather than generic advice.
    """

    high_risk_rules = ""
    if risk == "HIGH":
        high_risk_rules = """
ATURAN KHUSUS RISIKO TINGGI (WAJIB DIIKUTI):
- Tetap tenang, jangan panik, jangan dramatis.
- Validasi perasaan pengguna tanpa menghakimi.
- JANGAN memberi detail, metode, atau langkah apa pun terkait menyakiti diri.
- Dengan hangat dorong pengguna untuk segera bicara dengan orang yang
  mereka percaya (keluarga/teman), konselor, psikolog, atau layanan darurat.
- JANGAN PERNAH menjanjikan kerahasiaan.
- JANGAN PERNAH bilang "semua akan baik-baik saja" atau semacamnya.
- JANGAN PERNAH mendiagnosis kondisi apa pun.
- coping harus mencakup ajakan menghubungi orang terpercaya / profesional.
"""

    return f"""Kamu adalah Worthmn AI, teman refleksi emosional berbasis AI untuk
perempuan. Kamu BUKAN chatbot terapi dan BUKAN pengganti psikolog.

DATA PENGGUNA:
- Nama: {name}
- Lokasi: {district}, {city}
- Emosi yang dipilih: {emotion}
- Cerita: "{story}"

KONTEKS DARI SISTEM KEAMANAN (panduan nada saja, JANGAN sebutkan label
ini secara eksplisit ke pengguna):
- risk: {risk}
- theme: {theme}
{high_risk_rules}
Tulis tiga hal berikut:

1. reflection — refleksi hangat (maksimal ~120 kata) yang benar-benar
   merespons cerita dan emosi pengguna secara spesifik. Suportif,
   tidak menghakimi, tidak mendiagnosis, terasa manusiawi.

2. coping — TEPAT 3 saran coping yang PRAKTIS dan SPESIFIK untuk
   situasi pengguna ini (bukan saran generik seperti "tetap semangat").
   Sesuaikan dengan tema "{theme}" dan isi ceritanya.

3. quote — SATU kutipan dukungan yang personal, maksimal 25 kata,
   yang sesuai dengan kondisi emosional pengguna saat ini. Contoh
   pemetaan nada: kesepian -> tentang dicintai/ditemani, kelelahan ->
   tentang istirahat, keputusasaan -> tentang harapan. Kutipan HARUS
   terasa relevan dengan cerita di atas, dan TIDAK BOLEH mengulang
   kalimat atau ide yang sama persis dengan "reflection" — quote adalah
   pesan penutup yang singkat dan berbeda, bukan ringkasan reflection.

Balas HANYA dengan JSON valid, tanpa markdown, tanpa teks tambahan,
persis dengan bentuk ini:
{{"reflection":"...","coping":["...","...","..."],"quote":"..."}}"""


def fallback_content(risk):
    """
    Used only if the Gemini content call fails or returns unparsable
    JSON, so the user never gets a blank/broken response.
    """

    reflection = (
        "Terima kasih sudah berani berbagi apa yang kamu rasakan. Saat ini "
        "Worthmn AI sedang kesulitan menyusun refleksi lengkap, tapi apa "
        "pun yang kamu rasakan sekarang valid dan layak untuk didengar."
    )

    coping = [
        "Coba tarik napas dalam-dalam beberapa kali sebelum melanjutkan harimu.",
        "Tuliskan apa yang kamu rasakan di jurnal atau catatan pribadi.",
        "Hubungi seseorang yang kamu percaya untuk sekadar bercerita.",
    ]

    if risk == "HIGH":
        coping[2] = (
            "Tolong segera hubungi orang terdekat yang kamu percaya, "
            "konselor, psikolog, atau layanan darurat di sekitarmu sekarang."
        )

    return {
        "reflection": reflection,
        "coping": coping,
        "quote": "Kamu tidak harus menghadapi semuanya sendirian.",
    }


def generate_content(risk, theme, name, city, district, emotion, story):
    """
    STEP 2. Turns the STEP 1 classification into reflection + coping +
    quote. Falls back to a safe generic response if Gemini fails.
    """

    prompt = build_content_prompt(risk, theme, name, city, district, emotion, story)

    try:
        parsed = call_gemini_for_json(prompt)

        reflection = str(parsed.get("reflection", "")).strip()
        coping = parsed.get("coping", [])
        quote = str(parsed.get("quote", "")).strip()

        # Basic shape validation — if anything is missing/wrong shape,
        # treat the whole call as failed and use the fallback instead.
        if not reflection or not isinstance(coping, list) or len(coping) == 0 or not quote:
            raise ValueError("Gemini returned incomplete content.")

        coping = [str(item).strip() for item in coping if str(item).strip()][:3]

        # Safety net: even if Gemini ignored the word-limit instruction,
        # never let an oversized quote reach the frontend.
        quote_words = quote.split()
        if len(quote_words) > 25:
            quote = " ".join(quote_words[:25]).rstrip(",.;:") + "..."

        return {"reflection": reflection, "coping": coping, "quote": quote}

    except Exception as e:
        logger.warning("generate_content fell back to generic content: %r", e)
        return fallback_content(risk)


# ==================================================
# 3. NEARBY SUPPORT (local dataset via maps.py)
# ==================================================


def get_nearby_support(province):
    """
    Returns up to 3 psychologist/mental-health service recommendations
    for the given province. Each item has exactly the fields the
    frontend (ai.js -> renderNearbyList) uses: name, address, phone,
    website, google_maps_url.

    Returns [] if the province is empty or has no data - never raises.
    """

    return get_top_services_by_province(province)


# =========================
# HOME ROUTE
# =========================

@app.route("/")
def home():

    return send_from_directory(".", "index.html")


# =========================
# STATIC FILE ROUTE
# =========================

@app.route("/<path:path>")
def static_files(path):

    return send_from_directory(".", path)


# =========================
# TEST GEMINI CONNECTION
# =========================

@app.route("/test-ai")
def test_ai():

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents="Balas hanya dengan tulisan: Halo Worthmn 💜",
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="low"),
            max_output_tokens=256,
        ),
    )

    return response.text


# =========================
# ANALYZE ROUTE
# =========================

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Single entry point the frontend talks to. Always returns ONE JSON
    object (see the module docstring at the top of this file for the
    exact shape) — never plain text, and never partial data.

    Nearby-support behaviour by risk level:
    - LOW    -> nearby_mode "none":   never shown, never fetched.
    - MEDIUM -> nearby_mode "offer":  frontend asks the user first;
                                      the actual list is only fetched
                                      later via /nearby-support if the
                                      user says yes.
    - HIGH   -> nearby_mode "direct": fetched immediately and shown
                                      without asking.
    """

    data = request.get_json(silent=True) or {}

    name = data.get("name") or "kamu"
    city = data.get("city", "")
    district = data.get("district", "")
    emotion = data.get("emotion", "")
    story = data.get("story", "")


    province = data.get("province", "").strip()

    try:
        # ---- STEP 1: risk classification (deterministic keywords, then Gemini) ----
        classification = classify_risk(name, city, district, emotion, story)
        risk = classification["risk"]
        theme = classification["theme"]

        # ---- STEP 2: Gemini writes reflection + coping + quote ----
        content = generate_content(risk, theme, name, city, district, emotion, story)

        # ---- STEP 3: nearby support, gated by risk level ----
        if risk == "HIGH":
            nearby_mode = "direct"
            nearby = get_nearby_support(province)
        elif risk == "MEDIUM":
            nearby_mode = "offer"
            nearby = []  # not fetched yet - only on explicit user confirmation
        else:
            nearby_mode = "none"
            nearby = []

        return jsonify({
            "success": True,
            "risk": risk,
            "reflection": content["reflection"],
            "coping": content["coping"],
            "ask_nearby": nearby_mode != "none",
            "nearby_mode": nearby_mode,
            "nearby": nearby,
            "quote": content["quote"],
            # Echoed back so the frontend can call /nearby-support later
            # (for the MEDIUM "offer" flow) without needing to keep its
            # own copy of these fields around.
            "city": city,
            "district": district,
            "province": province,
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Terjadi kesalahan di server: {str(e)}",
        }), 500


# =========================
# NEARBY SUPPORT (ON DEMAND)
# =========================

@app.route("/nearby-support", methods=["POST"])
def nearby_support():
    """
    Called only when a MEDIUM-risk user explicitly says "yes" to the
    nearby-support offer from /analyze (nearby_mode: "offer"). Kept as
    a separate endpoint so MEDIUM risk doesn't pay the lookup cost
    unless the user actually wants it.

    Looks up recommendations by province from the local dataset - no
    external requests are made here.
    """

    data = request.get_json(silent=True) or {}

   
    province = data.get("province", "").strip()

    try:
        nearby = get_nearby_support(province)
        return jsonify({"success": True, "nearby": nearby})

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Terjadi kesalahan di server: {str(e)}",
        }), 500


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000,
    )