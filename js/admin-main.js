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
    console.log('🚀 Admin panel initializing...');
    initializeAdminPanel();
});

// تهيئة لوحة التحكم
function initializeAdminPanel() {
    currentUser = getFromStorage('currentUser');
    
    if (!currentUser) {
        console.log('👤 No user found, showing login page');
        showLoginPage();
    } else {
        console.log('✅ User found:', currentUser.name);
        loadData();
        showAdminPanel();
    }
}

// عرض صفحة تسجيل الدخول
function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginPage) {
        loginPage.classList.remove('hide');
        loginPage.style.display = 'flex';
    }
    if (adminPanel) {
        adminPanel.classList.remove('show');
        adminPanel.style.display = 'none';
    }
}

// عرض لوحة التحكم
function showAdminPanel() {
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');
    
    console.log('📊 Showing admin panel...');
    
    if (loginPage) {
        loginPage.classList.add('hide');
        loginPage.style.display = 'none';
    }
    
    if (adminPanel) {
        adminPanel.classList.add('show');
        adminPanel.style.display = 'flex';
    }
    
    displayUserInfo();
    
    setTimeout(() => {
        loadDashboard();
        updateDashboardStats();
    }, 100);
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🔐 Login attempt...');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (email === 'admin@system.com' && password === 'admin123') {
        console.log('✅ Login successful');
        
        currentUser = {
            id: 'admin1',
            name: 'المدير العام',
            email: email,
            role: 'admin',
            facility: null
        };
        
        saveToStorage('currentUser', currentUser);
        loadData();
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        showAdminPanel();
        showSuccess('تم تسجيل الدخول بنجاح');
    } else {
        console.log('❌ Invalid credentials');
        if (errorDiv) {
            errorDiv.textContent = '⚠️ بيانات الدخول غير صحيحة';
            errorDiv.style.display = 'block';
            errorDiv.style.background = '#ffebee';
            errorDiv.style.color = '#c62828';
            errorDiv.style.padding = '15px';
            errorDiv.style.borderRadius = '8px';
            errorDiv.style.marginBottom = '20px';
            errorDiv.style.borderRight = '4px solid #f44336';
        }
    }
}

// معالجة تسجيل الخروج
function handleLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
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
        if (userRoleDisplay) userRoleDisplay.textContent = getRoleNameArabic(currentUser.role);
    }
}

// الحصول على اسم الدور بالعربية
function getRoleNameArabic(role) {
    const roles = {
        admin: 'مدير النظام',
        supervisor: 'مشرف',
        user: 'مستخدم'
    };
    return roles[role] || role;
}

// تحميل البيانات
function loadData() {
    facilities = getFromStorage('facilities', []);
    users = getFromStorage('users', []);
    kpiData = getFromStorage('kpiData', []);
    
    console.log('📊 Data loaded:', { 
        facilities: facilities.length, 
        users: users.length, 
        kpiData: kpiData.length 
    });
}

/**
 * ===== لوحة المعلومات =====
 */

function loadDashboard() {
    console.log('📈 Loading dashboard...');
    updateDashboardStats();
    loadDashboardCharts();
}

function updateDashboardStats() {
    const totalFacilities = document.getElementById('totalFacilities');
    if (totalFacilities) {
        totalFacilities.textContent = facilities.length;
    }
    
    const totalUsers = document.getElementById('totalUsers');
    if (totalUsers) {
        totalUsers.textContent = users.length;
    }
    
    const totalKPIs = document.getElementById('totalKPIs');
    if (totalKPIs) {
        const allKPIsCount = getAllKPIs().length;
        totalKPIs.textContent = allKPIsCount;
    }
    
    const totalData = document.getElementById('totalData');
    if (totalData) {
        totalData.textContent = kpiData.length;
    }
    
    const monthlyData = document.getElementById('monthlyData');
    if (monthlyData) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyCount = kpiData.filter(d => d.month && d.month.startsWith(currentMonth)).length;
        monthlyData.textContent = `${monthlyCount} هذا الشهر`;
    }
}

