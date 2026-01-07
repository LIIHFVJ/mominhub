export interface SunniBook {
    id: string;
    title: string;
    author: string;
    description: string;
    url: string; // PDF link or page link
}

const API_KEY = "paV29H2gm56kvLP";
const BASE_URL = "https://api3.islamhouse.com/v3";

export async function fetchSunniBooks(): Promise<SunniBook[]> {
    try {
        // Attempt to fetch from IslamHouse API
        // Category ID 1 often refers to 'Books' in general listings or we search for it.
        // Documentation says: get-category-items/ar/books/showall/1/25/json
        const response = await fetch(`${BASE_URL}/${API_KEY}/main/get-category-items/ar/books/showall/1/25/json`);

        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                return data.data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    author: item.author_name || "Unknown",
                    description: item.description,
                    url: item.attachments?.[0]?.url || item.original_url
                }));
            }
        }
    } catch (error) {
        console.warn("IslamHouse API failed, falling back to static list", error);
    }

    // Fallback Static List of Major Sunni Books
    return [
        {
            id: "bukhari",
            title: "صحيح البخاري",
            author: "محمد بن إسماعيل البخاري",
            description: "أصح الكتب بعد كتاب الله.",
            url: "https://waqfeya.net/book.php?bid=1323" // Example link, ideally we serve PDFs
        },
        {
            id: "muslim",
            title: "صحيح مسلم",
            author: "مسلم بن الحجاج",
            description: "من أهم كتب الحديث عند المسلمين.",
            url: "https://waqfeya.net/book.php?bid=1711"
        },
        {
            id: "riyad",
            title: "رياض الصالحين",
            author: "الإمام النووي",
            description: "كتاب يجمع الأحاديث الصحيحة في الفضائل والآداب.",
            url: ""
        }
    ];
}
