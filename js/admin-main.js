/**
 * ===== السكريبت الرئيسي للوحة التحكم الإدارية (محدث v2.0) =====
 */

let currentUser = null;
let facilities = [];
let users = [];
let kpiData = [];
let selectedKPIDataType = null;
let selectedKPICategory = null;
let selectedKPISubcategory = null;

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

    console.log('Email:', email);
    console.log('Password:', password);

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
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        // إخفاء صفحة تسجيل الدخول
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        
        // إظهار لوحة التحكم
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'flex';
        }
        
        loadData();
        displayUserInfo();
        
        setTimeout(() => {
            loadDashboard();
            updateDashboardStats();
        }, 100);
        
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
    
    return false;
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
        if (userRoleDisplay) userRoleDisplay.textContent = currentUser.role === 'admin' ? 'مدير النظام' : 'مستخدم';
    }
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
    console.log('📊 Loading dashboard...');
    updateDashboardStats();
    loadRecentActivity();
}

function updateDashboardStats() {
    const facilities = getFromStorage('facilities', []);
    const users = getFromStorage('users', []);
    
    const activeFacilities = facilities.filter(f => f.status === 'active').length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    
    const totalKPIs = getAllKPIsCount();
    const pendingData = getPendingDataCount();
    
    const facilityCountEl = document.getElementById('facilityCount');
    const userCountEl = document.getElementById('userCount');
    const kpiCountEl = document.getElementById('kpiCount');
    const pendingCountEl = document.getElementById('pendingCount');
    
    if (facilityCountEl) facilityCountEl.textContent = activeFacilities;
    if (userCountEl) userCountEl.textContent = activeUsers;
    if (kpiCountEl) kpiCountEl.textContent = totalKPIs;
    if (pendingCountEl) pendingCountEl.textContent = pendingData;
}

function getAllKPIsCount() {
    let count = 0;
    const dataTypes = getAllDataTypes();
    
    dataTypes.forEach(dataType => {
        const stats = getKPIStatistics(dataType.id);
        count += stats.totalKPIs;
    });
    
    return count;
}

function getPendingDataCount() {
    const allData = getFromStorage('kpiData', []);
    return allData.filter(d => d.status === 'pending').length;
}

function loadRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    const recentData = getFromStorage('kpiData', [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    
    if (recentData.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #666;">لا توجد أنشطة حديثة</p>';
        return;
    }
    
    let html = '<ul class="activity-list">';
    
    recentData.forEach(item => {
        const dataType = getDataTypeInfo(item.dataType);
        const icon = dataType ? dataType.icon : '📊';
        const typeName = dataType ? dataType.name : item.dataType;
        
        html += `
            <li class="activity-item">
                <span class="activity-icon">${icon}</span>
                <div class="activity-content">
                    <strong>${typeName}</strong>
                    <small>${formatDateArabic(item.createdAt)}</small>
                </div>
            </li>
        `;
    });
    
    html += '</ul>';
    activityList.innerHTML = html;
}


// ========================================
// إدارة المؤشرات (v2.0 - نظام متقدم)
// ========================================

function loadKPIManagement() {
    console.log('📊 Loading KPI management...');
    
    const container = document.getElementById('kpiManagementContent');
    
    if (!container) {
        console.error('❌ kpiManagementContent not found!');
        return;
    }
    
    const dataTypes = getAllDataTypes();
    
    let html = `
        <div class="section-header">
            <h2>📊 إدارة المؤشرات</h2>
            <p>إضافة وتعديل وإدارة مؤشرات الأداء</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08);">
            <h3 style="color: #2c3e50; margin-bottom: 25px; font-size: 1.5rem;">اختر نوع البيانات:</h3>
            <div class="data-type-grid">
    `;
    
    dataTypes.forEach(dataType => {
        const stats = getKPIStatistics(dataType.id);
        
        html += `
            <div class="data-type-card" onclick="openKPIManagementPage('${dataType.id}')" style="border-left: 4px solid ${dataType.color}; cursor: pointer;">
                <div class="data-type-icon" style="font-size: 3rem">${dataType.icon}</div>
                <h4>${dataType.name}</h4>
                <p class="data-type-desc">${dataType.description}</p>
                <span class="input-type-badge" style="background: ${dataType.color}20; color: ${dataType.color}">${getInputTypeLabel(dataType.inputType)}</span>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #666;">
                        <span>📊 إجمالي المؤشرات:</span>
                        <strong style="color: ${dataType.color}">${stats.totalKPIs}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; margin-top: 5px;">
                        <span>✅ تم الإدخال:</span>
                        <strong style="color: #4caf50">${stats.completedKPIs}</strong>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function getKPIStatistics(dataTypeId) {
    const dataType = getDataTypeInfo(dataTypeId);
    if (!dataType) return { totalKPIs: 0, completedKPIs: 0 };
    
    let totalKPIs = 0;
    let completedKPIs = 0;
    
    // حساب إجمالي الأقسام
    Object.keys(dataType.categories).forEach(categoryId => {
        if (hasSubcategories(dataTypeId)) {
            const subcategories = getSubcategories(dataTypeId, categoryId);
            totalKPIs += Object.keys(subcategories).length;
            
            // حساب المكتملة
            Object.keys(subcategories).forEach(subcategoryId => {
                const allData = getFromStorage('allUserData', []);
                const hasData = allData.some(d => 
                    d.dataType === dataTypeId && 
                    d.category === categoryId && 
                    d.subcategory === subcategoryId
                );
                if (hasData) completedKPIs++;
            });
        } else {
            totalKPIs++;
            const allData = getFromStorage('allUserData', []);
            const hasData = allData.some(d => 
                d.dataType === dataTypeId && 
                d.category === categoryId
            );
            if (hasData) completedKPIs++;
        }
    });
    
    return { totalKPIs, completedKPIs };
}

// ========================================
// صفحة إدارة المؤشرات المتقدمة
// ========================================

function openKPIManagementPage(dataTypeId) {
    console.log('📋 Opening KPI management page for:', dataTypeId);
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    if (!dataType) {
        showError('نوع البيانات غير موجود');
        return;
    }
    
    const container = document.getElementById('kpiManagementContent');
    if (!container) return;
    
    const categories = dataType.categories;
    const allData = getFromStorage('allUserData', []);
    
    let html = `
        <div style="animation: fadeIn 0.3s;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${dataType.color} 0%, ${dataType.color}cc 100%); color: white; padding: 25px 30px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <button onclick="loadKPIManagement()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-bottom: 15px;
                    transition: all 0.3s;
                ">← العودة لقائمة المؤشرات</button>
                <h2 style="margin: 0; font-size: 1.8rem;">${dataType.icon} ${dataType.name}</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.95;">${dataType.description}</p>
            </div>
            
            <!-- زر إضافة مؤشر جديد -->
            <div style="margin-bottom: 25px;">
                <button onclick="showAddKPIForm('${dataTypeId}')" style="
                    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                    color: white;
                    padding: 12px 25px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 3px 10px rgba(76,175,80,0.3);
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(76,175,80,0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 10px rgba(76,175,80,0.3)'">
                    ➕ إضافة مؤشر جديد في ${dataType.name}
                </button>
            </div>
            
            <!-- نموذج الإضافة (مخفي) -->
            <div id="addKPIFormSection" style="display: none; margin-bottom: 30px;"></div>
            
            <!-- الأقسام -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 30px;">
    `;
    
    Object.values(categories).forEach(category => {
        const categoryData = allData.filter(d => d.dataType === dataTypeId && d.category === category.id);
        const entryCount = categoryData.length;
        const userCount = new Set(categoryData.map(d => d.user)).size;
        
        let statusInfo = '';
        if (entryCount === 0) {
            statusInfo = '<div style="background: #ff9800; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.75rem; margin-top: 8px;">⏳ لا توجد بيانات</div>';
        } else {
            statusInfo = `
                <div style="background: #4caf50; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.75rem; margin-top: 8px;">
                    ✅ ${entryCount} إدخال من ${userCount} مستخدم
                </div>
            `;
        }
        
        html += `
            <div onclick="viewCategoryDetails('${dataType.id}', '${category.id}')" style="
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                border-top: 3px solid ${category.color};
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 5px 20px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.08)'">
                <div style="font-size: 2.5rem; color: ${category.color}; margin-bottom: 10px;">${category.icon}</div>
                <h4 style="color: #2c3e50; margin: 0 0 5px 0;">${category.name}</h4>
                ${statusInfo}
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div id="categoryDetailsSection"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ========================================
// نموذج إضافة مؤشر جديد
// ========================================

function showAddKPIForm(dataTypeId) {
    const formSection = document.getElementById('addKPIFormSection');
    if (!formSection) return;
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    let html = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); border-top: 5px solid ${dataType.color}; animation: slideDown 0.3s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                <h3 style="margin: 0; color: ${dataType.color};">➕ إضافة مؤشر جديد في ${dataType.name}</h3>
                <button onclick="hideAddKPIForm()" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #999;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(244,67,54,0.1)'; this.style.color='#f44336'" onmouseout="this.style.background='none'; this.style.color='#999'">×</button>
            </div>
            
            <form onsubmit="saveNewKPI(event, '${dataTypeId}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>كود المؤشر *</label>
                        <input type="text" id="kpiCode" required placeholder="مثال: WFM-01" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label>اسم المؤشر *</label>
                        <input type="text" id="kpiName" required placeholder="أدخل اسم المؤشر" class="form-control">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>القسم *</label>
                        <select id="kpiCategory" required class="form-control" onchange="updateSubcategoryOptions('${dataTypeId}')">
                            <option value="">-- اختر القسم --</option>
    `;
    
    Object.values(dataType.categories).forEach(category => {
        html += `<option value="${category.id}">${category.icon} ${category.name}</option>`;
    });
    
    html += `
                        </select>
                    </div>
                    
                    <div class="form-group" id="subcategoryGroup" style="display: none;">
                        <label>القسم الفرعي</label>
                        <select id="kpiSubcategory" class="form-control">
                            <option value="">-- اختر القسم الفرعي --</option>
                        </select>
                    </div>
                </div>
    `;
    
    // نماذج إدخال حسب نوع البيانات
    if (dataType.inputType === 'formula') {
        html += `
            <div class="form-row">
                <div class="form-group">
                    <label>البسط (Numerator) *</label>
                    <input type="text" id="kpiNumerator" required placeholder="مثال: عدد المرضى" class="form-control">
                </div>
                
                <div class="form-group">
                    <label>المقام (Denominator) *</label>
                    <input type="text" id="kpiDenominator" required placeholder="مثال: إجمالي الحالات" class="form-control">
                </div>
            </div>
            
            <div class="form-group">
                <label>الصيغة</label>
                <input type="text" id="kpiFormula" placeholder="سيتم إنشاؤها تلقائياً: (البسط / المقام) × 100" class="form-control" readonly>
            </div>
        `;
    } else if (dataType.inputType === 'monthly_data') {
        html += `
            <div class="form-group">
                <label>نوع البيانات الشهرية *</label>
                <select id="kpiMonthlyType" required class="form-control">
                    <option value="">-- اختر النوع --</option>
                    <option value="بسط">بسط (Numerator)</option>
                    <option value="هدف">هدف (Target)</option>
                    <option value="مجموع">مجموع (Total)</option>
                </select>
            </div>
        `;
    }
    
    html += `
                <div class="form-group">
                    <label>الوصف</label>
                    <textarea id="kpiDescription" rows="3" placeholder="وصف المؤشر..." class="form-control"></textarea>
                </div>
                
                <div class="form-row">
                    <button type="submit" class="btn btn-primary">
                        💾 حفظ المؤشر
                    </button>
                    <button type="button" onclick="hideAddKPIForm()" class="btn btn-secondary">
                        ❌ إلغاء
                    </button>
                </div>
            </form>
        </div>
    `;
    
    formSection.innerHTML = html;
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth' });
}

function hideAddKPIForm() {
    const formSection = document.getElementById('addKPIFormSection');
    if (formSection) {
        formSection.style.display = 'none';
    }
}

function updateSubcategoryOptions(dataTypeId) {
    const categorySelect = document.getElementById('kpiCategory');
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategorySelect = document.getElementById('kpiSubcategory');
    
    if (!categorySelect || !subcategoryGroup || !subcategorySelect) return;
    
    const selectedCategory = categorySelect.value;
    
    if (!selectedCategory) {
        subcategoryGroup.style.display = 'none';
        return;
    }
    
    // التحقق من وجود أقسام فرعية
    if (hasSubcategories(dataTypeId)) {
        const subcategories = getSubcategories(dataTypeId, selectedCategory);
        
        if (subcategories && Object.keys(subcategories).length > 0) {
            subcategoryGroup.style.display = 'block';
            
            subcategorySelect.innerHTML = '<option value="">-- اختر القسم الفرعي --</option>';
            
            Object.values(subcategories).forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub.id}">${sub.icon || '📋'} ${sub.name}</option>`;
            });
        } else {
            subcategoryGroup.style.display = 'none';
        }
    } else {
        subcategoryGroup.style.display = 'none';
    }
}

