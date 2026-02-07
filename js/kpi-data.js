/**
 * ===== بيانات المؤشرات =====
 * النظام يبدأ فاضي - يتم إضافة المؤشرات يدوياً أو استيراد من Excel
 */

// الفئات (للتوافق مع الكود القديم)
const KPI_CATEGORIES = {
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

// لا توجد مؤشرات افتراضية - النظام يبدأ فاضي
const KPI_DATA = [];

/**
 * ===== دوال إدارة المؤشرات =====
 */

// جلب جميع المؤشرات حسب نوع البيانات
function getAllKPIsByType(dataType) {
    const storageKey = `kpis_${dataType}`;
    return getFromStorage(storageKey, []);
}

// جلب المؤشرات حسب نوع البيانات والفئة
function getKPIsByCategory(dataType, category) {
    const allKPIs = getAllKPIsByType(dataType);
    return allKPIs.filter(kpi => kpi.category === category || kpi.department === category || kpi.section === category);
}

// جلب المؤشرات المتاحة لنوع منشأة معين
function getKPIsForFacilityType(dataType, facilityType) {
    const allKPIs = getAllKPIsByType(dataType);
    return allKPIs.filter(kpi => {
        // التحقق من أن المؤشر متاح لهذا النوع من المنشآت
        return kpi.applicableTo && kpi.applicableTo[facilityType] === true;
    });
}

// جلب المؤشرات المتاحة لنوع منشأة وفئة محددة
function getAvailableKPIs(dataType, category, facilityType) {
    const categoryKPIs = getKPIsByCategory(dataType, category);
    
    // فلترة حسب نوع المنشأة
    return categoryKPIs.filter(kpi => {
        return kpi.applicableTo && kpi.applicableTo[facilityType] === true;
    });
}

// جلب مؤشر بواسطة ID
function getKPIById(kpiId) {
    const dataTypes = ['performance', 'excellence', 'monitoring', 'workforce'];
    
    for (const dataType of dataTypes) {
        const kpis = getAllKPIsByType(dataType);
        const kpi = kpis.find(k => k.id === kpiId);
        if (kpi) return kpi;
    }
    
    return null;
}

// جلب مؤشر بواسطة الكود
function getKPIByCode(dataType, code) {
    const kpis = getAllKPIsByType(dataType);
    return kpis.find(k => k.code === code);
}

// التحقق من وجود مؤشر
function kpiExists(dataType, code) {
    return getKPIByCode(dataType, code) !== undefined;
}

// حفظ مؤشر جديد
function saveKPI(kpiData) {
    const dataType = kpiData.dataType;
    const storageKey = `kpis_${dataType}`;
    
    // التحقق من عدم تكرار الكود
    if (kpiExists(dataType, kpiData.code)) {
        return { success: false, message: 'الكود موجود بالفعل' };
    }
    
    // إضافة معلومات إضافية
    kpiData.id = generateId();
    kpiData.custom = true;
    kpiData.createdAt = new Date().toISOString();
    
    // جلب المؤشرات الحالية
    let kpis = getAllKPIsByType(dataType);
    
    // إضافة المؤشر الجديد
    kpis.push(kpiData);
    
    // حفظ
    saveToStorage(storageKey, kpis);
    
    return { success: true, message: 'تم إضافة المؤشر بنجاح', kpi: kpiData };
}

// تحديث مؤشر
function updateKPI(kpiId, updatedData) {
    const dataType = updatedData.dataType;
    const storageKey = `kpis_${dataType}`;
    
    let kpis = getAllKPIsByType(dataType);
    const index = kpis.findIndex(k => k.id === kpiId);
    
    if (index === -1) {
        return { success: false, message: 'المؤشر غير موجود' };
    }
    
    // التحقق من عدم تكرار الكود (إذا تم تغييره)
    if (updatedData.code !== kpis[index].code) {
        if (kpiExists(dataType, updatedData.code)) {
            return { success: false, message: 'الكود موجود بالفعل' };
        }
    }
    
    // تحديث البيانات
    kpis[index] = {
        ...kpis[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
    };
    
    // حفظ
    saveToStorage(storageKey, kpis);
    
    return { success: true, message: 'تم تحديث المؤشر بنجاح', kpi: kpis[index] };
}

// حذف مؤشر
function deleteKPI(kpiId, dataType) {
    const storageKey = `kpis_${dataType}`;
    
    let kpis = getAllKPIsByType(dataType);
    const kpi = kpis.find(k => k.id === kpiId);
    
    if (!kpi) {
        return { success: false, message: 'المؤشر غير موجود' };
    }
    
    // حذف المؤشر
    kpis = kpis.filter(k => k.id !== kpiId);
    
    // حفظ
    saveToStorage(storageKey, kpis);
    
    // يمكن أيضاً حذف البيانات المرتبطة (اختياري)
    // deleteRelatedEntries(kpiId);
    
    return { success: true, message: 'تم حذف المؤشر بنجاح' };
}

// حذف جميع المؤشرات لنوع بيانات معين
function deleteAllKPIs(dataType) {
    const storageKey = `kpis_${dataType}`;
    saveToStorage(storageKey, []);
    return { success: true, message: 'تم حذف جميع المؤشرات' };
}

// جلب إحصائيات المؤشرات
function getKPIStats(dataType) {
    const kpis = getAllKPIsByType(dataType);
    
    const stats = {
        total: kpis.length,
        byCategory: {},
        byFacilityType: {
            hospital: 0,
            healthCenter: 0,
            healthUnit: 0
        }
    };
    
    kpis.forEach(kpi => {
        // حسب الفئة
        const category = kpi.category || kpi.department || kpi.section || 'other';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        // حسب نوع المنشأة
        if (kpi.applicableTo) {
            if (kpi.applicableTo.hospital) stats.byFacilityType.hospital++;
            if (kpi.applicableTo.healthCenter) stats.byFacilityType.healthCenter++;
            if (kpi.applicableTo.healthUnit) stats.byFacilityType.healthUnit++;
        }
    });
    
    return stats;
}

// تصدير المؤشرات إلى CSV
function exportKPIsToCSV(dataType) {
    const kpis = getAllKPIsByType(dataType);
    
    if (kpis.length === 0) {
        return null;
    }
    
    // إنشاء CSV Header
    let csv = 'الكود,الاسم,الفئة,الصيغة,البسط,المقام,المستهدف,الوحدة,مستشفى,مركز صحي,وحدة صحية\n';
    
    // إضافة البيانات
    kpis.forEach(kpi => {
        const row = [
            kpi.code || '',
            kpi.name || '',
            kpi.category || kpi.department || kpi.section || '',
            kpi.formula || '',
            kpi.numeratorLabel || '',
            kpi.denominatorLabel || '',
            kpi.target || '',
            kpi.unit || '',
            kpi.applicableTo?.hospital ? 'نعم' : 'لا',
            kpi.applicableTo?.healthCenter ? 'نعم' : 'لا',
            kpi.applicableTo?.healthUnit ? 'نعم' : 'لا'
        ].map(field => `"${field}"`).join(',');
        
        csv += row + '\n';
    });
    
    return csv;
}

// جلب اسم الفئة
function getCategoryName(dataType, categoryKey) {
    const categories = getCategoriesByDataType(dataType);
    return categories[categoryKey] || categoryKey;
}

// جلب نص أنواع المنشآت المتاحة
function getApplicableFacilitiesText(applicableTo) {
    const facilities = [];
    
    if (applicableTo.hospital) facilities.push('🏥 مستشفى');
    if (applicableTo.healthCenter) facilities.push('🏥 مركز صحي');
    if (applicableTo.healthUnit) facilities.push('🏥 وحدة صحية');
    
    return facilities.length > 0 ? facilities.join(', ') : 'غير محدد';
}

// توليد ID فريد
function generateId() {
    return 'kpi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * ===== دوال مساعدة للتوافق مع الكود القديم =====
 */

// جلب مؤشرات حسب الفئة (للتوافق)
function getKPIsByOldCategory(category) {
    // جلب من نوع الأداء فقط (للتوافق)
    const performanceKPIs = getAllKPIsByType('performance');
    return performanceKPIs.filter(kpi => kpi.category === category);
}

// جلب جميع المؤشرات (للتوافق)
function getAllKPIs() {
    const allKPIs = [];
    const dataTypes = ['performance', 'excellence', 'monitoring', 'workforce'];
    
    dataTypes.forEach(dataType => {
        const kpis = getAllKPIsByType(dataType);
        allKPIs.push(...kpis);
    });
    
    return allKPIs;
}
