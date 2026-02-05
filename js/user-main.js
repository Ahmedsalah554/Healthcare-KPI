/**
 * ===== السكريبت الرئيسي لنظام المستخدم =====
 */

// متغيرات عامة
let currentUser = null;
let currentFacility = null;
let selectedKPI = null;
let userKPIData = [];

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initializeUserSystem();
});

// تهيئة النظام
function initializeUserSystem() {
    // التحقق من تسجيل الدخول
    currentUser = getFromStorage('currentUserApp');
    
    if (!currentUser) {
        showLoginPage();
    } else {
        showAppPage();
    }
    
    // تحميل البيانات
    loadUserData();
    
    // تعيين التاريخ الافتراضي إلى اليوم
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('kpiDate')) {
        document.getElementById('kpiDate').value = today;
    }
}

// عرض صفحة تسجيل الدخول
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('appPage').style.display = 'none';
}

// عرض صفحة التطبيق
function showAppPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appPage').style.display = 'flex';
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // تحميل قائمة المؤشرات
    loadKPIList();
    
    // تحميل البيانات المدخلة
    loadDataHistory();
    
    // تحديث إحصائيات التصدير
    updateExportStats();
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    // التحقق البسيط (في الإنتاج يجب استخدام API)
    if (email === 'user@hospital.com' && password === 'user123') {
        currentUser = {
            id: 'user1',
            name: 'أحمد محمد',
            email: email,
            role: 'user',
            facility: 'fac1',
            facilityName: 'مستشفى الملك فهد العام'
        };
        
        saveToStorage('currentUserApp', currentUser);
        showSuccess('تم تسجيل الدخول بنجاح');
        showAppPage();
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ بيانات الدخول غير صحيحة';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// معالجة تسجيل الخروج
function handleLogout() {
    if (confirmAction('هل أنت متأكد من تسجيل الخروج؟')) {
        removeFromStorage('currentUserApp');
        currentUser = null;
        selectedKPI = null;
        showLoginPage();
        showSuccess('تم تسجيل الخروج بنجاح');
    }
}

// عرض معلومات المستخدم
function displayUserInfo() {
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.name;
        document.getElementById('facilityNameDisplay').textContent = currentUser.facilityName;
    }
}

// تحميل بيانات المستخدم
function loadUserData() {
    userKPIData = getFromStorage('kpiData', []);
    
    // تصفية البيانات الخاصة بالمستخدم الحالي
    if (currentUser) {
        userKPIData = userKPIData.filter(data => data.user === currentUser.id);
    }
}

// تحميل قائمة المؤشرات
function loadKPIList() {
    const container = document.getElementById('kpiListContainer');
    
    if (!container) return;
    
    const allKPIs = getAllKPIs();
    
    container.innerHTML = allKPIs.map(kpi => `
        <div class="kpi-card" onclick="selectKPI('${kpi.code}')">
            <div class="kpi-code">${kpi.code}</div>
            <div class="kpi-name">${kpi.name}</div>
            <div class="kpi-status">
                <span class="badge badge-primary">${KPI_CATEGORIES[kpi.category]}</span>
            </div>
        </div>
    `).join('');
}

