import pandas as pd
import json
import re

# ===========================
# Load CSV
# ===========================

df = pd.read_csv("data/mental_health_services.csv")

# ===========================
# Bersihkan String
# ===========================

def clean_text(value):

    if pd.isna(value):
        return ""

    value = str(value)

    value = value.replace("\n", " ")
    value = value.replace("\r", " ")

    return value.strip()

for col in df.columns:

    df[col] = df[col].apply(clean_text)

# ===========================
# Tentukan Type
# ===========================

def detect_type(name, category):

    text = f"{name} {category}".lower()

    if "psikiater" in text:
        return "Psychiatrist"

    elif "rsj" in text:
        return "Psychiatric Hospital"

    elif "rumah sakit jiwa" in text:
        return "Psychiatric Hospital"

    elif "klinik psikologi" in text:
        return "Psychology Clinic"

    elif "psikolog" in text:
        return "Psychologist"

    elif "rumah sakit" in text:
        return "Hospital"

    elif "puskesmas" in text:
        return "Community Health Center"

    else:
        return "Mental Health Service"

df["type"] = df.apply(
    lambda x: detect_type(
        x["name"],
        x["category"]
    ),
    axis=1
)

# ===========================
# Priority
# ===========================

priority = {

    "Psychiatrist":1,

    "Psychologist":2,

    "Psychology Clinic":3,

    "Psychiatric Hospital":4,

    "Hospital":5,

    "Community Health Center":6,

    "Mental Health Service":7

}

df["priority"] = df["type"].map(priority)

# ===========================
# Bersihkan Phone
# ===========================

def clean_phone(phone):

    phone = str(phone)

    phone = re.sub(
        r"[^0-9+]",
        "",
        phone
    )

    return phone

df["phone"] = df["phone"].apply(clean_phone)

# ===========================
# Bersihkan Rating
# ===========================

df["rating"] = pd.to_numeric(

    df["rating"],

    errors="coerce"

)

# ===========================
# Bersihkan Review
# ===========================

df["review_count"] = pd.to_numeric(

    df["review_count"],

    errors="coerce"

)

# ===========================
# Hapus Duplikat
# ===========================

df.drop_duplicates(

    subset=["name","address"],

    inplace=True

)

# ===========================
# Sort
# ===========================

df = df.sort_values(

    by=[

        "province",

        "priority",

        "rating"

    ],

    ascending=[

        True,

        True,

        False

    ]

)

# ===========================
# Simpan CSV
# ===========================

df.to_csv(

    "data/mental_health_services_clean.csv",

    index=False,

    encoding="utf-8-sig"

)

# ===========================
# Simpan JSON
# ===========================

records = df.to_dict(orient="records")

with open(

    "data/mental_health_services_clean.json",

    "w",

    encoding="utf-8"

) as f:

    json.dump(

        records,

        f,

        ensure_ascii=False,

        indent=4

    )

print()

print("==========================")

print("DONE CLEANING")

print("==========================")

print()

print("Total :",len(df))