function saveNewKPI(event, dataTypeId) {
    event.preventDefault();
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    const kpiData = {
        id: 'kpi_' + Date.now(),
        code: document.getElementById('kpiCode').value,
        name: document.getElementById('kpiName').value,
        category: document.getElementById('kpiCategory').value,
        subcategory: document.getElementById('kpiSubcategory')?.value || null,
        dataType: dataTypeId,
        description: document.getElementById('kpiDescription')?.value || '',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id
    };
    
    // إضافة البيانات الخاصة بنوع المؤشر
    if (dataType.inputType === 'formula') {
        kpiData.numerator = document.getElementById('kpiNumerator').value;
        kpiData.denominator = document.getElementById('kpiDenominator').value;
        kpiData.formula = `(${kpiData.numerator} / ${kpiData.denominator}) × 100`;
    } else if (dataType.inputType === 'monthly_data') {
        kpiData.monthlyType = document.getElementById('kpiMonthlyType').value;
    }
    
    // حفظ المؤشر
    let allKPIs = getFromStorage('customKPIs', []);
    allKPIs.push(kpiData);
    saveToStorage('customKPIs', allKPIs);
    
    showSuccess('✅ تم إضافة المؤشر بنجاح!');
    
    // إعادة تحميل الصفحة
    setTimeout(() => {
        openKPIManagementPage(dataTypeId);
    }, 1500);
}
// ========================================
// عرض تفاصيل القسم
// ========================================