// البحث في المؤشرات
function filterKPIs() {
    const searchTerm = document.getElementById('kpiSearch').value;
    const container = document.getElementById('kpiListContainer');
    
    if (!searchTerm) {
        loadKPIList();
        return;
    }
    
    const filteredKPIs = searchKPIs(searchTerm);
    
    if (filteredKPIs.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">🔍</div>
                <h3>لا توجد نتائج</h3>
                <p>لم يتم العثور على مؤشرات تطابق البحث</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredKPIs.map(kpi => `
        <div class="kpi-card" onclick="selectKPI('${kpi.code}')">
            <div class="kpi-code">${kpi.code}</div>
            <div class="kpi-name">${kpi.name}</div>
            <div class="kpi-status">
                <span class="badge badge-primary">${KPI_CATEGORIES[kpi.category]}</span>
            </div>
        </div>
    `).join('');
}

// اختيار مؤشر
function selectKPI(kpiCode) {
    selectedKPI = getKPIByCode(kpiCode);
    
    if (!selectedKPI) {
        showError('المؤشر غير موجود');
        return;
    }
    
    // إظهار نموذج الإدخال
    const formContainer = document.getElementById('kpiFormContainer');
    formContainer.style.display = 'block';
    
    // تحديث عنوان النموذج
    document.getElementById('kpiFormTitle').textContent = 
        `${selectedKPI.code} - ${selectedKPI.name}`;
    
    // عرض معلومات الصيغة
    document.getElementById('formulaInfo').innerHTML = `
        <div class="formula-box">
            <strong>📐 الصيغة:</strong> ${selectedKPI.formula}<br>
            <strong>🎯 المستهدف:</strong> ${selectedKPI.target}${selectedKPI.unit}
        </div>
    `;
    
    // تحديث تسميات الحقول
    document.getElementById('numeratorLabel').textContent = selectedKPI.numeratorLabel + ' *';
    document.getElementById('denominatorLabel').textContent = selectedKPI.denominatorLabel + ' *';
    
    // إعادة تعيين النموذج
    document.getElementById('kpiDataForm').reset();
    document.getElementById('kpiDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('resultBox').style.display = 'none';
    
    // التمرير للنموذج
    smoothScrollTo('kpiFormContainer');
}

// إغلاق نموذج الإدخال
function closeKPIForm() {
    document.getElementById('kpiFormContainer').style.display = 'none';
    selectedKPI = null;
}

// حساب النتيجة
function calculateResult() {
    const numerator = parseFloat(document.getElementById('kpiNumerator').value) || 0;
    const denominator = parseFloat(document.getElementById('kpiDenominator').value) || 0;
    
    if (numerator && denominator && denominator !== 0) {
        const result = calculateKPIResult(numerator, denominator);
        
        document.getElementById('resultValue').textContent = formatPercentage(result);
        document.getElementById('resultBox').style.display = 'block';
        
        return result;
    } else {
        document.getElementById('resultBox').style.display = 'none';
        return 0;
    }
}

// حفظ بيانات المؤشر
function saveKPIData(event) {
    event.preventDefault();
    
    if (!selectedKPI) {
        showError('الرجاء اختيار مؤشر أولاً');
        return;
    }
    
    if (!currentUser) {
        showError('خطأ في بيانات المستخدم');
        return;
    }
    
    const numerator = parseFloat(document.getElementById('kpiNumerator').value);
    const denominator = parseFloat(document.getElementById('kpiDenominator').value);
    const result = calculateResult();
    
    if (!numerator || !denominator || denominator === 0) {
        showError('الرجاء إدخال قيم صحيحة');
        return;
    }
    
    const kpiData = {
        id: generateId(),
        kpiCode: selectedKPI.code,
        kpiName: selectedKPI.name,
        category: selectedKPI.category,
        user: currentUser.id,
        userName: currentUser.name,
        facility: currentUser.facility,
        facilityName: currentUser.facilityName,
        date: document.getElementById('kpiDate').value,
        period: document.getElementById('kpiPeriod').value,
        numerator: numerator,
        denominator: denominator,
        result: result,
        target: selectedKPI.target,
        unit: selectedKPI.unit,
        notes: document.getElementById('kpiNotes').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // حفظ البيانات
    const allData = getFromStorage('kpiData', []);
    allData.push(kpiData);
    saveToStorage('kpiData', allData);
    
    // تحديث البيانات المحلية
    userKPIData.push(kpiData);
    
    showSuccess('✅ تم حفظ البيانات بنجاح');
    
    // إعادة تعيين النموذج
    resetKPIForm();
    
    // تحديث جدول البيانات
    loadDataHistory();
    
    // تحديث الإحصائيات
    updateExportStats();
}

// إعادة تعيين النموذج
function resetKPIForm() {
    document.getElementById('kpiDataForm').reset();
    document.getElementById('kpiDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('resultBox').style.display = 'none';
}

// التبديل بين التبويبات
function switchTab(tabName) {
    // إخفاء كل التبويبات
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // إزالة الفئة النشطة من الأزرار
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // إظهار التبويب المحدد
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // تحميل محتوى التبويب
    if (tabName === 'dataHistory') {
        loadDataHistory();
    } else if (tabName === 'export') {
        updateExportStats();
    }
}

// تحميل البيانات المدخلة
function loadDataHistory() {
    const tbody = document.querySelector('#dataTable tbody');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (!tbody) return;
    
    loadUserData(); // تحديث البيانات
    
    if (userKPIData.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        tbody.innerHTML = '';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    // ترتيب البيانات من الأحدث للأقدم
    const sortedData = [...userKPIData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    tbody.innerHTML = sortedData.map(data => `
        <tr>
            <td><strong>${data.kpiCode}</strong></td>
            <td>${formatDate(data.date)}</td>
            <td>${data.period}</td>
            <td>${formatNumber(data.numerator)}</td>
            <td>${formatNumber(data.denominator)}</td>
            <td><strong>${formatPercentage(data.result)}</strong></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <span class="status-badge status-${data.status}">
                        ${data.status === 'approved' ? '✅ معتمد' : 
                          data.status === 'pending' ? '⏳ قيد المراجعة' : 
                          '❌ مرفوض'}
                    </span>
                    <button class="btn btn-small btn-danger" onclick="deleteMyData('${data.id}')" title="حذف">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// حذف البيانات الخاصة بالمستخدم
function deleteMyData(id) {
    if (!confirmAction('هل أنت متأكد من حذف هذه البيانات؟')) return;
    
    // حذف من البيانات العامة
    let allData = getFromStorage('kpiData', []);
    allData = allData.filter(d => d.id !== id);
    saveToStorage('kpiData', allData);
    
    // حذف من البيانات المحلية
    userKPIData = userKPIData.filter(d => d.id !== id);
    
    showSuccess('تم حذف البيانات بنجاح');
    loadDataHistory();
    updateExportStats();
}

// مسح كل البيانات
function clearHistory() {
    if (!confirmAction('هل أنت متأكد من حذف جميع بياناتك؟')) return;
    
    // حذف بيانات المستخدم فقط
    let allData = getFromStorage('kpiData', []);
    allData = allData.filter(d => d.user !== currentUser.id);
    saveToStorage('kpiData', allData);
    
    userKPIData = [];
    
    showSuccess('تم مسح جميع البيانات');
    loadDataHistory();
    updateExportStats();
}

// تحديث إحصائيات التصدير
function updateExportStats() {
    loadUserData();
    
    document.getElementById('statsCount').textContent = userKPIData.length;
    document.getElementById('statsFacility').textContent = currentUser ? currentUser.facilityName : '-';
    
    if (userKPIData.length > 0) {
        const latestDate = userKPIData.reduce((latest, data) => {
            return new Date(data.createdAt) > new Date(latest) ? data.createdAt : latest;
        }, userKPIData[0].createdAt);
        
        document.getElementById('statsDate').textContent = formatDateArabic(latestDate);
    } else {
        document.getElementById('statsDate').textContent = '-';
    }
}

// تصدير إلى CSV
function exportToCSV() {
    if (userKPIData.length === 0) {
        showWarning('لا توجد بيانات للتصدير');
        return;
    }
    
    const columns = ['كود المؤشر', 'التاريخ', 'الفترة', 'البسط', 'المقام', 'النتيجة', 'المستهدف', 'الحالة', 'الملاحظات'];
    
    const data = userKPIData.map(item => ({
        'كود المؤشر': item.kpiCode,
        'التاريخ': formatDate(item.date),
        'الفترة': item.period,
        'البسط': item.numerator,
        'المقام': item.denominator,
        'النتيجة': formatPercentage(item.result),
        'المستهدف': item.target + item.unit,
        'الحالة': item.status === 'approved' ? 'معتمد' : 
                  item.status === 'pending' ? 'قيد المراجعة' : 'مرفوض',
        'الملاحظات': item.notes || '-'
    }));
    
    const filename = `KPI_Data_${currentUser.name}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(data, filename, columns);
    showSuccess('✅ تم تصدير البيانات بنجاح');
}

// تصدير إلى JSON
function exportToJSON() {
    if (userKPIData.length === 0) {
        showWarning('لا توجد بيانات للتصدير');
        return;
    }
    
    const exportData = {
        user: {
            name: currentUser.name,
            email: currentUser.email,
            facility: currentUser.facilityName
        },
        exportDate: new Date().toISOString(),
        totalRecords: userKPIData.length,
        data: userKPIData
    };
    
    const filename = `KPI_Data_${currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(exportData, filename);
    showSuccess('✅ تم تصدير البيانات بنجاح');
}

// طباعة البيانات
function printData() {
    if (userKPIData.length === 0) {
        showWarning('لا توجد بيانات للطباعة');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة بيانات المؤشرات</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h1 {
                    color: #1a73e8;
                    text-align: center;
                }
                .info {
                    background: #f5f5f5;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: right;
                }
                th {
                    background-color: #1a73e8;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                @media print {
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <h1>📊 بيانات مؤشرات الأداء</h1>
            <div class="info">
                <strong>المستخدم:</strong> ${currentUser.name}<br>
                <strong>المنشأة:</strong> ${currentUser.facilityName}<br>
                <strong>التاريخ:</strong> ${formatDateArabic(new Date().toISOString())}<br>
                <strong>إجمالي السجلات:</strong> ${userKPIData.length}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>كود المؤشر</th>
                        <th>التاريخ</th>
                        <th>الفترة</th>
                        <th>البسط</th>
                        <th>المقام</th>
                        <th>النتيجة</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${userKPIData.map(data => `
                        <tr>
                            <td>${data.kpiCode}</td>
                            <td>${formatDate(data.date)}</td>
                            <td>${data.period}</td>
                            <td>${formatNumber(data.numerator)}</td>
                            <td>${formatNumber(data.denominator)}</td>
                            <td>${formatPercentage(data.result)}</td>
                            <td>${data.status === 'approved' ? 'معتمد' : 
                                  data.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// تهيئة الرسوم البيانية (اختياري)
function initializeUserCharts() {
    if (userKPIData.length === 0) return;
    
    // يمكن إضافة رسوم بيانية للمستخدم هنا
    // createTrendChart, createCategoryChart, etc.
}

console.log('✅ User Main loaded successfully');
console.log('📊 KPI System - User Panel Ready!');
