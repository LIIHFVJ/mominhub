import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Ensure .env is loaded correctly from root
const rootEnvPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
}

let genAI: GoogleGenerativeAI | null = null;
let apiKey: string | undefined = undefined;

function initializeGemini() {
    if (genAI) return { genAI, apiKey };

    apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey.trim());
        console.log("[Gemini Service] Initialized with key starting with:", apiKey.substring(0, 7));
    } else {
        console.error("[Gemini Service] API Key is missing in process.env");
    }
    return { genAI, apiKey };
}

export async function askGemini(question: string, context?: 'sunni' | 'shia'): Promise<string> {
    const { genAI: ai, apiKey: key } = initializeGemini();
    
    if (!ai || !key) {
        console.error("[Gemini] API Key is missing - Initialization failed");
        return "عذراً، خدمة الفتاوى الذكية غير مفعلة حالياً (يرجى التأكد من ضبط مفتاح API في ملف .env باسم GEMINI_API_KEY).";
    }

    try {
        // List of models to try in order of preference
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let lastError: any = null;
        let successfulText: string | null = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Gemini] Attempting connection using model: ${modelName}...`);
                const model = ai.getGenerativeModel({ model: modelName });

                let contextPrompt = "";
                if (context === 'shia') {
                    contextPrompt = "أجب وفق المذهب الجعفري (الشيعي) بالاعتماد على المصادر الشيعية المعتبرة.";
                } else if (context === 'sunni') {
                    contextPrompt = "أجب وفق مذهب أهل السنة والجماعة بالاعتماد على المصادر السنية المعتبرة.";
                }

                const prompt = `أنت مساعد إسلامي متخصص في منصة "رفيق المؤمن". سألك أحد المستخدمين: "${question}". ${contextPrompt}
يجب الالتزام بالقواعد التالية:
1. **الأمانة العلمية**: اعتمد على القرآن والسنة ومصادر التشريع الأساسية.
2. **الحذر من الفتوى**: لا تحلل ولا تحرم من عندك في مسائل لا تملك فيها دليلاً شرعياً صريحاً. إذا لم تجد إجابة مباشرة، قل بوضوح: "هذه المسألة تحتاج لاستشارة مختص" أو "لا علم لي".
3. **الأسلوب**: أجب بلغة عربية فصحى ميسرة ومهذبة.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                successfulText = response.text();
                
                if (successfulText) {
                    console.log(`[Gemini] Success with model: ${modelName}`);
                    break;
                }
            } catch (e: any) {
                console.warn(`[Gemini] Model ${modelName} failed: ${e.message}`);
                lastError = e;
                // Continue to next model
            }
        }

        if (successfulText) return successfulText;
        if (lastError) throw lastError;
        
        throw new Error("All models failed to respond");
    } catch (error: any) {
        console.error(`[Gemini Error Details] Message: ${error.message}, Status: ${error.status}`);

        const errorMessage = error.message || "";
        
        if (errorMessage.includes("API_KEY_INVALID")) {
            return "خطأ: مفتاح API الخاص بـ Gemini غير صالح. يرجى التأكد من المفتاح في ملف .env.";
        }
        
        if (errorMessage.includes("model not found") || errorMessage.includes("404")) {
            return `خطأ: طراز الذكاء الاصطناعي (gemini-1.5-flash) غير متوفر حالياً لهذا المفتاح. يرجى التأكد من تفعيل Gemini API في Google Cloud Console أو استخدام مفتاح صالح من Google AI Studio.`;
        }

        if (errorMessage.includes("quota") || errorMessage.includes("429")) {
            return "عذراً، تم تجاوز حصة الاستخدام المجانية (Quota) لخدمة Gemini. يرجى المحاولة لاحقاً.";
        }

        if (errorMessage.includes("safety")) {
            return "عذراً، لا يمكن الإجابة على هذا الاستفسار بسبب سياسات السلامة الخاصة بالذكاء الاصطناعي.";
        }

        return `عذراً، حدث خطأ أثناء الاتصال بخدمة الاستشارة الذكية: ${error.message || "الخدمة غير متوفرة حالياً"}`;
    }
}
