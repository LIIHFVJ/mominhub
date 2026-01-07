import urllib.request
import json

ISLAMHOUSE_API_KEY = "paV29H2gm56kvLPy"
ISLAMHOUSE_BASE_URL = "https://api3.islamhouse.com/v3"

def test_api(category_id):
    url = f"{ISLAMHOUSE_BASE_URL}/{ISLAMHOUSE_API_KEY}/main/showall/ar/{category_id}/1/5/json"
    print(f"Testing URL: {url}")
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            print(f"Status: {response.getcode()}")
            data = json.loads(response.read().decode('utf-8'))
            print(f"Data keys: {data.keys()}")
            if "data" in data and data["data"]:
                print(f"Found {len(data['data'])} items.")
                print(f"First item title: {data['data'][0].get('title')}")
            else:
                print("No data found in response.")
    except Exception as e:
        print(f"Error: {e}")

print("Testing Category 48 (Duaa?):")
test_api(48)
print("\nTesting Category 49 (Adhkar?):")
test_api(49)
