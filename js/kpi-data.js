/**
 * ===== بيانات المؤشرات الكاملة (80+ مؤشر) =====
 */

// أسماء الفئات
const CATEGORY_NAMES = {
    'WFM': 'إدارة القوى العاملة',
    'UTZ': 'معدلات الاستخدام',
    'MP': 'الأداء الطبي',
    'PHC': 'الرعاية الصحية الأولية',
    'IPC': 'مكافحة العدوى',
    'PS': 'سلامة المرضى',
    'OHS': 'الصحة المهنية والسلامة',
    'MM': 'إدارة الأدوية',
    'LAB': 'خدمات المختبر',
    'DF': 'طب الأسنان'
};

// جميع المؤشرات
const ALL_KPIS = {
    // 1. إدارة القوى العاملة (WFM)
    'WFM': [
        {
            code: 'WFM-01',
            name: 'معدل التدريب السنوي للموظفين',
            formula: '(عدد الموظفين المدربين / إجمالي عدد الموظفين) × 100',
            numeratorLabel: 'عدد الموظفين المدربين',
            denominatorLabel: 'إجمالي عدد الموظفين',
            target: 80,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-02',
            name: 'معدل الحضور والانضباط',
            formula: '(عدد أيام الحضور / إجمالي أيام العمل) × 100',
            numeratorLabel: 'عدد أيام الحضور',
            denominatorLabel: 'إجمالي أيام العمل',
            target: 95,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-03',
            name: 'معدل دوران الموظفين',
            formula: '(عدد الموظفين المغادرين / متوسط عدد الموظفين) × 100',
            numeratorLabel: 'عدد الموظفين المغادرين',
            denominatorLabel: 'متوسط عدد الموظفين',
            target: 10,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-04',
            name: 'نسبة الممرضين إلى الأسرة',
            formula: 'عدد الممرضين / عدد الأسرة',
            numeratorLabel: 'عدد الممرضين',
            denominatorLabel: 'عدد الأسرة',
            target: 2,
            unit: 'ممرض/سرير',
            category: 'WFM'
        },
        {
            code: 'WFM-05',
            name: 'معدل رضا الموظفين',
            formula: '(عدد الموظفين الراضين / إجمالي المشاركين) × 100',
            numeratorLabel: 'عدد الموظفين الراضين',
            denominatorLabel: 'إجمالي المشاركين',
            target: 85,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-06',
            name: 'معدل إكمال التقييم السنوي',
            formula: '(عدد التقييمات المكتملة / إجمالي الموظفين) × 100',
            numeratorLabel: 'عدد التقييمات المكتملة',
            denominatorLabel: 'إجمالي الموظفين',
            target: 100,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-07',
            name: 'نسبة الأطباء إلى المرضى',
            formula: 'عدد الأطباء / عدد المرضى اليومي',
            numeratorLabel: 'عدد الأطباء',
            denominatorLabel: 'عدد المرضى اليومي',
            target: 0.1,
            unit: 'طبيب/مريض',
            category: 'WFM'
        },
        {
            code: 'WFM-08',
            name: 'معدل الإجازات المرضية',
            formula: '(أيام الإجازات المرضية / إجمالي أيام العمل) × 100',
            numeratorLabel: 'أيام الإجازات المرضية',
            denominatorLabel: 'إجمالي أيام العمل',
            target: 3,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-09',
            name: 'معدل العمل الإضافي',
            formula: '(ساعات العمل الإضافي / إجمالي ساعات العمل) × 100',
            numeratorLabel: 'ساعات العمل الإضافي',
            denominatorLabel: 'إجمالي ساعات العمل',
            target: 5,
            unit: '%',
            category: 'WFM'
        },
        {
            code: 'WFM-10',
            name: 'معدل التوظيف الجديد',
            formula: '(عدد الموظفين الجدد / إجمالي الموظفين) × 100',
            numeratorLabel: 'عدد الموظفين الجدد',
            denominatorLabel: 'إجمالي الموظفين',
            target: 15,
            unit: '%',
            category: 'WFM'
        }
    ],

    // 2. معدلات الاستخدام (UTZ)
    'UTZ': [
        {
            code: 'UTZ-01',
            name: 'معدل إشغال الأسرة',
            formula: '(عدد الأسرة المشغولة / إجمالي عدد الأسرة) × 100',
            numeratorLabel: 'عدد الأسرة المشغولة',
            denominatorLabel: 'إجمالي عدد الأسرة',
            target: 85,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-02',
            name: 'معدل استخدام غرف العمليات',
            formula: '(ساعات الاستخدام / إجمالي الساعات المتاحة) × 100',
            numeratorLabel: 'ساعات الاستخدام',
            denominatorLabel: 'إجمالي الساعات المتاحة',
            target: 70,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-03',
            name: 'متوسط مدة الإقامة',
            formula: 'إجمالي أيام المرضى / عدد المرضى المخرجين',
            numeratorLabel: 'إجمالي أيام المرضى',
            denominatorLabel: 'عدد المرضى المخرجين',
            target: 4,
            unit: 'يوم',
            category: 'UTZ'
        },
        {
            code: 'UTZ-04',
            name: 'معدل استخدام العيادات الخارجية',
            formula: '(عدد الزيارات / السعة الاستيعابية) × 100',
            numeratorLabel: 'عدد الزيارات',
            denominatorLabel: 'السعة الاستيعابية',
            target: 90,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-05',
            name: 'معدل استخدام أسرة العناية المركزة',
            formula: '(أيام إشغال ICU / إجمالي أيام ICU) × 100',
            numeratorLabel: 'أيام إشغال ICU',
            denominatorLabel: 'إجمالي أيام ICU',
            target: 75,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-06',
            name: 'معدل استخدام غرف الطوارئ',
            formula: '(عدد زيارات الطوارئ / السعة اليومية) × 100',
            numeratorLabel: 'عدد زيارات الطوارئ',
            denominatorLabel: 'السعة اليومية',
            target: 80,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-07',
            name: 'معدل دوران الأسرة',
            formula: 'عدد المرضى المخرجين / عدد الأسرة',
            numeratorLabel: 'عدد المرضى المخرجين',
            denominatorLabel: 'عدد الأسرة',
            target: 30,
            unit: 'مريض/سرير',
            category: 'UTZ'
        },
        {
            code: 'UTZ-08',
            name: 'معدل استخدام المعدات الطبية',
            formula: '(ساعات الاستخدام / إجمالي الساعات) × 100',
            numeratorLabel: 'ساعات الاستخدام',
            denominatorLabel: 'إجمالي الساعات',
            target: 60,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-09',
            name: 'معدل إلغاء العمليات',
            formula: '(عدد العمليات الملغاة / إجمالي العمليات المجدولة) × 100',
            numeratorLabel: 'عدد العمليات الملغاة',
            denominatorLabel: 'إجمالي العمليات المجدولة',
            target: 5,
            unit: '%',
            category: 'UTZ'
        },
        {
            code: 'UTZ-10',
            name: 'معدل استخدام الأشعة',
            formula: '(عدد الفحوصات / السعة اليومية) × 100',
            numeratorLabel: 'عدد الفحوصات',
            denominatorLabel: 'السعة اليومية',
            target: 85,
            unit: '%',
            category: 'UTZ'
        }
    ],

    // 3. الأداء الطبي (MP)
    'MP': [
        {
            code: 'MP-01',
            name: 'معدل الوفيات الإجمالي',
            formula: '(عدد الوفيات / إجمالي المرضى) × 100',
            numeratorLabel: 'عدد الوفيات',
            denominatorLabel: 'إجمالي المرضى',
            target: 1,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-02',
            name: 'معدل العدوى المكتسبة من المستشفى',
            formula: '(عدد حالات العدوى / إجمالي المرضى) × 100',
            numeratorLabel: 'عدد حالات العدوى',
            denominatorLabel: 'إجمالي المرضى',
            target: 2,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-03',
            name: 'معدل إعادة الإدخال خلال 30 يوم',
            formula: '(عدد المعادين / إجمالي المخرجين) × 100',
            numeratorLabel: 'عدد المعادين',
            denominatorLabel: 'إجمالي المخرجين',
            target: 8,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-04',
            name: 'معدل رضا المرضى',
            formula: '(عدد المرضى الراضين / إجمالي المشاركين) × 100',
            numeratorLabel: 'عدد المرضى الراضين',
            denominatorLabel: 'إجمالي المشاركين',
            target: 90,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-05',
            name: 'معدل المضاعفات الجراحية',
            formula: '(عدد المضاعفات / إجمالي العمليات) × 100',
            numeratorLabel: 'عدد المضاعفات',
            denominatorLabel: 'إجمالي العمليات',
            target: 3,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-06',
            name: 'معدل نجاح العمليات الجراحية',
            formula: '(عدد العمليات الناجحة / إجمالي العمليات) × 100',
            numeratorLabel: 'عدد العمليات الناجحة',
            denominatorLabel: 'إجمالي العمليات',
            target: 98,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-07',
            name: 'معدل الشكاوى الطبية',
            formula: '(عدد الشكاوى / إجمالي المرضى) × 100',
            numeratorLabel: 'عدد الشكاوى',
            denominatorLabel: 'إجمالي المرضى',
            target: 2,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-08',
            name: 'معدل الوقت المناسب للتدخل الطبي',
            formula: '(حالات التدخل في الوقت / إجمالي الحالات) × 100',
            numeratorLabel: 'حالات التدخل في الوقت',
            denominatorLabel: 'إجمالي الحالات',
            target: 95,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-09',
            name: 'معدل تقييم الألم',
            formula: '(عدد التقييمات / إجمالي المرضى) × 100',
            numeratorLabel: 'عدد التقييمات',
            denominatorLabel: 'إجمالي المرضى',
            target: 100,
            unit: '%',
            category: 'MP'
        },
        {
            code: 'MP-10',
            name: 'معدل المتابعة بعد الخروج',
            formula: '(عدد المتابعات / إجمالي المخرجين) × 100',
            numeratorLabel: 'عدد المتابعات',
            denominatorLabel: 'إجمالي المخرجين',
            target: 85,
            unit: '%',
            category: 'MP'
        }
    ],

    // 4. الرعاية الصحية الأولية (PHC)
    'PHC': [
        {
            code: 'PHC-01',
            name: 'معدل التطعيم للأطفال',
            formula: '(عدد الأطفال المطعمين / إجمالي الأطفال) × 100',
            numeratorLabel: 'عدد الأطفال المطعمين',
            denominatorLabel: 'إجمالي الأطفال](#)*