function loadDashboardCharts() {
    const container = document.getElementById('dashboardCharts');
    if (!container) return;
    
    if (typeof ApexCharts === 'undefined') {
        console.error('❌ ApexCharts library not loaded');
        container.innerHTML = `
            <div class="alert alert-danger">
                ⚠️ مكتبة الرسوم البيانية غير محملة
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-top: 30px;">
            <div class="card">
                <div class="card-header">
                    <h3>📊 توزيع المنشآت</h3>
                </div>
                <div class="card-body">
                    <div id="facilitiesChart" style="min-height: 300px;"></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>👥 توزيع المستخدمين</h3>
                </div>
                <div class="card-body">
                    <div id="usersChart" style="min-height: 300px;"></div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        renderFacilitiesChart();
        renderUsersChart();
    }, 100);
}

function renderFacilitiesChart() {
    const chartDiv = document.getElementById('facilitiesChart');
    if (!chartDiv) return;
    
    const distribution = {};
    facilities.forEach(f => {
        const type = getFacilityTypeArabic(f.type);
        distribution[type] = (distribution[type] || 0) + 1;
    });
    
    const labels = Object.keys(distribution);
    const series = Object.values(distribution);
    
    if (labels.length === 0 || series.length === 0) {
        chartDiv.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 10px;">📊</div>
                <p>لا توجد بيانات لعرضها</p>
            </div>
        `;
        return;
    }
    
    const options = {
        series: series,
        chart: {
            type: 'donut',
            height: 300
        },
        labels: labels,
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            enabled: true
        }
    };
    
    try {
        const chart = new ApexCharts(chartDiv, options);
        chart.render();
    } catch (error) {
        console.error('خطأ في رسم المخطط:', error);
        chartDiv.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: #f44336;">
                <p>⚠️ حدث خطأ في رسم المخطط</p>
            </div>
        `;
    }
}

function renderUsersChart() {
    const chartDiv = document.getElementById('usersChart');
    if (!chartDiv) return;
    
    const distribution = {};
    users.forEach(u => {
        const role = getRoleNameArabic(u.role);
        distribution[role] = (distribution[role] || 0) + 1;
    });
    
    const labels = Object.keys(distribution);
    const series = Object.values(distribution);
    
    if (labels.length === 0 || series.length === 0) {
        chartDiv.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 10px;">👥</div>
                <p>لا توجد بيانات لعرضها</p>
            </div>
        `;
        return;
    }
    
    const options = {
        series: [{
            name: 'عدد المستخدمين',
            data: series
        }],
        chart: {
            type: 'bar',
            height: 300
        },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true,
                borderRadius: 4
            }
        },
        colors: ['#667eea', '#764ba2', '#f093fb'],
        xaxis: {
            categories: labels
        },
        legend: {
            show: false
        },
        dataLabels: {
            enabled: true
        }
    };
    
    try {
        const chart = new ApexCharts(chartDiv, options);
        chart.render();
    } catch (error) {
        console.error('خطأ في رسم المخطط:', error);
        chartDiv.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: #f44336;">
                <p>⚠️ حدث خطأ في رسم المخطط</p>
            </div>
        `;
    }
}

/**
 * ===== إدارة المنشآت =====
 */

function loadFacilitiesTable() {
    const tbody = document.querySelector('#facilitiesTable tbody');
    if (!tbody) return;
    
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
            <td>${getFacilityTypeArabic(facility.type)}</td>
            <td>${facility.city || '-'}</td>
            <td>${facility.phone || '-'}</td>
            <td>${facility.capacity || '-'}</td>
            <td>
                <span class="badge ${facility.status === 'active' ? 'badge-success' : 'badge-danger'}">
                    ${facility.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="editFacility('${facility.id}')" title="تعديل">✏️</button>
                <button class="btn-icon" onclick="deleteFacility('${facility.id}')" title="حذف">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getFacilityTypeArabic(type) {
    const types = {
        hospital: 'مستشفى',
        healthCenter: 'مركز صحي',
        healthUnit: 'وحدة صحية'
    };
    return types[type] || type;
}

function addFacility() {
    document.getElementById('facilityId').value = '';
    document.getElementById('facilityCode').value = '';
    document.getElementById('facilityName').value = '';
    document.getElementById('facilityType').value = '';
    document.getElementById('facilityCity').value = '';
    document.getElementById('facilityPhone').value = '';
    document.getElementById('facilityEmail').value = '';
    document.getElementById('facilityCapacity').value = '';
    document.getElementById('facilityStatus').value = 'active';
    
    document.getElementById('modalTitle').textContent = 'إضافة منشأة جديدة';
    openModal('facilityModal');
}

function editFacility(facilityId) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) return;
    
    document.getElementById('facilityId').value = facility.id;
    document.getElementById('facilityCode').value = facility.code;
    document.getElementById('facilityName').value = facility.name;
    document.getElementById('facilityType').value = facility.type;
    document.getElementById('facilityCity').value = facility.city || '';
    document.getElementById('facilityPhone').value = facility.phone || '';
    document.getElementById('facilityEmail').value = facility.email || '';
    document.getElementById('facilityCapacity').value = facility.capacity || '';
    document.getElementById('facilityStatus').value = facility.status;
    
    document.getElementById('modalTitle').textContent = 'تعديل منشأة';
    openModal('facilityModal');
}

function saveFacility(event) {
    event.preventDefault();
    
    const facilityId = document.getElementById('facilityId').value;
    const facilityData = {
        code: document.getElementById('facilityCode').value,
        name: document.getElementById('facilityName').value,
        type: document.getElementById('facilityType').value,
        city: document.getElementById('facilityCity').value,
        phone: document.getElementById('facilityPhone').value,
        email: document.getElementById('facilityEmail').value,
        capacity: document.getElementById('facilityCapacity').value,
        status: document.getElementById('facilityStatus').value
    };
    
    if (facilityId) {
        const index = facilities.findIndex(f => f.id === facilityId);
        if (index !== -1) {
            facilities[index] = { ...facilities[index], ...facilityData };
            showSuccess('تم تحديث المنشأة بنجاح');
        }
    } else {
        facilityData.id = generateId();
        facilityData.createdAt = new Date().toISOString();
        facilities.push(facilityData);
        showSuccess('تم إضافة المنشأة بنجاح');
    }
    
    saveToStorage('facilities', facilities);
    loadFacilitiesTable();
    closeModal('facilityModal');
    updateDashboardStats();
}

function deleteFacility(facilityId) {
    if (!confirm('هل أنت متأكد من حذف هذه المنشأة؟')) return;
    
    facilities = facilities.filter(f => f.id !== facilityId);
    saveToStorage('facilities', facilities);
    loadFacilitiesTable();
    updateDashboardStats();
    showSuccess('تم حذف المنشأة بنجاح');
}

/**
 * ===== إدارة المستخدمين =====
 */

function loadUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <h3>لا يوجد مستخدمين</h3>
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
                <td>${getRoleNameArabic(user.role)}</td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">
                        ${user.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>${user.phone || '-'}</td>
                <td>
                    <button class="btn-icon" onclick="editUser('${user.id}')" title="تعديل">✏️</button>
                    <button class="btn-icon" onclick="deleteUser('${user.id}')" title="حذف">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function addUser() {
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userFacility').value = '';
    document.getElementById('userRole').value = 'user';
    document.getElementById('userStatus').value = 'active';
    
    const facilitySelect = document.getElementById('userFacility');
    facilitySelect.innerHTML = '<option value="">-- اختر المنشأة --</option>' +
        facilities.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    
    document.getElementById('userModalTitle').textContent = 'إضافة مستخدم جديد';
    openModal('userModal');
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    const facilitySelect = document.getElementById('userFacility');
    facilitySelect.innerHTML = '<option value="">-- اختر المنشأة --</option>' +
        facilities.map(f => `<option value="${f.id}" ${f.id === user.facility ? 'selected' : ''}>${f.name}</option>`).join('');
    
    document.getElementById('userModalTitle').textContent = 'تعديل مستخدم';
    openModal('userModal');
}

function saveUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('userPassword').value;
    
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        facility: document.getElementById('userFacility').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };
    
    const facility = facilities.find(f => f.id === userData.facility);
    if (facility) {
        userData.facilityType = facility.type;
    }
    
    if (userId) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            if (password) {
                users[index].password = password;
            }
            showSuccess('تم تحديث المستخدم بنجاح');
        }
    } else {
        if (!password) {
            showError('كلمة المرور مطلوبة للمستخدم الجديد');
            return;
        }
        userData.id = generateId();
        userData.password = password;
        userData.createdAt = new Date().toISOString();
        users.push(userData);
        showSuccess('تم إضافة المستخدم بنجاح');
    }
    
    saveToStorage('users', users);
    loadUsersTable();
    closeModal('userModal');
    updateDashboardStats();
}

function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    users = users.filter(u => u.id !== userId);
    saveToStorage('users', users);
    loadUsersTable();
    updateDashboardStats();
    showSuccess('تم حذف المستخدم بنجاح');
}

/**
 * ===== إدارة المؤشرات =====
 */

let selectedKPIDataType = 'performance';
let currentEditingKPI = null;

function showKPIManagement() {
    const container = document.getElementById('kpisManagementContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header">
                <h3>اختر نوع البيانات</h3>
            </div>
            <div class="card-body">
                <div class="data-type-selector" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${Object.keys(DATA_TYPES).map(typeKey => {
                        const type = DATA_TYPES[typeKey];
                        const kpis = getAllKPIsByType(type.id);
                        return `
                            <div class="data-type-option ${typeKey === 'PERFORMANCE' ? 'active' : ''}" 
                                 onclick="selectKPIDataType('${type.id}')" 
                                 id="dataTypeBtn_${type.id}"
                                 style="border: 2px solid ${type.color}; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.3s; background: white;">
                                <div style="font-size: 2.5rem; margin-bottom: 10px;">${type.icon}</div>
                                <h4 style="color: ${type.color}; margin-bottom: 8px;">${type.name}</h4>
                                <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${type.description}</p>
                                <div class="badge" style="background: ${type.color}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem;">
                                    ${kpis.length} مؤشر
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 id="kpiListTitle">مؤشرات الأداء</h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success btn-small" onclick="openImportModal()">
                        📤 استيراد من Excel
                    </button>
                    <button class="btn btn-primary btn-small" onclick="addKPIManual()">
                        ➕ إضافة مؤشر يدوياً
                    </button>
                </div>
            </div>
            <div class="card-body" id="kpiListContainer">
                <div style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                    <p>جاري تحميل المؤشرات...</p>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => selectKPIDataType('performance'), 100);
}

