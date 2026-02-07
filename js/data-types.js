/**
 * ===== تعريف أنواع البيانات الأربعة (محدث حسب المواصفات الجديدة) =====
 */

const DATA_TYPES = {
    // ========================================
    // 1️⃣ القوى البشرية - عدد فقط
    // ========================================
    WORKFORCE: {
        id: 'workforce',
        name: 'القوى البشرية',
        nameEn: 'Human Resources',
        icon: '👥',
        color: '#8b5cf6',
        description: 'بيانات القوى البشرية - عدد فقط',
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
            count: { required: true, type: 'number', label: 'العدد', min: 0 }
        }
    },
    
    // ========================================
    // 2️⃣ معايير التقييم - 20 قسم رئيسي + أقسام فرعية
    // ========================================
    HOSPITAL_ASSESSMENT: {
        id: 'hospital_assessment',
        name: 'معايير التقييم',
        nameEn: 'Hospital Assessment Standards 2025',
        icon: '⭐',
        color: '#f59e0b',
        description: 'معايير تقييم المستشفيات 2025',
        inputType: 'assessment',
        frequency: 'monthly',
        hasSubcategories: true,
        categories: {
            // 1. التسجيل الطبي
            MEDICAL_RECORDS: {
                id: 'MEDICAL_RECORDS',
                name: 'التسجيل الطبي',
                nameEn: 'Medical Records',
                icon: '📋',
                color: '#3b82f6',
                subcategories: {
                    MEDICAL_FILES: { id: 'MEDICAL_FILES', name: 'الملفات الطبية', icon: '📁' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' },
                    DECLARATIONS: { id: 'DECLARATIONS', name: 'الإقرارات', icon: '📄' }
                }
            },
            
            // 2. الخدمات الطبية المساعدة
            AUXILIARY_MEDICAL_SERVICES: {
                id: 'AUXILIARY_MEDICAL_SERVICES',
                name: 'الخدمات الطبية المساعدة',
                nameEn: 'Auxiliary Medical Services',
                icon: '🏥',
                color: '#10b981',
                subcategories: {}
            },
            
            // 3. الصيدلية
            PHARMACY: {
                id: 'PHARMACY',
                name: 'الصيدلية',
                nameEn: 'Pharmacy',
                icon: '💊',
                color: '#f59e0b',
                subcategories: {
                    DRUG_LISTS: { id: 'DRUG_LISTS', name: 'قوائم الأدوية', icon: '📋' }
                }
            },
            
            // 4. المعمل
            LABORATORY: {
                id: 'LABORATORY',
                name: 'المعمل',
                nameEn: 'Laboratory',
                icon: '🔬',
                color: '#8b5cf6',
                subcategories: {
                    WORK_ORGANIZATION: { id: 'WORK_ORGANIZATION', name: 'تنظيم العمل', icon: '⚙️' },
                    LAB_RECORDS: { id: 'LAB_RECORDS', name: 'سجلات المعمل', icon: '📝' },
                    LAB_POLICIES: { id: 'LAB_POLICIES', name: 'سياسات المعمل', icon: '📜' },
                    LAB_LISTS: { id: 'LAB_LISTS', name: 'قوائم المعمل', icon: '📋' },
                    SAFETY_REQUIREMENTS: { id: 'SAFETY_REQUIREMENTS', name: 'اشتراطات السلامة بالمعمل', icon: '⚠️' },
                    QUALITY_CONTROL: { id: 'QUALITY_CONTROL', name: 'ضبط الجودة بالمعمل', icon: '✅' },
                    WORK_PROCEDURES: { id: 'WORK_PROCEDURES', name: 'إجراءات العمل', icon: '📖' },
                    MICROBIOLOGY_LAB: { id: 'MICROBIOLOGY_LAB', name: 'معمل الميكروبيولوجي', icon: '🦠' },
                    SAMPLE_COLLECTION: { id: 'SAMPLE_COLLECTION', name: 'توافر الاشتراطات بمكان سحب العينات', icon: '💉' }
                }
            },
            
            // 5. الأشعة
            RADIOLOGY: {
                id: 'RADIOLOGY',
                name: 'الأشعة',
                nameEn: 'Radiology',
                icon: '📡',
                color: '#ec4899',
                subcategories: {
                    INFRASTRUCTURE: { id: 'INFRASTRUCTURE', name: 'البنية التحتية بالأشعة', icon: '🏗️' },
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'التجهيزات بالأشعة', icon: '🔧' },
                    SAFETY_REQUIREMENTS: { id: 'SAFETY_REQUIREMENTS', name: 'اشتراطات السلامة بالأشعة', icon: '⚠️' },
                    PROTECTION_EQUIPMENT: { id: 'PROTECTION_EQUIPMENT', name: 'معدات الوقاية الشخصية', icon: '🦺' },
                    LISTS: { id: 'LISTS', name: 'القوائم', icon: '📋' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' },
                    GENERAL_NOTES: { id: 'GENERAL_NOTES', name: 'ملاحظات عامة', icon: '📌' }
                }
            },
            
            // 6. بنك الدم
            BLOOD_BANK: {
                id: 'BLOOD_BANK',
                name: 'بنك الدم',
                nameEn: 'Blood Bank',
                icon: '🩸',
                color: '#ef4444',
                subcategories: {
                    INFRASTRUCTURE: { id: 'INFRASTRUCTURE', name: 'البنية التحتية ببنك الدم', icon: '🏗️' },
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'التجهيزات ببنك الدم', icon: '🔧' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' },
                    FORMS: { id: 'FORMS', name: 'النماذج ببنك الدم', icon: '📄' },
                    BLOOD_BAG_SPECS: { id: 'BLOOD_BAG_SPECS', name: 'مواصفات كيس الدم', icon: '💉' }
                }
            },
            
            // 7. الخدمات المساعدة غير الطبية
            NON_MEDICAL_SUPPORT: {
                id: 'NON_MEDICAL_SUPPORT',
                name: 'الخدمات المساعدة غير الطبية',
                nameEn: 'Non-Medical Support Services',
                icon: '🔧',
                color: '#06b6d4',
                subcategories: {}
            },
            
            // 8. وحدة التعقيم المركزي
            STERILIZATION: {
                id: 'STERILIZATION',
                name: 'وحدة التعقيم المركزي',
                nameEn: 'Central Sterilization Unit',
                icon: '🧼',
                color: '#10b981',
                subcategories: {
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'تجهيزات الوحدة', icon: '🔧' },
                    SUPPLIES: { id: 'SUPPLIES', name: 'ملاحظة المستلزمات', icon: '📦' },
                    WORK_PROCEDURES: { id: 'WORK_PROCEDURES', name: 'إجراءات العمل', icon: '📖' },
                    AUTOCLAVE_EFFICIENCY: { id: 'AUTOCLAVE_EFFICIENCY', name: 'متابعة كفاءة التعقيم بجهاز الأوتوكلاف', icon: '🔬' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' },
                    CLEANING_SCHEDULES: { id: 'CLEANING_SCHEDULES', name: 'القوائم – جداول تنظيف', icon: '📋' }
                }
            },
            
            // 9. وحدة غسيل المفروشات
            LAUNDRY: {
                id: 'LAUNDRY',
                name: 'وحدة غسيل المفروشات',
                nameEn: 'Laundry Unit',
                icon: '🧺',
                color: '#8b5cf6',
                subcategories: {
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'تجهيزات المغسلة', icon: '🔧' },
                    SUPPLIES: { id: 'SUPPLIES', name: 'ملاحظة المستلزمات', icon: '📦' },
                    WORK_ENVIRONMENT: { id: 'WORK_ENVIRONMENT', name: 'بيئة العمل', icon: '🏭' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' }
                }
            },
            
            // 10. ��حدة التغذية (المطبخ)
            NUTRITION: {
                id: 'NUTRITION',
                name: 'وحدة التغذية (المطبخ)',
                nameEn: 'Nutrition Unit (Kitchen)',
                icon: '🍽️',
                color: '#f59e0b',
                subcategories: {
                    KITCHEN_DESIGN: { id: 'KITCHEN_DESIGN', name: 'تصميم مطبخ المستشفى', icon: '🏗️' },
                    WORKFLOW: { id: 'WORKFLOW', name: 'مسار العمل في المطبخ', icon: '🔄' },
                    SUPPLIES: { id: 'SUPPLIES', name: 'ملاحظة المستلزمات', icon: '📦' },
                    SCHEDULES_CERTIFICATES: { id: 'SCHEDULES_CERTIFICATES', name: 'الجداول – القوائم – الشهادات الصحية', icon: '📋' }
                }
            },
            
            // 11. غرفة حفظ الموتى
            MORGUE: {
                id: 'MORGUE',
                name: 'غرفة حفظ الموتى',
                nameEn: 'Morgue',
                icon: '⚰️',
                color: '#6b7280',
                subcategories: {
                    GENERAL_REQUIREMENTS: { id: 'GENERAL_REQUIREMENTS', name: 'اشتراطات عامة', icon: '📜' }
                }
            },
            
            // 12. غرفة النفايات
            WASTE_ROOM: {
                id: 'WASTE_ROOM',
                name: 'غرفة النفايات',
                nameEn: 'Waste Room',
                icon: '🗑️',
                color: '#78716c',
                subcategories: {}
            },
            
            // 13. الانضباط والالتزام الإداري
            DISCIPLINE_COMMITMENT: {
                id: 'DISCIPLINE_COMMITMENT',
                name: 'الانضباط والالتزام الإداري',
                nameEn: 'Discipline and Administrative Commitment',
                icon: '⚖️',
                color: '#3b82f6',
                subcategories: {
                    HUMAN_RESOURCES: { id: 'HUMAN_RESOURCES', name: 'الموارد البشرية', icon: '👥' },
                    TRAINING: { id: 'TRAINING', name: 'التعليم والتدريب المستمر', icon: '📚' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' }
                }
            },
            
            // 14. الشئون المالية
            FINANCIAL_AFFAIRS: {
                id: 'FINANCIAL_AFFAIRS',
                name: 'الشئون المالية',
                nameEn: 'Financial Affairs',
                icon: '💰',
                color: '#f97316',
                subcategories: {
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' }
                }
            },
            
            // 15. المخازن
            WAREHOUSES: {
                id: 'WAREHOUSES',
                name: 'المخازن',
                nameEn: 'Warehouses',
                icon: '📦',
                color: '#06b6d4',
                subcategories: {
                    RECORDS_FORMS: { id: 'RECORDS_FORMS', name: 'السجلات / النماذج', icon: '📋' }
                }
            },
            
            // 16. وحدة العناية المركزة
            ICU: {
                id: 'ICU',
                name: 'وحدة العناية المركزة',
                nameEn: 'Intensive Care Unit',
                icon: '🏥',
                color: '#ef4444',
                subcategories: {
                    INFRASTRUCTURE: { id: 'INFRASTRUCTURE', name: 'البنية التحتية بوحدة العناية المركزة', icon: '🏗️' },
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'التجهيزات الخاصة بوحدة العناية المركزة', icon: '🔧' },
                    MEDICAL_NURSING_CARE: { id: 'MEDICAL_NURSING_CARE', name: 'الرعاية الطبية والتمريضية', icon: '👨‍⚕️' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' }
                }
            },
            
            // 17. قسم الاستقبال والطوارئ
            EMERGENCY: {
                id: 'EMERGENCY',
                name: 'قسم الاستقبال والطوارئ',
                nameEn: 'Emergency Department',
                icon: '🚨',
                color: '#ef4444',
                subcategories: {
                    INFRASTRUCTURE: { id: 'INFRASTRUCTURE', name: 'البنية التحتية بالاستقبال والطوارئ', icon: '🏗️' },
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'التجهيزات بالطوارئ', icon: '🔧' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات بالطوارئ', icon: '📝' },
                    CLINICAL_GUIDELINES: { id: 'CLINICAL_GUIDELINES', name: 'أدلة العمل الإكلينيكية بالطوارئ', icon: '📖' }
                }
            },
            
            // 18. قسم العمليات
            OPERATIONS: {
                id: 'OPERATIONS',
                name: 'قسم العمليات',
                nameEn: 'Operations Department',
                icon: '🏥',
                color: '#8b5cf6',
                subcategories: {
                    INFRASTRUCTURE: { id: 'INFRASTRUCTURE', name: 'البنية التحتية بالعمليات', icon: '🏗️' },
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'التجهيزات بالعمليات', icon: '🔧' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات بالعمليات', icon: '📝' }
                }
            },
            
            // 19. وحدة الغسيل الكلوي
            DIALYSIS: {
                id: 'DIALYSIS',
                name: 'وحدة الغسيل الكلوي',
                nameEn: 'Dialysis Unit',
                icon: '🩺',
                color: '#10b981',
                subcategories: {
                    INFRASTRUCTURE: { id: 'INFRASTRUCTURE', name: 'البنية التحتية بوحدة الغسيل الكلوي', icon: '🏗️' },
                    POLICIES_PROCEDURES: { id: 'POLICIES_PROCEDURES', name: 'السياسات والإجراءات بوحدة الغسيل الكلوي', icon: '📜' },
                    WORK_PROTOCOL: { id: 'WORK_PROTOCOL', name: 'بروتوكول العمل', icon: '📖' },
                    MEDICAL_FILE: { id: 'MEDICAL_FILE', name: 'الملف الطبي', icon: '📁' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' },
                    DECLARATIONS: { id: 'DECLARATIONS', name: 'الإقرارات', icon: '📄' },
                    PATIENT_TESTS: { id: 'PATIENT_TESTS', name: 'فحوصات المرضى', icon: '🔬' }
                }
            },
            
            // 20. العلاج الطبيعي
            PHYSIOTHERAPY: {
                id: 'PHYSIOTHERAPY',
                name: 'العلاج الطبيعي',
                nameEn: 'Physiotherapy',
                icon: '🏃',
                color: '#10b981',
                subcategories: {
                    GENERAL_REQUIREMENTS: { id: 'GENERAL_REQUIREMENTS', name: 'الاشتراطات العامة', icon: '📜' },
                    EQUIPMENT: { id: 'EQUIPMENT', name: 'التجهيزات اللازمة طبقاً لنوع الخدمة المقدمة', icon: '🔧' },
                    RECORDS: { id: 'RECORDS', name: 'السجلات', icon: '📝' },
                    INFECTION_CONTROL: { id: 'INFECTION_CONTROL', name: 'مكافحة العدوى بالعلاج الطبيعي', icon: '🦠' }
                }
            }
        },
        fields: {
            name: { required: true, type: 'text', label: 'المعيار' },
            assessment: { required: true, type: 'select', label: 'التقييم', options: ['2', '1', '0', 'N/A'] },
            notes: { required: false, type: 'textarea', label: 'ملاحظات' }
        }
    },
    
    // ========================================
    // 3️⃣ مؤشرات الأد��ء الشهري - نوعين (formula / direct)
    // ========================================
    PERFORMANCE: {
        id: 'performance',
        name: 'مؤشرات الأداء الشهري',
        nameEn: 'Monthly Performance Indicators',
        icon: '📊',
        color: '#1a73e8',
        description: 'مؤشرات الأداء - صيغة حسابية أو قيمة مباشرة',
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
            indicatorType: { 
                required: true, 
                type: 'select', 
                label: 'نوع المؤشر', 
                options: [
                    { value: 'formula', label: 'صيغة حسابية (بسط ÷ مقام × 100)' },
                    { value: 'direct', label: 'قيمة مباشرة (رقم واحد)' }
                ]
            },
            formulaDescription: { required: false, type: 'textarea', label: 'وصف المعادلة (للصيغة الحسابية)' },
            numeratorLabel: { required: false, type: 'text', label: 'البسط (توضيح)' },
            denominatorLabel: { required: false, type: 'text', label: 'المقام (توضيح)' },
            description: { required: false, type: 'textarea', label: 'الوصف/التعليمات (للقيمة المباشرة)' },
            frequency: { required: true, type: 'select', label: 'دورية الإبلاغ', options: ['شهري', 'ربع سنوي', 'سنوي'] }
        }
    },
    
    // ========================================
    // 4️⃣ نموذج الإدخال الشهري - مؤشرات التميز (8 إدارات)
    // ========================================
    MONTHLY_INPUT: {
        id: 'monthly_input',
        name: 'نموذج الإدخال الشهري (مؤشرات التميز)',
        nameEn: 'Monthly Excellence Indicators',
        icon: '📈',
        color: '#10b981',
        description: 'مؤشرات التميز - إدخال شهري حسب الإدارات',
        inputType: 'monthly_data',
        frequency: 'monthly',
        categories: {
            PREVENTIVE_GENERAL: {
                id: 'PREVENTIVE_GENERAL',
                name: 'إدارة الوقائي',
                nameEn: 'Preventive Department',
                icon: '🛡️',
                color: '#10b981'
            },
            PREVENTIVE_ENV_HEALTH: {
                id: 'PREVENTIVE_ENV_HEALTH',
                name: 'إدارة الوقائي (صحة البيئة)',
                nameEn: 'Preventive (Environmental Health)',
                icon: '🌿',
                color: '#22c55e'
            },
            PREVENTIVE_ENV_MONITORING: {
                id: 'PREVENTIVE_ENV_MONITORING',
                name: 'إدارة الوقائي (الرصد البيئي)',
                nameEn: 'Preventive (Environmental Monitoring)',
                icon: '📊',
                color: '#84cc16'
            },
            SAFETY_HEALTH: {
                id: 'SAFETY_HEALTH',
                name: 'إدارة السلامة والصحة المهنية',
                nameEn: 'Occupational Safety and Health',
                icon: '⚠️',
                color: '#f59e0b'
            },
            ENV_HEALTH_PREVENTIVE: {
                id: 'ENV_HEALTH_PREVENTIVE',
                name: 'إدارة صحة البيئة (الوقائي)',
                nameEn: 'Environmental Health (Preventive)',
                icon: '🌍',
                color: '#10b981'
            },
            ENV_MONITORING_CLIMATE: {
                id: 'ENV_MONITORING_CLIMATE',
                name: 'إدارة الرصد البيئي (ملف تغيير المناخ)',
                nameEn: 'Environmental Monitoring (Climate Change)',
                icon: '🌡️',
                color: '#06b6d4'
            },
            ENV_HEALTH: {
                id: 'ENV_HEALTH',
                name: 'إدارة صحة البيئة',
                nameEn: 'Environmental Health Department',
                icon: '♻️',
                color: '#14b8a6'
            },
            HEPATITIS: {
                id: 'HEPATITIS',
                name: 'إدارة الفيروسات الكبدية',
                nameEn: 'Viral Hepatitis Department',
                icon: '🦠',
                color: '#ef4444'
            }
        },
        fields: {
            code: { required: true, type: 'text', label: 'كود المؤشر' },
            name: { required: true, type: 'text', label: 'المؤشر' },
            responsibleDepartment: { required: true, type: 'text', label: 'الإدارة المسؤولة' },
            calculationFormula: { required: true, type: 'textarea', label: 'معادلة الاحتساب' },
            numerator: { required: true, type: 'number', label: 'البسط (القيمة الفعلية)' },
            target: { required: true, type: 'number', label: 'الهدف' },
            percentage: { required: false, type: 'number', label: 'النسبة المئوية', readonly: true },
            periodicity: { required: true, type: 'select', label: 'دورية التقييم', options: ['شهري', 'ربع سنوي', 'سنوي'] }
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

// ========================================
// ��وال مساعدة
// ========================================

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
        count: 'عدد فقط',
        assessment: 'تقييم (2-1-0-N/A)',
        formula: 'صيغة حسابية أو قيمة مباشرة',
        monthly_data: 'بيانات شهرية (بسط + هدف)'
    };
    return labels[inputType] || inputType;
}

function getCategoryName(dataType, categoryKey) {
    const categories = getCategoriesByDataType(dataType);
    const category = categories[categoryKey];
    return category ? category.name : categoryKey;
}

// ✅ دوال جديدة للأقسام الفرعية
function getSubcategories(dataTypeId, categoryId) {
    const dataType = getDataTypeInfo(dataTypeId);
    if (!dataType || !dataType.hasSubcategories) return {};
    
    const category = dataType.categories[categoryId];
    return category?.subcategories || {};
}

function hasSubcategories(dataTypeId) {
    const dataType = getDataTypeInfo(dataTypeId);
    return dataType?.hasSubcategories || false;
}

function getSubcategoryName(dataTypeId, categoryId, subcategoryId) {
    const subcategories = getSubcategories(dataTypeId, categoryId);
    const subcategory = subcategories[subcategoryId];
    return subcategory ? subcategory.name : subcategoryId;
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

function getMonthNameArabic(monthNumber) {
    const months = {
        1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
        5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
        9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
    };
    return months[monthNumber] || '';
}

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

function getAllFacilityTypes() {
    return Object.values(FACILITY_TYPES);
}

function getFacilityTypeInfo(facilityTypeId) {
    return FACILITY_TYPES[facilityTypeId] || null;
}

function getFacilityTypeName(facilityTypeId) {
    const facilityType = getFacilityTypeInfo(facilityTypeId);
    return facilityType ? facilityType.name : facilityTypeId;
}

function getFacilityTypeColor(facilityTypeId) {
    const facilityType = getFacilityTypeInfo(facilityTypeId);
    return facilityType ? facilityType.color : '#666666';
}

function getFacilityTypeIcon(facilityTypeId) {
    const facilityType = getFacilityTypeInfo(facilityTypeId);
    return facilityType ? facilityType.icon : '🏥';
}

console.log('✅ Data types loaded (Updated v2.0):', Object.keys(DATA_TYPES).length);
console.log('📊 Total main categories:', Object.values(DATA_TYPES).reduce((acc, dt) => acc + Object.keys(dt.categories).length, 0));
console.log('🔹 Hospital Assessment Subcategories:', Object.values(DATA_TYPES.HOSPITAL_ASSESSMENT.categories).reduce((acc, cat) => acc + Object.keys(cat.subcategories || {}).length, 0));
