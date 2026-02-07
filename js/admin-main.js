/**
 * ===== السكريبت الرئيسي للوحة التحكم الإدارية =====
 */

let currentUser = null;
let facilities = [];
let users = [];
let kpiData = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin panel initializing...');
    initializeAdminPanel();
});

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

function handleLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        removeFromStorage('currentUser');
        currentUser = null;
        showLoginPage();
        showSuccess('تم تسجيل الخروج بنجاح');
    }
}

function displayUserInfo() {
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
        if (userRoleDisplay) userRoleDisplay.textContent = getRoleNameArabic(currentUser.role);
    }
}

function getRoleNameArabic(role) {
    const roles = {
        admin: 'مدير النظام',
        supervisor: 'مشرف',
        user: 'مستخدم'
    };
    return roles[role] || role;
}

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
}

function loadDashboardCharts() {
    const container = document.getElementById('dashboardCharts');
    if (!container) return;
    
    if (typeof ApexCharts === 'undefined') {
        console.error('❌ ApexCharts library not loaded');
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
        </div>
    `;
    
    setTimeout(() => {
        renderFacilitiesChart();
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
    
    if (labels.length === 0) {
        chartDiv.innerHTML = `<div class="empty-state"><p>لا توجد بيانات</p></div>`;
        return;
    }
    
    const options = {
        series: series,
        chart: { type: 'donut', height: 300 },
        labels: labels,
        colors: ['#667eea', '#764ba2', '#f093fb'],
        legend: { position: 'bottom' }
    };
    
    try {
        const chart = new ApexCharts(chartDiv, options);
        chart.render();
    } catch (error) {
        console.error('Error:', error);
    }
}

function loadFacilitiesTable() {
    const tbody = document.querySelector('#facilitiesTable tbody');
    if (!tbody) return;
    
    if (facilities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center"><div class="empty-state"><h3>لا توجد منشآت</h3></div></td></tr>`;
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
            <td><span class="badge ${facility.status === 'active' ? 'badge-success' : 'badge-danger'}">${facility.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
            <td>
                <button class="btn-icon" onclick="editFacility('${facility.id}')">✏️</button>
                <button class="btn-icon" onclick="deleteFacility('${facility.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getFacilityTypeArabic(type) {
    const types = { hospital: 'مستشفى', healthCenter: 'مركز صحي', healthUnit: 'وحدة صحية' };
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

function loadUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="empty-state"><h3>لا يوجد مستخدمين</h3></div></td></tr>`;
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
                <td><span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">${user.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>${user.phone || '-'}</td>
                <td>
                    <button class="btn-icon" onclick="editUser('${user.id}')">✏️</button>
                    <button class="btn-icon" onclick="deleteUser('${user.id}')">🗑️</button>
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
            if (password) users[index].password = password;
            showSuccess('تم تحديث المستخدم بنجاح');
        }
    } else {
        if (!password) {
            showError('كلمة المرور مطلوبة');
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

let selectedKPIDataType = null;
let selectedKPICategory = null;
let currentEditingKPI = null;

function showKPIManagement() {
    const container = document.getElementById('kpisManagementContainer');
    if (!container) return;
    
    // إعادة تعيين
    selectedKPIDataType = null;
    selectedKPICategory = null;
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>🎯 اختر نوع البيانات</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    ${Object.values(DATA_TYPES).map(type => {
                        const totalKPIs = getAllKPIsByType(type.id).length;
                        return `
                            <div class="data-type-card" onclick="selectDataType('${type.id}')" 
                                 style="border: 3px solid ${type.color}; border-radius: 15px; padding: 25px; cursor: pointer; transition: all 0.3s; background: white; text-align: center;">
                                <div style="font-size: 3.5rem; margin-bottom: 15px;">${type.icon}</div>
                                <h3 style="color: ${type.color}; margin-bottom: 10px; font-size: 1.3rem;">${type.name}</h3>
                                <p style="color: #666; font-size: 0.95rem; margin-bottom: 15px; min-height: 40px;">${type.description}</p>
                                <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px;">
                                    <span style="background: ${type.color}20; color: ${type.color}; padding: 6px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                                        ${totalKPIs} مؤشر
                                    </span>
                                    <span style="background: #f0f0f0; color: #666; padding: 6px 15px; border-radius: 20px; font-size: 0.85rem;">
                                        ${type.frequency === 'monthly' ? 'شهري' : type.frequency === 'yearly' ? 'سنوي' : type.frequency}
                                    </span>
                                </div>
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #f0f0f0;">
                                    <span style="color: #999; font-size: 0.85rem;">النوع: ${getInputTypeLabel(type.inputType)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
        
        <div id="categorySelectionContainer"></div>
        <div id="kpisListContainer"></div>
    `;
}
function selectDataType(dataTypeId) {
    selectedKPIDataType = dataTypeId;
    selectedKPICategory = null;
    
    console.log('📊 Selected data type:', dataTypeId);
    
    const typeInfo = getDataTypeInfo(dataTypeId);
    const categoryContainer = document.getElementById('categorySelectionContainer');
    const kpisContainer = document.getElementById('kpisListContainer');
    
    if (!categoryContainer) return;
    
    // مسح المحتوى القديم
    if (kpisContainer) {
        kpisContainer.innerHTML = '';
    }
    
    // إخفاء اختيار النوع
    const typeSelection = categoryContainer.previousElementSibling;
    if (typeSelection) {
        typeSelection.style.display = 'none';
    }
    
    // عرض صفحة الأقسام الكاملة
    categoryContainer.innerHTML = `
        <div class="card">
            <div class="card-header" style="background: linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}dd 100%); color: white; padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">${typeInfo.icon}</div>
                        <h2 style="margin: 0 0 8px 0;">${typeInfo.name}</h2>
                        <p style="margin: 0; opacity: 0.9; font-size: 0.95rem;">${typeInfo.description} - ${getInputTypeLabel(typeInfo.inputType)}</p>
                    </div>
                    <button class="btn btn-secondary" onclick="showKPIManagement()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 12px 24px;">
                        ← العودة لاختيار النوع
                    </button>
                </div>
            </div>
            <div class="card-body" style="padding: 40px;">
                <h3 style="margin: 0 0 25px 0; color: #333; font-size: 1.4rem;">اختر القسم:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    ${Object.values(typeInfo.categories).map(cat => {
                        const catKPIs = getKPIsByCategory(dataTypeId, cat.id);
                        return `
                            <div class="category-card" onclick="selectCategory('${cat.id}')" 
                                 style="border: 3px solid ${cat.color || typeInfo.color}; border-radius: 15px; padding: 30px; cursor: pointer; transition: all 0.3s; background: white; text-align: center; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.15)';" 
                                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';">
                                <div style="font-size: 3.5rem; margin-bottom: 15px;">${cat.icon || typeInfo.icon}</div>
                                <h3 style="color: ${cat.color || typeInfo.color}; margin-bottom: 12px; font-size: 1.2rem; font-weight: 700;">${cat.name}</h3>
                                ${cat.nameEn ? `<p style="color: #999; font-size: 0.85rem; margin-bottom: 12px;">${cat.nameEn}</p>` : ''}
                                ${cat.weight ? `<p style="color: #666; font-size: 0.9rem; margin-bottom: 15px; background: #f0f0f0; padding: 8px; border-radius: 6px;">الوزن: ${cat.weight}</p>` : ''}
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid ${cat.color || typeInfo.color}20;">
                                    <span style="background: ${cat.color || typeInfo.color}; color: white; padding: 8px 20px; border-radius: 25px; font-size: 1rem; font-weight: 600; display: inline-block;">
                                        ${catKPIs.length} مؤشر
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function selectCategory(categoryId) {
    selectedKPICategory = categoryId;
    
    console.log('📂 Selected category:', categoryId);
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    const catInfo = typeInfo.categories[categoryId];
    
    // إخفاء صفحة الأقسام
    const categoryContainer = document.getElementById('categorySelectionContainer');
    if (categoryContainer) {
        categoryContainer.style.display = 'none';
    }
    
    const kpisContainer = document.getElementById('kpisListContainer');
    if (!kpisContainer) return;
    
    const kpis = getKPIsByCategory(selectedKPIDataType, categoryId);
    
    // عرض الصفحة الكاملة للمؤشرات
    kpisContainer.style.display = 'block';
    kpisContainer.innerHTML = `
        <div class="card">
            <div class="card-header" style="background: linear-gradient(135deg, ${catInfo.color || typeInfo.color} 0%, ${catInfo.color || typeInfo.color}dd 100%); color: white; padding: 25px; border-radius: 12px 12px 0 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">${catInfo.icon || typeInfo.icon}</div>
                        <h2 style="margin: 0 0 8px 0; font-size: 1.8rem;">${catInfo.name}</h2>
                        <p style="margin: 0; opacity: 0.95; font-size: 1rem;">${typeInfo.name} - ${getInputTypeLabel(typeInfo.inputType)}</p>
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-success" onclick="openImportModalForCategory()" style="background: white; color: ${catInfo.color || typeInfo.color}; padding: 12px 20px; font-weight: 600;">
                            📤 استيراد من Excel
                        </button>
                        <button class="btn btn-primary" onclick="addKPIManualForCategory()" style="background: white; color: ${catInfo.color || typeInfo.color}; padding: 12px 20px; font-weight: 600;">
                            ➕ إضافة يدوياً
                        </button>
                        <button class="btn btn-secondary" onclick="backToCategories()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 12px 20px;">
                            ← العودة للأقسام
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                ${kpis.length === 0 ? `
                    <div class="empty-state" style="text-align: center; padding: 80px 20px;">
                        <div style="font-size: 5rem; margin-bottom: 25px; opacity: 0.3;">${catInfo.icon || typeInfo.icon}</div>
                        <h3 style="color: #666; margin-bottom: 15px; font-size: 1.5rem;">لا توجد مؤشرات في هذا القسم</h3>
                        <p style="color: #999; margin-bottom: 35px; font-size: 1.1rem;">ابدأ بإضافة مؤشرات يدوياً أو استيرادها من Excel</p>
                        <div style="display: flex; gap: 20px; justify-content: center;">
                            <button class="btn btn-primary btn-large" onclick="addKPIManualForCategory()" style="padding: 15px 35px; font-size: 1.1rem;">
                                ➕ إضافة مؤشر يدوياً
                            </button>
                            <button class="btn btn-success btn-large" onclick="openImportModalForCategory()" style="padding: 15px 35px; font-size: 1.1rem;">
                                📤 استيراد من Excel
                            </button>
                        </div>
                    </div>
                ` : `
                    <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, ${catInfo.color || typeInfo.color}10 0%, ${catInfo.color || typeInfo.color}05 100%); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border-right: 4px solid ${catInfo.color || typeInfo.color};">
                        <div>
                            <strong style="color: #333; font-size: 1.3rem;">إجمالي المؤشرات: ${kpis.length}</strong>
                            <p style="margin: 5px 0 0 0; color: #666;">جميع المؤشرات في قسم ${catInfo.name}</p>
                        </div>
                        <button class="btn btn-secondary btn-small" onclick="exportCategoryKPIs()">
                            📥 تصدير Excel
                        </button>
                    </div>
                    
                    <div style="display: grid; gap: 15px;">
                        ${kpis.map((kpi, index) => `
                            <div class="kpi-item" style="background: white; border: 1px solid #e0e0e0; border-right: 5px solid ${catInfo.color || typeInfo.color}; border-radius: 10px; padding: 22px; transition: all 0.3s;"
                                 onmouseover="this.style.boxShadow='0 6px 16px rgba(0,0,0,0.12)'; this.style.transform='translateX(-8px)';" 
                                 onmouseout="this.style.boxShadow='none'; this.style.transform='translateX(0)';">
                                <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                                            <span style="background: ${catInfo.color || typeInfo.color}; color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.95rem; font-weight: 700;">
                                                ${kpi.code}
                                            </span>
                                            <h4 style="margin: 0; color: #333; font-size: 1.15rem; flex: 1;">${kpi.name}</h4>
                                        </div>
                                        ${renderKPIDetails(kpi, typeInfo)}
                                    </div>
                                    <div style="display: flex; gap: 10px;">
                                        <button class="btn-icon" onclick="viewKPIDetails('${kpi.id}')" title="عرض" 
                                                style="padding: 12px; background: #e3f2fd; border: none; border-radius: 8px; cursor: pointer; font-size: 1.3rem; transition: all 0.2s;"
                                                onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
                                            👁️
                                        </button>
                                        <button class="btn-icon" onclick="editKPIManual('${kpi.id}')" title="تعديل" 
                                                style="padding: 12px; background: #fff3e0; border: none; border-radius: 8px; cursor: pointer; font-size: 1.3rem; transition: all 0.2s;"
                                                onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
                                            ✏️
                                        </button>
                                        <button class="btn-icon" onclick="deleteKPIConfirm('${kpi.id}')" title="حذف" 
                                                style="padding: 12px; background: #ffebee; border: none; border-radius: 8px; cursor: pointer; font-size: 1.3rem; transition: all 0.2s;"
                                                onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}
function backToCategories() {
    console.log('⬅️ Going back to categories');
    
    const categoryContainer = document.getElementById('categorySelectionContainer');
    const kpisContainer = document.getElementById('kpisListContainer');
    
    if (categoryContainer) {
        categoryContainer.style.display = 'block';
    }
    
    if (kpisContainer) {
        kpisContainer.innerHTML = '';
        kpisContainer.style.display = 'none';
    }
    
    selectedKPICategory = null;
}
function renderKPIDetails(kpi, typeInfo) {
    let html = '';
    
    if (typeInfo.inputType === 'formula') {
        html += `
            <div style="display: grid; gap: 8px; margin-top: 8px; font-size: 0.9rem; color: #666;">
                ${kpi.formula ? `<div><strong>الصيغة:</strong> ${kpi.formula}</div>` : ''}
                ${kpi.numeratorLabel ? `<div><strong>البسط:</strong> ${kpi.numeratorLabel}</div>` : ''}
                ${kpi.denominatorLabel ? `<div><strong>المقام:</strong> ${kpi.denominatorLabel}</div>` : ''}
                ${kpi.target ? `<div><strong>المستهدف:</strong> <span style="color: ${typeInfo.color}; font-weight: 600;">${kpi.target}${kpi.unit || ''}</span></div>` : ''}
            </div>
        `;
    } else if (typeInfo.inputType === 'weighted') {
        html += `
            <div style="display: grid; gap: 8px; margin-top: 8px; font-size: 0.9rem; color: #666;">
                ${kpi.weight ? `<div><strong>الوزن:</strong> ${kpi.weight}</div>` : ''}
                ${kpi.maxScore ? `<div><strong>الدرجة القصوى:</strong> ${kpi.maxScore}</div>` : ''}
            </div>
        `;
    } else if (typeInfo.inputType === 'checklist') {
        html += `
            <div style="display: grid; gap: 8px; margin-top: 8px; font-size: 0.9rem; color: #666;">
                ${kpi.evaluationType ? `<div><strong>نوع التقييم:</strong> ${kpi.evaluationType}</div>` : ''}
                ${kpi.description ? `<div><strong>الوصف:</strong> ${kpi.description}</div>` : ''}
            </div>
        `;
    } else if (typeInfo.inputType === 'count') {
        html += `
            <div style="display: grid; gap: 8px; margin-top: 8px; font-size: 0.9rem; color: #666;">
                ${kpi.jobTitle ? `<div><strong>المسمى الوظيفي:</strong> ${kpi.jobTitle}</div>` : ''}
                ${kpi.contractType ? `<div><strong>نوع العقد:</strong> ${kpi.contractType}</div>` : ''}
            </div>
        `;
    }
    
    if (kpi.applicableTo) {
        html += `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; font-size: 0.85rem; color: #999;">
                ${getApplicableFacilitiesText(kpi.applicableTo)}
            </div>
        `;
    }
    
    return html;
}

function addKPIManualForCategory() {
    if (!selectedKPIDataType || !selectedKPICategory) {
        showError('الرجاء اختيار نوع البيانات والقسم أولاً');
        return;
    }
    
    currentEditingKPI = null;
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    const catInfo = typeInfo.categories[selectedKPICategory];
    
    const modalContent = createKPIFormByType(typeInfo, catInfo, null);
    showKPIModal(`إضافة مؤشر جديد - ${catInfo.name}`, modalContent);
}

function createKPIFormByType(typeInfo, catInfo, kpiData = null) {
    const isEdit = kpiData !== null;
    let html = `<form id="kpiManualForm" onsubmit="saveKPIManual(event); return false;" style="max-height: 70vh; overflow-y: auto; padding: 5px;">`;
    
    html += `
        <div class="form-group">
            <label for="kpiCode">كود المؤشر *</label>
            <input type="text" id="kpiCode" required placeholder="مثال: ${catInfo.id}-01" value="${kpiData?.code || ''}" ${isEdit ? 'readonly' : ''}>
            <small>الكود يجب أن يكون فريداً ولا يمكن تعديله لاحقاً</small>
        </div>

        <div class="form-group">
            <label for="kpiName">اسم المؤشر *</label>
            <input type="text" id="kpiName" required placeholder="أدخل اسم المؤشر" value="${kpiData?.name || ''}">
        </div>
    `;
    
    if (typeInfo.inputType === 'formula') {
        html += `
            <div class="form-group">
                <label for="kpiFormula">الصيغة الحسابية *</label>
                <input type="text" id="kpiFormula" required placeholder="مثال: (البسط / المقام) × 100" value="${kpiData?.formula || ''}">
            </div>

            <div class="form-group">
                <label for="kpiNumeratorLabel">تسمية البسط *</label>
                <input type="text" id="kpiNumeratorLabel" required placeholder="مثال: عدد الحالات المعالجة" value="${kpiData?.numeratorLabel || ''}">
            </div>

            <div class="form-group">
                <label for="kpiDenominatorLabel">تسمية المقام *</label>
                <input type="text" id="kpiDenominatorLabel" required placeholder="مثال: إجمالي الحالات" value="${kpiData?.denominatorLabel || ''}">
            </div>

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
        `;
    } else if (typeInfo.inputType === 'weighted') {
        html += `
            <div class="form-group">
                <label for="kpiWeight">الوزن *</label>
                <input type="number" id="kpiWeight" step="1" required placeholder="مثال: 120" value="${kpiData?.weight || catInfo.weight || ''}">
            </div>

            <div class="form-group">
                <label for="kpiMaxScore">الدرجة القصوى *</label>
                <input type="number" id="kpiMaxScore" step="0.1" required placeholder="مثال: 100" value="${kpiData?.maxScore || ''}">
            </div>

            <div class="form-group">
                <label for="kpiSubCriteria">المعايير الفرعية</label>
                <textarea id="kpiSubCriteria" rows="4" placeholder="أدخل المعايير الفرعية (كل معيار في سطر)">${kpiData?.subCriteria || ''}</textarea>
            </div>
        `;
    } else if (typeInfo.inputType === 'checklist') {
        html += `
            <div class="form-group">
                <label for="kpiEvaluationType">نوع التقييم *</label>
                <select id="kpiEvaluationType" required>
                    <option value="نعم/لا" ${kpiData?.evaluationType === 'نعم/لا' ? 'selected' : ''}>نعم/لا</option>
                    <option value="تقييم رقمي (2-1-0-N/A)" ${kpiData?.evaluationType === 'تقييم رقمي (2-1-0-N/A)' ? 'selected' : ''}>تقييم رقمي (2-1-0-N/A)</option>
                </select>
            </div>

            <div class="form-group">
                <label for="kpiDescription">الوصف</label>
                <textarea id="kpiDescription" rows="3" placeholder="وصف تفصيلي للمعيار...">${kpiData?.description || ''}</textarea>
            </div>
        `;
    } else if (typeInfo.inputType === 'count') {
        html += `
            <div class="form-group">
                <label for="kpiJobTitle">المسمى الوظيفي *</label>
                <input type="text" id="kpiJobTitle" required placeholder="مثال: طبيب استشاري" value="${kpiData?.jobTitle || ''}">
            </div>

            <div class="form-group">
                <label for="kpiContractType">نوع العقد *</label>
                <select id="kpiContractType" required>
                    <option value="دائم" ${kpiData?.contractType === 'دائم' ? 'selected' : ''}>دائم</option>
                    <option value="مؤقت" ${kpiData?.contractType === 'مؤقت' ? 'selected' : ''}>مؤقت</option>
                    <option value="متعاقد" ${kpiData?.contractType === 'متعاقد' ? 'selected' : ''}>متعاقد</option>
                </select>
            </div>
        `;
    }
    
    html += `
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

        <div class="modal-footer" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="closeKPIModal()">إلغاء</button>
            <button type="submit" class="btn btn-primary">💾 ${isEdit ? 'تحديث' : 'حفظ'}</button>
        </div>
    </form>
    `;
    
    return html;
}

function saveKPIManual(event) {
    event.preventDefault();
    
    console.log('💾 Saving KPI...');
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    
    const kpiData = {
        dataType: selectedKPIDataType,
        category: selectedKPICategory,
        code: document.getElementById('kpiCode').value.trim(),
        name: document.getElementById('kpiName').value.trim(),
        applicableTo: {
            hospital: document.getElementById('facilityHospital').checked,
            healthCenter: document.getElementById('facilityHealthCenter').checked,
            healthUnit: document.getElementById('facilityHealthUnit').checked
        }
    };
    
    if (typeInfo.inputType === 'formula') {
        kpiData.formula = document.getElementById('kpiFormula').value.trim();
        kpiData.numeratorLabel = document.getElementById('kpiNumeratorLabel').value.trim();
        kpiData.denominatorLabel = document.getElementById('kpiDenominatorLabel').value.trim();
        kpiData.target = parseFloat(document.getElementById('kpiTarget').value);
        kpiData.unit = document.getElementById('kpiUnit').value;
    } else if (typeInfo.inputType === 'weighted') {
        kpiData.weight = parseFloat(document.getElementById('kpiWeight').value);
        kpiData.maxScore = parseFloat(document.getElementById('kpiMaxScore').value);
        kpiData.subCriteria = document.getElementById('kpiSubCriteria').value.trim();
    } else if (typeInfo.inputType === 'checklist') {
        kpiData.evaluationType = document.getElementById('kpiEvaluationType').value;
        kpiData.description = document.getElementById('kpiDescription').value.trim();
    } else if (typeInfo.inputType === 'count') {
        kpiData.jobTitle = document.getElementById('kpiJobTitle').value.trim();
        kpiData.contractType = document.getElementById('kpiContractType').value;
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
        selectCategory(selectedKPICategory);
        updateDashboardStats();
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
    selectedKPIDataType = kpi.dataType;
    selectedKPICategory = kpi.category;
    
    const typeInfo = getDataTypeInfo(kpi.dataType);
    const catInfo = typeInfo.categories[kpi.category];
    
    const modalContent = createKPIFormByType(typeInfo, catInfo, kpi);
    showKPIModal('تعديل مؤشر - ' + catInfo.name, modalContent);
}

function viewKPIDetails(kpiId) {
    const kpi = getKPIById(kpiId);
    if (!kpi) {
        showError('المؤشر غير موجود');
        return;
    }
    
    const typeInfo = getDataTypeInfo(kpi.dataType);
    const catInfo = typeInfo.categories[kpi.category];
    
    let details = `
        <div style="padding: 20px;">
            <div style="background: ${catInfo.color || typeInfo.color}; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">${catInfo.icon || typeInfo.icon}</div>
                <h2 style="margin: 0 0 5px 0;">${kpi.name}</h2>
                <p style="margin: 0; opacity: 0.9;">${kpi.code}</p>
            </div>
            
            <div style="display: grid; gap: 15px;">
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">نوع البيانات:</strong><br>
                    <span style="font-size: 1.1rem; color: #333;">${typeInfo.name}</span>
                </div>
                
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">القسم:</strong><br>
                    <span style="font-size: 1.1rem; color: #333;">${catInfo.name}</span>
                </div>
    `;
    
    if (typeInfo.inputType === 'formula') {
        details += `
            ${kpi.formula ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>الصيغة:</strong><br>${kpi.formula}</div>` : ''}
            ${kpi.numeratorLabel ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>البسط:</strong><br>${kpi.numeratorLabel}</div>` : ''}
            ${kpi.denominatorLabel ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>المقام:</strong><br>${kpi.denominatorLabel}</div>` : ''}
            ${kpi.target ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>المستهدف:</strong><br><span style="font-size: 1.3rem; color: ${typeInfo.color}; font-weight: 600;">${kpi.target} ${kpi.unit}</span></div>` : ''}
        `;
    } else if (typeInfo.inputType === 'weighted') {
        details += `
            ${kpi.weight ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>الوزن:</strong><br>${kpi.weight}</div>` : ''}
            ${kpi.maxScore ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>الدرجة القصوى:</strong><br>${kpi.maxScore}</div>` : ''}
            ${kpi.subCriteria ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>المعايير الفرعية:</strong><br>${kpi.subCriteria.replace(/\n/g, '<br>')}</div>` : ''}
        `;
    } else if (typeInfo.inputType === 'checklist') {
        details += `
            ${kpi.evaluationType ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>نوع التقييم:</strong><br>${kpi.evaluationType}</div>` : ''}
            ${kpi.description ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>الوصف:</strong><br>${kpi.description}</div>` : ''}
        `;
    } else if (typeInfo.inputType === 'count') {
        details += `
            ${kpi.jobTitle ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>المسمى الوظيفي:</strong><br>${kpi.jobTitle}</div>` : ''}
            ${kpi.contractType ? `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px;"><strong>نوع العقد:</strong><br>${kpi.contractType}</div>` : ''}
        `;
    }
    
    details += `
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #666;">المنشآت المتاحة:</strong><br>
                    <span style="font-size: 1rem; color: #333;">${getApplicableFacilitiesText(kpi.applicableTo || {})}</span>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                <button class="btn btn-secondary" onclick="closeKPIModal()">إغلاق</button>
            </div>
        </div>
    `;
    
    showKPIModal('تفاصيل المؤشر', details);
}

function deleteKPIConfirm(kpiId) {
    const kpi = getKPIById(kpiId);
    if (!kpi) {
        showError('المؤشر غير موجود');
        return;
    }
    
    if (!confirm(`هل أنت متأكد من حذف المؤشر:\n\n${kpi.code} - ${kpi.name}\n\nلا يمكن التراجع عن هذا الإجراء!`)) {
        return;
    }
    
    const result = deleteKPI(kpiId, kpi.dataType);
    
    if (result.success) {
        showSuccess(result.message);
        selectCategory(selectedKPICategory);
        updateDashboardStats();
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

function openImportModalForCategory() {
    if (!selectedKPIDataType || !selectedKPICategory) {
        showError('الرجاء اختيار نوع البيانات والقسم أولاً');
        return;
    }
    
    const typeInfo = getDataTypeInfo(selectedKPIDataType);
    const catInfo = typeInfo.categories[selectedKPICategory];
    
    document.getElementById('importModalTitle').textContent = `استيراد مؤشرات - ${catInfo.name}`;
    openModal('importModal');
}

function exportCategoryKPIs() {
    showInfo('جاري تطوير ميزة التصدير');
}

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
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
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
             
