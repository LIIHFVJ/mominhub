
-- التحقق من وجود جدول الزيارات
DROP TABLE IF EXISTS adhkar CASCADE;

-- إنشاء جدول جديد بالبنية الصحيحة
CREATE TABLE adhkar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'adhkar',
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة بعض الزيارات النموذجية
INSERT INTO adhkar (title, content, category, type, order_index) VALUES
('زيارة الإمام الحسين (ع)', 
'السلام عليك يا أبا عبد الله، السلام عليك يا ابن رسول الله، السلام عليك يا قتيل الله بنهر كربلاء...', 
'حسينية', 'ziyarat', 1),

('زيارة الإمام الرضا (ع)', 
'السلام عليك يا ولي الله وابن وليه، السلام عليك يا حجة الله وابن حجته...', 
'رضوية', 'ziyarat', 2),

('زيارة أمير المؤمنين (ع)', 
'السلام عليك يا أمير المؤمنين، السلام عليك يا سيد الوصيين...', 
'علوية', 'ziyarat', 3),

('زيارة فاطمة الزهراء (س)', 
'السلام عليك يا فاطمة الزهراء، يا بنت رسول الله...', 
'فاطمية', 'ziyarat', 4),

('زيارة الأئمة في البقيع', 
'السلام عليكم يا أهل بيت النبوة وموضع الرسالة...', 
'بقيع', 'ziyarat', 5);

-- إنشاء فهرس للبحث السريع
CREATE INDEX idx_adhkar_category ON adhkar(category);
CREATE INDEX idx_adhkar_type ON adhkar(type);
CREATE INDEX idx_adhkar_is_active ON adhkar(is_active);
