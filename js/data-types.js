/**
 * ===== تعريف أنواع البيانات الأربعة (حسب الملفات الفعلية) =====
 */

const DATA_TYPES = {
    WORKFORCE: {
        id: 'workforce',
        name: 'القوى البشرية',
        nameEn: 'Human Resources',
        icon: '👥',
        color: '#8b5cf6',
        description: 'بيانات القوى البشرية والإحصائيات',
        inputType: 'count',
        frequency: 'monthly',
        categories: {
            DOCTORS: {
                id: 'DOCTORS',
                name: 'أطباء بشري',
                nameEn: 'Doctors',
                icon: '👨‍⚕️',
                color: '#8b5cf6'
            },
            PHARMACY: {
                id: 'PHARMACY',
                name: 'صيدلة',
                nameEn: 'Pharmacy',
                icon: '💊',
                color: '#3b82f6'
            },
            PHYSIOTHERAPY: {
                id: 'PHYSIOTHERAPY',
                name: 'علاج طبيعي',
                nameEn: 'Physiotherapy',
                icon: '🏃',
                color: '#10b981'
            },
            NURSING: {
                id: 'NURSING',
                name: 'تمريض',
                nameEn: 'Nursing',
                icon: '👩‍⚕️',
                color: '#f59e0b'
            },
            CHEMISTRY: {
                id: 'CHEMISTRY',
                name: 'كيميائي',
                nameEn: 'Chemistry',
                icon: '🧪',
                color: '#ec4899'
            },
            ADMIN: {
                id: 'ADMIN',
                name: 'إداري',
                nameEn: 'Administrative',
                icon: '📋',
                color: '#6b7280'
            },
            WORKERS: {
                id: 'WORKERS',
                name: 'عامل',
                nameEn: 'Workers',
                icon: '👷',
                color: '#78716c'
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'رقم الوظيفة' },
            jobTitle: { required: true, type: 'text', label: 'المسمى الوظيفي' },
            count: { required: true, type: 'number', label: 'العدد' }
        }
    },
    
    HOSPITAL_ASSESSMENT: {
        id: 'hospital_assessment',
        name: 'معايير التقييم',
        nameEn: 'Hospital Assessment Standards 2025',
        icon: '⭐',
        color: '#f59e0b',
        description: 'معايير تقييم المستشفيات 2025',
        inputType: 'assessment',
        frequency: 'monthly',
        categories: {
            PLANNING: {
                id: 'PLANNING',
                name: 'التخطيط المصمم والخدمات',
                nameEn: 'Planning and Services',
                icon: '📋',
                color: '#3b82f6'
            },
            LEADERSHIP: {
                id: 'LEADERSHIP',
                name: 'القيادة والحوكمة',
                nameEn: 'Leadership and Governance',
                icon: '👨‍💼',
                color: '#f59e0b'
            },
            WORK_ORGANIZATION: {
                id: 'WORK_ORGANIZATION',
                name: 'تنظيم العمل',
                nameEn: 'Work Organization',
                icon: '⚙️',
                color: '#10b981'
            },
            QUALITY_IMPROVEMENT: {
                id: 'QUALITY_IMPROVEMENT',
                name: 'تحسين الجودة والخدمات',
                nameEn: 'Quality Improvement',
                icon: '✨',
                color: '#8b5cf6'
            },
            OUTPATIENT_CARE: {
                id: 'OUTPATIENT_CARE',
                name: 'الرعاية الطبية الخارجية',
                nameEn: 'Outpatient Care',
                icon: '🏥',
                color: '#ec4899'
            },
            FINANCIAL_MANAGEMENT: {
                id: 'FINANCIAL_MANAGEMENT',
                name: 'الإدارة المالية',
                nameEn: 'Financial Management',
                icon: '💰',
                color: '#f97316'
            },
            SUPPORT_SERVICES: {
                id: 'SUPPORT_SERVICES',
                name: 'خدمات الدعم',
                nameEn: 'Support Services',
                icon: '🔧',
                color: '#06b6d4'
            },
            NURSING_MANAGEMENT: {
                id: 'NURSING_MANAGEMENT',
                name: 'إدارة التمريض',
                nameEn: 'Nursing Management',
                icon: '👩‍⚕️',
                color: '#8b5cf6'
            },
            DIAGNOSTIC_SERVICES: {
                id: 'DIAGNOSTIC_SERVICES',
                name: 'الخدمات التشخيصية',
                nameEn: 'Diagnostic Services',
                icon: '🔬',
                color: '#ef4444'
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'رقم المعيار' },
            name: { required: true, type: 'text', label: 'المعيار' },
            assessment: { required: true, type: 'select', label: 'التقييم', options: ['2', '1', '0', 'N/A'] },
            notes: { required: false, type: 'textarea', label: 'ملاحظات' }
        }
    },
    
    PERFORMANCE: {
        id: 'performance',
        name: 'مؤشرات الأداء الشهري',
        nameEn: 'Monthly Performance Indicators',
        icon: '📊',
        color: '#1a73e8',
        description: 'مؤشرات الأداء الأساسية - بسط ومقام',
        inputType: 'formula',
        frequency: 'monthly',
        categories: {
            PREVENTIVE: {
                id: 'PREVENTIVE',
                name: 'الوقائي',
                nameEn: 'Preventive',
                icon: '🛡️',
                color: '#10b981'
            },
            PLANNING_DEPT: {
                id: 'PLANNING_DEPT',
                name: 'إدارة التخطيط',
                nameEn: 'Planning Department',
                icon: '📋',
                color: '#3b82f6'
            },
            NURSING_DEPT: {
                id: 'NURSING_DEPT',
                name: 'إدارة التمريض',
                nameEn: 'Nursing Department',
                icon: '👩‍⚕️',
                color: '#8b5cf6'
            },
            EMERGENCY: {
                id: 'EMERGENCY',
                name: 'إدارة الطوارئ',
                nameEn: 'Emergency',
                icon: '🚨',
                color: '#ef4444'
            },
            CITIZEN_CARE: {
                id: 'CITIZEN_CARE',
                name: 'إدارة رعاية المواطنين',
                nameEn: 'Citizen Care',
                icon: '👨‍👩‍👧‍👦',
                color: '#f59e0b'
            },
            PATIENT_SAFETY: {
                id: 'PATIENT_SAFETY',
                name: 'إدارة سلامة المرضى',
                nameEn: 'Patient Safety',
                icon: '🛡️',
                color: '#ec4899'
            },
            INFORMATION: {
                id: 'INFORMATION',
                name: 'إدارة المعلومات',
                nameEn: 'Information Management',
                icon: '💾',
                color: '#06b6d4'
            },
            QUALITY: {
                id: 'QUALITY',
                name: 'إدارة الجودة',
                nameEn: 'Quality Management',
                icon: '✨',
                color: '#f59e0b'
            },
            LAB_SERVICES: {
                id: 'LAB_SERVICES',
                name: 'الخدمات المعملية',
                nameEn: 'Laboratory Services',
                icon: '🧪',
                color: '#8b5cf6'
            },
            LEADERSHIP_DEPT: {
                id: 'LEADERSHIP_DEPT',
                name: 'إدارة القيادة',
                nameEn: 'Leadership',
                icon: '👨‍💼',
                color: '#f97316'
            },
            VITAL_RECORDS: {
                id: 'VITAL_RECORDS',
                name: 'المكاتب الفنية وركن الإحصاء',
                nameEn: 'Vital Records',
                icon: '📊',
                color: '#3b82f6'
            },
            DIALYSIS: {
                id: 'DIALYSIS',
                name: 'إدارة غسيل الكلى',
                nameEn: 'Dialysis',
                icon: '🩺',
                color: '#10b981'
            },
            ONCOLOGY: {
                id: 'ONCOLOGY',
                name: 'إدارة الأورام',
                nameEn: 'Oncology',
                icon: '🎗️',
                color: '#ef4444'
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'كود المؤشر' },
            name: { required: true, type: 'text', label: 'المؤشر' },
            department: { required: true, type: 'text', label: 'الإدارة المسؤولة' },
            numeratorLabel: { required: true, type: 'text', label: 'البسط' },
            denominatorLabel: { required: false, type: 'text', label: 'المقام' },
            formula: { required: true, type: 'text', label: 'المعادلة الحسابية' },
            percentage: { required: true, type: 'text', label: 'النسبة المئوية (مثال: 100X)' },
            frequency: { required: true, type: 'select', label: 'دورية الإبلاغ', options: ['شهري', 'ربع سنوي', 'سنوي'] }
        }
    },
    
    MONTHLY_INPUT: {
        id: 'monthly_input',
        name: 'نموذج الإدخال الشهري',
        nameEn: 'Monthly Data Input',
        icon: '📈',
        color: '#10b981',
        description: 'إدخال البيانات الشهرية للمؤشرات',
        inputType: 'monthly_data',
        frequency: 'monthly',
        categories: {
            JANUARY: { id: 'JANUARY', name: 'يناير', nameEn: 'January', icon: '1️⃣', color: '#3b82f6', month: 1 },
            FEBRUARY: { id: 'FEBRUARY', name: 'فبراير', nameEn: 'February', icon: '2️⃣', color: '#8b5cf6', month: 2 },
            MARCH: { id: 'MARCH', name: 'مارس', nameEn: 'March', icon: '3️⃣', color: '#10b981', month: 3 },
            APRIL: { id: 'APRIL', name: 'أبريل', nameEn: 'April', icon: '4️⃣', color: '#f59e0b', month: 4 },
            MAY: { id: 'MAY', name: 'مايو', nameEn: 'May', icon: '5️⃣', color: '#ef4444', month: 5 },
            JUNE: { id: 'JUNE', name: 'يونيو', nameEn: 'June', icon: '6️⃣', color: '#ec4899', month: 6 },
            JULY: { id: 'JULY', name: 'يوليو', nameEn: 'July', icon: '7️⃣', color: '#06b6d4', month: 7 },
            AUGUST: { id: 'AUGUST', name: 'أغسطس', nameEn: 'August', icon: '8️⃣', color: '#8b5cf6', month: 8 },
            SEPTEMBER: { id: 'SEPTEMBER', name: 'سبتمبر', nameEn: 'September', icon: '9️⃣', color: '#10b981', month: 9 },
            OCTOBER: { id: 'OCTOBER', name: 'أكتوبر', nameEn: 'October', icon: '🔟', color: '#f59e0b', month: 10 },
            NOVEMBER: { id: 'NOVEMBER', name: 'نوفمبر', nameEn: 'November', icon: '1️⃣1️⃣', color: '#3b82f6', month: 11 },
            DECEMBER: { id: 'DECEMBER', name: 'ديسمبر', nameEn: 'December', icon: '1️⃣2️⃣', color: '#ef4444', month: 12 }
        },
        fields: {
            year: { required: true, type: 'number', label: 'السنة' },
            kpiCode: { required: true, type: 'select', label: 'المؤشر' },
            numerator: { required: true, type: 'number', label: 'البسط' },
            denominator: { required: false, type: 'number', label: 'المقام' },
            result: { required: false, type: 'number', label: 'النتيجة', readonly: true }
        }
    }
};

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