function viewCategoryDetails(dataTypeId, categoryId) {
    console.log('📋 Viewing category details:', dataTypeId, categoryId);
    
    const dataType = getDataTypeInfo(dataTypeId);
    const category = dataType.categories[categoryId];
    const detailsSection = document.getElementById('categoryDetailsSection');
    
    if (!detailsSection) return;
    
    // جلب البيانات
    const allData = getFromStorage('allUserData', []);
    const categoryData = allData.filter(d => d.dataType === dataTypeId && d.category === categoryId);
    
    // التحقق من وجود أقسام فرعية
    let hasSubcat = hasSubcategories(dataTypeId);
    let subcategories = hasSubcat ? getSubcategories(dataTypeId, categoryId) : null;
    
    let html = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 20px;">
            <div style="background: ${category.color}20; padding: 20px; border-radius: 10px; border-right: 4px solid ${category.color}; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #2c3e50;">${category.icon} ${category.name}</h3>
                <p style="margin: 5px 0 0 0; color: #666;">إجمالي الإدخالات: <strong>${categoryData.length}</strong></p>
            </div>
    `;
    
    if (hasSubcat && subcategories && Object.keys(subcategories).length > 0) {
        // عرض الأقسام الفرعية
        html += `
            <h4 style="color: #2c3e50; margin-bottom: 15px;">الأقسام الفرعية:</h4>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; margin-bottom: 25px;">
        `;
        
        Object.values(subcategories).forEach(subcategory => {
            const subData = categoryData.filter(d => d.subcategory === subcategory.id);
            
            let statusBadge = '';
            if (subData.length === 0) {
                statusBadge = '<div style="background: #ff9800; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7rem; margin-top: 5px;">⏳ فارغ</div>';
            } else {
                statusBadge = `<div style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7rem; margin-top: 5px;">✅ ${subData.length}</div>`;
            }
            
            html += `
                <div onclick="viewSubcategoryData('${dataTypeId}', '${categoryId}', '${subcategory.id}')" style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background='#f8f9fa'">
                    <div style="font-size: 1.8rem; margin-bottom: 5px;">${subcategory.icon || '📋'}</div>
                    <div style="font-size: 0.8rem; color: #2c3e50;">${subcategory.name}</div>
                    ${statusBadge}
                </div>
            `;
        });
        
        html += `
            </div>
        `;
    }
    
    // عرض جدول البيانات
    if (categoryData.length > 0) {
        html += `
            <h4 style="color: #2c3e50; margin-bottom: 15px;">البيانات المُدخلة:</h4>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>المستخدم</th>
                            <th>المنشأة</th>
                            ${hasSubcat ? '<th>القسم الفرعي</th>' : ''}
                            <th>القيمة</th>
                            <th>الملاحظات</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        categoryData.forEach(data => {
            const isLocked = getFromStorage(`lock_${data.dataType}_${data.category}${data.subcategory ? '_' + data.subcategory : ''}_${data.user}`, false);
            const subcatName = data.subcategory && subcategories ? (subcategories[data.subcategory]?.name || '-') : '-';
            
            let valueDisplay = '-';
            if (data.count !== undefined) valueDisplay = data.count;
            else if (data.assessment !== undefined) valueDisplay = getAssessmentLabel(data.assessment);
            else if (data.value !== undefined) valueDisplay = data.value;
            
            html += `
                <tr>
                    <td>${data.userName || '-'}</td>
                    <td>${data.facilityName || '-'}</td>
                    ${hasSubcat ? `<td>${subcatName}</td>` : ''}
                    <td><strong style="color: #1a73e8;">${valueDisplay}</strong></td>
                    <td>${data.notes || '-'}</td>
                    <td style="font-size: 0.85rem;">${formatDateArabic(data.timestamp)}</td>
                    <td>
                        ${isLocked 
                            ? '<span class="badge badge-danger">🔒 مقفل</span>' 
                            : '<span class="badge badge-success">✅ مفتوح</span>'}
                    </td>
                    <td>
                        ${isLocked 
                            ? `<button onclick="unlockCategoryForUser('${data.dataType}', '${data.category}', '${data.subcategory || ''}', '${data.user}')" class="btn-icon" title="فك القفل">🔓</button>`
                            : `<button onclick="lockCategoryForUser('${data.dataType}', '${data.category}', '${data.subcategory || ''}', '${data.user}')" class="btn-icon" title="قفل">🔒</button>`
                        }
                        <button onclick="deleteUserData('${data.dataType}', '${data.category}', '${data.subcategory || ''}', '${data.user}')" class="btn-icon" title="حذف" style="color: #f44336;">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        html += `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                <h4>لا توجد بيانات</h4>
                <p>لم يتم إدخال أي بيانات لهذا القسم بعد</p>
            </div>
        `;
    }
    
    html += `
        </div>
    `;
    
    detailsSection.innerHTML = html;
    detailsSection.scrollIntoView({ behavior: 'smooth' });
}

