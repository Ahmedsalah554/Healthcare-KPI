/**
 * ===== استيراد البيانات من Excel (محدث v2.0) =====
 * دعم الأقسام الفرعية والهيكل الجديد
 */

// تحميل مكتبة SheetJS (XLSX)
// يجب تضمين المكتبة في HTML: <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

let selectedImportDataType = null;
let selectedImportCategory = null;
let selectedImportSubcategory = null;

// ========================================
// واجهة الاستيراد
// ========================================

function loadImportInterface() {
    console.log('📥 Loading import interface...');
    
    const container = document.getElementById('importContent');
    if (!container) return;
    
    const dataTypes = getAllDataTypes();
    
    let html = `
        <div class="import-container">
            <div class="section-header">
                <h2>استيراد البيانات من Excel</h2>
                <p>اختر نوع البيانات ثم قم برفع ملف Excel</p>
            </div>
            
            <div class="import-steps">
                <div class="step-card">
                    <div class="step-number">1️⃣</div>
                    <h4>اختر نوع البيانات</h4>
                    <p>حدد نوع البيانات التي تريد استيرادها</p>
                </div>
                <div class="step-card">
                    <div class="step-number">2️⃣</div>
                    <h4>اختر القسم</h4>
                    <p>حدد القسم أو القسم الفرعي</p>
                </div>
                <div class="step-card">
                    <div class="step-number">3️⃣</div>
                    <h4>رفع الملف</h4>
                    <p>اختر ملف Excel وقم بالاستيراد</p>
                </div>
            </div>
            
            <div class="data-type-selector">
                <h3>الخطوة 1: اختر نوع البيانات</h3>
                <div class="data-type-grid">
    `;
    
    dataTypes.forEach(dataType => {
        html += `
            <div class="data-type-card" onclick="selectImportDataType('${dataType.id}')" style="border-left: 4px solid ${dataType.color}">
                <div class="data-type-icon" style="font-size: 3rem">${dataType.icon}</div>
                <h4>${dataType.name}</h4>
                <p class="data-type-desc">${dataType.description}</p>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <div id="importCategorySection" style="display: none; margin-top: 30px;"></div>
            <div id="importFileSection" style="display: none; margin-top: 30px;"></div>
            <div id="importResultSection" style="display: none; margin-top: 30px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

function selectImportDataType(dataTypeId) {
    selectedImportDataType = dataTypeId;
    selectedImportCategory = null;
    selectedImportSubcategory = null;
    
    const dataType = getDataTypeInfo(dataTypeId);
    console.log('Selected import data type:', dataType);
    
    showImportCategorySelection(dataType);
}

function showImportCategorySelection(dataType) {
    const categorySection = document.getElementById('importCategorySection');
    if (!categorySection) return;
    
    const categories = dataType.categories;
    
    let html = `
        <div class="import-step-section">
            <h3>الخطوة 2: اختر القسم</h3>
            <div class="category-grid">
    `;
    
    Object.values(categories).forEach(category => {
        html += `
            <div class="category-card" onclick="selectImportCategory('${dataType.id}', '${category.id}')" style="border-top: 3px solid ${category.color}">
                <div class="category-icon" style="color: ${category.color}; font-size: 2.5rem">${category.icon}</div>
                <h4>${category.name}</h4>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    categorySection.innerHTML = html;
    categorySection.style.display = 'block';
    
    // إخفاء الأقسام التالية
    document.getElementById('importFileSection').style.display = 'none';
    document.getElementById('importResultSection').style.display = 'none';
}

function selectImportCategory(dataTypeId, categoryId) {
    selectedImportDataType = dataTypeId;
    selectedImportCategory = categoryId;
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    // التحقق من وجود أقسام فرعية
    if (hasSubcategories(dataTypeId)) {
        const subcategories = getSubcategories(dataTypeId, categoryId);
        
        if (Object.keys(subcategories).length > 0) {
            showImportSubcategorySelection(dataType, categoryId, subcategories);
            return;
        }
    }
    
    // لا توجد أقسام فرعية - عرض واجهة رفع الملف
    showImportFileUpload(dataType, categoryId);
}

function showImportSubcategorySelection(dataType, categoryId, subcategories) {
    const categorySection = document.getElementById('importCategorySection');
    if (!categorySection) return;
    
    const category = dataType.categories[categoryId];
    
    let html = `
        <div class="import-step-section">
            <div class="breadcrumb">
                <span onclick="selectImportDataType('${dataType.id}')" style="cursor: pointer">← ${dataType.icon} ${dataType.name}</span>
                <span class="active">/ ${category.icon} ${category.name}</span>
            </div>
            
            <h3>اختر القسم الفرعي:</h3>
            <div class="subcategory-grid">
    `;
    
    Object.values(subcategories).forEach(subcategory => {
        html += `
            <div class="subcategory-card" onclick="selectImportSubcategory('${dataType.id}', '${categoryId}', '${subcategory.id}')">
                <div class="subcategory-icon" style="font-size: 2rem">${subcategory.icon || '📋'}</div>
                <h4>${subcategory.name}</h4>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    categorySection.innerHTML = html;
}

function selectImportSubcategory(dataTypeId, categoryId, subcategoryId) {
    selectedImportDataType = dataTypeId;
    selectedImportCategory = categoryId;
    selectedImportSubcategory = subcategoryId;
    
    const dataType = getDataTypeInfo(dataTypeId);
    showImportFileUpload(dataType, categoryId, subcategoryId);
}

function showImportFileUpload(dataType, categoryId, subcategoryId = null) {
    const fileSection = document.getElementById('importFileSection');
    if (!fileSection) return;
    
    const category = dataType.categories[categoryId];
    const subcategory = subcategoryId ? getSubcategories(dataType.id, categoryId)[subcategoryId] : null;
    
    let html = `
        <div class="import-step-section">
            <h3>الخطوة 3: رفع ملف Excel</h3>
            
            <div class="import-info-card">
                <h4>📋 المعلومات المطلوبة:</h4>
                <p><strong>نوع البيانات:</strong> ${dataType.icon} ${dataType.name}</p>
                <p><strong>القسم:</strong> ${category.icon} ${category.name}</p>
    `;
    
    if (subcategory) {
        html += `<p><strong>القسم الفرعي:</strong> ${subcategory.icon || '📋'} ${subcategory.name}</p>`;
    }
    
    html += `
            </div>
            
            <div class="template-section">
                <h4>📥 تحميل القالب:</h4>
                <p>قم بتحميل قالب Excel المناسب لنوع البيانات</p>
                <button onclick="downloadExcelTemplate('${dataType.id}', '${categoryId}')" class="btn btn-secondary">
                    📄 تحميل القالب
                </button>
            </div>
            
            <div class="upload-section">
                <h4>📤 رفع الملف:</h4>
                <div class="file-input-wrapper">
                    <input type="file" id="excelFileInput" accept=".xlsx,.xls" onchange="handleFileSelect(event)" class="file-input">
                    <label for="excelFileInput" class="file-input-label">
                        <span class="file-icon">📁</span>
                        <span class="file-text">اختر ��لف Excel</span>
                    </label>
                </div>
                <p id="selectedFileName" class="selected-file-name"></p>
                <button id="importButton" onclick="importExcelFile()" class="btn btn-primary" style="display: none;">
                    🚀 بدء الاستيراد
                </button>
            </div>
        </div>
    `;
    
    fileSection.innerHTML = html;
    fileSection.style.display = 'block';
}

// ========================================
// تحميل قوالب Excel
// ========================================

function downloadExcelTemplate(dataTypeId, categoryId) {
    const dataType = getDataTypeInfo(dataTypeId);
    
    if (!dataType) {
        showError('نوع البيانات غير موجود');
        return;
    }
    
    // إنشاء قالب Excel حسب نوع البيانات
    let worksheetData = [];
    
    if (dataType.inputType === 'count') {
        // القوى البشرية
        worksheetData = [
            ['العدد'],
            ['0'],
            ['مثال: 25']
        ];
    } else if (dataType.inputType === 'assessment') {
        // معايير التقييم
        worksheetData = [
            ['المعيار', 'التقييم', 'ملاحظات'],
            ['', '', ''],
            ['مثال: النظافة العامة', '2', 'ممتاز']
        ];
    } else if (dataType.inputType === 'formula') {
        // مؤشرات الأداء
        worksheetData = [
            ['الكود', 'المؤشر', 'نوع المؤشر', 'وصف المعادلة', 'البسط', 'المقام', 'الوصف', 'دورية الإبلاغ'],
            ['', '', 'formula أو direct', '', '', '', '', 'شهري'],
            ['WFM-01', 'نسبة الحضور', 'formula', '(الحاضرين ÷ الإجمالي) × 100', 'عدد الحاضرين', 'إجمالي الموظفين', '', 'شهري']
        ];
    } else if (dataType.inputType === 'monthly_data') {
        // مؤشرات التميز
        worksheetData = [
            ['الكود', 'المؤشر', 'الإدارة المسؤولة', 'معادلة الاحتساب', 'دورية التقييم'],
            ['', '', '', '', 'شهري'],
            ['A1', 'مؤشر الإنجاز', 'إدارة الوقائي', '(البسط ÷ الهدف) × 100', 'شهري']
        ];
    }
    
    // إنشاء workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // تنسيق العمود الأول (رأس الجدول)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center" }
        };
    }
    
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");
    
    // تصدير الملف
    const fileName = `template_${dataType.id}_${categoryId}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showSuccess('تم تحميل القالب بنجاح ✅');
}

// ========================================
// معالجة الملفات
// ========================================

let selectedFile = null;

function handleFileSelect(event) {
    selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
    
    const fileNameDisplay = document.getElementById('selectedFileName');
    const importButton = document.getElementById('importButton');
    
    if (fileNameDisplay) {
        fileNameDisplay.textContent = `📄 الملف المحدد: ${selectedFile.name}`;
        fileNameDisplay.style.display = 'block';
        fileNameDisplay.style.color = '#4caf50';
        fileNameDisplay.style.padding = '10px';
        fileNameDisplay.style.background = '#e8f5e9';
        fileNameDisplay.style.borderRadius = '8px';
        fileNameDisplay.style.marginTop = '10px';
    }
    
    if (importButton) {
        importButton.style.display = 'inline-block';
    }
}

function importExcelFile() {
    if (!selectedFile) {
        showError('الرجاء اختيار ملف أولاً');
        return;
    }
    
    if (!selectedImportDataType || !selectedImportCategory) {
        showError('الرجاء اختيار نوع البيانات والقسم');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // قراءة أول ورقة عمل
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // تحويل إلى JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            console.log('📊 Excel data loaded:', jsonData);
            
            // معالجة البيانات
            processImportedData(jsonData);
            
        } catch (error) {
            console.error('❌ Import error:', error);
            showError('خطأ في قراءة الملف: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        showError('فشل في قراءة الملف');
    };
    
    reader.readAsArrayBuffer(selectedFile);
}

// ========================================
// معالجة البيانات المستوردة
// ========================================

function processImportedData(excelData) {
    const dataType = getDataTypeInfo(selectedImportDataType);
    
    if (!dataType) {
        showError('نوع البيانات غير صحيح');
        return;
    }
    
    // إزالة رأس الجدول
    const headers = excelData[0];
    const rows = excelData.slice(1).filter(row => row && row.length > 0);
    
    console.log('Headers:', headers);
    console.log('Rows:', rows);
    
    if (rows.length === 0) {
        showError('لا توجد بيانات في الملف');
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    rows.forEach((row, index) => {
        // تجاهل الصفوف الفارغة أو أمثلة
        if (!row[0] || row[0].toString().includes('مثال')) {
            return;
        }
        
        let kpiData = {
            dataType: selectedImportDataType,
            category: selectedImportCategory,
            subcategory: selectedImportSubcategory,
            createdAt: new Date().toISOString(),
            imported: true
        };
        
        try {
            if (dataType.inputType === 'count') {
                // القوى البشرية
                kpiData.count = parseInt(row[0]) || 0;
                
            } else if (dataType.inputType === 'assessment') {
                // معايير التقييم
                kpiData.name = row[0] || '';
                kpiData.assessment = row[1] || '';
                kpiData.notes = row[2] || '';
                
                if (!kpiData.name) throw new Error('المعيار مطلوب');
                
            } else if (dataType.inputType === 'formula') {
                // مؤشرات الأداء
                kpiData.code = row[0] || '';
                kpiData.name = row[1] || '';
                kpiData.indicatorType = row[2] || 'formula';
                kpiData.formulaDescription = row[3] || '';
                kpiData.numeratorLabel = row[4] || '';
                kpiData.denominatorLabel = row[5] || '';
                kpiData.description = row[6] || '';
                kpiData.frequency = row[7] || 'شهري';
                
                if (!kpiData.code || !kpiData.name) throw new Error('الكود والاسم مطلوبان');
                
            } else if (dataType.inputType === 'monthly_data') {
                // مؤشرات التميز
                kpiData.code = row[0] || '';
                kpiData.name = row[1] || '';
                kpiData.responsibleDepartment = row[2] || '';
                kpiData.calculationFormula = row[3] || '';
                kpiData.periodicity = row[4] || 'شهري';
                
                if (!kpiData.code || !kpiData.name) throw new Error('الكود والاسم مطلوبان');
            }
            
            // حفظ البيانات
            const result = saveKPI(kpiData);
            
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
                errors.push(`الصف ${index + 2}: ${result.message}`);
            }
            
        } catch (error) {
            errorCount++;
            errors.push(`الصف ${index + 2}: ${error.message}`);
        }
    });
    
    // عرض النتائج
    displayImportResults(successCount, errorCount, errors);
}

function displayImportResults(successCount, errorCount, errors) {
    const resultSection = document.getElementById('importResultSection');
    if (!resultSection) return;
    
    let html = `
        <div class="import-results">
            <h3>📊 نتائج الاستيراد</h3>
            
            <div class="results-summary">
                <div class="result-card result-success">
                    <div class="result-icon">✅</div>
                    <div class="result-info">
                        <h4>نجح</h4>
                        <p class="result-value">${successCount}</p>
                    </div>
                </div>
                
                <div class="result-card result-error">
                    <div class="result-icon">❌</div>
                    <div class="result-info">
                        <h4>فشل</h4>
                        <p class="result-value">${errorCount}</p>
                    </div>
                </div>
                
                <div class="result-card result-total">
                    <div class="result-icon">📊</div>
                    <div class="result-info">
                        <h4>الإجمالي</h4>
                        <p class="result-value">${successCount + errorCount}</p>
                    </div>
                </div>
            </div>
    `;
    
    if (errorCount > 0 && errors.length > 0) {
        html += `
            <div class="errors-section">
                <h4>⚠️ الأخطاء:</h4>
                <ul class="error-list">
        `;
        
        errors.forEach(error => {
            html += `<li>${error}</li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    html += `
            <div class="result-actions">
                <button onclick="loadImportInterface()" class="btn btn-primary">🔄 استيراد ملف آخر</button>
            </div>
        </div>
    `;
    
    resultSection.innerHTML = html;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    if (successCount > 0) {
        showSuccess(`تم استيراد ${successCount} سجل بنجاح ✅`);
    }
    
    if (errorCount > 0) {
        showError(`فشل استيراد ${errorCount} سجل`);
    }
}

console.log('✅ Excel import script loaded (v2.0)');
