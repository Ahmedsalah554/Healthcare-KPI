/**
 * ===== تعريف أنواع البيانات الأربعة =====
 */

const DATA_TYPES = {
    PERFORMANCE: {
        id: 'performance',
        name: 'مؤشرات الأداء',
        nameEn: 'Performance Indicators',
        icon: '📊',
        color: '#1a73e8',
        description: 'مؤشرات الأداء الأساسية للمنشأة الصحية',
        hasFormula: true,
        hasNumeratorDenominator: true,
        hasScore: false,
        hasCount: false,
        frequency: 'monthly'
    },
    
    EXCELLENCE: {
        id: 'excellence',
        name: 'مؤشرات التميز',
        nameEn: 'Excellence Indicators',
        icon: '⭐',
        color: '#f59e0b',
        description: 'مؤشرات التميز والجودة',
        hasFormula: true,
        hasNumeratorDenominator: true,
        hasScore: false,
        hasCount: false,
        frequency: 'yearly'
    },
    
    MONITORING: {
        id: 'monitoring',
        name: 'المتابعة الشهرية',
        nameEn: 'Monthly Monitoring',
        icon: '📈',
        color: '#10b981',
        description: 'معايير المتابعة والتقييم الشهري',
        hasFormula: false,
        hasNumeratorDenominator: false,
        hasScore: true, // تقييم (2, 1, 0, N/A)
        hasCount: false,
        frequency: 'monthly'
    },
    
    WORKFORCE: {
        id: 'workforce',
        name: 'القوى البشرية',
        nameEn: 'Human Resources',
        icon: '👥',
        color: '#8b5cf6',
        description: 'بيانات الموارد البشرية والإحصائيات',
        hasFormula: false,
        hasNumeratorDenominator: false,
        hasScore: false,
        hasCount: true, // أرقام مباشرة
        frequency: 'monthly'
    }
};

// أنواع المنشآت
const FACILITY_TYPES = {
    hospital: {
        id: 'hospital',
        name: 'مستشفى',
        nameEn: 'Hospital',
        icon: '🏥',
        color: '#ef4444'
    },
    healthCenter: {
        id: 'healthCenter',
        name: 'مركز صحي',
        nameEn: 'Health Center',
        icon: '🏥',
        color: '#3b82f6'
    },
    healthUnit: {
        id: 'healthUnit',
        name: 'وحدة صحية',
        nameEn: 'Health Unit',
        icon: '🏥',
        color: '#22c55e'
    }
};

// الفئات لمؤشرات الأداء
const PERFORMANCE_CATEGORIES = {
    WFM: 'إدارة القوى العاملة',
    UTZ: 'معدلات الاستخدام',
    MP: 'الأداء الطبي',
    PHC: 'الرعاية الأولية',
    IPC: 'مكافحة العدوى',
    PS: 'سلامة المرضى',
    OHS: 'الصحة المهنية',
    MM: 'إدارة الأدوية',
    LAB: 'المختبر',
    DF: 'طب الأسنان'
};

// الفئات لمؤشرات التميز
const EXCELLENCE_CATEGORIES = {
    LEADERSHIP: 'القيادة',
    PLANNING: 'التخطيط الاستراتيجي',
    CUSTOMER: 'التركيز على العملاء',
    MEASUREMENT: 'القياس والتحليل',
    WORKFORCE_FOCUS: 'التركيز على القوى العاملة',
    OPERATIONS: 'العمليات',
    RESULTS: 'النتائج'
};

// الفئات للمتابعة الشهرية
const MONITORING_CATEGORIES = {
    QUALITY: 'معايير الجودة',
    SAFETY: 'معايير السلامة',
    INFECTION: 'معايير مكافحة العدوى',
    PHARMACY: 'معايير الصيدلية',
    EMERGENCY: 'معايير الطوارئ',
    LAB: 'معايير المختبر',
    RADIOLOGY: 'معايير الأشعة'
};

// الفئات للقوى البشرية
const WORKFORCE_CATEGORIES = {
    DOCTORS: 'الأطباء',
    NURSES: 'التمريض',
    TECHNICIANS: 'الفنيون',
    ADMIN: 'الإداريون',
    SUPPORT: 'الخدمات المساندة'
};

// دالة للحصول على الفئات حسب نوع البيانات
function getCategoriesByDataType(dataType) {
    switch(dataType) {
        case 'performance':
            return PERFORMANCE_CATEGORIES;
        case 'excellence':
            return EXCELLENCE_CATEGORIES;
        case 'monitoring':
            return MONITORING_CATEGORIES;
        case 'workforce':
            return WORKFORCE_CATEGORIES;
        default:
            return {};
    }
}

// دالة للحصول على معلومات نوع البيانات
function getDataTypeInfo(dataTypeId) {
    return Object.values(DATA_TYPES).find(dt => dt.id === dataTypeId) || null;
}

// دالة للحصول على جميع أنواع البيانات
function getAllDataTypes() {
    return Object.values(DATA_TYPES);
}
