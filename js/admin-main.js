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
        // تحميل البيانات أولاً
        loadData();
        // ثم عرض لوحة التحكم
        showAdminPanel();
    }
}

// عرض صفحة تسجيل الدخول
function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginPage) loginPage.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

// عرض لوحة التحكم
function showAdminPanel() {
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');
    
    // إخفاء صفحة اللوجن بشكل كامل
    if (loginPage) {
        loginPage.style.display = 'none';
    }
    
    // إظهار لوحة التحكم
    if (adminPanel) {
        adminPanel.style.display = 'flex';
    }
    
    // عرض معلومات المستخدم
    displayUserInfo();
    
    // تحميل لوحة المعلومات
    loadDashboard();
    
    // تحديث الإحصائيات
    updateDashboardStats();
}

// معالجة تسجيل الدخول
// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    event.stopPropagation(); // ← مهم!
    
    console.log('🔐 Login attempt...');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');

    // التحقق
    if (email === 'admin@system.com' && password === 'admin123') {
        console.log('✅ Login successful');
        
        currentUser = {
            id: 'admin1',
            name: 'المدير العام',
            email: email,
            role: 'admin',
            facility: null
        };
        
        // حفظ في LocalStorage
        saveToStorage('currentUser', currentUser);
        
        // تحميل البيانات
        loadData();
        
        // إخفاء رسالة الخطأ
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        // ✅ إخفاء صفحة اللوجن بكل الطرق الممكنة
        if (loginPage) {
            loginPage.style.display = 'none';
            loginPage.style.visibility = 'hidden';
            loginPage.style.opacity = '0';
            loginPage.style.pointerEvents = 'none';
            loginPage.classList.add('hide');
            console.log('✅ Login page hidden');
        }
        
        // ✅ إظهار لوحة التحكم
        if (adminPanel) {
            adminPanel.style.display = 'flex';
            adminPanel.style.visibility = 'visible';
            adminPanel.style.opacity = '1';
            adminPanel.classList.add('show');
            console.log('✅ Admin panel shown');
        }
        
        // تحديث البيانات
        setTimeout(() => {
            displayUserInfo();
            updateDashboardStats();
            loadDashboard();
        }, 100);
        
        showSuccess('تم تسجيل الدخول بنجاح');
        
        // ✅ إزالة صفحة اللوجن من الـ DOM تماماً (اختياري)
        setTimeout(() => {
            if (loginPage && loginPage.parentNode) {
                loginPage.remove();
            }
        }, 500);
        
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
    
    console.log('📊 Data loaded:', { facilities: facilities.length, users: users.length, kpiData: kpiData.length });
}

/**
 * ===== لوحة المعلومات =====
 */

// تحميل لوحة المعلومات
function loadDashboard() {
    updateDashboardStats();
    loadDashboardCharts();
}

// تحديث إحصائيات لوحة المعلومات
function updateDashboardStats() {
    // عدد المنشآت
    const totalFacilities = document.getElementById('totalFacilities');
    if (totalFacilities) {
        totalFacilities.textContent = facilities.length;
    }
    
    // عدد المستخدمين
    const totalUsers = document.getElementById('totalUsers');
    if (totalUsers) {
        totalUsers.textContent = users.length;
    }
    
    // عدد المؤشرات
    const totalKPIs = document.getElementById('totalKPIs');
    if (totalKPIs) {
        const allKPIsCount = getAllKPIs().length;
        totalKPIs.textContent = allKPIsCount;
    }
    
    // عدد البيانات
    const totalData = document.getElementById('totalData');
    if (totalData) {
        totalData.textContent = kpiData.length;
    }
    
    // البيانات الشهرية
    const monthlyData = document.getElementById('monthlyData');
    if (monthlyData) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyCount = kpiData.filter(d => d.month && d.month.startsWith(currentMonth)).length;
        monthlyData.textContent = `${monthlyCount} هذا الشهر`;
    }
}

