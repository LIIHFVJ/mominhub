
-- إضافة الزيارات وضمان وجود الأذكار والأدعية
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

-- التأكد من وجود الأذكار والأدعية الأساسية
-- أذكار الصباح
INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار الصباح - آية الكرسي', 
       'اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.', 
       'أذكار الصباح', 'adhkar', 1,
       'من قالها حين يصبح أجير من الجن حتى يمسى ومن قالها حين يمسى أجير من الجن حتى يصبح.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار الصباح - آية الكرسي' AND type = 'adhkar');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار الصباح - الإخلاص والمعوذتين', 
       'قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ. قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ. قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ.', 
       'أذكار الصباح', 'adhkar', 2,
       'من قالها حين يصبح وحين يمسى كفته من كل شىء (الإخلاص والمعوذتين).', 3
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار الصباح - الإخلاص والمعوذتين' AND type = 'adhkar');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار الصباح - التسبيح والتحميد', 
       'سُبْحـانَ اللهِ وَبِحَمْـدِهِ.', 
       'أذكار الصباح', 'adhkar', 3,
       'حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.', 100
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار الصباح - التسبيح والتحميد' AND type = 'adhkar');

-- أذكار المساء
INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار المساء - آية الكرسي', 
       'اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.', 
       'أذكار المساء', 'adhkar', 1,
       'من قالها حين يصبح أجير من الجن حتى يمسى ومن قالها حين يمسى أجير من الجن حتى يصبح.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار المساء - آية الكرسي' AND type = 'adhkar');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار المساء - الإخلاص والمعوذتين', 
       'قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ. قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ. قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ.', 
       'أذكار المساء', 'adhkar', 2,
       'من قالها حين يصبح وحين يمسى كفته من كل شىء (الإخلاص والمعوذتين).', 3
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار المساء - الإخلاص والمعوذتين' AND type = 'adhkar');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار المساء - التسبيح والتحميد', 
       'سُبْحـانَ اللهِ وَبِحَمْـدِهِ.', 
       'أذكار المساء', 'adhkar', 3,
       'حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.', 100
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار المساء - التسبيح والتحميد' AND type = 'adhkar');

-- أذكار النوم
INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار النوم - آية الكرسي', 
       'اللَّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.', 
       'أذكار النوم', 'adhkar', 1,
       'من قرأ آية الكرسي عند النوم لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار النوم - آية الكرسي' AND type = 'adhkar');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار النوم - الإخلاص والمعوذتين', 
       'قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ. قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ. قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ.', 
       'أذكار النوم', 'adhkar', 2,
       'من قرأها حين يصبح وحين يمسى كفته من كل شيء.', 3
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار النوم - الإخلاص والمعوذتين' AND type = 'adhkar');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'أذكار النوم - التسبيح والتحميد', 
       'سُبْحَانَ اللَّهِ (ثلاثاً وثلاثين) وَالْحَمْدُ لِلَّهِ (ثلاثاً وثلاثين) وَاللَّهُ أَكْبَرُ (أربعاً وثلاثينَ).', 
       'أذكار النوم', 'adhkar', 3,
       'أفضل الذكر بعد التسبيح.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'أذكار النوم - التسبيح والتحميد' AND type = 'adhkar');

-- أدعية مختارة
INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'دعاء الاستفتاح', 
       'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ، بِالثَّلْجِ وَالْمَاءِ وَالْبَرَدِ.', 
       'أدعية الصلاة', 'duaa', 1,
       'دعاء يقال في صلاة الليل والنوافل.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'دعاء الاستفتاح' AND type = 'duaa');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'دعاء الركوع', 
       'سُبْحَانَ رَبِّيَ الْعَظِيمِ.', 
       'أدعية الصلاة', 'duaa', 2,
       'يقال في الركوع ثلاث مرات.', 3
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'دعاء الركوع' AND type = 'duaa');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'دعاء السجود', 
       'سُبْحَانَ رَبِّيَ الأَعْلَى.', 
       'أدعية الصلاة', 'duaa', 3,
       'يقال في السجود ثلاث مرات.', 3
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'دعاء السجود' AND type = 'duaa');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'دعاء القنوت', 
       'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ؛ فَإِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ، إِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ، وَلاَ يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ.', 
       'أدعية الصلاة', 'duaa', 4,
       'دعاء القنوت في الوتر.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'دعاء القنوت' AND type = 'duaa');

INSERT INTO adhkar (title, content, category, type, order_index, description, count) 
SELECT 'دعاء الاستخارة', 
       'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ؛ فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ - فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ – فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ.', 
       'أدعية عامة', 'duaa', 5,
       'دعاء صلاة الاستخارة.', 1
WHERE NOT EXISTS (SELECT 1 FROM adhkar WHERE title = 'دعاء الاستخارة' AND type = 'duaa');

-- إنشاء فهرس للبحث السريع إذا لم يكن موجوداً
CREATE INDEX IF NOT EXISTS idx_adhkar_category ON adhkar(category);
CREATE INDEX IF NOT EXISTS idx_adhkar_type ON adhkar(type);
CREATE INDEX IF NOT EXISTS idx_adhkar_is_active ON adhkar(is_active);
