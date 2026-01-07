import urllib.request
import json

ISLAMHOUSE_API_KEY = "paV29H2gm56kvLPy"
ISLAMHOUSE_BASE_URL = "https://api3.islamhouse.com/v3"

def fetch_categories():
    url = f"{ISLAMHOUSE_BASE_URL}/{ISLAMHOUSE_API_KEY}/categories/showall/ar/json"
    print(f"Fetching from: {url}")
    try:
        with urllib.request.urlopen(url, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            if "data" in data:
                print(f"Found {len(data['data'])} categories.")
                with open("islamhouse_categories.txt", "w", encoding="utf-8") as f:
                    for cat in data['data']:
                        name = cat.get('name', '')
                        cat_id = cat.get('id')
                        f.write(f"ID: {cat_id} | Name: {name}\n")
                print("Results written to islamhouse_categories.txt")
            else:
                print("Error or empty data:", data)
    except Exception as e:
        print(f"Error: {e}")

fetch_categories()
