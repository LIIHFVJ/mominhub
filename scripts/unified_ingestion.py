import json
import os
import urllib.request
import urllib.parse
import re
import time

# Paths
BASE_DATA_PATH = r"c:\Users\ronal\OneDrive\Desktop\موقع قران\momin-hub\dua-dhikr\data\dua-dhikr"
SQL_OUTPUT_PATH = r"c:\Users\ronal\OneDrive\Desktop\موقع قران\momin-hub\migration_v5_data_unified.sql"
ISLAMHOUSE_API_KEY = "paV29H2gm56kvLPy"
ISLAMHOUSE_BASE_URL = "https://api3.islamhouse.com/v3"

def escape_sql(text):
    if not text: return ""
    return str(text).replace("'", "''")

TRANSLATION_MAP = {
    "HR. al-Bukhari": "رواه البخاري",
    "HR. Bukhari": "رواه البخاري",
    "HR. Muslim": "رواه مسلم",
    "HR. Abu Dawud": "رواه أبو داود",
    "HR. at-Tirmidzi": "رواه الترمذي",
    "at-Tirmidzi": "الترمذي",
    "HR. an-Nasa'i": "رواه النسائي",
    "an-Nasa'i": "النسائي",
    "HR. Ibn Majah": "رواه ابن ماجة",
    "Ibn Majah": "ابن ماجة",
    "HR. Ahmad": "رواه أحمد",
    "Ahmad": "رواه أحمد",
    "Al-Bukhari": "البخاري",
    "Muslim": "مسلم",
    "Abu Dawud": "أبو داود",
    "Abu Hurairah radhiyallahu 'anhu": "أبي هريرة رضي الله عنه",
    "Abu Hurairah": "أبي هريرة",
    "radhiyallahu 'anhu": "رضي الله عنه",
    "radhiyallahu 'anhuma": "رضي الله عنهما",
    "sallallahu 'alayhi wa sallam": "صلى الله عليه وسلم",
    "Sharh Muslim": "شرح مسلم",
    "Sahih at-Targhib wat Tarhib": "صحيح الترغيب والترهيب",
    "Sahih at-Targhib": "صحيح الترغيب",
    "Sahih al-Adab al-Mufrad": "صحيح الأدب المفرد",
    "al-Adab al-Mufrad": "الأدب المفرد",
    "Sahih Ibni Majah": "صحيح ابن ماجة",
    "Fat-hul Baari": "فتح الباري",
    "Sahih al-Jami": "صحيح الجامع",
    "Mishkat al-Masabih": "مشكاة المصابيح",
    "and others": "وغيرهم",
    "with": "بـ",
    "of": "من",
}

