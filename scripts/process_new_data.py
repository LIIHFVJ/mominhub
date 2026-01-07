import json
import os

# Paths
BASE_DATA_PATH = r"c:\Users\ronal\OneDrive\Desktop\موقع قران\momin-hub\dua-dhikr\data\dua-dhikr"
SQL_OUTPUT_PATH = r"c:\Users\ronal\OneDrive\Desktop\موقع قران\momin-hub\migration_v5_data_final.sql"

def escape_sql(text):
    if not text: return ""
    return text.replace("'", "''")

def parse_count(notes):
    """Simple parser for 'Recite 3x' etc."""
    if not notes: return 1
    import re
    match = re.search(r'(\d+)x', notes)
    if match:
        return int(match.group(1))
    return 1

def process_source():
    categories = {
        "morning-dhikr": "adhkar",
        "evening-dhikr": "adhkar",
        "dhikr-after-salah": "adhkar",
        "daily-dua": "duaa",
        "selected-dua": "duaa"
    }

    all_inserts = []
    total_processed = 0

    for folder, item_type in categories.items():
        folder_path = os.path.join(BASE_DATA_PATH, folder)
        json_file = os.path.join(folder_path, "en.json") # We use English for metadata/structure, but Arabic for text
        
        if not os.path.exists(json_file):
            print(f"Skipping {folder} - file not found.")
            continue

        print(f"Processing {folder}...")
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for entry in data:
            arabic_text = entry.get('arabic', '')
            title = entry.get('title', '')
            source = entry.get('source', '')
            notes = entry.get('notes', '')
            benefits = entry.get('benefits') or entry.get('fawaid', '')
            count = parse_count(notes)
            
            # Combine title and benefits for description
            description = f"{title}. {benefits}".strip()
            
            # Category name in Arabic/English
            folder_map = {
                "morning-dhikr": "أذكار الصباح",
                "evening-dhikr": "أذكار المساء",
                "dhikr-after-salah": "أذكار بعد الصلاة",
                "daily-dua": "أدعية يومية",
                "selected-dua": "أدعية مختارة"
            }
            category_name = folder_map.get(folder, folder)

            sql_row = f"('{escape_sql(category_name)}', '{escape_sql(arabic_text)}', '{escape_sql(source)}', '{item_type}', '{escape_sql(description)}', {count})"
            all_inserts.append(sql_row)
            total_processed += 1

    # Generate SQL in chunks
    chunk_size = 50
    chunks = [all_inserts[i:i + chunk_size] for i in range(0, len(all_inserts), chunk_size)]
    
    with open(SQL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("-- Mass Data Ingestion from dua-dhikr repository\n\n")
        for chunk in chunks:
            f.write("INSERT INTO adhkar (category, text, source, type, description, count) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(" ON CONFLICT DO NOTHING;\n\n")

    print(f"✅ Finished! Total processed: {total_processed}")
    print(f"✅ SQL generated at: {SQL_OUTPUT_PATH}")

if __name__ == "__main__":
    process_source()
