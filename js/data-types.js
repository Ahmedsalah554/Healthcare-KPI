/**
 * ===== تعريف أنواع البيانات الأربعة =====
 */

const DATA_TYPES = {
    performance: {
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
        frequency: 'monthly' // شهري
    },
    
    excellence: {
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
        frequency: 'yearly' // سنوي
    },
    
    monitoring: {
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
    
    workforce: {
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
    UTZ: 'استخدام الأسرة',
    MP: 'إدارة المرضى',
    ST: 'الجراحة',
    FM: 'الإدارة المالية',
    IMT: 'العلاج المكثف',
    MM: 'إدارة الأدوية',
    LAB: 'المختبر',
    PS: 'سلامة المرضى',
    IPC: 'مكافحة العدوى',
    OHS: 'الصحة المهنية',
    PHC: 'الرعاية الصحية الأولية'
};

// الإدارات المسؤولة (لمؤشرات التميز)
const EXCELLENCE_DEPARTMENTS = {
    'DEPT_PREV': 'إدارة الوقائي',
    'DEPT_QUALITY': 'إدارة الجودة',
    'DEPT_SAFETY': 'إدارة السلامة والصحة المهنية',
    'DEPT_ENV': 'إدارة الرصد البيئي',
    'DEPT_LIVER': 'إدارة الفيروسات الكبدية',
    'DEPT_EMERGENCY': 'إدارة الطوارئ',
    'DEPT_NURSING': 'إدارة التمريض',
    'DEPT_PHARMACY': 'إدارة الصيدلة'
};

// أقسام المتابعة الشهرية
const MONITORING_SECTIONS = {
    'SEC_HEALTH_SERVICES': 'الطلاب الصحي والخدمات',
    'SEC_LEADERSHIP': 'القيادة والإدارة',
    'SEC_HR': 'الموارد البشرية',
    'SEC_MEDICAL': 'المعايير الطبية',
    'SEC_INFECTION': 'مكافحة العدوى',
    'SEC_SAFETY': 'السلامة'
};

// فئات القوى البشرية
const WORKFORCE_CATEGORIES = {
    'staff': {
        id: 'staff',
        name: 'الموظفين',
        fields: [
            { id: 'saudiDoctors', name: 'أطباء سعوديون', unit: 'عدد' },
            { id: 'nonSaudiDoctors', name: 'أطباء غير سعوديين', unit: 'عدد' },
            { id: 'pharmacists', name: 'صيادلة', unit: 'عدد' },
            { id: 'physiotherapy', name: 'علاج طبيعي', unit: 'عدد' },
            { id: 'dentists', name: 'أطباء أسنان', unit: 'عدد' },
            { id: 'nurses', name: 'تمريض', unit: 'عدد' },
            { id: 'chemists', name: 'كيميائيون', unit: 'عدد' },
            { id: 'administrative', name: 'إداريون', unit: 'عدد' },
            { id: 'workers', name: 'عمال', unit: 'عدد' }
        ]
    },
    'statistics': {
        id: 'statistics',
        name: 'الإحصائيات الشهرية',
        fields: [
            { id: 'emergencyPatients', name: 'مرضى الطوارئ', unit: 'عدد' },
            { id: 'outpatientVisits', name: 'زيارات العيادات الخارجية', unit: 'عدد' },
            { id: 'deaths', name: 'حالات الوفاة', unit: 'عدد' },
            { id: 'criticalCare', name: 'حالات الرعاية المركزة', unit: 'عدد' },
            { id: 'specializedServices', name: 'الخدمات التخصصية', unit: 'عدد' },
            { id: 'nursingHours', name: 'ساعات التمريض', unit: 'ساعة' },
            { id: 'administrativeLoad', name: 'العبء الإداري', unit: 'عدد' }
        ]
    }
};

// تنسيق أنواع المنشآت للعرض
function getApplicableFacilitiesText(applicableTo) {
    const facilities = [];
    if (applicableTo.hospital) facilities.push('مستشفى');
    if (applicableTo.healthCenter) facilities.push('مركز صحي');
    if (applicableTo.healthUnit) facilities.push('وحدة صحية');
    
    if (facilities.length === 3) return 'الكل';
    if (facilities.length === 0) return 'غير محدد';
    return facilities.join('، ');
}

// الحصول على اسم الفئة حسب نوع البيانات
function getCategoryName(dataType, categoryCode) {
    if (dataType === 'performance') {
        return PERFORMANCE_CATEGORIES[categoryCode] || categoryCode;
    } else if (dataType === 'excellence') {
        return EXCELLENCE_DEPARTMENTS[categoryCode] || categoryCode;
    } else if (dataType === 'monitoring') {
        return MONITORING_SECTIONS[categoryCode] || categoryCode;
    } else if (dataType === 'workforce') {
        return WORKFORCE_CATEGORIES[categoryCode]?.name || categoryCode;
    }
    return categoryCode;
}

// الحصول على قائمة الفئات حسب نوع البيانات
function getCategoriesByDataType(dataType) {
    if (dataType === 'performance') {
        return PERFORMANCE_CATEGORIES;
    } else if (dataType === 'excellence') {
        return EXCELLENCE_DEPARTMENTS;
    } else if (dataType === 'monitoring') {
        return MONITORING_SECTIONS;
    } else if (dataType === 'workforce') {
        return Object.keys(WORKFORCE_CATEGORIES).reduce((acc, key) => {
            acc[key] = WORKFORCE_CATEGORIES[key].name;
            return acc;
        }, {});
    }
    return {};
}
