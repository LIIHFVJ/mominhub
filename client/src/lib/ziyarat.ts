
import { supabase } from './supabase';

export interface Ziyarat {
    id: string;
    title: string;
    content: string;
    category: string;
    type: string;
    is_active: boolean;
    order_index: number;
    created_at?: string;
    updated_at?: string;
}

// جلب جميع الزيارات
export const fetchAllZiyarat = async (): Promise<Ziyarat[]> => {
    const { data, error } = await supabase
        .from('adhkar')
        .select('*')
        .eq('type', 'ziyarat')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
};

// جلب الزيارات حسب الفئة
export const fetchZiyaratByCategory = async (category: string): Promise<Ziyarat[]> => {
    const { data, error } = await supabase
        .from('adhkar')
        .select('*')
        .eq('type', 'ziyarat')
        .eq('category', category)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
};

// جلب فئات الزيارات
export const fetchZiyaratCategories = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('adhkar')
        .select('category')
        .eq('type', 'ziyarat')
        .eq('is_active', true);

    if (error) throw error;

    // استخراج الفئات الفريدة
    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories;
};

// إضافة زيارة جديدة
export const addZiyarat = async (ziyarat: Omit<Ziyarat, 'id' | 'created_at' | 'updated_at'>): Promise<Ziyarat> => {
    const { data, error } = await supabase
        .from('adhkar')
        .insert([ziyarat])
        .select();

    if (error) throw error;
    return data?.[0] as Ziyarat;
};

// تحديث زيارة موجودة
export const updateZiyarat = async (id: string, updates: Partial<Ziyarat>): Promise<Ziyarat> => {
    const { data, error } = await supabase
        .from('adhkar')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data?.[0] as Ziyarat;
};

// حذف زيارة (تغيير is_active إلى false)
export const deleteZiyarat = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('adhkar')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
};
