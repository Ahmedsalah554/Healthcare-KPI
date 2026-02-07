/**
 * ===== بيانات المؤشرات - كل قسم مستقل =====
 */

// جلب جميع المؤشرات حسب نوع البيانات (جميع الأقسام)
function getAllKPIsByType(dataTypeId) {
    const allKPIs = [];
    const categories = getCategoriesByDataType(dataTypeId);
    
    // جلب المؤشرات من كل قسم
    Object.keys(categories).forEach(categoryKey => {
        const categoryKPIs = getKPIsByCategory(dataTypeId, categoryKey);
        allKPIs.push(...categoryKPIs);
    });
    
    console.log(`📊 Total KPIs for ${dataTypeId}:`, allKPIs.length);
    return allKPIs;
}

// جلب المؤشرات حسب نوع البيانات والقسم (مستقل)
function getKPIsByCategory(dataTypeId, categoryId) {
    const storageKey = `kpis_${dataTypeId}_${categoryId}`;
    console.log('🔍 Getting KPIs from:', storageKey);
    
    const data = getFromStorage(storageKey, []);
    console.log(`Found ${data.length} KPIs in ${categoryId}`);
    
    return data;
}

// حفظ مؤشر جديد (في قسمه الخاص)
function saveKPI(kpiData) {
    console.log('💾 saveKPI called with:', kpiData);
    
    const dataType = kpiData.dataType;
    const category = kpiData.category;
    
    if (!dataType || !category) {
        console.error('❌ Missing dataType or category:', { dataType, category });
        return { success: false, message: 'نوع البيانات أو القسم غير محدد' };
    }
    
    const storageKey = `kpis_${dataType}_${category}`;
    console.log('Storage key:', storageKey);
    
    // التحقق من عدم تكرار الكود في نفس القسم
    if (kpiExistsInCategory(dataType, category, kpiData.code)) {
        console.log('❌ KPI already exists in category:', kpiData.code);
        return { success: false, message: 'الكود موجود بالفعل في هذا القسم' };
    }
    
    // إضافة معلومات إضافية
    kpiData.id = generateKPIId();
    kpiData.custom = true;
    kpiData.createdAt = new Date().toISOString();
    
    console.log('Generated ID:', kpiData.id);
    
    // جلب المؤشرات الحالية للقسم
    let kpis = getKPIsByCategory(dataType, category);
    console.log('Current KPIs in category:', kpis.length);
    
    // إضافة المؤشر الجديد
    kpis.push(kpiData);
    console.log('New KPIs count:', kpis.length);
    
    // حفظ في القسم المحدد
    const saved = saveToStorage(storageKey, kpis);
    console.log('Saved to storage:', saved);
    
    // تأكيد الحفظ
    const verification = getKPIsByCategory(dataType, category);
    console.log('✅ Verification - KPIs in category:', verification.length);
    
    return { success: true, message: 'تم إضافة المؤشر بنجاح', kpi: kpiData };
}

