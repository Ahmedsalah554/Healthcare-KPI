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
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    
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
        document.getElementById('userNameDisplay').textContent = currentUser.name;
        document.getElementById('userRoleDisplay').textContent = 
            currentUser.role === 'admin' ? 'مدير النظام' : 'مشرف';
        
        if (currentUser.facility) {
            const facility = facilities.find(f => f.id === currentUser.facility);
            document.getElementById('userFacilityDisplay').textContent = 
                facility ? facility.name : '-';
        }
    }
}

// تحميل البيانات
function loadData() {
    facilities = getFromStorage('facilities', getDefaultFacilities());
    users = getFromStorage('users', getDefaultUsers());
    kpiData = getFromStorage('kpiData', []);
    
    // حفظ البيانات الافتراضية إذا لم تكن موجودة
    if (facilities.length > 0) saveToStorage('facilities', facilities);
    if (users.length > 0) saveToStorage('users', users);
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
            email: 'ahmed@hospital.com',
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

// تحديث الإحصائيات
function updateStatistics() {
    document.getElementById('totalFacilities').textContent = facilities.length;
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalKPIs').textContent = KPI_DATA.length;
    document.getElementById('totalData').textContent = kpiData.length;
    
    // حساب البيانات الشهرية
    const thisMonth = new Date().getMonth();
    const monthlyData = kpiData.filter(item => {
        const itemMonth = new Date(item.date).getMonth();
        return itemMonth === thisMonth;
    });
    
    document.getElementById('monthlyData').textContent = `${monthlyData.length} هذا الشهر`;
}

// التبديل بين الصفحات
function switchView(viewName) {
    // إخفاء كل التبويبات
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
    event.target.classList.add('active');
    
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
    }
}

// تحميل المنشآت
function loadFacilities() {
    const tbody = document.querySelector('#facilitiesTable tbody');
    
    if (facilities.length === 0) {
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
    
    tbody.innerHTML = facilities.map(facility => `
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
}

// تحميل المستخدمين
function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (users.length === 0) {
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
    
    tbody.innerHTML = users.map(user => {
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
    
    if (id) {
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            showSuccess('تم تحديث المستخدم بنجاح');
        }
    } else {
        userData.createdAt = new Date().toISOString();
        users.push(userData);
        showSuccess('تم إضافة المستخدم بنجاح');
    }
    
    saveToStorage('users', users);
    closeModal('userModal');
    loadUsers();
}

// حذف مستخدم
function deleteUser(id) {
    if (!confirmAction('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    users = users.filter(u => u.id !== id);
    saveToStorage('users', users);
    showSuccess('تم حذف المستخدم بنجاح');
    loadUsers();
}

// تحميل إدارة المؤشرات
function loadKPIsManagement() {
    const container = document.getElementById('kpisManagementContainer');
    
    const categorizedKPIs = {};
    KPI_DATA.forEach(kpi => {
        if (!categorizedKPIs[kpi.category]) {
            categorizedKPIs[kpi.category] = [];
        }
        categorizedKPIs[kpi.category].push(kpi);
    });
    
    container.innerHTML = Object.keys(categorizedKPIs).map(category => `
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
                                <span class="badge badge-primary">المستهدف: ${kpi.target}${kpi.unit}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// تحميل جدول البيانات
function loadDataTable() {
    const tbody = document.querySelector('#dataTable tbody');
    
    if (kpiData.length === 0) {
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
    
    tbody.innerHTML = kpiData.map(data => {
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

console.log('✅ Admin Main loaded successfully');
