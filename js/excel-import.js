/**
 * ===== استيراد المؤشرات من ملف Excel/CSV =====
 */

// قراءة ملف CSV
function parseCSV(content) {
    const lines = content.split('\n');
    const result = [];
    
    for (let i = 1; i < lines.length; i++) { // تخطي الهيدر
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = parseCSVLine(line);
        
        if (columns.length < 3) continue;
        
        const kpiName = columns[0]?.trim();
        const kpiCode = columns[1]?.trim();
        const formula = columns[2]?.trim();
        
        if (!kpiName || !kpiCode) continue;
        
        // استخراج الفئة من الكود
        const categoryCode = extractCategoryFromCode(kpiCode);
        
        result.push({
            code: kpiCode,
            name: kpiName,
            category: categoryCode,
            formula: formula || 'غير محدد',
            numeratorLabel: 'البسط',
            denominatorLabel: 'المقام',
            target: 90,
            unit: '%',
            custom: true
        });
    }
    
    return result;
}

// تحليل سطر CSV (يدعم الفواصل داخل النصوص)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// استخراج الفئة من الكود
function extractCategoryFromCode(code) {
    const categoryMap = {
        'WFM': 'WFM',
        'UTZ': 'UTZ',
        'MP': 'MP',
        'ST': 'ST',
        'FM': 'FM',
        'IMT': 'IMT',
        'MM': 'MM',
        'LAB': 'LAB',
        'DF': 'DF',
        'PCC': 'PCC',
        'INT': 'INT',
        'PS': 'PS',
        'IPC': 'IPC',
        'OHS': 'OHS',
        'PHC': 'PHC'
    };
    
    const prefix = code.split('-')[0];
    return categoryMap[prefix] || 'OTHER';
}

// معالجة ملف Excel باستخدام SheetJS (اختياري)
async function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                const kpis = [];
                
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    
                    if (!row[0] || !row[1]) continue;
                    
                    const kpiName = String(row[0]).trim();
                    const kpiCode = String(row[1]).trim();
                    const formula = row[2] ? String(row[2]).trim() : 'غير محدد';
                    
                    const categoryCode = extractCategoryFromCode(kpiCode);
                    
                    kpis.push({
                        code: kpiCode,
                        name: kpiName,
                        category: categoryCode,
                        formula: formula,
                        numeratorLabel: 'البسط',
                        denominatorLabel: 'المقام',
                        target: 90,
                        unit: '%',
                        custom: true
                    });
                }
                
                resolve(kpis);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// معالجة رفع الملف
async function handleFileUpload(file) {
    const fileName = file.name.toLowerCase();
    
    showLoading('جاري قراءة الملف...');
    
    try {
        let kpis = [];
        
        if (fileName.endsWith('.csv')) {
            // قراءة CSV
            const text = await file.text();
            kpis = parseCSV(text);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // قراءة Excel (يتطلب مكتبة SheetJS)
            if (typeof XLSX === 'undefined') {
                throw new Error('مكتبة SheetJS غير متوفرة. استخدم ملف CSV بدلاً من ذلك.');
            }
            kpis = await parseExcel(file);
        } else {
            throw new Error('صيغة الملف غير مدعومة. استخدم CSV أو Excel.');
        }
        
        hideLoading();
        
        if (kpis.length === 0) {
            showError('لم يتم العثور على مؤشرات في الملف');
            return;
        }
        
        // عرض معاينة المؤشرات
        showKPIsPreview(kpis);
        
    } catch (error) {
        hideLoading();
        showError('خطأ في قراءة الملف: ' + error.message);
        console.error(error);
    }
}

