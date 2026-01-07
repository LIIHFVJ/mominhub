
-- التحقق من وجود جدول الزيارات
DO $$
DECLARE
    backup_name TEXT;
BEGIN
    -- التحقق من وجود جدول adhkar
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'adhkar') THEN
        -- التحقق من بنية الجدول الحالي
        -- إذا كان الجدول موجوداً ببنية مختلفة، سنقوم بإنشاء جدول جديد
        -- وإعادة تسمية الجدول القديم
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'adhkar' AND column_name = 'title') THEN
            -- إعادة تسمية الجدول القديم
            backup_name := 'adhkar_backup_' || floor(EXTRACT(EPOCH FROM NOW()));
            EXECUTE format('ALTER TABLE adhkar RENAME TO %I', backup_name);
            
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
        END IF;
    ELSE
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
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- إضافة بعض الزيارات النموذجية (مع التحقق من عدم وجودها مسبقاً)
INSERT INTO adhkar (title, content, category, type, order_index) 
SELECT 'زيارة الإمام الحسين (ع)', 
       'السلام عليك يا أبا عبد الله، السلام عليك يا ابن رسول الله، السلام عليك يا قتيل الله بنهر كربلاء...', 
       'حسينية', 'ziyarat', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة الإمام الحسين (ع)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index) 
SELECT 'زيارة الإمام الرضا (ع)', 
       'السلام عليك يا ولي الله وابن وليه، السلام عليك يا حجة الله وابن حجته...', 
       'رضوية', 'ziyarat', 2
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة الإمام الرضا (ع)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index) 
SELECT 'زيارة أمير المؤمنين (ع)', 
       'السلام عليك يا أمير المؤمنين، السلام عليك يا سيد الوصيين...', 
       'علوية', 'ziyarat', 3
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة أمير المؤمنين (ع)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index) 
SELECT 'زيارة فاطمة الزهراء (س)', 
       'السلام عليك يا فاطمة الزهراء، يا بنت رسول الله...', 
       'فاطمية', 'ziyarat', 4
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة فاطمة الزهراء (س)' AND type = 'ziyarat');

INSERT INTO adhkar (title, content, category, type, order_index) 
SELECT 'زيارة الأئمة في البقيع', 
       'السلام عليكم يا أهل بيت النبوة وموضع الرسالة...', 
       'بقيع', 'ziyarat', 5
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'زيارة الأئمة في البقيع' AND type = 'ziyarat');

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_adhkar_category ON adhkar(category);
CREATE INDEX IF NOT EXISTS idx_adhkar_type ON adhkar(type);
CREATE INDEX IF NOT EXISTS idx_adhkar_is_active ON adhkar(is_active);