// دوال مساعدة
function getDataTypeInfo(dataTypeId) {
    return Object.values(DATA_TYPES).find(dt => dt.id === dataTypeId) || null;
}

function getCategoriesByDataType(dataTypeId) {
    const dataType = getDataTypeInfo(dataTypeId);
    return dataType?.categories || {};
}

function getAllDataTypes() {
    return Object.values(DATA_TYPES);
}

function getInputTypeLabel(inputType) {
    const labels = {
        count: 'عد مباشر (عدد الموظفين)',
        assessment: 'تقييم (2-1-0-N/A)',
        formula: 'صيغة حسابية (بسط/مقام)',
        monthly_data: 'بيانات شهرية'
    };
    return labels[inputType] || inputType;
}

function getCategoryName(dataType, categoryKey) {
    const categories = getCategoriesByDataType(dataType);
    const category = categories[categoryKey];
    return category ? category.name : categoryKey;
}

function getApplicableFacilitiesText(applicableTo) {
    if (!applicableTo) {
        return 'جميع المنشآت';
    }
    
    const facilities = [];
    
    if (applicableTo.hospital) facilities.push('🏥 مستشفى');
    if (applicableTo.healthCenter) facilities.push('🏥 مركز صحي');
    if (applicableTo.healthUnit) facilities.push('🏥 وحدة صحية');
    
    return facilities.length > 0 ? facilities.join(', ') : 'غير محدد';
}