def translate_to_arabic(text):
    if not text: return ""
    
    text = re.sub(r'\s+', ' ', text).strip()

    # Priority mapping for common phrases and names
    P_MAP = {
        "this wording is the wording of": "هذا اللفظ لـ",
        "said that the chain of this hadith is hasan": "قال إن إسناد هذا الحديث حسن",
        "said that the chain of this hadith is sahih": "قال إن إسناد هذا الحديث صحيح",
        "said that this hadith is sahih": "قال إن هذا الحديث صحيح",
        "said that this hadith is hasan": "قال إن هذا الحديث حسن",
        "Al-Hafiz Abu Tahir said that": "قال الحافظ أبو طاهر",
        "Al-Hafiz Abu Tahir": "الحافظ أبو طاهر",
        "Abu Tahir": "أبو طاهر",
        "Juwairiyah binti al-Harits": "جويرية بنت الحارث",
        "Abdullah ibn Mas'ud": "عبد الله بن مسعود",
        "ibn Mas'ud": "بن مسعود",
        "Mas'ud": "مسعود",
        "Ibn Umar": "ابن عمر",
        "Ummu Salamah": "أم سلمة",
        "from Ummu Salamah": "عن أم سلمة",
        "Sahih at-Targhib wat Tarhib": "صحيح الترغيب والترهيب",
        "Sahih at-Targhib": "صحيح الترغيب",
        "Sahih al-Adab al-Mufrad": "صحيح الأدب المفرد",
        "Amalul Yaum wal Lailah": "عمل اليوم والليلة",
        "Bulugh al-Maram": "بلوغ المرام",
        "Mishkat al-Masabih": "مشكاة المصابيح",
        "Fat-hul Baari": "فتح الباري",
        "Fat-hul Bari": "فتح الباري",
        "Al-Kubro": "الكبرى",
        "as-Saghir": "الصغير",
        "as-Sahihah": "السلسلة الصحيحة",
        "radhiyallahu 'anhuma": "رضي الله عنهما",
        "radhiyallahu 'anhu": "رضي الله عنه",
        "radhiyallahu 'anha": "رضي الله عنها",
        "sallallahu 'alayhi wa sallam": "صلى الله عليه وسلم",
        "Upon Entering The Morning": "عند الصباح",
        "Upon Entering The Evening": "عند المساء",
        "Entering The Morning": "دخول الصباح",
        "Entering The Evening": "دخول المساء",
        "The Natural Religion of Islam": "فطرة الإسلام",
        "The Natural Religion": "فطرة الإسلام",
        "The Word of Sincerity": "كلمة الإخلاص",
        "The Religion of our Prophet Muhammad": "دين نبينا محمد",
        "The World and Hereafter": "الدنيا والآخرة",
        "The Hereafter": "الآخرة",
        "Asking for Protection from": "الاستعاذة من",
        "Asking for Protection": "الاستعاذة",
        "The Grace of Allah": "فضل الله",
        "Sayyid al-Istighfar": "سيد الاستغفار",
        "Dua for Protection and Good Health": "دعاء للعافية",
        "Dua for Salvation in The World and Hereafter": "دعاء للنجاة في الدنيا والآخرة",
        "Dua for Protection from Shaytan Whispers": "الاستعاذة من وساوس الشيطان",
        "Asking for Protection from All Harms": "الاستعاذة من كل ضر",
        "Declaration of Pleasure by Allah, Islam, and the Prophet Muhammad": "الرضا بالله وبالإسلام وبمحمد صلى الله عليه وسلم",
        "Asking Allah for Guidance": "سؤال الله الهداية",
        "Daily Tasbih and Tahmid": "تسبيح وتحميد يومي",
        "Tawheed Dhikr": "ذكر التوحيد",
        "Read Tasbih": "قراءة التسبيح",
        "Useful Knowledge, Good Sustenance, and Accepted Deeds": "علم نافع ورزق طيب وعمل متقبل",
        "Istighfar 100x a Day": "الاستغفار 100 مرة في اليوم",
        "Dua for": "دعاء لـ",
        "Declaration of": "إعلان الـ",
        "Ibnus Sunni": "ابن السني",
        "al-Bukhari": "البخاري",
        "al-Bukari": "البخاري",
        "at-Tirmidzi": "الترمذي",
        "at-Tirmidhi": "الترمذي",
        "an-Nasa'i": "النسائي",
        "Ibnu Majah": "ابن ماجة",
        "Ibn Majah": "ابن ماجة",
        "Abu Dawud": "أبو داود",
        "Bukhari": "البخاري",
        "Muslim": "مسلم",
        "Ahmad": "أحمد",
        "Al-Hakim": "الحاكم",
        "Hibban": "حبان",
        "Hajar": "حجر",
        "ad-Darimi": "الدارمي",
        "al-Adab al-Mufrad": "الأدب المفرد",
        "Sharh Shahih": "شرح صحيح",
        "Sharh Muslim": "شرح مسلم",
        "al-Harith": "الحارث",
        "al-Mustadrak": "المستدرك",
        "al-Baihaqi": "البيهقي",
        "al-Albani": "الألباني",
        "al-Irwa'": "الإرواء",
        "Ayatul Kursi": "آية الكرسي",
        "Ayat al-Kursi": "آية الكرسي",
        "Al-Ikhlas": "سورة الإخلاص",
        "Al-Falaq": "سورة الفلق",
        "An-Nas": "سورة الناس",
        "Al-Baqarah": "البقرة",
        "Ali Imran": "آل عمران",
        "Ibrahim": "إبراهيم",
        "Al-Mu'minun": "المؤمنون",
        "Adeen": "دين",
        "Pleasure": "رضا",
        "and others": "وغيرهم",
        "and": "و",
        "from": "من",
        "with": "بـ",
        "of": "من",
        "in": "في",
        "by": "بواسطة",
        "this hadith is": "هذا الحديث",
        "this hadith": "هذا الحديث",
        "all_inserts": "جميع المدخلات",
        "Narrated by": "رواه",
        "all compilers from": "كل مخرجي",
        "the Sunan books": "كتب السنن",
        "the Sunan": "السنن",
        "except Nasa'i": "إلا النسائي",
        "authenticated by": "صححه",
        "said that the": "قال إن",
        "said that": "ذكر أن",
        "is": "هو",
        "this": "هذا",
        "word": "لفظ",
        "hasan": "حسن",
        "sahih": "صحيح",
        "others": "آخرين",
        "see": "انظر",
        "binti": "بنت",
        "bint": "بنت",
    }
    
    # Process replacements using word boundaries \b
    sorted_keys = sorted(P_MAP.keys(), key=len, reverse=True)
    for eng in sorted_keys:
        ara = P_MAP[eng]
        pattern = re.compile(rf'\b{re.escape(eng)}\b', re.IGNORECASE)
        text = pattern.sub(ara, text)

    # 3. Handle abbreviations
    text = re.compile(r'\bHR\.', re.I).sub('رواه', text)
    text = re.compile(r'\bNo\.', re.I).sub('رقم', text)
    text = re.compile(r'\bVol\.', re.I).sub('جزء', text)
    text = re.compile(r'\bp\.', re.I).sub('ص', text)
    
    # 4. Cleanup Roman Numerals (v-indexes)
    roman_map = {"XII": "12", "XI": "11", "X": "10", "IX": "9", "VIII": "8", "VII": "7", "VI": "6", "V": "5", "IV": "4", "III": "3", "II": "2"}
    for rom, num in roman_map.items():
        text = re.sub(rf'\b{rom}\b', num, text)

    return text.strip()