function selectKPIDataType(dataType) {
    selectedKPIDataType = dataType;
    
    console.log('📊 Selected data type:', dataType);
    
    document.querySelectorAll('.data-type-option').forEach(opt => {
        opt.classList.remove('active');
        opt.style.transform = 'scale(1)';
        opt.style.boxShadow = 'none';
    });
    
    const selectedBtn = document.getElementById(`dataTypeBtn_${dataType}`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
        selectedBtn.style.transform = 'scale(1.05)';
        selectedBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
    }
    
    const typeInfo = getDataTypeInfo(dataType);
    const title = document.getElementById('kpiListTitle');
    if (title && typeInfo) {
        title.textContent = typeInfo.name;
        title.style.color = typeInfo.color;
    }
    
    loadKPIsList(dataType);
}

function loadKPIsList(dataType) {
    const container = document.getElementById('kpiListContainer');
    if (!container) return;
    
    console.log('📋 Loading KPIs for:', dataType);
    
    const kpis = getAllKPIsByType(dataType);
    const typeInfo = getDataTypeInfo(dataType);
    
    console.log('Found KPIs:', kpis.length);
    
    if (kpis.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">${typeInfo.icon}</div>
                <h3 style="color: #333; margin-bottom: 10px;">لا توجد مؤشرات</h3>
                <p style="margin-bottom: 25px;">قم بإضافة مؤشرات يدوياً أو استيرادها من Excel</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-primary" onclick="addKPIManual()">➕ إضافة مؤشر يدوياً</button>
                    <button class="btn btn-success" onclick="openImportModal()">📤 استيراد من Excel</button>
                </div>
            </div>
        `;
        return;
    }
    
    const categories = getCategoriesByDataType(dataType);
    const groupedKPIs = {};
    
    kpis.forEach(kpi => {
        const category = kpi.category || kpi.department || kpi.section || 'other';
        if (!groupedKPIs[category]) {
            groupedKPIs[category] = [];
        }
        groupedKPIs[category].push(kpi);
    });
    
    container.innerHTML = Object.keys(groupedKPIs).map(category => {
        const categoryName = categories[category] || category;
        const categoryKPIs = groupedKPIs[category];
        
        return `
            <div class="category-group" style="margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                <div style="background: ${typeInfo.color}; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.2rem;">${categoryName}</h3>
                    <span style="background: rgba(255,255,255,0.3); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem;">
                        ${categoryKPIs.length} مؤشر
                    </span>
                </div>
                <div style="padding: 15px;">
                    ${categoryKPIs.map(kpi => `
                        <div class="kpi-card" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 10px; transition: all 0.3s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                        <span style="background: ${typeInfo.color}; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                                            ${kpi.code}
                                        </span>
                                        <h4 style="margin: 0; color: #333; font-size: 1rem;">${kpi.name}</h4>
                                    </div>
                                    ${kpi.formula ? `
                                        <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">
                                            <strong>الصيغة:</strong> ${kpi.formula}
                                        </p>
                                    ` : ''}
                                    ${kpi.numeratorLabel && kpi.denominatorLabel ? `
                                        <p style="margin: 5px 0; color: #666; font-size: 0.85rem;">
                                            <strong>البسط:</strong> ${kpi.numeratorLabel} | 
                                            <strong>المقام:</strong> ${kpi.denominatorLabel}
                                        </p>
                                    ` : ''}
                                    ${kpi.target ? `
                                        <p style="margin: 5px 0; color: #666; font-size: 0.85rem;">
                                            <strong>المستهدف:</strong> ${kpi.target}${kpi.unit || ''}
                                        </p>
                                    ` : ''}
                                    <div style="margin-top: 8px; font-size: 0.8rem; color: #999;">
                                        ${getApplicableFacilitiesText(kpi.applicableTo || {})}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-icon" onclick="viewKPIDetails('${kpi.id}')" title="عرض التفاصيل" style="font-size: 1.2rem; padding: 8px; background: #e3f2fd; border: none; border-radius: 6px; cursor: pointer;">👁️</button>
                                    <button class="btn-icon" onclick="editKPIManual('${kpi.id}')" title="تعديل" style="font-size: 1.2rem; padding: 8px; background: #fff3e0; border: none; border-radius: 6px; cursor: pointer;">✏️</button>
                                    <button class="btn-icon" onclick="deleteKPIConfirm('${kpi.id}', '${dataType}')" title="حذف" style="font-size: 1.2rem; padding: 8px; background: #ffebee; border: none; border-radius: 6px; cursor: pointer;">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function addKPIManual() {
    currentEditingKPI = null;
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    
    if (!typeInfo) {
        showError('الرجاء اختيار نوع البيانات أولاً');
        return;
    }
    
    const modalContent = createKPIForm(typeInfo, null);
    showKPIModal('إضافة مؤشر جديد - ' + typeInfo.name, modalContent);
}

function createKPIForm(typeInfo, kpiData = null) {
    const categories = getCategoriesByDataType(typeInfo.id);
    const isEdit = kpiData !== null;
    
    return `
        <form id="kpiManualForm" onsubmit="saveKPIManual(event); return false;" style="max-height: 70vh; overflow-y: auto; padding: 5px;">
            <div class="form-group">
                <label for="kpiCode">كود المؤشر *</label>
                <input type="text" id="kpiCode" required placeholder="مثال: WFM-01" value="${kpiData?.code || ''}" ${isEdit ? 'readonly' : ''}>
                <small>الكود يجب أن يكون فريداً ولا يمكن تعديله لاحقاً</small>
            </div>

            <div class="form-group">
                <label for="kpiName">اسم المؤشر *</label>
                <input type="text" id="kpiName" required placeholder="أدخل اسم المؤشر" value="${kpiData?.name || ''}">
            </div>

            <div class="form-group">
                <label for="kpiCategory">الفئة *</label>
                <select id="kpiCategory" required>
                    <option value="">-- اختر الفئة --</option>
                    ${Object.keys(categories).map(key => 
                        `<option value="${key}" ${kpiData?.category === key ? 'selected' : ''}>${categories[key]}</option>`
                    ).join('')}
                </select>
            </div>

            ${typeInfo.hasFormula ? `
                <div class="form-group">
                    <label for="kpiFormula">الصيغة الحسابية *</label>
                    <input type="text" id="kpiFormula" required placeholder="مثال: (البسط / المقام) × 100" value="${kpiData?.formula || ''}">
                </div>
            ` : ''}

            ${typeInfo.hasNumeratorDenominator ? `
                <div class="form-group">
                    <label for="kpiNumeratorLabel">تسمية البسط *</label>
                    <input type="text" id="kpiNumeratorLabel" required placeholder="مثال: عدد الحالات المعالجة" value="${kpiData?.numeratorLabel || ''}">
                </div>

                <div class="form-group">
                    <label for="kpiDenominatorLabel">تسمية المقام *</label>
                    <input type="text" id="kpiDenominatorLabel" required placeholder="مثال: إجمالي الحالات" value="${kpiData?.denominatorLabel || ''}">
                </div>
            ` : ''}

            <div class="form-group">
                <label for="kpiTarget">المستهدف *</label>
                <input type="number" id="kpiTarget" step="0.01" required placeholder="مثال: 85" value="${kpiData?.target || ''}">
            </div>

            <div class="form-group">
                <label for="kpiUnit">الوحدة *</label>
                <select id="kpiUnit" required>
                    <option value="%" ${kpiData?.unit === '%' ? 'selected' : ''}>%</option>
                    <option value="عدد" ${kpiData?.unit === 'عدد' ? 'selected' : ''}>عدد</option>
                    <option value="ساعة" ${kpiData?.unit === 'ساعة' ? 'selected' : ''}>ساعة</option>
                    <option value="يوم" ${kpiData?.unit === 'يوم' ? 'selected' : ''}>يوم</option>
                    <option value="دقيقة" ${kpiData?.unit === 'دقيقة' ? 'selected' : ''}>دقيقة</option>
                </select>
            </div>

            <div class="form-group">
                <label style="display: block; margin-bottom: 10px; font-weight: 600;">أنواع المنشآت المتاحة *</label>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="facilityHospital" ${kpiData?.applicableTo?.hospital ? 'checked' : ''}>
                        <span>🏥 مستشفى</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="facilityHealthCenter" ${kpiData?.applicableTo?.healthCenter ? 'checked' : ''}>
                        <span>🏥 مركز صحي</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="facilityHealthUnit" ${kpiData?.applicableTo?.healthUnit ? 'checked' : ''}>
                        <span>🏥 وحدة صحية</span>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label for="kpiDescription">الوصف (اختياري)</label>
                <textarea id="kpiDescription" rows="3" placeholder="وصف المؤشر وطريقة حسابه...">${kpiData?.description || ''}</textarea>
            </div>

            <div class="modal-footer" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" onclick="closeKPIModal()">إلغاء</button>
                <button type="submit" class="btn btn-primary">💾 ${isEdit ? 'تحديث' : 'حفظ'}</button>
            </div>
        </form>
    `;
}

function saveKPIManual(event) {
    event.preventDefault();
    
    console.log('💾 Saving KPI...');
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    
    const kpiData = {
        dataType: selectedKPIDataType,
        code: document.getElementById('kpiCode').value.trim(),
        name: document.getElementById('kpiName').value.trim(),
        category: document.getElementById('kpiCategory').value,
        target: parseFloat(document.getElementById('kpiTarget').value),
        unit: document.getElementById('kpiUnit').value,
        description: document.getElementById('kpiDescription')?.value || '',
        applicableTo: {
            hospital: document.getElementById('facilityHospital').checked,
            healthCenter: document.getElementById('facilityHealthCenter').checked,
            healthUnit: document.getElementById('facilityHealthUnit').checked
        }
    };
    
    if (typeInfo.hasFormula) {
        kpiData.formula = document.getElementById('kpiFormula').value.trim();
    }
    
    if (typeInfo.hasNumeratorDenominator) {
        kpiData.numeratorLabel = document.getElementById('kpiNumeratorLabel').value.trim();
        kpiData.denominatorLabel = document.getElementById('kpiDenominatorLabel').value.trim();
    }
    
    if (!kpiData.applicableTo.hospital && !kpiData.applicableTo.healthCenter && !kpiData.applicableTo.healthUnit) {
        showError('يجب اختيار نوع منشأة واحد على الأقل');
        return;
    }
    
    console.log('KPI Data:', kpiData);
    
    let result;
    if (currentEditingKPI) {
        kpiData.id = currentEditingKPI;
        result = updateKPI(currentEditingKPI, kpiData);
    } else {
        result = saveKPI(kpiData);
    }
    
    console.log('Save result:', result);
    
    if (result.success) {
        showSuccess(result.message);
        closeKPIModal();
        loadKPIsList(selectedKPIDataType);
        updateDashboardStats();
        selectKPIDataType(selectedKPIDataType);
    } else {
        showError(result.message);
    }
}

function editKPIManual(kpiId) {
    const kpi = getKPIById(kpiId);
    if (!kpi) {
        showError('المؤشر غير موجود');
        return;
    }
    
    currentEditingKPI = kpiId;
    const typeInfo = getDataTypeInfo(kpi.dataType);
    
    const modalContent = createKPIForm(typeInfo, kpi);
    showKPIModal('تعديل مؤشر - ' + typeInfo.name, modalContent);
}

function viewKPIDetails(kpiId) {
    const kpi = getKPIById(kpiId);
    if (!kpi) {
        showError('المؤشر غير موجود');
        return;
    }
    
    const typeInfo = getDataTypeInfo(kpi.dataType);
    const categoryName = getCategoryName(kpi.dataType, kpi.category);
    
    const details = `
        <div style="padding: 20px;">
            <div style="background: ${typeInfo.color}; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">${typeInfo.icon}</div>
                <h2 style="margin: 0 0 5px 0;">${kpi.name}</h2>
                <p style="margin: 0; opacity: 0.9;">${kpi.code}</p>
            </div>
            
            <div style="display: grid; gap: 15px;">
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">نوع البيانات:</strong><br>
                    <span style="font-size: 1.1rem; color: #333;">${typeInfo.name}</span>
                </div>
                
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">الفئة:</strong><br>
                    <span style="font-size: 1.1rem; color: #333;">${categoryName}</span>
                </div>
                
                ${kpi.formula ? `
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #666;">الصيغة الحسابية:</strong><br>
                        <span style="font-size: 1.1rem; color: #333;">${kpi.formula}</span>
                    </div>
                ` : ''}
                
                ${kpi.numeratorLabel && kpi.denominatorLabel ? `
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #666;">البسط:</strong><br>
                        <span style="font-size: 1rem; color: #333;">${kpi.numeratorLabel}</span>
                    </div>
                    
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #666;">المقام:</strong><br>
                        <span style="font-size: 1rem; color: #333;">${kpi.denominatorLabel}</span>
                    </div>
                ` : ''}
                
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">المستهدف:</strong><br>
                    <span style="font-size: 1.3rem; color: ${typeInfo.color}; font-weight: 600;">${kpi.target} ${kpi.unit}</span>
                </div>
                
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">المنشآت المتاحة:</strong><br>
                    <span style="font-size: 1rem; color: #333;">${getApplicableFacilitiesText(kpi.applicableTo || {})}</span>
                </div>
                
                ${kpi.description ? `
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong style="color: #666;">الوصف:</strong><br>
                        <span style="font-size: 0.95rem; color: #333;">${kpi.description}</span>
                    </div>
                ` : ''}
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                <button class="btn btn-secondary" onclick="closeKPIModal()">إغلاق</button>
            </div>
        </div>
    `;
    
    showKPIModal('تفاصيل المؤشر', details);
}

function deleteKPIConfirm(kpiId, dataType) {
    const kpi = getKPIById(kpiId);
    if (!kpi) {
        showError('المؤشر غير موجود');
        return;
    }
    
    if (!confirm(`هل أنت متأكد من حذف المؤشر:\n\n${kpi.code} - ${kpi.name}\n\nلا يمكن التراجع عن هذا الإجراء!`)) {
        return;
    }
    
    const result = deleteKPI(kpiId, dataType);
    
    if (result.success) {
        showSuccess(result.message);
        loadKPIsList(dataType);
        updateDashboardStats();
        selectKPIDataType(dataType);
    } else {
        showError(result.message);
    }
}

function showKPIModal(title, content) {
    let modal = document.getElementById('customKPIModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customKPIModal';
        modal.className = 'modal';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center;';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 15px; max-width: 600px; width: 90%; max-height: 90vh; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px 25px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 1.3rem; color: #333;">${title}</h2>
                <span onclick="closeKPIModal()" style="cursor: pointer; font-size: 1.5rem; color: #999; line-height: 1;">&times;</span>
            </div>
            <div class="modal-body" style="padding: 25px;">
                ${content}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeKPIModal();
        }
    };
}

function closeKPIModal() {
    const modal = document.getElementById('customKPIModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingKPI = null;
}

function openImportModal() {
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    
    if (!typeInfo) {
        showError('الرجاء اختيار نوع البيانات أولاً');
        return;
    }
    
    document.getElementById('importModalTitle').textContent = `استيراد مؤشرات - ${typeInfo.name}`;
    openModal('importModal');
}

/**
 * ===== إدارة البيانات المدخلة =====
 */

function loadDataTable() {
    const tbody = document.querySelector('#dataTable tbody');
    if (!tbody) return;
    
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
    
    tbody.innerHTML = kpiData.map(entry => {
        const facility = facilities.find(f => f.id === entry.facility);
        const user = users.find(u => u.id === entry.userId);
        
        return `
            <tr>
                <td>${facility ? facility.name : '-'}</td>
                <td>${user ? user.name : '-'}</td>
                <td>${entry.categoryName || '-'}</td>
                <td>${formatDateArabic(entry.createdAt)}</td>
                <td>${entry.entries ? entry.entries.length : 0} مؤشر</td>
                <td>
                    <span class="badge badge-success">
                        ${entry.status === 'completed' ? 'مكتمل' : 'قيد المراجعة'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="viewDataEntry('${entry.id}')" title="عرض">👁️</button>
                    <button class="btn-icon" onclick="deleteDataEntry('${entry.id}')" title="حذف">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewDataEntry(entryId) {
    const entry = kpiData.find(e => e.id === entryId);
    if (!entry) return;
    
    let details = `تفاصيل الإدخال:\n\n`;
    details += `المنشأة: ${entry.facilityName}\n`;
    details += `الفئة: ${entry.categoryName}\n`;
    details += `التاريخ: ${formatDateArabic(entry.createdAt)}\n`;
    details += `عدد المؤشرات: ${entry.entries ? entry.entries.length : 0}\n\n`;
    
    if (entry.entries && entry.entries.length > 0) {
        details += `المؤشرات:\n`;
        entry.entries.forEach((kpi, index) => {
            details += `${index + 1}. ${kpi.kpiName}\n`;
            if (kpi.result !== undefined) {
                details += `   النتيجة: ${kpi.result.toFixed(2)}${kpi.unit || '%'}\n`;
            }
        });
    }
    
    alert(details);
}

function deleteDataEntry(entryId) {
    if (!confirm('هل أنت متأكد من حذف هذا الإدخال؟')) return;
    
    kpiData = kpiData.filter(e => e.id !== entryId);
    saveToStorage('kpiData', kpiData);
    loadDataTable();
    updateDashboardStats();
    showSuccess('تم حذف الإدخال بنجاح');
}

/**
 * ===== التقارير =====
 */

function loadReports() {
    updateReportsStats();
}

function updateReportsStats() {
    const reportTotalData = document.getElementById('reportTotalData');
    const reportApprovedData = document.getElementById('reportApprovedData');
    const reportPendingData = document.getElementById('reportPendingData');
    const reportActiveFacilities = document.getElementById('reportActiveFacilities');
    
    if (reportTotalData) reportTotalData.textContent = kpiData.length;
    
    const approvedCount = kpiData.filter(d => d.status === 'approved' || d.status === 'completed').length;
    if (reportApprovedData) reportApprovedData.textContent = approvedCount;
    
    const pendingCount = kpiData.filter(d => d.status === 'pending').length;
    if (reportPendingData) reportPendingData.textContent = pendingCount;
    
    const activeFacilitiesCount = facilities.filter(f => f.status === 'active').length;
    if (reportActiveFacilities) reportActiveFacilities.textContent = activeFacilitiesCount;
}

function exportFullReport() {
    showInfo('جاري تطوير ميزة تصدير التقارير');
}

function exportDetailedReport() {
    showInfo('جاري تطوير ميزة تصدير التقارير التفصيلية');
}

function refreshReports() {
    loadData();
    loadReports();
    showSuccess('تم تحديث التقارير');
}

function applyReportFilters() {
    showInfo('جاري تطوير ميزة الفلترة');
}

function resetReportFilters() {
    showInfo('جاري تطوير ميزة إعادة التعيين');
}

/**
 * ===== دوال مساعدة =====
 */

function switchView(viewName) {
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.sidebar-nav a').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetSection = document.getElementById(viewName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const clickedBtn = event.currentTarget;
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    if (viewName === 'dashboard') {
        loadDashboard();
    } else if (viewName === 'facilities') {
        loadFacilitiesTable();
    } else if (viewName === 'users') {
        loadUsersTable();
    } else if (viewName === 'kpis') {
        showKPIManagement();
    } else if (viewName === 'data') {
        loadDataTable();
    } else if (viewName === 'reports') {
        loadReports();
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