// دالة لتحويل رقم الشهر إلى اسم
function getMonthNameArabic(monthNumber) {
    const months = {
        1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
        5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
        9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
    };
    return months[monthNumber] || '';
}

// دالة للحصول على معلومات الشهر من القسم
function getMonthFromCategory(categoryId) {
    const categories = DATA_TYPES.MONTHLY_INPUT.categories;
    const category = Object.values(categories).find(cat => cat.id === categoryId);
    return category ? category.month : null;
}

// دالة للتحقق من نوع الإدخال
function isCountType(dataTypeId) {
    const type = getDataTypeInfo(dataTypeId);
    return type?.inputType === 'count';
}

function isAssessmentType(dataTypeId) {
    const type = getDataTypeInfo(dataTypeId);
    return type?.inputType === 'assessment';
}

function isFormulaType(dataTypeId) {
    const type = getDataTypeInfo(dataTypeId);
    return type?.inputType === 'formula';
}

function isMonthlyDataType(dataTypeId) {
    const type = getDataTypeInfo(dataTypeId);
    return type?.inputType === 'monthly_data';
}

// دالة للحصول على جميع أنواع المنشآت
function getAllFacilityTypes() {
    return Object.values(FACILITY_TYPES);
}

// دالة للحصول على نوع منشأة محدد
function getFacilityTypeInfo(facilityTypeId) {
    return FACILITY_TYPES[facilityTypeId] || null;
}

// دالة للحصول على اسم نوع المنشأة بالعربي
function getFacilityTypeName(facilityTypeId) {
    const facilityType = getFacilityTypeInfo(facilityTypeId);
    return facilityType ? facilityType.name : facilityTypeId;
}

// دالة للحصول على لون نوع المنشأة
function getFacilityTypeColor(facilityTypeId) {
    const facilityType = getFacilityTypeInfo(facilityTypeId);
    return facilityType ? facilityType.color : '#666666';
}

// دالة للحصول على أيقونة نوع المنشأة
function getFacilityTypeIcon(facilityTypeId) {
    const facilityType = getFacilityTypeInfo(facilityTypeId);
    return facilityType ? facilityType.icon : '🏥';
}

console.log('✅ Data types loaded:', Object.keys(DATA_TYPES).length);