function viewSubcategoryData(dataTypeId, categoryId, subcategoryId) {
    const allData = getFromStorage('allUserData', []);
    const subData = allData.filter(d => 
        d.dataType === dataTypeId && 
        d.category === categoryId && 
        d.subcategory === subcategoryId
    );
    
    const dataType = getDataTypeInfo(dataTypeId);
    const category = dataType.categories[categoryId];
    const subcategory = getSubcategories(dataTypeId, categoryId)[subcategoryId];
    
    const detailsSection = document.getElementById('categoryDetailsSection');
    if (!detailsSection) return;
    
    let html = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 20px;">
            <button onclick="viewCategoryDetails('${dataTypeId}', '${categoryId}')" style="
                background: rgba(26, 115, 232, 0.1);
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                color: #1a73e8;
                cursor: pointer;
                font-weight: 600;
                margin-bottom: 15px;
            ">← العودة</button>
            
            <div style="background: ${category.color}20; padding: 20px; border-radius: 10px; border-right: 4px solid ${category.color}; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #2c3e50;">${subcategory.icon || '📋'} ${subcategory.name}</h3>
                <p style="margin: 5px 0 0 0; color: #666;">${category.name} - إجمالي الإدخالات: <strong>${subData.length}</strong></p>
            </div>
    `;
    
    if (subData.length > 0) {
        html += `
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>المستخدم</th>
                            <th>المنشأة</th>
                            <th>القيمة</th>
                            <th>الملاحظات</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        subData.forEach(data => {
            const isLocked = getFromStorage(`lock_${data.dataType}_${data.category}_${data.subcategory}_${data.user}`, false);
            
            let valueDisplay = '-';
            if (data.count !== undefined) valueDisplay = data.count;
            else if (data.assessment !== undefined) valueDisplay = getAssessmentLabel(data.assessment);
            else if (data.value !== undefined) valueDisplay = data.value;
            
            html += `
                <tr>
                    <td>${data.userName || '-'}</td>
                    <td>${data.facilityName || '-'}</td>
                    <td><strong style="color: #1a73e8;">${valueDisplay}</strong></td>
                    <td>${data.notes || '-'}</td>
                    <td style="font-size: 0.85rem;">${formatDateArabic(data.timestamp)}</td>
                    <td>
                        ${isLocked 
                            ? '<span class="badge badge-danger">🔒 مقفل</span>' 
                            : '<span class="badge badge-success">✅ مفتوح</span>'}
                    </td>
                    <td>
                        ${isLocked 
                            ? `<button onclick="unlockCategoryForUser('${data.dataType}', '${data.category}', '${data.subcategory}', '${data.user}')" class="btn-icon" title="فك القفل">🔓</button>`
                            : `<button onclick="lockCategoryForUser('${data.dataType}', '${data.category}', '${data.subcategory}', '${data.user}')" class="btn-icon" title="قفل">🔒</button>`
                        }
                        <button onclick="deleteUserData('${data.dataType}', '${data.category}', '${data.subcategory}', '${data.user}')" class="btn-icon" title="حذ��" style="color: #f44336;">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        html += `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                <h4>لا توجد بيانات</h4>
            </div>
        `;
    }
    
    html += `</div>`;
    
    detailsSection.innerHTML = html;
    detailsSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// إدارة القفل
// ========================================

function unlockCategoryForUser(dataTypeId, categoryId, subcategoryId, userId) {
    if (!confirm('هل تريد فك قفل هذا القسم للمستخدم؟ سيتمكن من إعادة إدخال البيانات.')) {
        return;
    }
    
    const lockKey = `lock_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${userId}`;
    removeFromStorage(lockKey);
    
    showSuccess('✅ تم فك القفل بنجاح! المستخدم يمكنه الآن إعادة الإدخال.');
    
    // إعادة تحميل التفاصيل
    setTimeout(() => {
        if (subcategoryId) {
            viewSubcategoryData(dataTypeId, categoryId, subcategoryId);
        } else {
            viewCategoryDetails(dataTypeId, categoryId);
        }
    }, 1000);
}

function lockCategoryForUser(dataTypeId, categoryId, subcategoryId, userId) {
    if (!confirm('هل تريد قفل هذا القسم للمستخدم؟')) {
        return;
    }
    
    const lockKey = `lock_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${userId}`;
    saveToStorage(lockKey, true);
    
    showSuccess('🔒 تم القفل بنجاح!');
    
    setTimeout(() => {
        if (subcategoryId) {
            viewSubcategoryData(dataTypeId, categoryId, subcategoryId);
        } else {
            viewCategoryDetails(dataTypeId, categoryId);
        }
    }, 1000);
}

function deleteUserData(dataTypeId, categoryId, subcategoryId, userId) {
    if (!confirm('هل تريد حذف هذه البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
        return;
    }
    
    // حذف البيانات
    const dataKey = `data_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${userId}`;
    removeFromStorage(dataKey);
    
    // حذف القفل
    const lockKey = `lock_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${userId}`;
    removeFromStorage(lockKey);
    
    // حذف من قاعدة البيانات العامة
    let allData = getFromStorage('allUserData', []);
    allData = allData.filter(d => !(
        d.dataType === dataTypeId && 
        d.category === categoryId && 
        d.subcategory === (subcategoryId || null) && 
        d.user === userId
    ));
    saveToStorage('allUserData', allData);
    
    showSuccess('✅ تم الحذف بنجاح!');
    
    setTimeout(() => {
        if (subcategoryId) {
            viewSubcategoryData(dataTypeId, categoryId, subcategoryId);
        } else {
            viewCategoryDetails(dataTypeId, categoryId);
        }
    }, 1000);
}

function getAssessmentLabel(value) {
    const labels = {
        '2': '⭐⭐ ممتاز',
        '1': '⭐ جيد',
        '0': '❌ ضعيف',
        'N/A': '⚪ لا ينطبق'
    };
    return labels[value] || value;
}
function selectDataTypeForKPI(dataTypeId) {
    selectedKPIDataType = dataTypeId;
    selectedKPICategory = null;
    selectedKPISubcategory = null;
    
    const dataType = getDataTypeInfo(dataTypeId);
    console.log('Selected data type:', dataType);
    
    showCategorySelector(dataType);
}

function showCategorySelector(dataType) {
    const formSection = document.getElementById('kpiFormSection');
    if (!formSection) return;
    
    const categories = dataType.categories;
    
    let html = `
        <div class="breadcrumb">
            <span class="active">${dataType.icon} ${dataType.name}</span>
        </div>
        
        <div class="category-selector">
            <h3>اختر القسم:</h3>
            <div class="category-grid">
    `;
    
    Object.values(categories).forEach(category => {
        html += `
            <div class="category-card" onclick="selectCategoryForKPI('${dataType.id}', '${category.id}')" style="border-top: 3px solid ${category.color}">
                <div class="category-icon" style="color: ${category.color}; font-size: 2.5rem">${category.icon}</div>
                <h4>${category.name}</h4>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    formSection.innerHTML = html;
    formSection.style.display = 'block';
}

function selectCategoryForKPI(dataTypeId, categoryId) {
    selectedKPIDataType = dataTypeId;
    selectedKPICategory = categoryId;
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    // ✅ التحقق من وجود أقسام فرعية
    if (hasSubcategories(dataTypeId)) {
        const subcategories = getSubcategories(dataTypeId, categoryId);
        
        if (Object.keys(subcategories).length > 0) {
            showSubcategorySelector(dataType, categoryId, subcategories);
            return;
        }
    }
    
    showKPIForm(dataType, categoryId);
}

function showSubcategorySelector(dataType, categoryId, subcategories) {
    const formSection = document.getElementById('kpiFormSection');
    if (!formSection) return;
    
    const category = dataType.categories[categoryId];
    
    let html = `
        <div class="breadcrumb">
            <span onclick="selectDataTypeForKPI('${dataType.id}')" style="cursor: pointer">← ${dataType.icon} ${dataType.name}</span>
            <span class="active">/ ${category.icon} ${category.name}</span>
        </div>
        
        <div class="subcategory-selector">
            <h3>اختر القسم الفرعي:</h3>
            <div class="subcategory-grid">
    `;
    
    Object.values(subcategories).forEach(subcategory => {
        html += `
            <div class="subcategory-card" onclick="selectSubcategoryForKPI('${dataType.id}', '${categoryId}', '${subcategory.id}')">
                <div class="subcategory-icon">${subcategory.icon || '📋'}</div>
                <h4>${subcategory.name}</h4>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    formSection.innerHTML = html;
}

function selectSubcategoryForKPI(dataTypeId, categoryId, subcategoryId) {
    selectedKPIDataType = dataTypeId;
    selectedKPICategory = categoryId;
    selectedKPISubcategory = subcategoryId;
    
    const dataType = getDataTypeInfo(dataTypeId);
    showKPIForm(dataType, categoryId, subcategoryId);
}

function showKPIForm(dataType, categoryId, subcategoryId = null) {
    const formSection = document.getElementById('kpiFormSection');
    if (!formSection) return;
    
    const category = dataType.categories[categoryId];
    const subcategory = subcategoryId ? getSubcategories(dataType.id, categoryId)[subcategoryId] : null;
    
    let breadcrumb = `
        <div class="breadcrumb">
            <span onclick="selectDataTypeForKPI('${dataType.id}')" style="cursor: pointer">← ${dataType.icon} ${dataType.name}</span>
            <span onclick="selectCategoryForKPI('${dataType.id}', '${categoryId}')" style="cursor: pointer">/ ${category.icon} ${category.name}</span>
    `;
    
    if (subcategory) {
        breadcrumb += `<span class="active">/ ${subcategory.icon || '📋'} ${subcategory.name}</span>`;
    }
    
    breadcrumb += `</div>`;
    
    let html = breadcrumb;
    
    // ✅ نموذج حسب نوع الإدخال
    if (dataType.inputType === 'count') {
        // القوى البشرية - عدد فقط
        html += `
            <div class="kpi-form-card">
                <h3>إضافة بيانات: ${category.name}</h3>
                <form onsubmit="saveWorkforceData(event)">
                    <div class="form-group">
                        <label>العدد *</label>
                        <input type="number" id="countValue" min="0" required class="form-control" placeholder="أدخل العدد">
                    </div>
                    <button type="submit" class="btn btn-primary">💾 حفظ</button>
                </form>
            </div>
        `;
    } else if (dataType.inputType === 'assessment') {
        // معايير التقييم
        html += `
            <div class="kpi-form-card">
                <h3>إضافة معيار: ${subcategory ? subcategory.name : category.name}</h3>
                <form onsubmit="saveAssessmentData(event)">
                    <div class="form-group">
                        <label>المعيار *</label>
                        <input type="text" id="criteriaName" required class="form-control" placeholder="أدخل اسم المعيار">
                    </div>
                    <div class="form-group">
                        <label>التقييم *</label>
                        <select id="assessmentValue" required class="form-control">
                            <option value="">اختر التقييم</option>
                            <option value="2">⭐⭐ ممتاز (2)</option>
                            <option value="1">⭐ جيد (1)</option>
                            <option value="0">❌ ضعيف (0)</option>
                            <option value="N/A">⚪ لا ينطبق (N/A)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>ملاحظات</label>
                        <textarea id="assessmentNotes" rows="3" class="form-control" placeholder="أضف ملاحظاتك هنا"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">💾 حفظ المعيار</button>
                </form>
            </div>
        `;
    } else if (dataType.inputType === 'formula') {
        // مؤشرات الأداء - نوعين
        html += `
            <div class="kpi-form-card">
                <h3>إضافة مؤشر: ${category.name}</h3>
                <form onsubmit="savePerformanceIndicator(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>كود المؤشر *</label>
                            <input type="text" id="indicatorCode" required class="form-control" placeholder="مثال: WFM-01">
                        </div>
                        <div class="form-group">
                            <label>اسم المؤشر *</label>
                            <input type="text" id="indicatorName" required class="form-control" placeholder="أدخل اسم المؤشر">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>نوع المؤشر *</label>
                        <select id="indicatorType" onchange="toggleIndicatorFields()" required class="form-control">
                            <option value="">اختر النوع</option>
                            <option value="formula">📊 صيغة حسابية (بسط ÷ مقام × 100)</option>
                            <option value="direct">🔢 قيمة مباشرة (رقم واحد)</option>
                        </select>
                    </div>
                    
                    <div id="formulaFields" style="display: none;">
                        <div class="form-group">
                            <label>وصف المعادلة</label>
                            <textarea id="formulaDescription" rows="2" class="form-control" placeholder="مثال: (عدد الحالات المعالجة ÷ إجمالي الحالات) × 100"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>البسط (توضيح)</label>
                                <input type="text" id="numeratorLabel" class="form-control" placeholder="مثال: عدد الحالات المعالجة">
                            </div>
                            <div class="form-group">
                                <label>المقام (توضيح)</label>
                                <input type="text" id="denominatorLabel" class="form-control" placeholder="مثال: إجمالي الحالات">
                            </div>
                        </div>
                    </div>
                    
                    <div id="directFields" style="display: none;">
                        <div class="form-group">
                            <label>الوصف/التعليمات</label>
                            <textarea id="directDescription" rows="3" class="form-control" placeholder="وصف المؤشر وطريقة حسابه"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>دورية الإبلاغ *</label>
                        <select id="indicatorFrequency" required class="form-control">
                            <option value="شهري">📅 شهري</option>
                            <option value="ربع سنوي">📆 ربع سنوي</option>
                            <option value="سنوي">🗓️ سنوي</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">💾 حفظ المؤشر</button>
                </form>
            </div>
        `;
    } else if (dataType.inputType === 'monthly_data') {
        // مؤشرات التميز
        html += `
            <div class="kpi-form-card">
                <h3>إضافة مؤشر تميز: ${category.name}</h3>
                <form onsubmit="saveExcellenceIndicator(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>كود المؤشر *</label>
                            <input type="text" id="excellenceCode" required class="form-control" placeholder="مثال: A1">
                        </div>
                        <div class="form-group">
                            <label>اسم المؤشر *</label>
                            <input type="text" id="excellenceName" required class="form-control" placeholder="أدخل اسم المؤشر">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>الإدارة المسؤولة *</label>
                        <input type="text" id="responsibleDept" required class="form-control" placeholder="أدخل اسم الإدارة">
                    </div>
                    
                    <div class="form-group">
                        <label>معادلة الاحتساب *</label>
                        <textarea id="calculationFormula" rows="3" required class="form-control" placeholder="مثال: (البسط ÷ الهدف) × 100"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>دورية التقييم *</label>
                        <select id="excellencePeriodicity" required class="form-control">
                            <option value="شهري">📅 شهري</option>
                            <option value="ربع سنوي">📆 ربع سنوي</option>
                            <option value="سنوي">🗓️ سنوي</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">💾 حفظ المؤشر</button>
                </form>
            </div>
        `;
    }
    
    formSection.innerHTML = html;
    
    // تحميل المؤشرات الحالية
    loadCurrentKPIs(dataType.id, categoryId, subcategoryId);
}

function toggleIndicatorFields() {
    const type = document.getElementById('indicatorType').value;
    const formulaFields = document.getElementById('formulaFields');
    const directFields = document.getElementById('directFields');
    
    if (type === 'formula') {
        formulaFields.style.display = 'block';
        directFields.style.display = 'none';
    } else if (type === 'direct') {
        formulaFields.style.display = 'none';
        directFields.style.display = 'block';
    } else {
        formulaFields.style.display = 'none';
        directFields.style.display = 'none';
    }
}

function loadCurrentKPIs(dataTypeId, categoryId, subcategoryId = null) {
    const listSection = document.getElementById('kpiListSection');
    if (!listSection) return;
    
    let kpis;
    if (subcategoryId) {
        kpis = getKPIsBySubcategory(dataTypeId, categoryId, subcategoryId);
    } else {
        kpis = getKPIsByCategory(dataTypeId, categoryId);
    }
    
    if (kpis.length === 0) {
        listSection.style.display = 'none';
        return;
    }
    
    let html = `
        <div class="kpi-list-card">
            <h3>المؤشرات الحالية (${kpis.length})</h3>
            <div class="kpi-table">
                <table>
                    <thead>
                        <tr>
                            <th>الكود/الاسم</th>
                            <th>التفاصيل</th>
                            <th>تاريخ الإضافة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    kpis.forEach(kpi => {
        html += `
            <tr>
                <td><strong>${kpi.code || kpi.name}</strong></td>
                <td>${kpi.description || kpi.formulaDescription || '-'}</td>
                <td>${formatDateArabic(kpi.createdAt)}</td>
                <td>
                    <button onclick="editKPI('${dataTypeId}', '${categoryId}', '${kpi.id}', ${subcategoryId ? `'${subcategoryId}'` : 'null'})" class="btn-icon" title="تعديل">✏️</button>
                    <button onclick="deleteKPIItem('${dataTypeId}', '${categoryId}', '${kpi.id}', ${subcategoryId ? `'${subcategoryId}'` : 'null'})" class="btn-icon" title="حذف">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    listSection.innerHTML = html;
    listSection.style.display = 'block';
}
// ========================================
// دوال حفظ البيانات
// ========================================

function saveWorkforceData(event) {
    event.preventDefault();
    
    const countValue = document.getElementById('countValue').value;
    
    const kpiData = {
        dataType: selectedKPIDataType,
        category: selectedKPICategory,
        count: parseInt(countValue),
        createdAt: new Date().toISOString()
    };
    
    const result = saveKPI(kpiData);
    
    if (result.success) {
        showSuccess(result.message);
        document.getElementById('countValue').value = '';
        loadCurrentKPIs(selectedKPIDataType, selectedKPICategory);
    } else {
        showError(result.message);
    }
}

function saveAssessmentData(event) {
    event.preventDefault();
    
    const criteriaName = document.getElementById('criteriaName').value;
    const assessmentValue = document.getElementById('assessmentValue').value;
    const assessmentNotes = document.getElementById('assessmentNotes').value;
    
    const kpiData = {
        dataType: selectedKPIDataType,
        category: selectedKPICategory,
        subcategory: selectedKPISubcategory,
        name: criteriaName,
        assessment: assessmentValue,
        notes: assessmentNotes,
        createdAt: new Date().toISOString()
    };
    
    const result = saveKPI(kpiData);
    
    if (result.success) {
        showSuccess(result.message);
        document.getElementById('criteriaName').value = '';
        document.getElementById('assessmentValue').value = '';
        document.getElementById('assessmentNotes').value = '';
        loadCurrentKPIs(selectedKPIDataType, selectedKPICategory, selectedKPISubcategory);
    } else {
        showError(result.message);
    }
}

function savePerformanceIndicator(event) {
    event.preventDefault();
    
    const code = document.getElementById('indicatorCode').value;
    const name = document.getElementById('indicatorName').value;
    const indicatorType = document.getElementById('indicatorType').value;
    const frequency = document.getElementById('indicatorFrequency').value;
    
    const kpiData = {
        dataType: selectedKPIDataType,
        category: selectedKPICategory,
        code: code,
        name: name,
        indicatorType: indicatorType,
        frequency: frequency,
        createdAt: new Date().toISOString()
    };
    
    if (indicatorType === 'formula') {
        kpiData.formulaDescription = document.getElementById('formulaDescription').value;
        kpiData.numeratorLabel = document.getElementById('numeratorLabel').value;
        kpiData.denominatorLabel = document.getElementById('denominatorLabel').value;
    } else if (indicatorType === 'direct') {
        kpiData.description = document.getElementById('directDescription').value;
    }
    
    const result = saveKPI(kpiData);
    
    if (result.success) {
        showSuccess(result.message);
        event.target.reset();
        toggleIndicatorFields();
        loadCurrentKPIs(selectedKPIDataType, selectedKPICategory);
    } else {
        showError(result.message);
    }
}

function saveExcellenceIndicator(event) {
    event.preventDefault();
    
    const code = document.getElementById('excellenceCode').value;
    const name = document.getElementById('excellenceName').value;
    const responsibleDept = document.getElementById('responsibleDept').value;
    const calculationFormula = document.getElementById('calculationFormula').value;
    const periodicity = document.getElementById('excellencePeriodicity').value;
    
    const kpiData = {
        dataType: selectedKPIDataType,
        category: selectedKPICategory,
        code: code,
        name: name,
        responsibleDepartment: responsibleDept,
        calculationFormula: calculationFormula,
        periodicity: periodicity,
        createdAt: new Date().toISOString()
    };
    
    const result = saveKPI(kpiData);
    
    if (result.success) {
        showSuccess(result.message);
        event.target.reset();
        loadCurrentKPIs(selectedKPIDataType, selectedKPICategory);
    } else {
        showError(result.message);
    }
}

function deleteKPIItem(dataType, category, kpiId, subcategory = null) {
    if (!confirm('هل أنت متأكد من حذف هذا المؤشر؟')) return;
    
    const result = deleteKPI(dataType, category, kpiId, subcategory);
    
    if (result.success) {
        showSuccess(result.message);
        loadCurrentKPIs(dataType, category, subcategory);
    } else {
        showError(result.message);
    }
}

function editKPI(dataType, category, kpiId, subcategory = null) {
    const kpi = getKPIById(dataType, category, kpiId, subcategory);
    
    if (!kpi) {
        showError('المؤشر غير موجود');
        return;
    }
    
    // عرض نموذج التعديل
    showEditForm(dataType, category, kpi, subcategory);
}

function showEditForm(dataType, category, kpi, subcategory = null) {
    const formSection = document.getElementById('kpiFormSection');
    if (!formSection) return;
    
    const dataTypeInfo = getDataTypeInfo(dataType);
    const categoryInfo = dataTypeInfo.categories[category];
    
    let html = `
        <div class="kpi-form-card">
            <h3>تعديل المؤشر: ${kpi.code || kpi.name}</h3>
            <form onsubmit="updateKPIForm(event, '${dataType}', '${category}', '${kpi.id}', ${subcategory ? `'${subcategory}'` : 'null'})">
    `;
    
    if (dataTypeInfo.inputType === 'count') {
        html += `
            <div class="form-group">
                <label>العدد *</label>
                <input type="number" id="editCountValue" value="${kpi.count}" min="0" required class="form-control">
            </div>
        `;
    } else if (dataTypeInfo.inputType === 'assessment') {
        html += `
            <div class="form-group">
                <label>المعيار *</label>
                <input type="text" id="editCriteriaName" value="${kpi.name}" required class="form-control">
            </div>
            <div class="form-group">
                <label>التقييم *</label>
                <select id="editAssessmentValue" required class="form-control">
                    <option value="2" ${kpi.assessment === '2' ? 'selected' : ''}>⭐⭐ ممتاز (2)</option>
                    <option value="1" ${kpi.assessment === '1' ? 'selected' : ''}>⭐ جيد (1)</option>
                    <option value="0" ${kpi.assessment === '0' ? 'selected' : ''}>❌ ضعيف (0)</option>
                    <option value="N/A" ${kpi.assessment === 'N/A' ? 'selected' : ''}>⚪ لا ينطبق (N/A)</option>
                </select>
            </div>
            <div class="form-group">
                <label>ملاحظات</label>
                <textarea id="editAssessmentNotes" rows="3" class="form-control">${kpi.notes || ''}</textarea>
            </div>
        `;
    } else if (dataTypeInfo.inputType === 'formula') {
        html += `
            <div class="form-row">
                <div class="form-group">
                    <label>كود المؤشر *</label>
                    <input type="text" id="editIndicatorCode" value="${kpi.code}" required class="form-control">
                </div>
                <div class="form-group">
                    <label>اسم المؤشر *</label>
                    <input type="text" id="editIndicatorName" value="${kpi.name}" required class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label>نوع المؤشر *</label>
                <select id="editIndicatorType" onchange="toggleEditIndicatorFields()" required class="form-control">
                    <option value="formula" ${kpi.indicatorType === 'formula' ? 'selected' : ''}>📊 صيغة حسابية</option>
                    <option value="direct" ${kpi.indicatorType === 'direct' ? 'selected' : ''}>🔢 قيمة مباشرة</option>
                </select>
            </div>
            <div id="editFormulaFields" style="display: ${kpi.indicatorType === 'formula' ? 'block' : 'none'};">
                <div class="form-group">
                    <label>وصف المعادلة</label>
                    <textarea id="editFormulaDescription" rows="2" class="form-control">${kpi.formulaDescription || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>البسط (توضيح)</label>
                        <input type="text" id="editNumeratorLabel" value="${kpi.numeratorLabel || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>المقام (توضيح)</label>
                        <input type="text" id="editDenominatorLabel" value="${kpi.denominatorLabel || ''}" class="form-control">
                    </div>
                </div>
            </div>
            <div id="editDirectFields" style="display: ${kpi.indicatorType === 'direct' ? 'block' : 'none'};">
                <div class="form-group">
                    <label>الوصف/التعليمات</label>
                    <textarea id="editDirectDescription" rows="3" class="form-control">${kpi.description || ''}</textarea>
                </div>
            </div>
            <div class="form-group">
                <label>دورية الإبلاغ *</label>
                <select id="editIndicatorFrequency" required class="form-control">
                    <option value="شهري" ${kpi.frequency === 'شهري' ? 'selected' : ''}>📅 شهري</option>
                    <option value="ربع سنوي" ${kpi.frequency === 'ربع سنوي' ? 'selected' : ''}>📆 ربع سنوي</option>
                    <option value="سنوي" ${kpi.frequency === 'سنوي' ? 'selected' : ''}>🗓️ سنوي</option>
                </select>
            </div>
        `;
    } else if (dataTypeInfo.inputType === 'monthly_data') {
        html += `
            <div class="form-row">
                <div class="form-group">
                    <label>كود المؤشر *</label>
                    <input type="text" id="editExcellenceCode" value="${kpi.code}" required class="form-control">
                </div>
                <div class="form-group">
                    <label>اسم المؤشر *</label>
                    <input type="text" id="editExcellenceName" value="${kpi.name}" required class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label>الإدارة المسؤولة *</label>
                <input type="text" id="editResponsibleDept" value="${kpi.responsibleDepartment || ''}" required class="form-control">
            </div>
            <div class="form-group">
                <label>معادلة الاحتساب *</label>
                <textarea id="editCalculationFormula" rows="3" required class="form-control">${kpi.calculationFormula || ''}</textarea>
            </div>
            <div class="form-group">
                <label>دورية التقييم *</label>
                <select id="editExcellencePeriodicity" required class="form-control">
                    <option value="شهري" ${kpi.periodicity === 'شهري' ? 'selected' : ''}>📅 شهري</option>
                    <option value="ربع سنوي" ${kpi.periodicity === 'ربع سنوي' ? 'selected' : ''}>📆 ربع سنوي</option>
                    <option value="سنوي" ${kpi.periodicity === 'سنوي' ? 'selected' : ''}>🗓️ سنوي</option>
                </select>
            </div>
        `;
    }
    
    html += `
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">💾 حفظ التعديلات</button>
                    <button type="button" onclick="cancelEdit('${dataType}', '${category}', ${subcategory ? `'${subcategory}'` : 'null'})" class="btn btn-secondary">❌ إلغاء</button>
                </div>
            </form>
        </div>
    `;
    
    formSection.innerHTML = html;
    formSection.scrollIntoView({ behavior: 'smooth' });
}

function toggleEditIndicatorFields() {
    const type = document.getElementById('editIndicatorType').value;
    const formulaFields = document.getElementById('editFormulaFields');
    const directFields = document.getElementById('editDirectFields');
    
    if (type === 'formula') {
        formulaFields.style.display = 'block';
        directFields.style.display = 'none';
    } else if (type === 'direct') {
        formulaFields.style.display = 'none';
        directFields.style.display = 'block';
    }
}

function updateKPIForm(event, dataType, category, kpiId, subcategory = null) {
    event.preventDefault();
    
    const dataTypeInfo = getDataTypeInfo(dataType);
    let updatedData = {};
    
    if (dataTypeInfo.inputType === 'count') {
        updatedData.count = parseInt(document.getElementById('editCountValue').value);
    } else if (dataTypeInfo.inputType === 'assessment') {
        updatedData.name = document.getElementById('editCriteriaName').value;
        updatedData.assessment = document.getElementById('editAssessmentValue').value;
        updatedData.notes = document.getElementById('editAssessmentNotes').value;
    } else if (dataTypeInfo.inputType === 'formula') {
        updatedData.code = document.getElementById('editIndicatorCode').value;
        updatedData.name = document.getElementById('editIndicatorName').value;
        updatedData.indicatorType = document.getElementById('editIndicatorType').value;
        updatedData.frequency = document.getElementById('editIndicatorFrequency').value;
        
        if (updatedData.indicatorType === 'formula') {
            updatedData.formulaDescription = document.getElementById('editFormulaDescription').value;
            updatedData.numeratorLabel = document.getElementById('editNumeratorLabel').value;
            updatedData.denominatorLabel = document.getElementById('editDenominatorLabel').value;
        } else {
            updatedData.description = document.getElementById('editDirectDescription').value;
        }
    } else if (dataTypeInfo.inputType === 'monthly_data') {
        updatedData.code = document.getElementById('editExcellenceCode').value;
        updatedData.name = document.getElementById('editExcellenceName').value;
        updatedData.responsibleDepartment = document.getElementById('editResponsibleDept').value;
        updatedData.calculationFormula = document.getElementById('editCalculationFormula').value;
        updatedData.periodicity = document.getElementById('editExcellencePeriodicity').value;
    }
    
    const result = updateKPI(dataType, category, kpiId, updatedData, subcategory);
    
    if (result.success) {
        showSuccess(result.message);
        showKPIForm(dataTypeInfo, category, subcategory);
    } else {
        showError(result.message);
    }
}

function cancelEdit(dataType, category, subcategory = null) {
    const dataTypeInfo = getDataTypeInfo(dataType);
    showKPIForm(dataTypeInfo, category, subcategory);
}
// ========================================
// إدارة المنشآت
// ========================================

function loadFacilitiesManagement() {
    console.log('🏥 Loading facilities management...');
    
    const container = document.getElementById('facilitiesContent');
    if (!container) return;
    
    facilities = getFromStorage('facilities', []);
    
    let html = `
        <div class="facilities-management">
            <div class="section-header">
                <h2>إدارة المنشآت الصحية</h2>
                <button onclick="showAddFacilityForm()" class="btn btn-primary">➕ إضافة منشأة جديدة</button>
            </div>
            
            <div id="facilityFormSection" style="display: none;"></div>
            
            <div class="facilities-list">
                <h3>قائمة المنشآت (${facilities.length})</h3>
    `;
    
    if (facilities.length === 0) {
        html += '<p style="text-align: center; padding: 40px; color: #666;">لا توجد منشآت مضافة</p>';
    } else {
        html += `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>اسم المنشأة</th>
                        <th>النوع</th>
                        <th>المنطقة</th>
                        <th>الحالة</th>
                        <th>عدد المستخدمين</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        facilities.forEach(facility => {
            const facilityUsers = users.filter(u => u.facility === facility.id);
            const statusClass = facility.status === 'active' ? 'status-active' : 'status-inactive';
            const statusText = facility.status === 'active' ? '✅ نشط' : '❌ غير نشط';
            
            html += `
                <tr>
                    <td><strong>${facility.name}</strong></td>
                    <td>${getFacilityTypeName(facility.type)}</td>
                    <td>${facility.region || '-'}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>${facilityUsers.length}</td>
                    <td>
                        <button onclick="editFacility('${facility.id}')" class="btn-icon" title="تعديل">✏️</button>
                        <button onclick="toggleFacilityStatus('${facility.id}')" class="btn-icon" title="تغيير الحالة">🔄</button>
                        <button onclick="deleteFacility('${facility.id}')" class="btn-icon" title="حذف">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function showAddFacilityForm() {
    const formSection = document.getElementById('facilityFormSection');
    if (!formSection) return;
    
    const facilityTypes = getAllFacilityTypes();
    
    let html = `
        <div class="form-card">
            <h3>إضافة منشأة جد��دة</h3>
            <form onsubmit="saveFacility(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>اسم المنشأة *</label>
                        <input type="text" id="facilityName" required class="form-control" placeholder="أدخل اسم المنشأة">
                    </div>
                    <div class="form-group">
                        <label>نوع المنشأة *</label>
                        <select id="facilityType" required class="form-control">
                            <option value="">اختر النوع</option>
    `;
    
    facilityTypes.forEach(type => {
        html += `<option value="${type.id}">${type.icon} ${type.name}</option>`;
    });
    
    html += `
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>المنطقة</label>
                        <input type="text" id="facilityRegion" class="form-control" placeholder="أدخل المنطقة">
                    </div>
                    <div class="form-group">
                        <label>المدينة</label>
                        <input type="text" id="facilityCity" class="form-control" placeholder="أدخل المدينة">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>العنوان</label>
                    <textarea id="facilityAddress" rows="2" class="form-control" placeholder="أدخل العنوان التفصيلي"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">💾 حفظ المنشأة</button>
                    <button type="button" onclick="cancelFacilityForm()" class="btn btn-secondary">❌ إلغاء</button>
                </div>
            </form>
        </div>
    `;
    
    formSection.innerHTML = html;
    formSection.style.display = 'block';
}

function saveFacility(event) {
    event.preventDefault();
    
    const facilityData = {
        id: 'facility_' + Date.now(),
        name: document.getElementById('facilityName').value,
        type: document.getElementById('facilityType').value,
        region: document.getElementById('facilityRegion').value,
        city: document.getElementById('facilityCity').value,
        address: document.getElementById('facilityAddress').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    facilities.push(facilityData);
    saveToStorage('facilities', facilities);
    
    showSuccess('تم إضافة المنشأة بنجاح');
    loadFacilitiesManagement();
}

function cancelFacilityForm() {
    const formSection = document.getElementById('facilityFormSection');
    if (formSection) {
        formSection.style.display = 'none';
    }
}

function editFacility(facilityId) {
    showError('وظيفة التعديل قيد التطوير');
}

function toggleFacilityStatus(facilityId) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) return;
    
    facility.status = facility.status === 'active' ? 'inactive' : 'active';
    saveToStorage('facilities', facilities);
    
    showSuccess('تم تغيير حالة المنشأة');
    loadFacilitiesManagement();
}

function deleteFacility(facilityId) {
    if (!confirm('هل أنت متأكد من حذف هذه المنشأة؟')) return;
    
    const facilityUsers = users.filter(u => u.facility === facilityId);
    
    if (facilityUsers.length > 0) {
        showError('لا يمكن حذف المنشأة لوجود مستخدمين مرتبطين بها');
        return;
    }
    
    facilities = facilities.filter(f => f.id !== facilityId);
    saveToStorage('facilities', facilities);
    
    showSuccess('تم حذف المنشأة بنجاح');
    loadFacilitiesManagement();
}

// ========================================
// إدارة المستخدمين
// ========================================

function loadUsersManagement() {
    console.log('👥 Loading users management...');
    
    const container = document.getElementById('usersContent');
    if (!container) return;
    
    users = getFromStorage('users', []);
    
    let html = `
        <div class="users-management">
            <div class="section-header">
                <h2>إدارة المستخدمين</h2>
                <button onclick="showAddUserForm()" class="btn btn-primary">➕ إضافة مستخدم جديد</button>
            </div>
            
            <div id="userFormSection" style="display: none;"></div>
            
            <div class="users-list">
                <h3>قائمة المستخدمين (${users.length})</h3>
    `;
    
    if (users.length === 0) {
        html += '<p style="text-align: center; padding: 40px; color: #666;">لا يوجد مستخدمين مضافين</p>';
    } else {
        html += `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>المنشأة</th>
                        <th>الدور</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        users.forEach(user => {
            const facility = facilities.find(f => f.id === user.facility);
            const facilityName = facility ? facility.name : 'غير محدد';
            const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
            const statusText = user.status === 'active' ? '✅ نشط' : '❌ غير نشط';
            const roleText = user.role === 'admin' ? '👑 مدير' : '👤 مستخدم';
            
            html += `
                <tr>
                    <td><strong>${user.name}</strong></td>
                    <td>${user.email}</td>
                    <td>${facilityName}</td>
                    <td>${roleText}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <button onclick="editUser('${user.id}')" class="btn-icon" title="تعديل">✏️</button>
                        <button onclick="toggleUserStatus('${user.id}')" class="btn-icon" title="تغيير الحالة">🔄</button>
                        <button onclick="resetUserPassword('${user.id}')" class="btn-icon" title="إعادة تعيين كلمة المرور">🔑</button>
                        <button onclick="deleteUser('${user.id}')" class="btn-icon" title="حذف">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function showAddUserForm() {
    const formSection = document.getElementById('userFormSection');
    if (!formSection) return;
    
    let html = `
        <div class="form-card">
            <h3>إضافة مستخدم جديد</h3>
            <form onsubmit="saveUser(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>الاسم الكامل *</label>
                        <input type="text" id="userName" required class="form-control" placeholder="أدخل الاسم الكامل">
                    </div>
                    <div class="form-group">
                        <label>البريد الإلكتروني *</label>
                        <input type="email" id="userEmail" required class="form-control" placeholder="example@domain.com">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>كلمة المرور *</label>
                        <input type="password" id="userPassword" required class="form-control" placeholder="أدخل كلمة المرور">
                    </div>
                    <div class="form-group">
                        <label>المنشأة *</label>
                        <select id="userFacility" required class="form-control">
                            <option value="">اختر المنشأة</option>
    `;
    
    facilities.forEach(facility => {
        html += `<option value="${facility.id}">${facility.name}</option>`;
    });
    
    html += `
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>الدور *</label>
                    <select id="userRole" required class="form-control">
                        <option value="user">👤 مستخدم عادي</option>
                        <option value="admin">👑 مدير</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">💾 حفظ المستخدم</button>
                    <button type="button" onclick="cancelUserForm()" class="btn btn-secondary">❌ إلغاء</button>
                </div>
            </form>
        </div>
    `;
    
    formSection.innerHTML = html;
    formSection.style.display = 'block';
}

function saveUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    
    // التحقق من عدم تكرار البريد الإلكتروني
    if (users.some(u => u.email === email)) {
        showError('البريد الإلكتروني مستخدم بالفعل');
        return;
    }
    
    const userData = {
        id: 'user_' + Date.now(),
        name: document.getElementById('userName').value,
        email: email,
        password: document.getElementById('userPassword').value,
        facility: document.getElementById('userFacility').value,
        role: document.getElementById('userRole').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    users.push(userData);
    saveToStorage('users', users);
    
    showSuccess('تم إضافة المستخدم بنجاح');
    loadUsersManagement();
}

function cancelUserForm() {
    const formSection = document.getElementById('userFormSection');
    if (formSection) {
        formSection.style.display = 'none';
    }
}

function editUser(userId) {
    showError('وظيفة التعديل قيد التطوير');
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.status = user.status === 'active' ? 'inactive' : 'active';
    saveToStorage('users', users);
    
    showSuccess('تم تغيير حالة المستخدم');
    loadUsersManagement();
}

function resetUserPassword(userId) {
    const newPassword = prompt('أدخل كلمة المرور الجديدة:');
    
    if (!newPassword) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.password = newPassword;
    saveToStorage('users', users);
    
    showSuccess('تم إعادة تعيين كلمة المرور بنجاح');
}

function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    users = users.filter(u => u.id !== userId);
    saveToStorage('users', users);
    
    showSuccess('تم حذف المستخدم بنجاح');
    loadUsersManagement();
}

// ========================================
// التقارير
// ========================================

function loadReports() {
    console.log('📊 Loading reports...');
    
    const container = document.getElementById('reportsContent');
    if (!container) return;
    
    let html = `
        <div class="reports-section">
            <div class="section-header">
                <h2>التقارير والإحصائيات</h2>
            </div>
            
            <div class="reports-grid">
                <div class="report-card" onclick="generateKPIReport()">
                    <div class="report-icon">📊</div>
                    <h3>تقرير المؤشرات</h3>
                    <p>إحصائيات شاملة لجميع المؤشرات</p>
                </div>
                
                <div class="report-card" onclick="generateFacilityReport()">
                    <div class="report-icon">🏥</div>
                    <h3>تقرير المنشآت</h3>
                    <p>بيانات المنشآت والأداء</p>
                </div>
                
                <div class="report-card" onclick="generateUserActivityReport()">
                    <div class="report-icon">👥</div>
                    <h3>تقرير نشاط المستخدمين</h3>
                    <p>إحصائيات استخدام النظام</p>
                </div>
                
                <div class="report-card" onclick="exportAllData()">
                    <div class="report-icon">💾</div>
                    <h3>تصدير البيانات</h3>
                    <p>تصدير جميع البيانات بصيغة JSON</p>
                </div>
            </div>
            
            <div id="reportResult" style="margin-top: 30px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

function generateKPIReport() {
    const dataTypes = getAllDataTypes();
    let reportHtml = `
        <div class="report-result">
            <h3>📊 تقرير المؤشرات الشامل</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>نوع البيانات</th>
                        <th>عدد الأقسام</th>
                        <th>عدد المؤشرات</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    let totalKPIs = 0;
    
    dataTypes.forEach(dataType => {
        const stats = getKPIStatistics(dataType.id);
        totalKPIs += stats.totalKPIs;
        
        reportHtml += `
            <tr>
                <td>${dataType.icon} ${dataType.name}</td>
                <td>${stats.totalCategories}</td>
                <td>${stats.totalKPIs}</td>
            </tr>
        `;
    });
    
    reportHtml += `
                </tbody>
                <tfoot>
                    <tr>
                        <th>الإجمالي</th>
                        <th>${dataTypes.length}</th>
                        <th>${totalKPIs}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    document.getElementById('reportResult').innerHTML = reportHtml;
}

function generateFacilityReport() {
    const reportHtml = `
        <div class="report-result">
            <h3>🏥 تقرير المنشآت</h3>
            <p>إجمالي المنشآت: <strong>${facilities.length}</strong></p>
            <p>المنشآت النشطة: <strong>${facilities.filter(f => f.status === 'active').length}</strong></p>
            <p>المنشآت غير النشطة: <strong>${facilities.filter(f => f.status === 'inactive').length}</strong></p>
        </div>
    `;
    
    document.getElementById('reportResult').innerHTML = reportHtml;
}

function generateUserActivityReport() {
    const reportHtml = `
        <div class="report-result">
            <h3>👥 تقرير نشاط المستخدمين</h3>
            <p>إجمالي المستخدمين: <strong>${users.length}</strong></p>
            <p>المستخدمين النشطين: <strong>${users.filter(u => u.status === 'active').length}</strong></p>
            <p>المدراء: <strong>${users.filter(u => u.role === 'admin').length}</strong></p>
        </div>
    `;
    
    document.getElementById('reportResult').innerHTML = reportHtml;
}

function exportAllData() {
    const allData = {
        facilities: facilities,
        users: users,
        kpiData: kpiData,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_data_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccess('تم تصدير البيانات بنجاح');
}

// ========================================
// التنقل بين الأقسام
// ========================================

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // تحميل المحتوى حسب القسم
    if (sectionId === 'kpiManagement') {
        loadKPIManagement();
    } else if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'facilities') {
        loadFacilitiesManagement();
    } else if (sectionId === 'users') {
        loadUsersManagement();
    } else if (sectionId === 'reports') {
        loadReports();
    }
}
// ========================================
// الحصول على المؤشرات المخصصة
// ========================================

function getCustomKPIsForDataType(dataTypeId) {
    const allKPIs = getFromStorage('customKPIs', []);
    return allKPIs.filter(kpi => kpi.dataType === dataTypeId);
}

function getCustomKPIsForCategory(dataTypeId, categoryId) {
    const allKPIs = getFromStorage('customKPIs', []);
    return allKPIs.filter(kpi => kpi.dataType === dataTypeId && kpi.category === categoryId);
}

function getCustomKPIsForSubcategory(dataTypeId, categoryId, subcategoryId) {
    const allKPIs = getFromStorage('customKPIs', []);
    return allKPIs.filter(kpi => 
        kpi.dataType === dataTypeId && 
        kpi.category === categoryId && 
        kpi.subcategory === subcategoryId
    );
}

console.log('✅ Admin main script loaded (v2.0 - Complete)');