// تحديث مؤشر
function updateKPI(kpiId, updatedData) {
    const dataType = updatedData.dataType;
    const category = updatedData.category;
    const storageKey = `kpis_${dataType}_${category}`;
    
    console.log('🔄 Updating KPI:', kpiId, 'in', storageKey);
    
    let kpis = getKPIsByCategory(dataType, category);
    const index = kpis.findIndex(k => k.id === kpiId);
    
    if (index === -1) {
        console.error('❌ KPI not found:', kpiId);
        return { success: false, message: 'المؤشر غير موجود' };
    }
    
    // التحقق من عدم تكرار الكود (إذا تم تغييره)
    if (updatedData.code !== kpis[index].code) {
        if (kpiExistsInCategory(dataType, category, updatedData.code)) {
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
    console.log('✅ KPI updated');
    
    return { success: true, message: 'تم تحديث المؤشر بنجاح', kpi: kpis[index] };
}

// حذف مؤشر
function deleteKPI(kpiId, dataType) {
    console.log('🗑️ Deleting KPI:', kpiId);
    
    // البحث في جميع الأقسام
    const categories = getCategoriesByDataType(dataType);
    
    for (const categoryKey of Object.keys(categories)) {
        const storageKey = `kpis_${dataType}_${categoryKey}`;
        let kpis = getKPIsByCategory(dataType, categoryKey);
        
        const kpi = kpis.find(k => k.id === kpiId);
        
        if (kpi) {
            console.log('Found KPI in category:', categoryKey);
            
            // حذف المؤشر
            kpis = kpis.filter(k => k.id !== kpiId);
            
            // حفظ
            saveToStorage(storageKey, kpis);
            console.log('✅ KPI deleted from', categoryKey);
            
            return { success: true, message: 'تم حذف المؤشر بنجاح' };
        }
    }
    
    console.error('❌ KPI not found');
    return { success: false, message: 'المؤشر غير موجود' };
}

// التحقق من وجود مؤشر في قسم محدد
function kpiExistsInCategory(dataType, category, code) {
    const kpis = getKPIsByCategory(dataType, category);
    return kpis.some(k => k.code === code);
}

// جلب مؤشر بواسطة ID (البحث في جميع الأقسام)
function getKPIById(kpiId) {
    console.log('🔍 Searching for KPI:', kpiId);
    
    const dataTypes = ['workforce', 'hospital_assessment', 'performance', 'monthly_input'];
    
    for (const dataType of dataTypes) {
        const categories = getCategoriesByDataType(dataType);
        
        for (const categoryKey of Object.keys(categories)) {
            const kpis = getKPIsByCategory(dataType, categoryKey);
            const kpi = kpis.find(k => k.id === kpiId);
            
            if (kpi) {
                console.log('✅ Found KPI in:', dataType, categoryKey);
                return kpi;
            }
        }
    }
    
    console.log('❌ KPI not found');
    return null;
}

// حذف جميع المؤشرات لقسم معين
function deleteAllKPIsInCategory(dataType, category) {
    const storageKey = `kpis_${dataType}_${category}`;
    saveToStorage(storageKey, []);
    console.log('🗑️ Deleted all KPIs in:', storageKey);
    return { success: true, message: 'تم حذف جميع المؤشرات' };
}

// حذف جميع المؤشرات لنوع بيانات معين (جميع الأقسام)
function deleteAllKPIs(dataType) {
    const categories = getCategoriesByDataType(dataType);
    
    Object.keys(categories).forEach(categoryKey => {
        const storageKey = `kpis_${dataType}_${categoryKey}`;
        saveToStorage(storageKey, []);
    });
    
    console.log('🗑️ Deleted all KPIs for:', dataType);
    return { success: true, message: 'تم حذف جميع المؤشرات' };
}

// جلب إحصائيات المؤشرات
function getKPIStats(dataType) {
    const stats = {
        total: 0,
        byCategory: {},
        byFacilityType: {
            hospital: 0,
            healthCenter: 0,
            healthUnit: 0
        }
    };
    
    const categories = getCategoriesByDataType(dataType);
    
    Object.keys(categories).forEach(categoryKey => {
        const kpis = getKPIsByCategory(dataType, categoryKey);
        
        stats.byCategory[categoryKey] = kpis.length;
        stats.total += kpis.length;
        
        kpis.forEach(kpi => {
            if (kpi.applicableTo) {
                if (kpi.applicableTo.hospital) stats.byFacilityType.hospital++;
                if (kpi.applicableTo.healthCenter) stats.byFacilityType.healthCenter++;
                if (kpi.applicableTo.healthUnit) stats.byFacilityType.healthUnit++;
            }
        });
    });
    
    console.log('📊 KPI Stats:', stats);
    return stats;
}

// جلب جميع المؤشرات (للتوافق)
function getAllKPIs() {
    const allKPIs = [];
    const dataTypes = ['workforce', 'hospital_assessment', 'performance', 'monthly_input'];
    
    dataTypes.forEach(dataType => {
        const kpis = getAllKPIsByType(dataType);
        allKPIs.push(...kpis);
    });
    
    console.log('📊 Total KPIs (all types):', allKPIs.length);
    return allKPIs;
}

// تصدير المؤشرات إلى CSV
function exportKPIsToCSV(dataType, category = null) {
    let kpis;
    
    if (category) {
        kpis = getKPIsByCategory(dataType, category);
    } else {
        kpis = getAllKPIsByType(dataType);
    }
    
    if (kpis.length === 0) {
        return null;
    }
    
    const typeInfo = getDataTypeInfo(dataType);
    let csv = '';
    
    if (typeInfo.inputType === 'formula') {
        csv = 'الكود,المؤشر,الإدارة المسؤولة,البسط,المقام,المعادلة,النسبة المئوية,دورية الإبلاغ,مستشفى,مركز صحي,وحدة صحية\n';
        kpis.forEach(kpi => {
            const row = [
                kpi.code || '',
                kpi.name || '',
                kpi.department || '',
                kpi.numeratorLabel || '',
                kpi.denominatorLabel || '',
                kpi.formula || '',
                kpi.percentage || '',
                kpi.frequency || '',
                kpi.applicableTo?.hospital ? 'نعم' : 'لا',
                kpi.applicableTo?.healthCenter ? 'نعم' : 'لا',
                kpi.applicableTo?.healthUnit ? 'نعم' : 'لا'
            ].map(field => `"${field}"`).join(',');
            csv += row + '\n';
        });
    } else if (typeInfo.inputType === 'assessment') {
        csv = 'رقم المعيار,المعيار,التقييم,ملاحظات,مستشفى,مركز صحي,وحدة صحية\n';
        kpis.forEach(kpi => {
            const row = [
                kpi.code || '',
                kpi.name || '',
                kpi.assessment || '',
                kpi.notes || '',
                kpi.applicableTo?.hospital ? 'نعم' : 'لا',
                kpi.applicableTo?.healthCenter ? 'نعم' : 'لا',
                kpi.applicableTo?.healthUnit ? 'نعم' : 'لا'
            ].map(field => `"${field}"`).join(',');
            csv += row + '\n';
        });
    } else if (typeInfo.inputType === 'count') {
        csv = 'الكود,المسمى الوظيفي,العدد,مستشفى,مركز صحي,وحدة صحية\n';
        kpis.forEach(kpi => {
            const row = [
                kpi.code || '',
                kpi.jobTitle || '',
                kpi.count || '0',
                kpi.applicableTo?.hospital ? 'نعم' : 'لا',
                kpi.applicableTo?.healthCenter ? 'نعم' : 'لا',
                kpi.applicableTo?.healthUnit ? 'نعم' : 'لا'
            ].map(field => `"${field}"`).join(',');
            csv += row + '\n';
        });
    } else if (typeInfo.inputType === 'monthly_data') {
        csv = 'السنة,المؤشر,القيمة,مستشفى,مركز صحي,وحدة صحية\n';
        kpis.forEach(kpi => {
            const row = [
                kpi.year || '',
                kpi.kpiCode || '',
                kpi.monthValue || '',
                kpi.applicableTo?.hospital ? 'نعم' : 'لا',
                kpi.applicableTo?.healthCenter ? 'نعم' : 'لا',
                kpi.applicableTo?.healthUnit ? 'نعم' : 'لا'
            ].map(field => `"${field}"`).join(',');
            csv += row + '\n';
        });
    }
    
    return csv;
}

// جلب المؤشرات حسب نوع المنشأة
function getKPIsByFacilityType(dataType, facilityType) {
    const allKPIs = getAllKPIsByType(dataType);
    return allKPIs.filter(kpi => {
        if (!kpi.applicableTo) return true;
        return kpi.applicableTo[facilityType] === true;
    });
}

// جلب المؤشرات المخصصة فقط
function getCustomKPIs(dataType) {
    const allKPIs = getAllKPIsByType(dataType);
    return allKPIs.filter(kpi => kpi.custom === true);
}

// جلب المؤشرات الافتراضية فقط
function getDefaultKPIs(dataType) {
    const allKPIs = getAllKPIsByType(dataType);
    return allKPIs.filter(kpi => !kpi.custom);
}

// البحث في المؤشرات
function searchKPIs(dataType, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return getAllKPIsByType(dataType);
    }
    
    const term = searchTerm.toLowerCase().trim();
    const allKPIs = getAllKPIsByType(dataType);
    
    return allKPIs.filter(kpi => {
        return (kpi.code && kpi.code.toLowerCase().includes(term)) ||
               (kpi.name && kpi.name.toLowerCase().includes(term)) ||
               (kpi.department && kpi.department.toLowerCase().includes(term)) ||
               (kpi.jobTitle && kpi.jobTitle.toLowerCase().includes(term));
    });
}

// توليد ID فريد للمؤشر
function generateKPIId() {
    return 'kpi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// نسخ مؤشر إلى قسم آخر
function duplicateKPI(kpiId, targetCategory) {
    const kpi = getKPIById(kpiId);
    if (!kpi) {
        return { success: false, message: 'المؤشر غير موجود' };
    }
    
    const newKPI = { ...kpi };
    delete newKPI.id;
    newKPI.category = targetCategory;
    newKPI.code = newKPI.code + '_copy';
    
    return saveKPI(newKPI);
}

// استيراد مؤشرات متعددة
function importKPIs(kpisArray, dataType, category) {
    const results = {
        success: 0,
        failed: 0,
        errors: []
    };
    
    kpisArray.forEach((kpiData, index) => {
        kpiData.dataType = dataType;
        kpiData.category = category;
        
        const result = saveKPI(kpiData);
        
        if (result.success) {
            results.success++;
        } else {
            results.failed++;
            results.errors.push(`الصف ${index + 1}: ${result.message}`);
        }
    });
    
    return results;
}

console.log('✅ KPI data functions loaded');
