/**
 * ===== استيراد المؤشرات من Excel/CSV =====
 */

function handleKPIFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    console.log('📁 File selected:', file.name);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['xlsx', 'xls', 'csv'];
    
    if (!validExtensions.includes(fileExtension)) {
        showError('نوع الملف غير صحيح. يرجى اختيار ملف Excel (.xlsx, .xls) أو CSV (.csv)');
        event.target.value = '';
        return;
    }
    
    if (!selectedKPIDataType || !selectedKPICategory) {
        showError('الرجاء اختيار نوع البيانات والقسم أولاً');
        event.target.value = '';
        return;
    }
    
    showLoadingMessage('جاري قراءة الملف...');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let data;
            
            if (fileExtension === 'csv') {
                data = parseCSV(e.target.result);
            } else {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            }
            
            console.log('📊 Data read:', data.length, 'rows');
            console.log('First 3 rows:', data.slice(0, 3));
            
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
    
    if (fileExtension === 'csv') {
        reader.readAsText(file, 'UTF-8');
    } else {
        reader.readAsBinaryString(file);
    }
}

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
    
    // تنظيف الهيدر من القيم الفارغة
    const rawHeaders = data[0];
    const headers = rawHeaders.map(h => {
        if (h === null || h === undefined || h === '') {
            return '';
        }
        return String(h).trim();
    }).filter(h => h !== ''); // إزالة الخلايا الفارغة تماماً
    
    console.log('📋 Cleaned Headers:', headers);
    
    if (headers.length === 0) {
        showError('الملف لا يحتوي على أعمدة صالحة');
        hideLoadingMessage();
        return;
    }
    
    const requiredColumns = detectRequiredColumns(headers, typeInfo);
    
    if (!requiredColumns.valid) {
        showError('الملف لا يحتوي على الأعمدة المطلوبة:\n\n' + requiredColumns.missing.join('\n'));
        hideLoadingMessage();
        return;
    }
    
    const kpis = [];
    const errors = [];
    const skipped = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        if (!row || row.length === 0 || !row[0]) {
            continue;
        }
        
        try {
            const kpiData = extractKPIFromRow(row, rawHeaders, requiredColumns, typeInfo);
            
            if (kpiData) {
                if (kpiExistsInCategory(selectedKPIDataType, selectedKPICategory, kpiData.code)) {
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
    
    showImportPreview(kpis, skipped, errors, typeInfo);
}

function detectRequiredColumns(headers, typeInfo) {
    const result = {
        valid: true,
        missing: [],
        columns: {}
    };
    
    console.log('🔍 Detecting columns for:', typeInfo.id);
    console.log('Headers to search:', headers);
    
    // دالة مساعدة للبحث الآمن
    function findColumnIndex(aliases) {
        return headers.findIndex(h => {
            if (!h || h === '') return false;
            const headerLower = String(h).toLowerCase();
            return aliases.some(alias => headerLower.includes(alias.toLowerCase()));
        });
    }
    
    // الأعمدة الأساسية
    const basicColumns = {
        code: ['كود', 'الكود', 'code', 'رمز', 'ID', 'id'],
        name: ['اسم', 'الاسم', 'name', 'المؤشر', 'indicator', 'الوظيفة', 'المعيار', 'المسمى']
    };
    
    // البحث عن الأعمدة الأساسية
    for (const [key, aliases] of Object.entries(basicColumns)) {
        const index = findColumnIndex(aliases);
        
        if (index !== -1) {
            result.columns[key] = index;
            console.log(`✅ Found ${key} at index ${index}`);
        } else {
            result.missing.push(aliases[0]);
            result.valid = false;
            console.log(`❌ Missing ${key}`);
        }
    }
    
    // أعمدة إضافية حسب النوع
    if (typeInfo.inputType === 'formula') {
        const formulaIndex = findColumnIndex(['صيغة', 'الصيغة', 'formula', 'معادلة']);
        if (formulaIndex !== -1) result.columns.formula = formulaIndex;
        
        const numeratorIndex = findColumnIndex(['بسط', 'البسط', 'numerator']);
        if (numeratorIndex !== -1) result.columns.numerator = numeratorIndex;
        
        const denominatorIndex = findColumnIndex(['مقام', 'المقام', 'denominator']);
        if (denominatorIndex !== -1) result.columns.denominator = denominatorIndex;
        
        const targetIndex = findColumnIndex(['مستهدف', 'المستهدف', 'target', 'هدف']);
        if (targetIndex !== -1) result.columns.target = targetIndex;
        
        const unitIndex = findColumnIndex(['وحدة', 'الوحدة', 'unit']);
        if (unitIndex !== -1) result.columns.unit = unitIndex;
        
    } else if (typeInfo.inputType === 'weighted') {
        const weightIndex = findColumnIndex(['وزن', 'الوزن', 'weight']);
        if (weightIndex !== -1) result.columns.weight = weightIndex;
        
        const maxScoreIndex = findColumnIndex(['درجة', 'الدرجة', 'maxscore', 'score', 'قصوى']);
        if (maxScoreIndex !== -1) result.columns.maxScore = maxScoreIndex;
        
    } else if (typeInfo.inputType === 'checklist') {
        const evalIndex = findColumnIndex(['تقييم', 'evaluation', 'نوع التقييم', 'نوع']);
        if (evalIndex !== -1) result.columns.evaluationType = evalIndex;
        
        const descIndex = findColumnIndex(['وصف', 'الوصف', 'description']);
        if (descIndex !== -1) result.columns.description = descIndex;
        
    } else if (typeInfo.inputType === 'count') {
        const jobIndex = findColumnIndex(['وظيفة', 'المسمى', 'job', 'title', 'مسمى']);
        if (jobIndex !== -1) result.columns.jobTitle = jobIndex;
        
        const contractIndex = findColumnIndex(['عقد', 'نوع العقد', 'contract', 'نوع']);
        if (contractIndex !== -1) result.columns.contractType = contractIndex;
    }
    
    // أعمدة المنشآت
    const hospitalIndex = findColumnIndex(['مستشفى', 'hospital']);
    const centerIndex = findColumnIndex(['مركز', 'center']);
    const unitIndex = findColumnIndex(['وحدة', 'unit', 'health unit']);
    
    if (hospitalIndex !== -1) result.columns.hospital = hospitalIndex;
    if (centerIndex !== -1) result.columns.healthCenter = centerIndex;
    if (unitIndex !== -1) result.columns.healthUnit = unitIndex;
    
    console.log('📊 Detection result:', result);
    
    return result;
}

function extractKPIFromRow(row, headers, columns, typeInfo) {
    const kpiData = {
        dataType: selectedKPIDataType,
        category: selectedKPICategory,
        code: String(row[columns.columns.code] || '').trim(),
        name: String(row[columns.columns.name] || '').trim(),
        applicableTo: {
            hospital: true,
            healthCenter: true,
            healthUnit: true
        }
    };
    
    if (!kpiData.code || !kpiData.name) {
        throw new Error('الكود أو الاسم فارغ');
    }
    
    if (typeInfo.inputType === 'formula') {
        if (columns.columns.formula !== undefined) {
            kpiData.formula = String(row[columns.columns.formula] || '').trim();
        }
        if (columns.columns.numerator !== undefined) {
            kpiData.numeratorLabel = String(row[columns.columns.numerator] || '').trim();
        }
        if (columns.columns.denominator !== undefined) {
            kpiData.denominatorLabel = String(row[columns.columns.denominator] || '').trim();
        }
        if (columns.columns.target !== undefined) {
            kpiData.target = parseFloat(row[columns.columns.target]) || 0;
        }
        if (columns.columns.unit !== undefined) {
            kpiData.unit = String(row[columns.columns.unit] || '%').trim();
        }
    } else if (typeInfo.inputType === 'weighted') {
        if (columns.columns.weight !== undefined) {
            kpiData.weight = parseFloat(row[columns.columns.weight]) || 0;
        }
        if (columns.columns.maxScore !== undefined) {
            kpiData.maxScore = parseFloat(row[columns.columns.maxScore]) || 0;
        }
    } else if (typeInfo.inputType === 'checklist') {
        if (columns.columns.evaluationType !== undefined) {
            kpiData.evaluationType = String(row[columns.columns.evaluationType] || '').trim();
        }
        if (columns.columns.description !== undefined) {
            kpiData.description = String(row[columns.columns.description] || '').trim();
        }
    } else if (typeInfo.inputType === 'count') {
        if (columns.columns.jobTitle !== undefined) {
            kpiData.jobTitle = String(row[columns.columns.jobTitle] || '').trim();
        }
        if (columns.columns.contractType !== undefined) {
            kpiData.contractType = String(row[columns.columns.contractType] || '').trim();
        }
    }
    
    if (columns.columns.hospital !== undefined) {
        const val = String(row[columns.columns.hospital] || '').trim().toLowerCase();
        kpiData.applicableTo.hospital = ['نعم', 'yes', '1', 'true', 'x', '✓'].includes(val);
    }
    if (columns.columns.healthCenter !== undefined) {
        const val = String(row[columns.columns.healthCenter] || '').trim().toLowerCase();
        kpiData.applicableTo.healthCenter = ['نعم', 'yes', '1', 'true', 'x', '✓'].includes(val);
    }
    if (columns.columns.healthUnit !== undefined) {
        const val = String(row[columns.columns.healthUnit] || '').trim().toLowerCase();
        kpiData.applicableTo.healthUnit = ['نعم', 'yes', '1', 'true', 'x', '✓'].includes(val);
    }
    
    return kpiData;
}

function showImportPreview(kpis, skipped, errors, typeInfo) {
    hideLoadingMessage();
    
    const previewContainer = document.getElementById('importPreview');
    if (!previewContainer) return;
    
    const catInfo = typeInfo.categories[selectedKPICategory];
    
    let html = '';
    
    html += `
        <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, ${catInfo.color || typeInfo.color}20 0%, ${catInfo.color || typeInfo.color}10 100%); border-radius: 10px; border-right: 4px solid ${catInfo.color || typeInfo.color};">
            <h3 style="margin: 0 0 15px 0; color: #333; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">${catInfo.icon || typeInfo.icon}</span>
                <span>📊 ملخص الاستيراد - ${catInfo.name}</span>
            </h3>
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
    
    if (kpis.length > 0) {
        html += `
            <div style="margin: 20px 0;">
                <h4 style="color: #4caf50; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <span>✅</span>
                    <span>المؤشرات الجاهزة للإضافة (${kpis.length})</span>
                </h4>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; background: white;">
                    ${kpis.map((kpi, index) => `
                        <div style="padding: 10px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <strong style="color: ${catInfo.color || typeInfo.color};">${kpi.code}</strong> - ${kpi.name}
                                <small style="color: #999; display: block; margin-top: 3px;">
                                    ${typeInfo.inputType === 'formula' && kpi.target ? `المستهدف: ${kpi.target}${kpi.unit || ''}` : ''}
                                    ${typeInfo.inputType === 'weighted' && kpi.weight ? `الوزن: ${kpi.weight}` : ''}
                                </small>
                            </div>
                            <span style="color: #4caf50; font-size: 1.2rem;">✓</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
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
    
    html += `
        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e0e0e0; display: flex; gap: 15px; justify-content: center;">
            ${kpis.length > 0 ? `
                <button class="btn btn-success btn-large" onclick="confirmImport()" style="min-width: 200px; padding: 15px 30px; font-size: 1.1rem;">
                    ✓ تأكيد وإضافة ${kpis.length} مؤشر
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="cancelImport()" style="padding: 15px 30px;">
                إلغاء
            </button>
        </div>
    `;
    
    previewContainer.innerHTML = html;
    
    window.pendingKPIsImport = kpis;
}

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
        console.log('Saving KPI:', kpiData.code);
        const result = saveKPI(kpiData);
        if (result.success) {
            successCount++;
            console.log('✅ Saved:', kpiData.code);
        } else {
            failCount++;
            console.error('❌ Failed:', kpiData.code, result.message);
        }
    });
    
    hideLoadingMessage();
    closeModal('importModal');
    
    if (successCount > 0) {
        showSuccess(`تم إضافة ${successCount} مؤشر بنجاح! 🎉`);
        
        setTimeout(() => {
            console.log('🔄 Reloading category...');
            selectCategory(selectedKPICategory);
            updateDashboardStats();
        }, 500);
    }
    
    if (failCount > 0) {
        showWarning(`فشل في إضافة ${failCount} مؤشر`);
    }
    
    window.pendingKPIsImport = null;
    
    const fileInput = document.getElementById('kpiFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
}

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

function hideLoadingMessage() {
    // يتم استبدالها بالمحتوى الجديد
}

function downloadExcelTemplate() {
    if (!selectedKPIDataType || !selectedKPICategory) {
        showError('الرجاء اختيار نوع البيانات والقسم أولاً');
        return;
    }
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    const catInfo = typeInfo.categories[selectedKPICategory];
    
    let headers = ['الكود', 'الاسم'];
    let example = [`${catInfo.id}-01`, 'مثال على مؤشر'];
    
    if (typeInfo.inputType === 'formula') {
        headers.push('الصيغة', 'البسط', 'المقام', 'المستهدف', 'الوحدة');
        example.push('(البسط / المقام) × 100', 'عدد الحالات', 'إجمالي الحالات', '85', '%');
    } else if (typeInfo.inputType === 'weighted') {
        headers.push('الوزن', 'الدرجة القصوى');
        example.push(catInfo.weight || '100', '100');
    } else if (typeInfo.inputType === 'checklist') {
        headers.push('نوع التقييم', 'الوصف');
        example.push('نعم/لا', 'وصف المعيار');
    } else if (typeInfo.inputType === 'count') {
        headers.push('المسمى الوظيفي', 'نوع العقد');
        example.push('طبيب استشاري', 'دائم');
    }
    
    headers.push('مستشفى', 'مركز صحي', 'وحدة صحية');
    example.push('نعم', 'نعم', 'لا');
    
    const data = [headers, example];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج');
    
    const fileName = `نموذج_${catInfo.name}_${typeInfo.name}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showSuccess('تم تنزيل النموذج بنجاح');
}
