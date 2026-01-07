export interface ShiaBook {
    bookId: string;
    BookName: string;
    author: string;
    bookDescription: string;
    bookCover: string;
    volume: number;
}

const BASE_URL = "https://www.thaqalayn-api.net/api/v2";

export async function fetchShiaBooks(): Promise<ShiaBook[]> {
    try {
        const response = await fetch(`${BASE_URL}/allbooks`);
        if (!response.ok) throw new Error("Failed to fetch Shia books");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching Shia books:", error);
        return [];
    }
}

export async function fetchShiaHadith(bookId: string, hadithId: string) {
    try {
        const response = await fetch(`${BASE_URL}/${bookId}/${hadithId}`);
        if (!response.ok) throw new Error("Failed to fetch hadith");
        return await response.json();
    } catch (error) {
        console.error("Error fetching hadith:", error);
        return null;
    }
}
