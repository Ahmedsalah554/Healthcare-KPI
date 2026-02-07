/**
 * ===== السكريبت الرئيسي للوحة التحكم الإدارية =====
 */

// متغيرات عامة
let currentUser = null;
let facilities = [];
let users = [];
let kpiData = [];

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

// تهيئة لوحة التحكم
function initializeAdminPanel() {
    // التحقق من تسجيل الدخول
    currentUser = getFromStorage('currentUser');
    
    if (!currentUser) {
        showLoginPage();
    } else {
        showAdminPanel();
    }

    // تحميل البيانات من LocalStorage
    loadData();
}

// عرض صفحة تسجيل الدخول
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// عرض لوحة التحكم
function showAdminPanel() {
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginPage) {
        loginPage.style.display = 'none';
        loginPage.style.visibility = 'hidden';
        loginPage.style.opacity = '0';
        loginPage.style.pointerEvents = 'none';
    }
    
    if (adminPanel) {
        adminPanel.style.display = 'flex';
        adminPanel.style.visibility = 'visible';
        adminPanel.style.opacity = '1';
    }
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // تحميل لوحة المعلومات
    loadDashboard();
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // التحقق البسيط (في الإنتاج يجب استخدام API)
    if (email === 'admin@system.com' && password === 'admin123') {
        currentUser = {
            id: 'admin1',
            name: 'المدير العام',
            email: email,
            role: 'admin',
            facility: null
        };
        
        saveToStorage('currentUser', currentUser);
        showSuccess('تم تسجيل الدخول بنجاح');
        showAdminPanel();
    } else {
        showError('بيانات الدخول غير صحيحة');
    }
}

// معالجة تسجيل الخروج
function handleLogout() {
    if (confirmAction('هل أنت متأكد من تسجيل الخروج؟')) {
        removeFromStorage('currentUser');
        currentUser = null;
        showLoginPage();
        showSuccess('تم تسجيل الخروج بنجاح');
    }
}

// عرض معلومات المستخدم
function displayUserInfo() {
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
        if (userRoleDisplay) {
            userRoleDisplay.textContent = 
                currentUser.role === 'admin' ? 'مدير النظام' : 'مشرف';
        }
    }
}

// تحميل البيانات - محدث
function loadData() {
    // جلب البيانات من LocalStorage
    let storedFacilities = getFromStorage('facilities', null);
    let storedUsers = getFromStorage('users', null);
    let storedKpiData = getFromStorage('kpiData', null);
    
    // التحقق من أنها arrays صحيحة
    if (Array.isArray(storedFacilities)) {
        facilities = storedFacilities;
    } else {
        facilities = getDefaultFacilities();
    }
    
    if (Array.isArray(storedUsers)) {
        users = storedUsers;
    } else {
        users = getDefaultUsers();
    }
    
    if (Array.isArray(storedKpiData)) {
        kpiData = storedKpiData;
    } else {
        kpiData = [];
    }
    
    // حفظ البيانات الافتراضية
    saveToStorage('facilities', facilities);
    saveToStorage('users', users);
    saveToStorage('kpiData', kpiData);
    
    console.log('✅ Data loaded:', {
        facilities: facilities.length,
        users: users.length,
        kpiData: kpiData.length
    });
}

