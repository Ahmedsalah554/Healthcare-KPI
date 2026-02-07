/**
 * ===== بيانات المؤشرات - كل قسم مستقل (محدث) =====
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

// ✅ جلب المؤشرات حسب القسم الفرعي (جديد)
function getKPIsBySubcategory(dataTypeId, categoryId, subcategoryId) {
    const storageKey = `kpis_${dataTypeId}_${categoryId}_${subcategoryId}`;
    console.log('🔍 Getting KPIs from subcategory:', storageKey);
    
    const data = getFromStorage(storageKey, []);
    console.log(`Found ${data.length} KPIs in ${subcategoryId}`);
    
    return data;
}

// حفظ مؤشر جديد (في قسمه الخاص)
function saveKPI(kpiData) {
    console.log('💾 saveKPI called with:', kpiData);
    
    const dataType = kpiData.dataType;
    const category = kpiData.category;
    const subcategory = kpiData.subcategory;
    
    if (!dataType || !category) {
        console.error('❌ Missing dataType or category:', { dataType, category });
        return { success: false, message: 'نوع البيانات أو القسم غير محدد' };
    }
    
    // ✅ تحديد مفتاح التخزين (مع دعم الأقسام الفرعية)
    let storageKey;
    if (subcategory) {
        storageKey = `kpis_${dataType}_${category}_${subcategory}`;
    } else {
        storageKey = `kpis_${dataType}_${category}`;
    }
    console.log('Storage key:', storageKey);
    
    // التحقق من عدم تكرار الكود في نفس القسم
    if (kpiExistsInCategory(dataType, category, kpiData.code, subcategory)) {
        console.log('❌ KPI already exists:', kpiData.code);
        return { success: false, message: 'الكود موجود بالفعل في هذا القسم' };
    }
    
    // إضافة معلومات إضافية
    kpiData.id = generateKPIId();
    kpiData.custom = true;
    kpiData.createdAt = new Date().toISOString();
    
    console.log('Generated ID:', kpiData.id);
    
    // جلب المؤشرات الحالية للقسم
    let kpis = getFromStorage(storageKey, []);
    console.log('Current KPIs in category:', kpis.length);
    
    // إضافة المؤشر الجديد
    kpis.push(kpiData);
    console.log('New KPIs count:', kpis.length);
    
    // حفظ في القسم المحدد
    const saved = saveToStorage(storageKey, kpis);
    console.log('Saved to storage:', saved);
    
    // تأكيد الحفظ
    const verify = getFromStorage(storageKey, []);
    console.log('Verification - KPIs count after save:', verify.length);
    
    if (saved && verify.length === kpis.length) {
        console.log('✅ KPI saved successfully');
        return { success: true, message: 'تم حفظ المؤشر بنجاح', id: kpiData.id };
    } else {
        console.error('❌ Save verification failed');
        return { success: false, message: 'فشل في حفظ المؤشر' };
    }
}

// التحقق من وجود مؤشر بنفس الكود
function kpiExistsInCategory(dataType, category, code, subcategory = null) {
    let kpis;
    if (subcategory) {
        kpis = getKPIsBySubcategory(dataType, category, subcategory);
    } else {
        kpis = getKPIsByCategory(dataType, category);
    }
    
    return kpis.some(kpi => kpi.code === code);
}

// حذف مؤشر
function deleteKPI(dataType, category, kpiId, subcategory = null) {
    console.log('🗑️ Deleting KPI:', { dataType, category, kpiId, subcategory });
    
    let storageKey;
    if (subcategory) {
        storageKey = `kpis_${dataType}_${category}_${subcategory}`;
    } else {
        storageKey = `kpis_${dataType}_${category}`;
    }
    
    let kpis = getFromStorage(storageKey, []);
    const initialLength = kpis.length;
    
    // حذف المؤشر
    kpis = kpis.filter(kpi => kpi.id !== kpiId);
    
    if (kpis.length < initialLength) {
        saveToStorage(storageKey, kpis);
        console.log('✅ KPI deleted successfully');
        return { success: true, message: 'تم حذف المؤشر بنجاح' };
    } else {
        console.error('❌ KPI not found');
        return { success: false, message: 'المؤشر غير موجود' };
    }
}

// تحديث مؤشر
function updateKPI(dataType, category, kpiId, updatedData, subcategory = null) {
    console.log('📝 Updating KPI:', { dataType, category, kpiId, subcategory });
    
    let storageKey;
    if (subcategory) {
        storageKey = `kpis_${dataType}_${category}_${subcategory}`;
    } else {
        storageKey = `kpis_${dataType}_${category}`;
    }
    
    let kpis = getFromStorage(storageKey, []);
    const index = kpis.findIndex(kpi => kpi.id === kpiId);
    
    if (index !== -1) {
        // تحديث البيانات مع الحفاظ على الحقول الأساسية
        kpis[index] = {
            ...kpis[index],
            ...updatedData,
            id: kpiId, // الحفاظ على الـ ID
            updatedAt: new Date().toISOString()
        };
        
        saveToStorage(storageKey, kpis);
        console.log('✅ KPI updated successfully');
        return { success: true, message: 'تم تحديث المؤشر بنجاح' };
    } else {
        console.error('❌ KPI not found');
        return { success: false, message: 'المؤشر غير موجود' };
    }
}

// الحصول على مؤشر واحد بالـ ID
function getKPIById(dataType, category, kpiId, subcategory = null) {
    let kpis;
    if (subcategory) {
        kpis = getKPIsBySubcategory(dataType, category, subcategory);
    } else {
        kpis = getKPIsByCategory(dataType, category);
    }
    
    return kpis.find(kpi => kpi.id === kpiId) || null;
}

// توليد ID فريد للمؤشر
function generateKPIId() {
    return 'kpi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ✅ حفظ بيانات الإدخال الشهري (للمؤشرات)
function saveMonthlyData(monthlyData) {
    console.log('💾 Saving monthly data:', monthlyData);
    
    const { dataType, category, kpiCode, month, year } = monthlyData;
    
    if (!dataType || !category || !kpiCode || !month || !year) {
        return { success: false, message: 'بيانات غير كاملة' };
    }
    
    // مفتاح التخزين للبيانات الشهرية
    const storageKey = `monthly_data_${dataType}_${category}_${year}`;
    
    // جلب البيانات الحالية
    let allMonthlyData = getFromStorage(storageKey, []);
    
    // إضافة ID فريد
    monthlyData.id = generateKPIId();
    monthlyData.createdAt = new Date().toISOString();
    
    // إضافة البيانات الجديدة
    allMonthlyData.push(monthlyData);
    
    // حفظ
    const saved = saveToStorage(storageKey, allMonthlyData);
    
    if (saved) {
        return { success: true, message: 'تم حفظ البيانات بنجاح', id: monthlyData.id };
    } else {
        return { success: false, message: 'فشل في حفظ البيانات' };
    }
}

// ✅ جلب البيانات الشهرية
function getMonthlyData(dataType, category, year, month = null) {
    const storageKey = `monthly_data_${dataType}_${category}_${year}`;
    let data = getFromStorage(storageKey, []);
    
    // تصفية حسب الشهر إن وُجد
    if (month) {
        data = data.filter(d => d.month === month);
    }
    
    return data;
}

// ✅ حساب النتيجة التلقائية (للمؤشرات الحسابية)
function calculateResult(indicatorType, numerator, denominator, target = null) {
    if (indicatorType === 'formula') {
        // صيغة حسابية: (بسط ÷ مقام) × 100
        if (!denominator || denominator === 0) return 0;
        return (numerator / denominator) * 100;
    } else if (indicatorType === 'direct') {
        // قيمة مباشرة
        return numerator;
    } else if (indicatorType === 'monthly_data') {
        // مؤشرات التميز: (بسط ÷ هدف) × 100
        if (!target || target === 0) return 0;
        return (numerator / target) * 100;
    }
    return 0;
}

// إحصائيات المؤشرات
function getKPIStatistics(dataTypeId) {
    const categories = getCategoriesByDataType(dataTypeId);
    const stats = {
        totalCategories: Object.keys(categories).length,
        totalKPIs: 0,
        kpisByCategory: {}
    };
    
    Object.keys(categories).forEach(categoryKey => {
        const categoryKPIs = getKPIsByCategory(dataTypeId, categoryKey);
        stats.kpisByCategory[categoryKey] = categoryKPIs.length;
        stats.totalKPIs += categoryKPIs.length;
    });
    
    return stats;
}

// تصدير البيانات (JSON)
function exportKPIData(dataTypeId, categoryId = null) {
    let data;
    
    if (categoryId) {
        data = getKPIsByCategory(dataTypeId, categoryId);
    } else {
        data = getAllKPIsByType(dataTypeId);
    }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi_data_${dataTypeId}_${categoryId || 'all'}_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// استيراد البيانات (JSON)
function importKPIData(file, dataTypeId, categoryId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!Array.isArray(data)) {
                    reject('البيانات غير صحيحة');
                    return;
                }
                
                const storageKey = `kpis_${dataTypeId}_${categoryId}`;
                const existingKPIs = getFromStorage(storageKey, []);
                
                // دمج البيانات (تجنب التكرار)
                data.forEach(kpi => {
                    if (!existingKPIs.some(existing => existing.code === kpi.code)) {
                        kpi.id = generateKPIId();
                        kpi.importedAt = new Date().toISOString();
                        existingKPIs.push(kpi);
                    }
                });
                
                saveToStorage(storageKey, existingKPIs);
                resolve({ success: true, count: data.length });
                
            } catch (error) {
                reject('خطأ في قراءة الملف: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            reject('فشل في قراءة الملف');
        };
        
        reader.readAsText(file);
    });
}

console.log('✅ KPI Data functions loaded (Updated v2.0)');
