/**
 * ===== استيراد المؤشرات من Excel/CSV =====
 */

// معالجة اختيار الملف
function handleKPIFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    console.log('📁 File selected:', file.name);
    
    // التحقق من نوع الملف
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['xlsx', 'xls', 'csv'];
    
    if (!validExtensions.includes(fileExtension)) {
        showError('نوع الملف غير صحيح. يرجى اختيار ملف Excel (.xlsx, .xls) أو CSV (.csv)');
        event.target.value = '';
        return;
    }
    
    // عرض رسالة تحميل
    showLoadingMessage('جاري قراءة الملف...');
    
    // قراءة الملف
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let data;
            
            if (fileExtension === 'csv') {
                // قراءة CSV
                data = parseCSV(e.target.result);
            } else {
                // قراءة Excel
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            }
            
            console.log('📊 Data read:', data.length, 'rows');
            
            // معالجة البيانات
            processImportedData(data);
            
        } catch (error) {
            console.error('Error reading file:', error);
            showError('حدث خطأ في قراءة الملف: ' + error.message);
            hideLoadingMessage();
        }
    };
    
    reader.onerror = function() {
        showError('فشل في قراءة الملف');
        hideLoadingMessage();
    };
    
    // قراءة الملف حسب النوع
    if (fileExtension === 'csv') {
        reader.readAsText(file, 'UTF-8');
    } else {
        reader.readAsBinaryString(file);
    }
}

// معالجة البيانات المستوردة
function processImportedData(data) {
    if (!data || data.length < 2) {
        showError('الملف فارغ أو لا يحتوي على بيانات كافية');
        hideLoadingMessage();
        return;
    }
    
    console.log('🔄 Processing data...');
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    if (!typeInfo) {
        showError('يرجى اختيار نوع البيانات أولاً');
        hideLoadingMessage();
        return;
    }
    
    // استخراج الهيدر (الصف الأول)
    const headers = data[0].map(h => String(h).trim());
    
    console.log('📋 Headers:', headers);
    
    // التحقق من الأعمدة المطلوبة
    const requiredColumns = detectRequiredColumns(headers, typeInfo);
    
    if (!requiredColumns.valid) {
        showError('الملف لا يحتوي على الأعمدة المطلوبة: ' + requiredColumns.missing.join(', '));
        hideLoadingMessage();
        return;
    }
    
    // معالجة الصفوف
    const kpis = [];
    const errors = [];
    const skipped = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        if (!row || row.length === 0 || !row[0]) {
            continue; // تجاهل الصفوف الفارغة
        }
        
        try {
            const kpiData = extractKPIFromRow(row, headers, requiredColumns, typeInfo);
            
            if (kpiData) {
                // التحقق من عدم التكرار
                if (kpiExists(selectedKPIDataType, kpiData.code)) {
                    skipped.push(`${kpiData.code} - ${kpiData.name} (موجود مسبقاً)`);
                } else {
                    kpis.push(kpiData);
                }
            }
        } catch (error) {
            errors.push(`الصف ${i + 1}: ${error.message}`);
        }
    }
    
    console.log('✅ Processed:', kpis.length, 'KPIs');
    console.log('⚠️ Skipped:', skipped.length, 'KPIs');
    console.log('❌ Errors:', errors.length, 'rows');
    
    // عرض معاينة
    showImportPreview(kpis, skipped, errors, typeInfo);
}