// الحصول على منشآت افتراضية
function getDefaultFacilities() {
    return [
        {
            id: 'fac1',
            code: 'FAC001',
            name: 'مستشفى الملك فهد العام',
            type: 'مستشفى',
            city: 'الرياض',
            phone: '0112345678',
            email: 'info@kfh.sa',
            capacity: 500,
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'fac2',
            code: 'FAC002',
            name: 'مركز صحي الملز',
            type: 'مركز صحي',
            city: 'الرياض',
            phone: '0112345679',
            email: 'info@malaz.sa',
            capacity: 100,
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
}

// الحصول على مستخدمين افتراضيين
function getDefaultUsers() {
    return [
        {
            id: 'user1',
            name: 'أحمد محمد',
            email: 'user@hospital.com',
            password: 'user123',
            phone: '0501234567',
            facility: 'fac1',
            role: 'supervisor',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'user2',
            name: 'فاطمة علي',
            email: 'fatima@center.com',
            password: 'user123',
            phone: '0501234568',
            facility: 'fac2',
            role: 'user',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
}

// تحميل لوحة المعلومات
function loadDashboard() {
    updateStatistics();
    createDashboardCharts('dashboardCharts');
}

// تحديث الإحصائيات - محدث
function updateStatistics() {
    // جلب المؤشرات المخصصة
    const customKPIs = getFromStorage('customKPIs', []);
    const totalKPIs = KPI_DATA.length + (Array.isArray(customKPIs) ? customKPIs.length : 0);
    
    // التأكد من أن البيانات arrays
    const safeFacilities = Array.isArray(facilities) ? facilities : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeKpiData = Array.isArray(kpiData) ? kpiData : [];
    
    const totalFacilitiesEl = document.getElementById('totalFacilities');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalKPIsEl = document.getElementById('totalKPIs');
    const totalDataEl = document.getElementById('totalData');
    
    if (totalFacilitiesEl) totalFacilitiesEl.textContent = safeFacilities.length;
    if (totalUsersEl) totalUsersEl.textContent = safeUsers.length;
    if (totalKPIsEl) totalKPIsEl.textContent = totalKPIs;
    if (totalDataEl) totalDataEl.textContent = safeKpiData.length;
    
    // حساب البيانات الشهرية
    const thisMonth = new Date().getMonth();
    const monthlyData = safeKpiData.filter(item => {
        if (!item || !item.date) return false;
        const itemMonth = new Date(item.date).getMonth();
        return itemMonth === thisMonth;
    });
    
    const monthlyDataEl = document.getElementById('monthlyData');
    if (monthlyDataEl) {
        monthlyDataEl.textContent = `${monthlyData.length} هذا الشهر`;
    }
}

// التبديل بين الصفحات
function switchView(viewName) {
    // إخفاء كل ال��بويبات
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // إزالة الفئة النشطة من القائمة
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // إظهار التبويب المحدد
    const selectedTab = document.getElementById(viewName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // تفعيل الرابط المحدد
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // تحميل محتوى الصفحة
    switch(viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'facilities':
            loadFacilities();
            break;
        case 'users':
            loadUsers();
            break;
        case 'kpis':
            loadKPIsManagement();
            break;
        case 'data':
            loadDataTable();
            break;
        case 'reports':
            loadReportsData();
            break;
    }
}

// تحميل المنشآت
function loadFacilities() {
    const tbody = document.querySelector('#facilitiesTable tbody');
    
    if (!tbody) return;
    
    const safeFacilities = Array.isArray(facilities) ? facilities : [];
    
    if (safeFacilities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">🏥</div>
                        <h3>لا توجد منشآت</h3>
                        <p>قم بإضافة منشأة جديدة</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = safeFacilities.map(facility => `
        <tr>
            <td>${facility.code}</td>
            <td>${facility.name}</td>
            <td>${facility.type}</td>
            <td>${facility.city}</td>
            <td>${facility.phone}</td>
            <td>${facility.capacity || '-'}</td>
            <td>
                <span class="status-badge status-${facility.status}">
                    ${facility.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-primary" onclick="editFacility('${facility.id}')">
                        ✏️ تعديل
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteFacility('${facility.id}')">
                        🗑️ حذف
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// إضافة منشأة جديدة
function addFacility() {
    document.getElementById('modalTitle').textContent = 'إضافة منشأة جديدة';
    document.getElementById('facilityForm').reset();
    document.getElementById('facilityId').value = '';
    openModal('facilityModal');
}

// تعديل منشأة
function editFacility(id) {
    const facility = facilities.find(f => f.id === id);
    if (!facility) return;
    
    document.getElementById('modalTitle').textContent = 'تعديل المنشأة';
    document.getElementById('facilityId').value = facility.id;
    document.getElementById('facilityCode').value = facility.code;
    document.getElementById('facilityName').value = facility.name;
    document.getElementById('facilityType').value = facility.type;
    document.getElementById('facilityCity').value = facility.city;
    document.getElementById('facilityPhone').value = facility.phone;
    document.getElementById('facilityEmail').value = facility.email || '';
    document.getElementById('facilityCapacity').value = facility.capacity || '';
    document.getElementById('facilityStatus').value = facility.status;
    
    openModal('facilityModal');
}

// حفظ المنشأة
function saveFacility(event) {
    event.preventDefault();
    
    const id = document.getElementById('facilityId').value;
    const facilityData = {
        id: id || generateId(),
        code: document.getElementById('facilityCode').value,
        name: document.getElementById('facilityName').value,
        type: document.getElementById('facilityType').value,
        city: document.getElementById('facilityCity').value,
        phone: document.getElementById('facilityPhone').value,
        email: document.getElementById('facilityEmail').value,
        capacity: parseInt(document.getElementById('facilityCapacity').value) || 0,
        status: document.getElementById('facilityStatus').value,
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        // تحديث
        const index = facilities.findIndex(f => f.id === id);
        if (index !== -1) {
            facilities[index] = { ...facilities[index], ...facilityData };
            showSuccess('تم تحديث المنشأة بنجاح');
        }
    } else {
        // إضافة جديدة
        facilityData.createdAt = new Date().toISOString();
        facilities.push(facilityData);
        showSuccess('تم إضافة المنشأة بنجاح');
    }
    
    saveToStorage('facilities', facilities);
    closeModal('facilityModal');
    loadFacilities();
}

// حذف منشأة
function deleteFacility(id) {
    if (!confirmAction('هل أنت متأكد من حذف هذه المنشأة؟')) return;
    
    facilities = facilities.filter(f => f.id !== id);
    saveToStorage('facilities', facilities);
    showSuccess('تم حذف المنشأة بنجاح');
    loadFacilities();
    updateStatistics();
}

// تحميل المستخدمين
function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (!tbody) return;
    
    const safeUsers = Array.isArray(users) ? users : [];
    
    if (safeUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <h3>لا يوجد مستخدمون</h3>
                        <p>قم بإضافة مستخدم جديد</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = safeUsers.map(user => {
        const facility = facilities.find(f => f.id === user.facility);
        return `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${facility ? facility.name : '-'}</td>
                <td>
                    <span class="badge badge-primary">
                        ${user.role === 'admin' ? 'مدير' : user.role === 'supervisor' ? 'مشرف' : 'مستخدم'}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>${user.phone || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="editUser('${user.id}')">
                            ✏️ تعديل
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteUser('${user.id}')">
                            🗑️ حذف
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// إضافة مستخدم
function addUser() {
    document.getElementById('userModalTitle').textContent = 'إضافة مستخدم جديد';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    
    // ملء قائمة المنشآت
    const facilitySelect = document.getElementById('userFacility');
    facilitySelect.innerHTML = '<option value="">-- اختر المنشأة --</option>' +
        facilities.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    
    openModal('userModal');
}

// تعديل مستخدم
function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('userModalTitle').textContent = 'تعديل المستخدم';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    // ملء قائمة المنشآت
    const facilitySelect = document.getElementById('userFacility');
    facilitySelect.innerHTML = '<option value="">-- اختر المنشأة --</option>' +
        facilities.map(f => `<option value="${f.id}" ${f.id === user.facility ? 'selected' : ''}>${f.name}</option>`).join('');
    
    openModal('userModal');
}

// حفظ المستخدم
function saveUser(event) {
    event.preventDefault();
    
    const id = document.getElementById('userId').value;
    const userData = {
        id: id || generateId(),
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        facility: document.getElementById('userFacility').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        updatedAt: new Date().toISOString()
    };
    
    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }
    
    if (id) {
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            showSuccess('تم تحديث المستخدم بنجاح');
        }
    } else {
        userData.password = password || 'user123';
        userData.createdAt = new Date().toISOString();
        users.push(userData);
        showSuccess('تم إضافة المستخدم بنجاح');
    }
    
    saveToStorage('users', users);
    closeModal('userModal');
    loadUsers();
    updateStatistics();
}

// حذف مستخدم
function deleteUser(id) {
    if (!confirmAction('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    users = users.filter(u => u.id !== id);
    saveToStorage('users', users);
    showSuccess('تم حذف المستخدم بنجاح');
    loadUsers();
    updateStatistics();
}

// تحميل إدارة المؤشرات
function loadKPIsManagement() {
    const container = document.getElementById('kpisManagementContainer');
    
    if (!container) return;
    
    // جلب المؤشرات المخصصة من LocalStorage
    let customKPIs = getFromStorage('customKPIs', []);
    if (!Array.isArray(customKPIs)) customKPIs = [];
    
    // دمج المؤشرات الافتراضية مع المخصصة
    const allKPIs = [...KPI_DATA, ...customKPIs];
    
    const categorizedKPIs = {};
    allKPIs.forEach(kpi => {
        if (!categorizedKPIs[kpi.category]) {
            categorizedKPIs[kpi.category] = [];
        }
        categorizedKPIs[kpi.category].push(kpi);
    });
    
    container.innerHTML = `
        <div class="mb-2" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="addKPI()">
                ➕ إضافة مؤشر جديد
            </button>
            <button class="btn btn-success" onclick="exportKPIs()">
                📥 تصدير المؤشرات المخصصة
            </button>
            <button class="btn btn-warning" onclick="openImportModal()">
                📤 استيراد من Excel/CSV
            </button>
        </div>
    ` + Object.keys(categorizedKPIs).map(category => `
        <div class="card mb-2">
            <div class="card-header">
                <div class="card-title">${KPI_CATEGORIES[category]} (${categorizedKPIs[category].length} مؤشر)</div>
            </div>
            <div class="card-body">
                <div class="grid-3">
                    ${categorizedKPIs[category].map(kpi => `
                        <div class="kpi-card">
                            <div class="kpi-code">${kpi.code}</div>
                            <div class="kpi-name">${kpi.name}</div>
                            <div class="mt-1">
                                <span class="badge badge-primary">المستهدف: ${kpi.target}${kpi.unit || '%'}</span>
                                ${kpi.custom ? '<span class="badge badge-success" style="margin-right: 5px;">مخصص</span>' : ''}
                            </div>
                            <div class="action-buttons mt-1" style="display: flex; gap: 5px;">
                                ${kpi.custom ? `
                                    <button class="btn btn-small btn-primary" onclick="editKPI('${kpi.code}')">
                                        ✏️ تعديل
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="deleteKPI('${kpi.code}')">
                                        🗑️ حذف
                                    </button>
                                ` : '<span style="font-size: 0.8rem; color: #999;">مؤشر افتراضي</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    // تحديث الإحصائيات
    updateStatistics();
}

// إضافة مؤشر جديد - فتح الفورم
function addKPI() {
    document.getElementById('kpiModalTitle').textContent = 'إضافة مؤشر جديد';
    document.getElementById('kpiForm').reset();
    document.getElementById('kpiIdField').value = '';
    document.getElementById('kpiCustomField').value = 'true';
    document.getElementById('kpiCode').disabled = false;
    
    // ملء قائمة الفئات
    const categorySelect = document.getElementById('kpiCategory');
    categorySelect.innerHTML = '<option value="">-- اختر الفئة --</option>' +
        Object.keys(KPI_CATEGORIES).map(key => 
            `<option value="${key}">${KPI_CATEGORIES[key]}</option>`
        ).join('');
    
    openModal('kpiModal');
}

// تعديل مؤشر - فتح الفورم
function editKPI(code) {
    const customKPIs = getFromStorage('customKPIs', []);
    const kpiIndex = customKPIs.findIndex(k => k.code === code);
    
    if (kpiIndex === -1) {
        showWarning('لا يمكن تعديل المؤشرات الافتراضية');
        return;
    }
    
    const kpi = customKPIs[kpiIndex];
    
    document.getElementById('kpiModalTitle').textContent = 'تعديل المؤشر';
    document.getElementById('kpiIdField').value = kpi.code;
    document.getElementById('kpiCode').value = kpi.code;
    document.getElementById('kpiCode').disabled = true;
    document.getElementById('kpiName').value = kpi.name;
    document.getElementById('kpiFormula').value = kpi.formula;
    document.getElementById('kpiNumeratorLabel').value = kpi.numeratorLabel;
    document.getElementById('kpiDenominatorLabel').value = kpi.denominatorLabel;
    document.getElementById('kpiTarget').value = kpi.target;
    document.getElementById('kpiUnit').value = kpi.unit;
    document.getElementById('kpiCustomField').value = 'true';
    
    // ملء قائمة الفئات
    const categorySelect = document.getElementById('kpiCategory');
    categorySelect.innerHTML = '<option value="">-- اختر الفئة --</option>' +
        Object.keys(KPI_CATEGORIES).map(key => 
            `<option value="${key}" ${key === kpi.category ? 'selected' : ''}>${KPI_CATEGORIES[key]}</option>`
        ).join('');
    
    openModal('kpiModal');
}

// حفظ المؤشر من الفورم
function saveKPI(event) {
    event.preventDefault();
    
    const code = document.getElementById('kpiCode').value.trim().toUpperCase();
    const name = document.getElementById('kpiName').value.trim();
    const category = document.getElementById('kpiCategory').value;
    const formula = document.getElementById('kpiFormula').value.trim();
    const numeratorLabel = document.getElementById('kpiNumeratorLabel').value.trim();
    const denominatorLabel = document.getElementById('kpiDenominatorLabel').value.trim();
    const target = parseFloat(document.getElementById('kpiTarget').value);
    const unit = document.getElementById('kpiUnit').value;
    const oldCode = document.getElementById('kpiIdField').value;
    
    // التحقق من البيانات
    if (!code || !name || !category || !formula || !numeratorLabel || !denominatorLabel || isNaN(target)) {
        showError('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    let customKPIs = getFromStorage('customKPIs', []);
    if (!Array.isArray(customKPIs)) customKPIs = [];
    
    if (oldCode) {
        // تحديث مؤشر موجود
        const index = customKPIs.findIndex(k => k.code === oldCode);
        if (index !== -1) {
            customKPIs[index] = {
                ...customKPIs[index],
                name,
                category,
                formula,
                numeratorLabel,
                denominatorLabel,
                target,
                unit,
                custom: true,
                updatedAt: new Date().toISOString()
            };
            
            saveToStorage('customKPIs', customKPIs);
            showSuccess('تم تحديث المؤشر بنجاح');
        }
    } else {
        // إضافة مؤشر جديد
        // التحقق من عدم تكرار الكود
        const allKPIs = [...KPI_DATA, ...customKPIs];
        if (allKPIs.find(k => k.code === code)) {
            showError('هذا الكود موجود بالفعل');
            return;
        }
        
        const newKPI = {
            code,
            name,
            category,
            formula,
            numeratorLabel,
            denominatorLabel,
            target,
            unit,
            custom: true,
            createdAt: new Date().toISOString()
        };
        
        customKPIs.push(newKPI);
        saveToStorage('customKPIs', customKPIs);
        showSuccess('تم إضافة المؤشر بنجاح');
    }
    
    closeModal('kpiModal');
    loadKPIsManagement();
}

// حذف مؤشر
function deleteKPI(code) {
    if (!confirmAction('هل أنت متأكد من حذف هذا المؤشر؟')) return;
    
    let customKPIs = getFromStorage('customKPIs', []);
    customKPIs = customKPIs.filter(k => k.code !== code);
    
    saveToStorage('customKPIs', customKPIs);
    
    showSuccess('تم حذف المؤشر بنجاح');
    loadKPIsManagement();
}

// تصدير المؤشرات
function exportKPIs() {
    const customKPIs = getFromStorage('customKPIs', []);
    
    if (customKPIs.length === 0) {
        showWarning('لا توجد مؤشرات مخصصة للتصدير');
        return;
    }
    
    const filename = `Custom_KPIs_${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(customKPIs, filename);
    showSuccess('تم تصدير المؤشرات بنجاح');
}

// تحديث دالة استيراد المؤشرات - استخدام الـ Modal الجديد
function importKPIs() {
    openImportModal();
}

// تحميل جدول البيانات
function loadDataTable() {
    const tbody = document.querySelector('#dataTable tbody');
    
    if (!tbody) return;
    
    const safeKpiData = Array.isArray(kpiData) ? kpiData : [];
    
    if (safeKpiData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">💾</div>
                        <h3>لا توجد بيانات</h3>
                        <p>لم يتم إدخال أي بيانات بعد</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = safeKpiData.map(data => {
        const facility = facilities.find(f => f.id === data.facility);
        const user = users.find(u => u.id === data.user);
        const kpi = getKPIByCode(data.kpiCode);
        
        return `
            <tr>
                <td>${facility ? facility.name : '-'}</td>
                <td>${user ? user.name : '-'}</td>
                <td>${data.kpiCode}${kpi ? ' - ' + kpi.name.substring(0, 30) + '...' : ''}</td>
                <td>${formatDateArabic(data.date)}</td>
                <td>${formatPercentage(data.result)}</td>
                <td>
                    <span class="status-badge status-${data.status}">
                        ${data.status === 'approved' ? 'معتمد' : data.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${data.status === 'pending' ? `
                            <button class="btn btn-small btn-success" onclick="approveData('${data.id}')">
                                ✅ اعتماد
                            </button>
                            <button class="btn btn-small btn-danger" onclick="rejectData('${data.id}')">
                                ❌ رفض
                            </button>
                        ` : ''}
                        <button class="btn btn-small btn-danger" onclick="deleteData('${data.id}')">
                            🗑️ حذف
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// اعتماد البيانات
function approveData(id) {
    const index = kpiData.findIndex(d => d.id === id);
    if (index !== -1) {
        kpiData[index].status = 'approved';
        kpiData[index].approvedBy = currentUser.id;
        kpiData[index].approvedAt = new Date().toISOString();
        saveToStorage('kpiData', kpiData);
        showSuccess('تم اعتماد البيانات بنجاح');
        loadDataTable();
    }
}

// رفض البيانات
function rejectData(id) {
    const reason = prompt('السبب (اختياري):');
    const index = kpiData.findIndex(d => d.id === id);
    if (index !== -1) {
        kpiData[index].status = 'rejected';
        kpiData[index].rejectedBy = currentUser.id;
        kpiData[index].rejectedAt = new Date().toISOString();
        if (reason) kpiData[index].notes = reason;
        saveToStorage('kpiData', kpiData);
        showWarning('تم رفض البيانات');
        loadDataTable();
    }
}

// حذف البيانات
function deleteData(id) {
    if (!confirmAction('هل أنت متأكد من حذف هذه البيانات؟')) return;
    
    kpiData = kpiData.filter(d => d.id !== id);
    saveToStorage('kpiData', kpiData);
    showSuccess('تم حذف البيانات بنجاح');
    loadDataTable();
    updateStatistics();
}

// فتح نافذة منبثقة
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// إغلاق نافذة منبثقة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== دوال التقارير والتحليلات المتقدمة =====

let reportFilteredData = [];

// تحميل بيانات التقارير
function loadReportsData() {
    const allData = Array.isArray(kpiData) ? kpiData : [];
    reportFilteredData = [...allData];
    
    // تحديث الفلاتر
    updateReportFilters();
    
    // تحديث الإحصائيات
    updateReportStatistics();
    
    // تحديث التنبيهات
    updateReportAlerts();
    
    // إنشاء الرسوم البيانية
    createReportCharts();
    
    // تحميل الجدول التفصيلي
    loadDetailedReportTable();
}

// تحديث الفلاتر
function updateReportFilters() {
    // فلتر المنشآت
    const facilityFilter = document.getElementById('reportFacilityFilter');
    if (facilityFilter && Array.isArray(facilities)) {
        facilityFilter.innerHTML = '<option value="">جميع المنشآت</option>' +
            facilities.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    }
    
    // فلتر الفئات
    const categoryFilter = document.getElementById('reportCategoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
            Object.keys(KPI_CATEGORIES).map(key => 
                `<option value="${key}">${KPI_CATEGORIES[key]}</option>`
            ).join('');
    }
}

// تحديث إحصائيات التقارير
function updateReportStatistics() {
    const totalData = reportFilteredData.length;
    const approvedData = reportFilteredData.filter(d => d.status === 'approved').length;
    const pendingData = reportFilteredData.filter(d => d.status === 'pending').length;
    const activeFacilitiesCount = Array.isArray(facilities) ? facilities.filter(f => f.status === 'active').length : 0;
    
    // تحديث الأرقام
    const totalEl = document.getElementById('reportTotalData');
    const approvedEl = document.getElementById('reportApprovedData');
    const pendingEl = document.getElementById('reportPendingData');
    const facilitiesEl = document.getElementById('reportActiveFacilities');
    
    if (totalEl) totalEl.textContent = totalData;
    if (approvedEl) approvedEl.textContent = approvedData;
    if (pendingEl) pendingEl.textContent = pendingData;
    if (facilitiesEl) facilitiesEl.textContent = activeFacilitiesCount;
    
    // حساب نسبة القبول
    const approvalRate = totalData > 0 ? ((approvedData / totalData) * 100).toFixed(1) : 0;
    const rateElement = document.getElementById('reportApprovedRate');
    if (rateElement) {
        rateElement.textContent = `${approvalRate}% معدل القبول`;
        
        // تلوين حسب النسبة
        if (approvalRate >= 85) {
            rateElement.style.color = '#4caf50';
        } else if (approvalRate >= 70) {
            rateElement.style.color = '#ff9800';
        } else {
            rateElement.style.color = '#f44336';
        }
    }
}

// تحديث التنبيهات
function updateReportAlerts() {
    // البيانات الجديدة
    const today = new Date();
    const recentData = reportFilteredData.filter(d => {
        if (!d.createdAt) return false;
        const dataDate = new Date(d.createdAt);
        const diffDays = Math.floor((today - dataDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
    });
    
    const alertNewData = document.getElementById('alertNewData');
    if (alertNewData) {
        if (recentData.length > 0) {
            const latestData = recentData[recentData.length - 1];
            alertNewData.textContent = 
                `${latestData.facilityName || 'منشأة'} أرسل ${recentData.length} بيانات جديدة - اليوم`;
        } else {
            alertNewData.textContent = 'لا توجد بيانات جديدة';
        }
    }
    
    // البيانات المعتمدة حديثاً
    const recentApproved = reportFilteredData.filter(d => {
        if (d.status !== 'approved' || !d.approvedAt) return false;
        const approvedDate = new Date(d.approvedAt);
        const diffDays = Math.floor((today - approvedDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
    });
    
    const alertApproved = document.getElementById('alertApproved');
    if (alertApproved) {
        if (recentApproved.length > 0) {
            alertApproved.textContent = 
                `تم اعتماد ${recentApproved.length} بيانات جديدة - خلال 24 ساعة`;
        } else {
            alertApproved.textContent = 'لا توجد بيانات معتمدة حديثاً';
        }
    }
    
    // التنبيهات
    const pendingCount = reportFilteredData.filter(d => d.status === 'pending').length;
    const alertWarning = document.getElementById('alertWarning');
    if (alertWarning) {
        if (pendingCount > 0) {
            alertWarning.textContent = 
                `${pendingCount} بيانات تحتاج إلى مراجعة واعتماد`;
        } else {
            alertWarning.textContent = 'لا توجد بيانات تحتاج مراجعة ✓';
        }
    }
}

// تطبيق الفلاتر
function applyReportFilters() {
    const facilityId = document.getElementById('reportFacilityFilter')?.value || '';
    const period = document.getElementById('reportPeriodFilter')?.value || '';
    const category = document.getElementById('reportCategoryFilter')?.value || '';
    const status = document.getElementById('reportStatusFilter')?.value || '';
    
    const allData = Array.isArray(kpiData) ? kpiData : [];
    
    reportFilteredData = allData.filter(item => {
        let match = true;
        
        if (facilityId && item.facility !== facilityId) match = false;
        if (category && item.category !== category) match = false;
        if (status && item.status !== status) match = false;
        if (period) {
            const itemDate = item.date ? item.date.substring(0, 7) : '';
            if (itemDate !== period) match = false;
        }
        
        return match;
    });
    
    // تحديث كل شيء
    updateReportStatistics();
    updateReportAlerts();
    createReportCharts();
    loadDetailedReportTable();
    
    showSuccess(`تم العثور على ${reportFilteredData.length} سجل`);
}

// إعادة تعيين الفلاتر
function resetReportFilters() {
    const facilityFilter = document.getElementById('reportFacilityFilter');
    const periodFilter = document.getElementById('reportPeriodFilter');
    const categoryFilter = document.getElementById('reportCategoryFilter');
    const statusFilter = document.getElementById('reportStatusFilter');
    
    if (facilityFilter) facilityFilter.value = '';
    if (periodFilter) periodFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    applyReportFilters();
}

// إنشاء الرسوم البيانية
function createReportCharts() {
    createFacilityPerformanceChart();
    createCategoryDistributionChart();
    createMonthlyPerformanceChart();
}

// رسم بياني لأداء المنشآت
function createFacilityPerformanceChart() {
    const element = document.getElementById('facilityPerformanceChart');
    if (!element) return;
    
    if (reportFilteredData.length === 0) {
        element.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">لا توجد بيانات</div>';
        return;
    }
    
    // تجميع حسب المنشأة
    const facilityData = {};
    reportFilteredData.forEach(item => {
        const name = item.facilityName || 'غير محدد';
        if (!facilityData[name]) {
            facilityData[name] = { results: [], targets: [] };
        }
        facilityData[name].results.push(item.result || 0);
        facilityData[name].targets.push(item.target || 0);
    });
    
    const categories = Object.keys(facilityData);
    const avgResults = categories.map(name => {
        const results = facilityData[name].results;
        return results.reduce((sum, val) => sum + val, 0) / results.length;
    });
    
    const avgTargets = categories.map(name => {
        const targets = facilityData[name].targets;
        return targets.reduce((sum, val) => sum + val, 0) / targets.length;
    });
    
    const chartOptions = {
        chart: { type: 'bar', height: 350, fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
        series: [
            { name: 'النتيجة الفعلية', data: avgResults },
            { name: 'المستهدف', data: avgTargets }
        ],
        xaxis: { categories: categories },
        yaxis: { title: { text: 'النسبة المئوية (%)' } },
        colors: ['#1a73e8', '#f44336'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        legend: { position: 'top' }
    };
    
    element.innerHTML = '';
    const chart = new ApexCharts(element, chartOptions);
    chart.render();
}

// رسم بياني للتوزيع حسب الفئة
function createCategoryDistributionChart() {
    const element = document.getElementById('categoryDistributionChart');
    if (!element) return;
    
    if (reportFilteredData.length === 0) {
        element.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">لا توجد بيانات</div>';
        return;
    }
    
    const categoryCount = {};
    reportFilteredData.forEach(item => {
        const cat = KPI_CATEGORIES[item.category] || 'أخرى';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    const chartOptions = {
        chart: { type: 'donut', height: 350, fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
        series: Object.values(categoryCount),
        labels: Object.keys(categoryCount),
        colors: ['#1a73e8', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#8bc34a', '#ff5722', '#607d8b'],
        legend: { position: 'bottom' },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + '%';
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'الإجمالي',
                            fontSize: '16px',
                            fontWeight: 600,
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        }
    };
    
    element.innerHTML = '';
    const chart = new ApexCharts(element, chartOptions);
    chart.render();
}

// رسم بياني للأداء الشهري
function createMonthlyPerformanceChart() {
    const element = document.getElementById('monthlyPerformanceChart');
    if (!element) return;
    
    if (reportFilteredData.length === 0) {
        element.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">لا توجد بيانات</div>';
        return;
    }
    
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const monthlyData = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);
    
    reportFilteredData.forEach(item => {
        if (!item.date) return;
        const month = new Date(item.date).getMonth();
        monthlyData[month] += item.result || 0;
        monthlyCounts[month]++;
    });
    
    const averages = monthlyData.map((sum, index) => 
        monthlyCounts[index] > 0 ? sum / monthlyCounts[index] : 0
    );
    
    const chartOptions = {
        chart: { type: 'area', height: 350, fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
        series: [{ name: 'متوسط الأداء', data: averages }],
        xaxis: { categories: months },
        yaxis: { title: { text: 'النسبة المئوية (%)' } },
        colors: ['#1a73e8'],
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 }
        },
        stroke: { curve: 'smooth', width: 2 },
        dataLabels: { enabled: false }
    };
    
    element.innerHTML = '';
    const chart = new ApexCharts(element, chartOptions);
    chart.render();
}

// تحميل الجدول التفصيلي
function loadDetailedReportTable() {
    const tbody = document.getElementById('detailedReportBody');
    if (!tbody) return;
    
    if (reportFilteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <h3>لا توجد بيانات</h3>
                        <p>لم يتم العثور على بيانات تطابق الفلاتر</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedData = [...reportFilteredData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    tbody.innerHTML = sortedData.map(item => {
        const kpi = getKPIByCode(item.kpiCode);
        const kpiName = kpi ? kpi.name : item.kpiName || item.kpiCode;
        
        const target = item.target || 0;
        const result = item.result || 0;
        const deviation = result - target;
        const deviationPercent = target > 0 ? ((deviation / target) * 100).toFixed(1) : 0;
        
        let performance = '';
        let performanceClass = '';
        
        if (result >= target * 0.95) {
            performance = 'ممتاز';
            performanceClass = 'badge-success';
        } else if (result >= target * 0.85) {
            performance = 'جيد';
            performanceClass = 'badge-primary';
        } else if (result >= target * 0.70) {
            performance = 'متوسط';
            performanceClass = 'badge-warning';
        } else {
            performance = 'ضعيف';
            performanceClass = 'badge-danger';
        }
        
        return `
            <tr>
                <td>
                    <strong>${item.kpiCode}</strong><br>
                    <small style="color:#666;">${kpiName.substring(0, 40)}...</small>
                </td>
                <td>${item.facilityName || '-'}</td>
                <td><span class="badge badge-primary">${KPI_CATEGORIES[item.category] || item.category}</span></td>
                <td><strong>${target}${item.unit || '%'}</strong></td>
                <td><strong>${result.toFixed(1)}${item.unit || '%'}</strong></td>
                <td style="color: ${deviation >= 0 ? '#4caf50' : '#f44336'}; font-weight: 700;">
                    ${deviation >= 0 ? '+' : ''}${deviationPercent}%
                </td>
                <td><span class="badge ${performanceClass}">${performance}</span></td>
                <td>${formatDate(item.date)}</td>
                <td>
                    <span class="status-badge status-${item.status}">
                        ${item.status === 'approved' ? 'معتمد' : 
                          item.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// تصدير التقرير الكامل
function exportFullReport() {
    if (reportFilteredData.length === 0) {
        showWarning('لا توجد بيانات للتصدير');
        return;
    }
    
    const data = reportFilteredData.map(item => {
        const kpi = getKPIByCode(item.kpiCode);
        const deviation = (item.result || 0) - (item.target || 0);
        const deviationPercent = item.target > 0 ? ((deviation / item.target) * 100).toFixed(1) : 0;
        
        return {
            'كود المؤشر': item.kpiCode,
            'اسم المؤشر': kpi ? kpi.name : item.kpiName,
            'الفئة': KPI_CATEGORIES[item.category] || item.category,
            'المنشأة': item.facilityName,
            'التاريخ': formatDate(item.date),
            'الفترة': item.period,
            'المستهدف': item.target + (item.unit || '%'),
            'النتيجة': (item.result || 0).toFixed(1) + (item.unit || '%'),
            'الانحراف': deviationPercent + '%',
            'الحالة': item.status === 'approved' ? 'معتمد' : 
                      item.status === 'pending' ? 'قيد المراجعة' : 'مرفوض',
            'المستخدم': item.userName || '-',
            'تاريخ الإدخال': formatDateArabic(item.createdAt)
        };
    });
    
    const filename = `KPI_Full_Report_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(data, filename);
    showSuccess('✅ تم تصدير التقرير الكامل بنجاح');
}

// تصدير التقرير التفصيلي
function exportDetailedReport() {
    exportFullReport();
}

// تحديث التقارير
function refreshReports() {
    loadData();
    loadReportsData();
    showSuccess('تم تحديث التقارير بنجاح');
}
// ===== دوال استيراد Excel/CSV =====

// فتح نافذة الاستيراد
function openImportModal() {
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    const fileInput = document.getElementById('kpiFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    console.log('📂 فتح نافذة الاستيراد');
    openModal('importModal');
}

// معالجة اختيار الملف
function handleKPIFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📁 تم اختيار الملف:', file.name);
    
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        showError('يرجى اختيار ملف CSV أو Excel');
        return;
    }
    
    if (typeof handleFileUpload === 'function') {
        handleFileUpload(file);
    } else {
        showError('خطأ: دالة handleFileUpload غير موجودة');
        console.error('❌ handleFileUpload is not defined');
    }
}

console.log('✅ Admin Main loaded successfully');