// تحميل الرسوم البيانية للوحة المعلومات
function loadDashboardCharts() {
    const container = document.getElementById('dashboardCharts');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-top: 30px;">
            <div class="card">
                <div class="card-header">
                    <h3>📊 توزيع المنشآت</h3>
                </div>
                <div class="card-body">
                    <div id="facilitiesChart"></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>👥 توزيع المستخدمين</h3>
                </div>
                <div class="card-body">
                    <div id="usersChart"></div>
                </div>
            </div>
        </div>
    `;
    
    // رسم بياني لتوزيع المنشآت
    renderFacilitiesChart();
    
    // رسم بياني لتوزيع المستخدمين
    renderUsersChart();
}

// رسم بياني لتوزيع المنشآت
function renderFacilitiesChart() {
    const chartDiv = document.getElementById('facilitiesChart');
    if (!chartDiv) return;
    
    // حساب التوزيع
    const distribution = {};
    facilities.forEach(f => {
        const type = f.type || 'غير محدد';
        distribution[type] = (distribution[type] || 0) + 1;
    });
    
    const data = {
        labels: Object.keys(distribution),
        series: Object.values(distribution)
    };
    
    if (data.series.length === 0) {
        chartDiv.innerHTML = '<div class="empty-state"><p>لا توجد بيانات</p></div>';
        return;
    }
    
    const options = {
        series: data.series,
        chart: {
            type: 'donut',
            height: 300
        },
        labels: data.labels,
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
        legend: {
            position: 'bottom'
        }
    };
    
    const chart = new ApexCharts(chartDiv, options);
    chart.render();
}

// رسم بياني لتوزيع المستخدمين
function renderUsersChart() {
    const chartDiv = document.getElementById('usersChart');
    if (!chartDiv) return;
    
    // حساب التوزيع
    const distribution = {};
    users.forEach(u => {
        const role = getRoleNameArabic(u.role);
        distribution[role] = (distribution[role] || 0) + 1;
    });
    
    const data = {
        labels: Object.keys(distribution),
        series: Object.values(distribution)
    };
    
    if (data.series.length === 0) {
        chartDiv.innerHTML = '<div class="empty-state"><p>لا توجد بيانات</p></div>';
        return;
    }
    
    const options = {
        series: [{
            data: data.series
        }],
        chart: {
            type: 'bar',
            height: 300
        },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true
            }
        },
        colors: ['#667eea', '#764ba2', '#f093fb'],
        xaxis: {
            categories: data.labels
        },
        legend: {
            show: false
        }
    };
    
    const chart = new ApexCharts(chartDiv, options);
    chart.render();
}

/**
 * ===== إدارة المنشآت =====
 */

// تحميل جدول المنشآت
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

// الحصول على نوع المنشأة بالعربية
function getFacilityTypeArabic(type) {
    const types = {
        hospital: 'مستشفى',
        healthCenter: 'مركز صحي',
        healthUnit: 'وحدة صحية'
    };
    return types[type] || type;
}

// إضافة منشأة
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

// تعديل منشأة
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

// حفظ منشأة
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
        // تحديث
        const index = facilities.findIndex(f => f.id === facilityId);
        if (index !== -1) {
            facilities[index] = { ...facilities[index], ...facilityData };
            showSuccess('تم تحديث المنشأة بنجاح');
        }
    } else {
        // إضافة جديد
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

// حذف منشأة
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

// تحميل جدول المستخدمين
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

// إضافة مستخدم
function addUser() {
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userFacility').value = '';
    document.getElementById('userRole').value = 'user';
    document.getElementById('userStatus').value = 'active';
    
    // ملء قائمة المنشآت
    const facilitySelect = document.getElementById('userFacility');
    facilitySelect.innerHTML = '<option value="">-- اختر المنشأة --</option>' +
        facilities.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    
    document.getElementById('userModalTitle').textContent = 'إضافة مستخدم جديد';
    openModal('userModal');
}

// تعديل مستخدم
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
    
    // ملء قائمة المنشآت
    const facilitySelect = document.getElementById('userFacility');
    facilitySelect.innerHTML = '<option value="">-- اختر المنشأة --</option>' +
        facilities.map(f => `<option value="${f.id}" ${f.id === user.facility ? 'selected' : ''}>${f.name}</option>`).join('');
    
    document.getElementById('userModalTitle').textContent = 'تعديل مستخدم';
    openModal('userModal');
}

// حفظ مستخدم
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
    
    // إضافة نوع المنشأة
    const facility = facilities.find(f => f.id === userData.facility);
    if (facility) {
        userData.facilityType = facility.type;
    }
    
    if (userId) {
        // تحديث
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            if (password) {
                users[index].password = password;
            }
            showSuccess('تم تحديث المستخدم بنجاح');
        }
    } else {
        // إضافة جديد
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

// حذف مستخدم
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

// عرض واجهة إدارة المؤشرات
function showKPIManagement() {
    const container = document.getElementById('kpisManagementContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header">
                <h3>اختر نوع البيانات</h3>
            </div>
            <div class="card-body">
                <div class="data-type-selector">
                    ${Object.keys(DATA_TYPES).map(typeKey => {
                        const type = DATA_TYPES[typeKey];
                        const kpis = getAllKPIsByType(type.id);
                        return `
                            <div class="data-type-option ${typeKey === 'PERFORMANCE' ? 'active' : ''}" 
                                 onclick="selectKPIDataType('${type.id}')" 
                                 style="border-left: 4px solid ${type.color};">
                                <div class="type-icon" style="color: ${type.color};">${type.icon}</div>
                                <div class="type-info">
                                    <h4>${type.name}</h4>
                                    <p>${type.description}</p>
                                    <div class="badge" style="background: ${type.color};">
                                        ${kpis.length} مؤشر
                                    </div>
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
                <div>
                    <button class="btn btn-success btn-small" onclick="openImportModal()">
                        📤 استيراد من Excel
                    </button>
                    <button class="btn btn-primary btn-small" onclick="addKPIManual()">
                        ➕ إضافة مؤشر
                    </button>
                </div>
            </div>
            <div class="card-body" id="kpiListContainer">
                <!-- سيتم تحميل المؤشرات هنا -->
            </div>
        </div>
    `;
    
    // عرض مؤشرات الأداء افتراضياً
    selectKPIDataType('performance');
}

// متغير لحفظ نوع البيانات المختار
let selectedKPIDataType = 'performance';

// اختيار نوع البيانات
function selectKPIDataType(dataType) {
    selectedKPIDataType = dataType;
    
    // تحديث active class
    document.querySelectorAll('.data-type-option').forEach(opt => {
        opt.classList.remove('active');
    });
    event.currentTarget?.classList.add('active');
    
    // تحديث العنوان
    const typeInfo = DATA_TYPES[Object.keys(DATA_TYPES).find(key => DATA_TYPES[key].id === dataType)];
    const title = document.getElementById('kpiListTitle');
    if (title && typeInfo) {
        title.textContent = typeInfo.name;
    }
    
    // تحميل المؤشرات
    loadKPIsList(dataType);
}

// تحميل قائمة المؤشرات
function loadKPIsList(dataType) {
    const container = document.getElementById('kpiListContainer');
    if (!container) return;
    
    const kpis = getAllKPIsByType(dataType);
    
    if (kpis.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>لا توجد مؤشرات</h3>
                <p>قم بإضافة مؤشرات أو استيرادها من Excel</p>
                <button class="btn btn-primary" onclick="addKPIManual()">➕ إضافة مؤشر</button>
            </div>
        `;
        return;
    }
    
    // تجميع المؤشرات حسب الفئة
    const categories = getCategoriesByDataType(dataType);
    const groupedKPIs = {};
    
    kpis.forEach(kpi => {
        const category = kpi.category || kpi.department || kpi.section || 'other';
        if (!groupedKPIs[category]) {
            groupedKPIs[category] = [];
        }
        groupedKPIs[category].push(kpi);
    });
    
    // عرض المؤشرات
    container.innerHTML = Object.keys(groupedKPIs).map(category => {
        const categoryName = categories[category] || category;
        const categoryKPIs = groupedKPIs[category];
        
        return `
            <div class="category-group">
                <h3>${categoryName} (${categoryKPIs.length})</h3>
                ${categoryKPIs.map(kpi => `
                    <div class="kpi-card">
                        <div class="kpi-info">
                            <h4>${kpi.code} - ${kpi.name}</h4>
                            ${kpi.formula ? `<p><strong>الصيغة:</strong> ${kpi.formula}</p>` : ''}
                            ${kpi.target ? `<p><strong>المستهدف:</strong> ${kpi.target} ${kpi.unit || ''}</p>` : ''}
                            <small>${getApplicableFacilitiesText(kpi.applicableTo || {})}</small>
                        </div>
                        <div class="kpi-actions">
                            <button class="btn-icon" onclick="viewKPIDetails('${kpi.id}')" title="عرض">👁️</button>
                            <button class="btn-icon" onclick="editKPIManual('${kpi.id}')" title="تعديل">✏️</button>
                            <button class="btn-icon" onclick="deleteKPIConfirm('${kpi.id}', '${dataType}')" title="حذف">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// إضافة مؤشر يدوياً
function addKPIManual() {
    // TODO: فتح نموذج إضافة مؤشر
    showInfo('جاري تطوير نموذج إضافة المؤشرات يدوياً');
}

// تعديل مؤشر
function editKPIManual(kpiId) {
    // TODO: فتح نموذج تعديل مؤشر
    showInfo('جاري تطوير نموذج تعديل المؤشرات');
}

// عرض تفاصيل مؤشر
function viewKPIDetails(kpiId) {
    const kpi = getKPIById(kpiId);
    if (!kpi) return;
    
    alert(`
تفاصيل المؤشر:
الكود: ${kpi.code}
الاسم: ${kpi.name}
الفئة: ${kpi.category || kpi.department || kpi.section}
الصيغة: ${kpi.formula || '-'}
المستهدف: ${kpi.target || '-'} ${kpi.unit || ''}
المنشآت المتاحة: ${getApplicableFacilitiesText(kpi.applicableTo || {})}
    `);
}

// حذف مؤشر
function deleteKPIConfirm(kpiId, dataType) {
    if (!confirm('هل أنت متأكد من حذف هذا المؤشر؟')) return;
    
    const result = deleteKPI(kpiId, dataType);
    if (result.success) {
        showSuccess(result.message);
        loadKPIsList(dataType);
        updateDashboardStats();
    } else {
        showError(result.message);
    }
}

// فتح نافذة الاستيراد
function openImportModal() {
    openModal('importModal');
}

/**
 * ===== إدارة البيانات المدخلة =====
 */

// تحميل جدول البيانات
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

// عرض تفاصيل إدخال
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

// حذف إدخال
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

// تحميل التقارير
function loadReports() {
    updateReportsStats();
    renderReportsCharts();
}

// تحديث إحصائيات التقارير
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

// رسم الرسوم البيانية للتقارير
function renderReportsCharts() {
    // TODO: إضافة الرسوم البيانية للتقارير
    console.log('Rendering reports charts...');
}

// تصدير التقرير الكامل
function exportFullReport() {
    showInfo('جاري تطوير ميزة تصدير التقارير');
}

// تصدير تقرير تفصيلي
function exportDetailedReport() {
    showInfo('جاري تطوير ميزة تصدير التقارير التفصيلية');
}

// تحديث التقارير
function refreshReports() {
    loadData();
    loadReports();
    showSuccess('تم تحديث التقارير');
}

// تطبيق فلاتر التقرير
function applyReportFilters() {
    showInfo('جاري تطوير ميزة الفلترة');
}

// إعادة تعيين فلاتر التقرير
function resetReportFilters() {
    showInfo('جاري تطوير ميزة إعادة التعيين');
}

/**
 * ===== دوال مساعدة =====
 */

// تبديل العرض
function switchView(viewName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة active من جميع الأزرار
    document.querySelectorAll('.sidebar-nav a').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(viewName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // تفعيل الزر المطلوب
    event.currentTarget?.classList.add('active');
    
    // تحميل المحتوى
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

// فتح نافذة منبثقة
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// إغلاق نافذة منبثقة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// رسالة معلوماتية
function showInfo(message) {
    alert('ℹ️ ' + message);
}