// كشف الأعمدة المطلوبة
function detectRequiredColumns(headers, typeInfo) {
    const result = {
        valid: true,
        missing: [],
        columns: {}
    };
    
    // الأعمدة الأساسية
    const basicColumns = {
        code: ['كود', 'الكود', 'code', 'رمز', 'ID'],
        name: ['اسم', 'الاسم', 'name', 'المؤشر', 'indicator'],
        category: ['فئة', 'الفئة', 'category', 'قسم', 'department'],
        target: ['مستهدف', 'المستهدف', 'target', 'هدف'],
        unit: ['وحدة', 'الوحدة', 'unit']
    };
    
    // البحث عن الأعمدة
    for (const [key, aliases] of Object.entries(basicColumns)) {
        const index = headers.findIndex(h => 
            aliases.some(alias => h.toLowerCase().includes(alias.toLowerCase()))
        );
        
        if (index !== -1) {
            result.columns[key] = index;
        } else {
            result.missing.push(aliases[0]);
            result.valid = false;
        }
    }
    
    // أعمدة إضافية حسب النوع
    if (typeInfo.hasFormula) {
        const formulaIndex = headers.findIndex(h => 
            ['صيغة', 'الصيغة', 'formula', 'معادلة'].some(alias => 
                h.toLowerCase().includes(alias.toLowerCase())
            )
        );
        if (formulaIndex !== -1) {
            result.columns.formula = formulaIndex;
        }
    }
    
    if (typeInfo.hasNumeratorDenominator) {
        const numeratorIndex = headers.findIndex(h => 
            ['بسط', 'البسط', 'numerator'].some(alias => 
                h.toLowerCase().includes(alias.toLowerCase())
            )
        );
        const denominatorIndex = headers.findIndex(h => 
            ['مقام', 'المقام', 'denominator'].some(alias => 
                h.toLowerCase().includes(alias.toLowerCase())
            )
        );
        
        if (numeratorIndex !== -1) result.columns.numerator = numeratorIndex;
        if (denominatorIndex !== -1) result.columns.denominator = denominatorIndex;
    }
    
    // أعمدة المنشآت
    const hospitalIndex = headers.findIndex(h => 
        ['مستشفى', 'hospital'].some(alias => h.toLowerCase().includes(alias.toLowerCase()))
    );
    const centerIndex = headers.findIndex(h => 
        ['مركز', 'center'].some(alias => h.toLowerCase().includes(alias.toLowerCase()))
    );
    const unitIndex = headers.findIndex(h => 
        ['وحدة', 'unit', 'health unit'].some(alias => h.toLowerCase().includes(alias.toLowerCase()))
    );
    
    if (hospitalIndex !== -1) result.columns.hospital = hospitalIndex;
    if (centerIndex !== -1) result.columns.healthCenter = centerIndex;
    if (unitIndex !== -1) result.columns.healthUnit = unitIndex;
    
    return result;
}

// استخراج بيانات المؤشر من الصف
function extractKPIFromRow(row, headers, columns, typeInfo) {
    const kpiData = {
        dataType: selectedKPIDataType,
        code: String(row[columns.columns.code] || '').trim(),
        name: String(row[columns.columns.name] || '').trim(),
        category: extractCategory(String(row[columns.columns.category] || '').trim(), typeInfo.id),
        target: parseFloat(row[columns.columns.target]) || 0,
        unit: String(row[columns.columns.unit] || '%').trim(),
        applicableTo: {
            hospital: true,
            healthCenter: true,
            healthUnit: true
        }
    };
    
    // التحقق من البيانات الأساسية
    if (!kpiData.code || !kpiData.name) {
        throw new Error('الكود أو الاسم فارغ');
    }
    
    // الصيغة
    if (typeInfo.hasFormula && columns.columns.formula !== undefined) {
        kpiData.formula = String(row[columns.columns.formula] || '').trim();
    }
    
    // البسط والمقام
    if (typeInfo.hasNumeratorDenominator) {
        if (columns.columns.numerator !== undefined) {
            kpiData.numeratorLabel = String(row[columns.columns.numerator] || '').trim();
        }
        if (columns.columns.denominator !== undefined) {
            kpiData.denominatorLabel = String(row[columns.columns.denominator] || '').trim();
        }
    }
    
    // أنواع المنشآت
    if (columns.columns.hospital !== undefined) {
        const val = String(row[columns.columns.hospital] || '').trim().toLowerCase();
        kpiData.applicableTo.hospital = ['نعم', 'yes', '1', 'true', 'x'].includes(val);
    }
    if (columns.columns.healthCenter !== undefined) {
        const val = String(row[columns.columns.healthCenter] || '').trim().toLowerCase();
        kpiData.applicableTo.healthCenter = ['نعم', 'yes', '1', 'true', 'x'].includes(val);
    }
    if (columns.columns.healthUnit !== undefined) {
        const val = String(row[columns.columns.healthUnit] || '').trim().toLowerCase();
        kpiData.applicableTo.healthUnit = ['نعم', 'yes', '1', 'true', 'x'].includes(val);
    }
    
    return kpiData;
}

