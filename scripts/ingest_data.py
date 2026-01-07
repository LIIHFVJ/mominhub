import json
import os

# Paths
JSON_PATH = r"c:\Users\ronal\OneDrive\Desktop\موقع قران\momin-hub\azkar.json"
SQL_PATH = r"c:\Users\ronal\OneDrive\Desktop\موقع قران\momin-hub\migration_v5_data.sql"

def escape_sql(text):
    if not text: return ""
    return text.replace("'", "''")

def process_data():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    rows = data.get('rows', [])
    adhkar_inserts = []
    
    print(f"Processing {len(rows)} records...")

    for row in rows:
        category_name = row[0]
        text = row[1]
        description = row[2]
        count = row[3] if len(row) > 3 else 1
        reference = row[4] if len(row) > 4 else ""
        
        # Classification logic
        item_type = 'adhkar'
        if "دعاء" in category_name:
            item_type = 'duaa'
        
        # Schema: (category, text, source, type, description, count)
        sql_row = f"('{escape_sql(category_name)}', '{escape_sql(text)}', '{escape_sql(reference)}', '{item_type}', '{escape_sql(description)}', {count})"
        adhkar_inserts.append(sql_row)
    
    # Generate SQL
    chunk_size = 100
    chunks = [adhkar_inserts[i:i + chunk_size] for i in range(0, len(adhkar_inserts), chunk_size)]
    
    sql_script = "-- Data Ingestion Migration V5\n\n"
    for chunk in chunks:
        sql_script += "INSERT INTO adhkar (category, text, source, type, description, count) VALUES\n"
        sql_script += ",\n".join(chunk)
        sql_script += " ON CONFLICT DO NOTHING;\n\n"
        
    with open(SQL_PATH, "w", encoding="utf-8") as f:
        f.write(sql_script)
    
    print(f"✅ SQL migration generated at: {SQL_PATH}")
    print(f"Total items processed: {len(adhkar_inserts)}")

if __name__ == "__main__":
    process_data()
