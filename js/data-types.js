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
        hasCategories: true,
        inputType: 'formula',
        frequency: 'monthly',
        categories: {
            WFM: {
                id: 'WFM',
                name: 'إدارة القوى العاملة',
                nameEn: 'Workforce Management',
                icon: '👥',
                color: '#1a73e8'
            },
            UTZ: {
                id: 'UTZ',
                name: 'معدلات الاستخدام',
                nameEn: 'Utilization Rates',
                icon: '🏥',
                color: '#4caf50'
            },
            MP: {
                id: 'MP',
                name: 'الأداء الطبي',
                nameEn: 'Medical Performance',
                icon: '⚕️',
                color: '#f44336'
            },
            PHC: {
                id: 'PHC',
                name: 'الرعاية الأولية',
                nameEn: 'Primary Healthcare',
                icon: '🏥',
                color: '#ff9800'
            },
            IPC: {
                id: 'IPC',
                name: 'مكافحة العدوى',
                nameEn: 'Infection Control',
                icon: '🦠',
                color: '#9c27b0'
            },
            PS: {
                id: 'PS',
                name: 'سلامة المرضى',
                nameEn: 'Patient Safety',
                icon: '🛡️',
                color: '#e91e63'
            },
            OHS: {
                id: 'OHS',
                name: 'الصحة المهنية',
                nameEn: 'Occupational Health',
                icon: '👷',
                color: '#00bcd4'
            },
            MM: {
                id: 'MM',
                name: 'إدارة الأدوية',
                nameEn: 'Medication Management',
                icon: '💊',
                color: '#8bc34a'
            },
            LAB: {
                id: 'LAB',
                name: 'المختبر',
                nameEn: 'Laboratory',
                icon: '🧪',
                color: '#ff5722'
            },
            DF: {
                id: 'DF',
                name: 'طب الأسنان',
                nameEn: 'Dental',
                icon: '🦷',
                color: '#607d8b'
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'كود المؤشر' },
            name: { required: true, type: 'text', label: 'اسم المؤشر' },
            formula: { required: true, type: 'text', label: 'الصيغة الحسابية' },
            numeratorLabel: { required: true, type: 'text', label: 'تسمية البسط' },
            denominatorLabel: { required: true, type: 'text', label: 'تسمية المقام' },
            target: { required: true, type: 'number', label: 'المستهدف' },
            unit: { required: true, type: 'select', label: 'الوحدة', options: ['%', 'عدد', 'ساعة', 'يوم'] }
        }
    },
    
    EXCELLENCE: {
        id: 'excellence',
        name: 'مؤشرات التميز',
        nameEn: 'Excellence Indicators',
        icon: '⭐',
        color: '#f59e0b',
        description: 'معايير التميز المؤسسي والجودة',
        hasCategories: true,
        inputType: 'weighted',
        frequency: 'yearly',
        categories: {
            LEADERSHIP: {
                id: 'LEADERSHIP',
                name: 'القيادة',
                nameEn: 'Leadership',
                icon: '👨‍💼',
                color: '#f59e0b',
                weight: 120
            },
            PLANNING: {
                id: 'PLANNING',
                name: 'التخطيط الاستراتيجي',
                nameEn: 'Strategic Planning',
                icon: '📋',
                color: '#ef4444',
                weight: 85
            },
            CUSTOMER: {
                id: 'CUSTOMER',
                name: 'التركيز على العملاء',
                nameEn: 'Customer Focus',
                icon: '👥',
                color: '#8b5cf6',
                weight: 85
            },
            MEASUREMENT: {
                id: 'MEASUREMENT',
                name: 'القياس والتحليل',
                nameEn: 'Measurement & Analysis',
                icon: '📊',
                color: '#3b82f6',
                weight: 90
            },
            WORKFORCE_FOCUS: {
                id: 'WORKFORCE_FOCUS',
                name: 'التركيز على القوى العاملة',
                nameEn: 'Workforce Focus',
                icon: '👷',
                color: '#10b981',
                weight: 85
            },
            OPERATIONS: {
                id: 'OPERATIONS',
                name: 'العمليات',
                nameEn: 'Operations',
                icon: '⚙️',
                color: '#f97316',
                weight: 85
            },
            RESULTS: {
                id: 'RESULTS',
                name: 'النتائج',
                nameEn: 'Results',
                icon: '🎯',
                color: '#06b6d4',
                weight: 450
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'كود المعيار' },
            name: { required: true, type: 'text', label: 'اسم المعيار' },
            weight: { required: true, type: 'number', label: 'الوزن' },
            maxScore: { required: true, type: 'number', label: 'الدرجة القصوى' },
            subCriteria: { required: false, type: 'textarea', label: 'المعايير الفرعية' }
        }
    },
    
    MONITORING: {
        id: 'monitoring',
        name: 'المتابعة الشهرية',
        nameEn: 'Monthly Monitoring',
        icon: '📈',
        color: '#10b981',
        description: 'معايير المتابعة والتقييم الشهري',
        hasCategories: true,
        inputType: 'checklist',
        frequency: 'monthly',
        categories: {
            QUALITY: {
                id: 'QUALITY',
                name: 'معايير الجودة',
                nameEn: 'Quality Standards',
                icon: '✨',
                color: '#10b981'
            },
            SAFETY: {
                id: 'SAFETY',
                name: 'معايير السلامة',
                nameEn: 'Safety Standards',
                icon: '🛡️',
                color: '#ef4444'
            },
            INFECTION: {
                id: 'INFECTION',
                name: 'مكافحة العدوى',
                nameEn: 'Infection Control',
                icon: '🦠',
                color: '#8b5cf6'
            },
            PHARMACY: {
                id: 'PHARMACY',
                name: 'الصيدلية',
                nameEn: 'Pharmacy',
                icon: '💊',
                color: '#3b82f6'
            },
            EMERGENCY: {
                id: 'EMERGENCY',
                name: 'الطوارئ',
                nameEn: 'Emergency',
                icon: '🚨',
                color: '#f59e0b'
            },
            LAB: {
                id: 'LAB',
                name: 'المختبر',
                nameEn: 'Laboratory',
                icon: '🧪',
                color: '#06b6d4'
            },
            RADIOLOGY: {
                id: 'RADIOLOGY',
                name: 'الأشعة',
                nameEn: 'Radiology',
                icon: '🔬',
                color: '#ec4899'
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'كود المعيار' },
            name: { required: true, type: 'text', label: 'المعيار' },
            description: { required: false, type: 'textarea', label: 'الوصف' },
            evaluationType: { required: true, type: 'select', label: 'نوع التقييم', options: ['نعم/لا', 'تقييم رقمي (2-1-0-N/A)'] }
        }
    },
    
    WORKFORCE: {
        id: 'workforce',
        name: 'القوى البشرية',
        nameEn: 'Human Resources',
        icon: '👥',
        color: '#8b5cf6',
        description: 'بيانات الموارد البشرية والإحصائيات',
        hasCategories: true,
        inputType: 'count',
        frequency: 'monthly',
        categories: {
            DOCTORS: {
                id: 'DOCTORS',
                name: 'الأطباء',
                nameEn: 'Doctors',
                icon: '👨‍⚕️',
                color: '#8b5cf6',
                subCategories: ['طبيب استشاري', 'طبيب أخصائي', 'طبيب عام', 'طبيب مقيم']
            },
            NURSES: {
                id: 'NURSES',
                name: 'التمريض',
                nameEn: 'Nursing',
                icon: '👩‍⚕️',
                color: '#3b82f6',
                subCategories: ['ممرض/ة أول', 'ممرض/ة', 'مساعد تمريض']
            },
            TECHNICIANS: {
                id: 'TECHNICIANS',
                name: 'الفنيون',
                nameEn: 'Technicians',
                icon: '🔬',
                color: '#10b981',
                subCategories: ['فني مختبر', 'فني أشعة', 'فني صيدلية', 'فني أجهزة']
            },
            ADMIN: {
                id: 'ADMIN',
                name: 'الإداريون',
                nameEn: 'Administrative',
                icon: '📋',
                color: '#f59e0b',
                subCategories: ['مدير', 'موظف إداري', 'سكرتير']
            },
            SUPPORT: {
                id: 'SUPPORT',
                name: 'الخدمات المساندة',
                nameEn: 'Support Services',
                icon: '🧹',
                color: '#6b7280',
                subCategories: ['عامل نظافة', 'حارس أمن', 'سائق', 'عامل صيانة']
            }
        },
        fields: {
            jobTitle: { required: true, type: 'text', label: 'المسمى الوظيفي' },
            contractType: { required: true, type: 'select', label: 'نوع العقد', options: ['دائم', 'مؤقت', 'متعاقد'] },
            gender: { required: false, type: 'select', label: 'الجنس', options: ['ذكر', 'أنثى'] }
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
        formula: 'صيغة حسابية (بسط/مقام)',
        weighted: 'وزن ودرجة',
        checklist: 'قائمة فحص',
        count: 'عد مباشر'
    };
    return labels[inputType] || inputType;
}