def parse_count(notes):
    """Simple parser for 'Recite 3x' etc."""
    if not notes: return 1
    match = re.search(r'(\d+)x', notes)
    if match:
        return int(match.group(1))
    return 1

def fetch_islamhouse(category_id, category_name, item_type):
    items = []
    page = 1
    print(f"Fetching from IslamHouse: {category_name} (ID: {category_id})...")
    
    while True:
        url = f"{ISLAMHOUSE_BASE_URL}/{ISLAMHOUSE_API_KEY}/main/showall/ar/{category_id}/{page}/50/json"
        try:
            with urllib.request.urlopen(url, timeout=15) as response:
                if response.getcode() != 200:
                    break
                data = json.loads(response.read().decode('utf-8'))
            
            if "data" not in data or not data["data"]:
                break
            
            for item in data["data"]:
                title = item.get("title", "")
                description = item.get("description", "")
                api_url = item.get("api_url", "")
                if not title: continue
                
                sql_row = f"('{escape_sql(category_name)}', '{escape_sql(title)}', '{escape_sql(api_url)}', '{item_type}', '{escape_sql(description)}', 1)"
                items.append(sql_row)
            
            links = data.get("links", {})
            current_page = links.get("current_page", page)
            pages_number = links.get("pages_number", page)
            
            print(f"  Page {current_page}/{pages_number} done. ({len(items)} items so far)")
            
            if current_page >= pages_number:
                break
                
            page += 1
            time.sleep(0.5) # Subtle rate limiting
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break
            
    return items

def process_dua_dhikr():
    categories = {
        "morning-dhikr": "adhkar",
        "evening-dhikr": "adhkar",
        "dhikr-after-salah": "adhkar",
        "daily-dua": "duaa",
        "selected-dua": "duaa"
    }

    # Use IDs that match the frontend static categories where possible
    folder_map = {
        "morning-dhikr": "morning",
        "evening-dhikr": "evening",
        "dhikr-after-salah": "prayer",
        "daily-dua": "أدعية يومية",
        "selected-dua": "أدعية مختارة"
    }

    adhkar_inserts = []
    
    for folder, item_type in categories.items():
        folder_path = os.path.join(BASE_DATA_PATH, folder)
        json_file = os.path.join(folder_path, "en.json")
        
        if not os.path.exists(json_file):
            continue

        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for entry in data:
            arabic_text = entry.get('arabic', '')
            title = entry.get('title', '')
            source = entry.get('source', '')
            notes = entry.get('notes', '')
            benefits = entry.get('benefits') or entry.get('fawaid', '')
            count = parse_count(notes)
            
            # Translate fields
            final_source = translate_to_arabic(source)
            final_title = translate_to_arabic(title)
            
            # For description, we want it fully translated too
            final_description = final_title
            if benefits:
                final_description = translate_to_arabic(f"{title}. {benefits}")
            else:
                final_description = final_title
            
            category_id = folder_map.get(folder, folder)

            sql_row = f"('{escape_sql(category_id)}', '{escape_sql(arabic_text)}', '{escape_sql(final_source)}', '{item_type}', '{escape_sql(final_description)}', {count})"
            adhkar_inserts.append(sql_row)
            
    return adhkar_inserts

def main():
    print("🚀 Starting Unified Data Ingestion...")
    
    # 1. IslamHouse Data
    islamhouse_duaa = fetch_islamhouse(48, "أدعية من إسلام هاوس", "duaa")
    islamhouse_adhkar = fetch_islamhouse(49, "أذكار من إسلام هاوس", "adhkar")
    
    # 2. Dua-Dhikr Data
    local_data = process_dua_dhikr()
    
    all_inserts = islamhouse_duaa + islamhouse_adhkar + local_data
    
    print(f"📊 Total items collected: {len(all_inserts)}")
    
    # Generate SQL
    chunk_size = 50
    chunks = [all_inserts[i:i + chunk_size] for i in range(0, len(all_inserts), chunk_size)]
    
    with open(SQL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("-- Unified Data Ingestion: Clear Old Data + Insert New Fully Translated Data\n\n")
        f.write("-- 1. DELETE existing data to ensure a clean refresh\n")
        f.write("DELETE FROM adhkar;\n\n")
        
        f.write("-- 2. INSERT new data\n")
        for chunk in chunks:
            f.write("INSERT INTO adhkar (category, text, source, type, description, count) VALUES\n")
            f.write(",\n".join(chunk))
            f.write(" ON CONFLICT DO NOTHING;\n\n")

    print(f"✅ Finished! SQL generated at: {SQL_OUTPUT_PATH}")

if __name__ == "__main__":
    main()
