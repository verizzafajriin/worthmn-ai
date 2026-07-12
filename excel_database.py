import pandas as pd
import glob
import os

# ==========================================
# CONFIG
# ==========================================

INPUT_FOLDER = "data-psikolog-di-indonesia"
OUTPUT_FOLDER = "data"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ==========================================
# Province Mapping
# ==========================================

province_mapping = {

    "nad": "Aceh",

    "sumut": "Sumatera Utara",
    "sumbar": "Sumatera Barat",
    "sumsel": "Sumatera Selatan",

    "dki jakarta": "DKI Jakarta",
    "diy yogyakarta": "DI Yogyakarta",

    "kaltim": "Kalimantan Timur",
    "kalteng": "Kalimantan Tengah",
    "kalbar": "Kalimantan Barat",
    "kalsel": "Kalimantan Selatan",
    "kaltara": "Kalimantan Utara",

    "ntb": "Nusa Tenggara Barat",
    "ntt": "Nusa Tenggara Timur"
}

# ==========================================
# Bersihkan Nama Provinsi
# ==========================================

def clean_province(filename):

    province = filename.lower()

    province = province.replace(".csv","")
    province = province.replace("psikolog di ","")
    province = province.replace(" dan sekitarnya","")

    province = province.strip()

    province = province_mapping.get(
        province,
        province.title()
    )

    return province

# ==========================================
# Cari Semua CSV
# ==========================================

files = glob.glob(
    os.path.join(INPUT_FOLDER,"*.csv")
)

print(f"\nFound {len(files)} CSV files\n")

all_data = []

# ==========================================
# Gabungkan
# ==========================================

for file in files:

    print("Reading :", os.path.basename(file))

    df = pd.read_csv(file)

    province = clean_province(
        os.path.basename(file)
    )

    df["Province"] = province

    all_data.append(df)

merged = pd.concat(
    all_data,
    ignore_index=True
)

# ==========================================
# Rename Kolom
# ==========================================

merged.rename(columns={

    "Nama Tempat":"name",

    "Items":"category",

    "Alamat":"google_maps_url",

    "W4Efsd 3":"address",

    "W4Efsd 6":"phone",

    "UsdlK":"website",

    "Rating":"rating",

    "Review":"review_count",

    "Province":"province"

}, inplace=True)

# ==========================================
# Ambil Kolom Penting
# ==========================================

needed = [

    "name",

    "category",

    "province",

    "address",

    "phone",

    "website",

    "rating",

    "review_count",

    "google_maps_url"

]

for col in needed:

    if col not in merged.columns:

        merged[col] = ""

merged = merged[needed]

# ==========================================
# Bersihkan Data
# ==========================================

merged = merged.fillna("")

merged = merged[
    merged["name"] != ""
]

merged.drop_duplicates(

    subset=["name","address"],

    inplace=True

)

merged.reset_index(

    drop=True,

    inplace=True

)

# ==========================================
# Export CSV
# ==========================================

merged.to_csv(

    os.path.join(
        OUTPUT_FOLDER,
        "mental_health_services.csv"
    ),

    index=False,

    encoding="utf-8-sig"

)

# ==========================================
# Export JSON
# ==========================================

merged.to_json(

    os.path.join(
        OUTPUT_FOLDER,
        "mental_health_services.json"
    ),

    orient="records",

    indent=4,

    force_ascii=False

)

print("\n=======================")
print("DONE")
print("=======================")

print("Total Data :", len(merged))
