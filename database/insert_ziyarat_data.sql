
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
