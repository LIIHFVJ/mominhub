
-- إضافة الزيارات فقط دون التأثير على الأذكار والأدعية الموجودة
-- التحقق من وجود الجدول أولاً
DO $$
BEGIN
    -- التحقق من وجود جدول adhkar
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'adhkar') THEN
        -- إنشاء جدول جديد إذا لم يكن موجوداً
        CREATE TABLE adhkar (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'adhkar',
            is_active BOOLEAN DEFAULT true,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            description TEXT,
            count INTEGER DEFAULT 1
        );
    END IF;
END $$;

-- إضافة بعض الزيارات النموذجية (مع التحقق من عدم وجودها مسبقاً)
INSERT INTO adhkar (title, content, category, type, order_index, description) 
SELECT 'زيارة الإمام الحسين (ع)', 
       'السلام عليك يا أبا عبد الله، السلام عليك يا ابن رسول الله، السلام عليك يا قتيل الله بنهر كربلاء...', 
       'حسينية', 'ziyarat', 1,
       'زيارة الإمام الحسين بن علي بن أبي طالب (عليه السلام)'
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة الإمام الحسين (ع)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index, description) 
SELECT 'زيارة الإمام الرضا (ع)', 
       'السلام عليك يا ولي الله وابن وليه، السلام عليك يا حجة الله وابن حجته...', 
       'رضوية', 'ziyarat', 2,
       'زيارة الإمام علي بن موسى الرضا (عليه السلام)'
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة الإمام الرضا (ع)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index, description) 
SELECT 'زيارة أمير المؤمنين (ع)', 
       'السلام عليك يا أمير المؤمنين، السلام عليك يا سيد الوصيين...', 
       'علوية', 'ziyarat', 3,
       'زيارة الإمام علي بن أبي طالب (عليه السلام)'
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة أمير المؤمنين (ع)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index, description) 
SELECT 'زيارة فاطمة الزهراء (س)', 
       'السلام عليك يا فاطمة الزهراء، يا بنت رسول الله...', 
       'فاطمية', 'ziyarat', 4,
       'زيارة السيدة فاطمة الزهراء (عليها السلام)'
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة فاطمة الزهراء (س)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index, description) 
SELECT 'زيارة الأئمة في البقيع', 
       'السلام عليكم يا أهل بيت النبوة وموضع الرسالة...', 
       'بقيع', 'ziyarat', 5,
       'زيارة الأئمة الأربعة في البقيع (عليهم السلام)'
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة الأئمة في البقيع' AND type = 'ziyarat');

-- إنشاء فهرس للبحث السريع إذا لم يكن موجوداً
CREATE INDEX IF NOT EXISTS idx_adhkar_category ON adhkar(category);
CREATE INDEX IF NOT EXISTS idx_adhkar_type ON adhkar(type);
CREATE INDEX IF NOT EXISTS idx_adhkar_is_active ON adhkar(is_active);