// عرض معاينة المؤشرات
function showKPIsPreview(kpis) {
    const previewContainer = document.getElementById('importPreview');
    
    if (!previewContainer) return;
    
    // تجميع حسب الفئة
    const categorized = {};
    kpis.forEach(kpi => {
        if (!categorized[kpi.category]) {
            categorized[kpi.category] = [];
        }
        categorized[kpi.category].push(kpi);
    });
    
    previewContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-title">📋 معاينة المؤشرات المستوردة</div>
                <div>
                    <span class="badge badge-success" style="font-size: 1.1rem; padding: 8px 15px;">
                        ${kpis.length} مؤشر
                    </span>
                </div>
            </div>
            
            <div class="card-body">
                ${Object.keys(categorized).map(category => `
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #1a73e8; margin-bottom: 15px;">
                            ${KPI_CATEGORIES[category] || category} 
                            <span class="badge badge-primary">${categorized[category].length} مؤشر</span>
                        </h3>
                        
                        <div style="display: grid; gap: 10px;">
                            ${categorized[category].map(kpi => `
                                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-right: 3px solid #1a73e8;">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div style="flex: 1;">
                                            <strong style="color: #1a73e8;">${kpi.code}</strong>
                                            <span style="margin: 0 10px; color: #999;">|</span>
                                            <span>${kpi.name}</span>
                                        </div>
                                        <span class="badge badge-success">✓</span>
                                    </div>
                                    ${kpi.formula !== 'غير محدد' ? 
                                        `<div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                                            📐 ${kpi.formula.substring(0, 100)}${kpi.formula.length > 100 ? '...' : ''}
                                        </div>` : ''
                                    }
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="card-footer" style="display: flex; gap: 15px; justify-content: center; padding: 20px;">
                <button class="btn btn-success btn-large" onclick="confirmImport()">
                    ✅ تأكيد الاستيراد
                </button>
                <button class="btn btn-secondary btn-large" onclick="cancelImport()">
                    ❌ إلغاء
                </button>
            </div>
        </div>
    `;
    
    // حفظ المؤشرات مؤقتاً
    window.tempKPIs = kpis;
}

// تأكيد الاستيراد
function confirmImport() {
    if (!window.tempKPIs || window.tempKPIs.length === 0) {
        showError('لا توجد مؤشرات للاستيراد');
        return;
    }
    
    showLoading('جاري استيراد المؤشرات...');
    
    setTimeout(() => {
        try {
            // جلب المؤشرات المخصصة الحالية
            let customKPIs = getFromStorage('customKPIs', []);
            if (!Array.isArray(customKPIs)) customKPIs = [];
            
            // إضافة المؤشرات الجديدة
            let addedCount = 0;
            let skippedCount = 0;
            
            window.tempKPIs.forEach(kpi => {
                // التحقق من عدم التكرار
                const exists = customKPIs.find(k => k.code === kpi.code);
                if (!exists) {
                    customKPIs.push({
                        ...kpi,
                        createdAt: new Date().toISOString()
                    });
                    addedCount++;
                } else {
                    skippedCount++;
                }
            });
            
            // حفظ في LocalStorage
            saveToStorage('customKPIs', customKPIs);
            
            hideLoading();
            
            // عرض تقرير الاستيراد
            showImportReport(addedCount, skippedCount);
            
            // مسح المؤقت
            window.tempKPIs = null;
            
            // إعادة تحميل صفحة المؤشرات
            if (typeof loadKPIsManagement === 'function') {
                loadKPIsManagement();
            }
            
        } catch (error) {
            hideLoading();
            showError('خطأ في الاستيراد: ' + error.message);
            console.error(error);
        }
    }, 500);
}

// إلغاء الاستيراد
function cancelImport() {
    window.tempKPIs = null;
    
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    showInfo('تم إلغاء الاستيراد');
}

// عرض تقرير الاستيراد
function showImportReport(addedCount, skippedCount) {
    const previewContainer = document.getElementById('importPreview');
    
    if (!previewContainer) return;
    
    previewContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-title">✅ تقرير الاستيراد</div>
            </div>
            
            <div class="card-body" style="text-align: center; padding: 50px;">
                <div style="font-size: 5rem; margin-bottom: 20px;">🎉</div>
                <h2 style="color: #4caf50; margin-bottom: 20px;">تم الاستيراد بنجاح!</h2>
                
                <div style="display: flex; gap: 30px; justify-content: center; margin-top: 30px;">
                    <div style="background: #e8f5e9; padding: 25px; border-radius: 12px; min-width: 200px;">
                        <div style="font-size: 3rem; color: #4caf50; font-weight: 700;">${addedCount}</div>
                        <div style="color: #2e7d32; font-weight: 600; margin-top: 10px;">مؤشر جديد</div>
                    </div>
                    
                    ${skippedCount > 0 ? `
                        <div style="background: #fff3e0; padding: 25px; border-radius: 12px; min-width: 200px;">
                            <div style="font-size: 3rem; color: #ff9800; font-weight: 700;">${skippedCount}</div>
                            <div style="color: #ef6c00; font-weight: 600; margin-top: 10px;">مؤشر مكرر (تم تجاهله)</div>
                        </div>
                    ` : ''}
                </div>
                
                <button class="btn btn-primary btn-large" onclick="closeImportReport()" style="margin-top: 40px;">
                    ✓ إغلاق
                </button>
            </div>
        </div>
    `;
}

// إغلاق تقرير الاستيراد
function closeImportReport() {
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
}

// دوال مساعدة للتحميل
function showLoading(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 40px; border-radius: 15px; text-align: center; min-width: 300px;">
                <div class="spinner" style="margin: 0 auto 20px;"></div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #333;">${message}</div>
            </div>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

console.log('✅ Excel Import loaded successfully');