// استخراج الفئة من الكود أو النص
function extractCategory(categoryText, dataType) {
    const categories = getCategoriesByDataType(dataType);
    
    // البحث بالكود (مثل WFM)
    for (const [key, value] of Object.entries(categories)) {
        if (categoryText.toUpperCase().includes(key)) {
            return key;
        }
        if (categoryText.includes(value)) {
            return key;
        }
    }
    
    // إذا لم يتم العثور، استخدام أول فئة
    return Object.keys(categories)[0];
}

// عرض معاينة الاستيراد
function showImportPreview(kpis, skipped, errors, typeInfo) {
    hideLoadingMessage();
    
    const previewContainer = document.getElementById('importPreview');
    if (!previewContainer) return;
    
    let html = '';
    
    // إحصائيات
    html += `
        <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">📊 ملخص الاستيراد</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                <div style="padding: 15px; background: white; border-radius: 8px; border: 2px solid #4caf50;">
                    <div style="font-size: 2rem; color: #4caf50; font-weight: 700;">${kpis.length}</div>
                    <div style="color: #666; font-size: 0.9rem;">جاهز للإضافة</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border: 2px solid #ff9800;">
                    <div style="font-size: 2rem; color: #ff9800; font-weight: 700;">${skipped.length}</div>
                    <div style="color: #666; font-size: 0.9rem;">تم تجاهله</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; border: 2px solid #f44336;">
                    <div style="font-size: 2rem; color: #f44336; font-weight: 700;">${errors.length}</div>
                    <div style="color: #666; font-size: 0.9rem;">أخطاء</div>
                </div>
            </div>
        </div>
    `;
    
    // المؤشرات الجاهزة
    if (kpis.length > 0) {
        html += `
            <div style="margin: 20px 0;">
                <h4 style="color: #4caf50; margin-bottom: 10px;">✅ المؤشرات الجاهزة للإضافة (${kpis.length})</h4>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; background: white;">
                    ${kpis.map((kpi, index) => `
                        <div style="padding: 10px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between;">
                            <div>
                                <strong style="color: ${typeInfo.color};">${kpi.code}</strong> - ${kpi.name}
                                <small style="color: #999; display: block; margin-top: 3px;">
                                    ${getCategoryName(kpi.dataType, kpi.category)} | المستهدف: ${kpi.target}${kpi.unit}
                                </small>
                            </div>
                            <span style="color: #4caf50;">✓</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // المؤشرات المتجاهلة
    if (skipped.length > 0) {
        html += `
            <div style="margin: 20px 0;">
                <h4 style="color: #ff9800; margin-bottom: 10px;">⚠️ المؤشرات المتجاهلة (${skipped.length})</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ffe0b2; border-radius: 8px; padding: 10px; background: #fff3e0;">
                    ${skipped.map(item => `
                        <div style="padding: 5px 10px; color: #e65100; font-size: 0.9rem;">• ${item}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // الأخطاء
    if (errors.length > 0) {
        html += `
            <div style="margin: 20px 0;">
                <h4 style="color: #f44336; margin-bottom: 10px;">❌ الأخطاء (${errors.length})</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ffcdd2; border-radius: 8px; padding: 10px; background: #ffebee;">
                    ${errors.map(error => `
                        <div style="padding: 5px 10px; color: #c62828; font-size: 0.9rem;">• ${error}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // أزرار الإجراء
    html += `
        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e0e0e0; display: flex; gap: 15px; justify-content: center;">
            ${kpis.length > 0 ? `
                <button class="btn btn-success btn-large" onclick="confirmImport()" style="min-width: 200px;">
                    ✓ تأكيد وإضافة ${kpis.length} مؤشر
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="cancelImport()">
                إلغاء
            </button>
        </div>
    `;
    
    previewContainer.innerHTML = html;
    
    // حفظ البيانات مؤقتاً
    window.pendingKPIsImport = kpis;
}

// تأكيد الاستيراد
function confirmImport() {
    if (!window.pendingKPIsImport || window.pendingKPIsImport.length === 0) {
        showError('لا توجد بيانات للاستيراد');
        return;
    }
    
    console.log('💾 Importing', window.pendingKPIsImport.length, 'KPIs...');
    
    showLoadingMessage('جاري إضافة المؤشرات...');
    
    let successCount = 0;
    let failCount = 0;
    
    window.pendingKPIsImport.forEach(kpiData => {
        const result = saveKPI(kpiData);
        if (result.success) {
            successCount++;
        } else {
            failCount++;
            console.error('Failed to save KPI:', kpiData.code, result.message);
        }
    });
    
    hideLoadingMessage();
    
    // إغلاق النافذة
    closeModal('importModal');
    
    // عرض النتيجة
    if (successCount > 0) {
        showSuccess(`تم إضافة ${successCount} مؤشر بنجاح!`);
        
        // تحديث العرض
        loadKPIsList(selectedKPIDataType);
        updateDashboardStats();
        selectKPIDataType(selectedKPIDataType);
    }
    
    if (failCount > 0) {
        showWarning(`فشل في إضافة ${failCount} مؤشر`);
    }
    
    // مسح البيانات المؤقتة
    window.pendingKPIsImport = null;
    
    // إعادة تعيين الفورم
    const fileInput = document.getElementById('kpiFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
}

// إلغاء الاستيراد
function cancelImport() {
    if (confirm('هل أنت متأكد من إلغاء الاستيراد؟')) {
        window.pendingKPIsImport = null;
        
        const fileInput = document.getElementById('kpiFileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        const previewContainer = document.getElementById('importPreview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        closeModal('importModal');
    }
}

// قراءة CSV
function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    
    for (let line of lines) {
        if (!line.trim()) continue;
        
        const row = [];
        let cell = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        
        row.push(cell.trim());
        result.push(row);
    }
    
    return result;
}

// عرض رسالة تحميل
function showLoadingMessage(message) {
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 20px; animation: spin 1s linear infinite;">⏳</div>
                <h3 style="color: #333; margin-bottom: 10px;">${message}</h3>
                <p style="color: #666;">الرجاء الانتظار...</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    }
}

// إخفاء رسالة التحميل
function hideLoadingMessage() {
    // يتم استبدالها بالمحتوى الجديد
}

// تصدير المؤشرات إلى Excel
function exportKPIsToExcel() {
    const kpis = getAllKPIsByType(selectedKPIDataType);
    
    if (kpis.length === 0) {
        showError('لا توجد مؤشرات للتصدير');
        return;
    }
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    
    // إنشاء البيانات
    const data = [
        ['الكود', 'الاسم', 'الفئة', 'الصيغة', 'البسط', 'المقام', 'المستهدف', 'الوحدة', 'مستشفى', 'مركز صحي', 'وحدة صحية']
    ];
    
    kpis.forEach(kpi => {
        data.push([
            kpi.code,
            kpi.name,
            getCategoryName(kpi.dataType, kpi.category),
            kpi.formula || '',
            kpi.numeratorLabel || '',
            kpi.denominatorLabel || '',
            kpi.target,
            kpi.unit,
            kpi.applicableTo?.hospital ? 'نعم' : 'لا',
            kpi.applicableTo?.healthCenter ? 'نعم' : 'لا',
            kpi.applicableTo?.healthUnit ? 'نعم' : 'لا'
        ]);
    });
    
    // إنشاء Workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, typeInfo.name);
    
    // تنزيل الملف
    const fileName = `${typeInfo.name}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showSuccess('تم تصدير المؤشرات بنجاح');
}

// تنزيل نموذج Excel
function downloadExcelTemplate() {
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    
    if (!typeInfo) {
        showError('الرجاء اختيار نوع البيانات أولاً');
        return;
    }
    
    // إنشاء البيانات
    const data = [
        ['الكود', 'الاسم', 'الفئة', 'الصيغة', 'البسط', 'المقام', 'المستهدف', 'الوحدة', 'مستشفى', 'مركز صحي', 'وحدة صحية'],
        ['WFM-01', 'مثال على مؤشر', 'WFM', '(البسط / المقام) × 100', 'عدد الحالات', 'إجمالي الحالات', '85', '%', 'نعم', 'نعم', 'لا']
    ];
    
    // إنشاء Workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج');
    
    // تنزيل الملف
    const fileName = `نموذج_${typeInfo.name}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showSuccess('تم تنزيل النموذج بنجاح');
}
