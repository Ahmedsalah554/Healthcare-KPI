/**
 * ===== السكريبت الرئيسي لواجهة المستخدم (محدث v2.0) =====
 */

let currentUser = null;
let currentFacility = null;
let selectedDataType = null;
let selectedCategory = null;
let selectedSubcategory = null;
let selectedMonth = null;
let selectedYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 User panel initializing...');
    initializeUserPanel();
});

function initializeUserPanel() {
    currentUser = getFromStorage('currentUser');
    
    if (!currentUser) {
        console.log('👤 No user found, showing login page');
        showLoginPage();
    } else {
        console.log('✅ User found:', currentUser.name);
        loadUserData();
        showUserPanel();
    }
}

function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const userPanel = document.getElementById('userPanel');
    
    if (loginPage) {
        loginPage.classList.remove('hide');
        loginPage.style.display = 'flex';
    }
    if (userPanel) {
        userPanel.classList.remove('show');
        userPanel.style.display = 'none';
    }
}

function showUserPanel() {
    const loginPage = document.getElementById('loginPage');
    const appPage = document.getElementById('appPage');
    
    console.log('📊 Showing user panel...');
    
    if (loginPage) {
        loginPage.style.display = 'none';
        console.log('✅ Login page hidden');
    }
    
    if (appPage) {
        appPage.style.display = 'flex';
        console.log('✅ App page displayed');
    }
    
    displayUserInfo();
    
    setTimeout(() => {
        loadDataEntry();
    }, 200);
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
    
    // التحقق من المستخدمين المخزنين
    const users = getFromStorage('users', []);
    const user = users.find(u => u.email === email && u.password === password && u.status === 'active');
    
    if (user) {
        console.log('✅ Login successful');
        
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            facility: user.facility
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
        
        // إظهار واجهة المستخدم
        const userPanel = document.getElementById('userPanel');
        if (userPanel) {
            userPanel.style.display = 'flex';
        }
        
        loadUserData();
        displayUserInfo();
        
        setTimeout(() => {
            loadDataEntry();
        }, 100);
        
        showSuccess('تم تسجيل الدخول بنجاح');
    } else {
        console.log('❌ Invalid credentials');
        if (errorDiv) {
            errorDiv.textContent = '⚠️ بيانات الدخول غير صحيحة أو الحساب غير نشط';
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
        currentFacility = null;
        showLoginPage();
        showSuccess('تم تسجيل الخروج بنجاح');
    }
}

function displayUserInfo() {
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const facilityNameDisplay = document.getElementById('facilityNameDisplay');
        
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
        
        if (currentFacility && facilityNameDisplay) {
            facilityNameDisplay.textContent = currentFacility.name;
        }
    }
}

function loadUserData() {
    if (!currentUser) return;
    
    // تحميل بيانات المنشأة
    const facilities = getFromStorage('facilities', []);
    currentFacility = facilities.find(f => f.id === currentUser.facility);
    
    console.log('📊 User data loaded:', {
        user: currentUser.name,
        facility: currentFacility ? currentFacility.name : 'غير محدد'
    });
}

// ========================================
// إدخال البيانات (محدث v2.0)
// ========================================

function loadDataEntry() {
    console.log('📝 Loading data entry...');
    
    // التأكد من وجود الـ container
    let container = document.getElementById('dataEntryContent');
    
    // إذا مش موجود، جرب categoriesView
    if (!container) {
        container = document.getElementById('categoriesView');
    }
    
    // إذا لسه مش موجود، جرب categoriesContainer
    if (!container) {
        container = document.getElementById('categoriesContainer');
    }
    
    if (!container) {
        console.error('❌ Container not found!');
        console.log('Available elements:', {
            dataEntryContent: document.getElementById('dataEntryContent'),
            categoriesView: document.getElementById('categoriesView'),
            categoriesContainer: document.getElementById('categoriesContainer')
        });
        return;
    }
    
    console.log('✅ Container found:', container.id);
    
    const dataTypes = getAllDataTypes();
    
    let html = `
        <div class="data-entry-container">
            <div class="page-header">
                <h1>📋 إدخال بيانات المؤشرات</h1>
                <div class="breadcrumb">المنشأة: ${currentFacility ? currentFacility.name : 'غير محدد'}</div>
            </div>
            
            <div class="data-type-selector">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">اختر نوع البيانات:</h3>
                <div class="data-type-grid">
    `;
    
    dataTypes.forEach(dataType => {
        html += `
            <div class="data-type-card" onclick="selectDataType('${dataType.id}')" style="border-left: 4px solid ${dataType.color}">
                <div class="data-type-icon" style="font-size: 3rem">${dataType.icon}</div>
                <h4>${dataType.name}</h4>
                <p class="data-type-desc">${dataType.description}</p>
                <span class="input-type-badge" style="background: ${dataType.color}20; color: ${dataType.color}">${getInputTypeLabel(dataType.inputType)}</span>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <div id="categorySection" style="display: none; margin-top: 30px;"></div>
            <div id="entryFormSection" style="display: none; margin-top: 30px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Data entry content loaded!');
}

function selectDataType(dataTypeId) {
    selectedDataType = dataTypeId;
    selectedCategory = null;
    selectedSubcategory = null;
    
    const dataType = getDataTypeInfo(dataTypeId);
    console.log('Selected data type:', dataType);
    
    showCategorySelection(dataType);
}

function showCategorySelection(dataType) {
    const categorySection = document.getElementById('categorySection');
    if (!categorySection) return;
    
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
            <div class="category-card" onclick="selectCategory('${dataType.id}', '${category.id}')" style="border-top: 3px solid ${category.color}">
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
    
    // إخفاء النموذج
    const entryFormSection = document.getElementById('entryFormSection');
    if (entryFormSection) {
        entryFormSection.style.display = 'none';
    }
}

function selectCategory(dataTypeId, categoryId) {
    selectedDataType = dataTypeId;
    selectedCategory = categoryId;
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    // ✅ التحقق من وجود أقسام فرعية
    if (hasSubcategories(dataTypeId)) {
        const subcategories = getSubcategories(dataTypeId, categoryId);
        
        if (Object.keys(subcategories).length > 0) {
            showSubcategorySelection(dataType, categoryId, subcategories);
            return;
        }
    }
    
    // لا توجد أقسام فرعية - عرض النموذج مباشرة
    showEntryForm(dataType, categoryId);
}

function showSubcategorySelection(dataType, categoryId, subcategories) {
    const categorySection = document.getElementById('categorySection');
    if (!categorySection) return;
    
    const category = dataType.categories[categoryId];
    
    let html = `
        <div class="breadcrumb">
            <span onclick="selectDataType('${dataType.id}')" style="cursor: pointer">← ${dataType.icon} ${dataType.name}</span>
            <span class="active">/ ${category.icon} ${category.name}</span>
        </div>
        
        <div class="subcategory-selector">
            <h3>اختر القسم الفرعي:</h3>
            <div class="subcategory-grid">
    `;
    
    Object.values(subcategories).forEach(subcategory => {
        html += `
            <div class="subcategory-card" onclick="selectSubcategory('${dataType.id}', '${categoryId}', '${subcategory.id}')">
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

function selectSubcategory(dataTypeId, categoryId, subcategoryId) {
    selectedDataType = dataTypeId;
    selectedCategory = categoryId;
    selectedSubcategory = subcategoryId;
    
    const dataType = getDataTypeInfo(dataTypeId);
    showEntryForm(dataType, categoryId, subcategoryId);
}
function showEntryForm(dataType, categoryId, subcategoryId = null) {
    const entryFormSection = document.getElementById('entryFormSection');
    if (!entryFormSection) return;
    
    const category = dataType.categories[categoryId];
    const subcategory = subcategoryId ? getSubcategories(dataType.id, categoryId)[subcategoryId] : null;
    
    let breadcrumb = `
        <div class="breadcrumb">
            <span onclick="selectDataType('${dataType.id}')" style="cursor: pointer">← ${dataType.icon} ${dataType.name}</span>
            <span onclick="selectCategory('${dataType.id}', '${categoryId}')" style="cursor: pointer">/ ${category.icon} ${category.name}</span>
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
            <div class="entry-form-card">
                <h3>إدخال بيانات: ${category.name}</h3>
                <p class="form-hint">أدخل العدد الحالي للموظفين في هذا القسم</p>
                <form onsubmit="submitWorkforceData(event)">
                    <div class="form-group">
                        <label>العدد *</label>
                        <input type="number" id="countValue" min="0" required class="form-control" placeholder="أدخل العدد">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">💾 حفظ البيانات</button>
                        <button type="button" onclick="loadDataEntry()" class="btn btn-secondary">❌ إلغاء</button>
                    </div>
                </form>
            </div>
        `;
    } else if (dataType.inputType === 'assessment') {
        // معايير التقييم
        html += `
            <div class="entry-form-card">
                <h3>تقييم المعايير: ${subcategory ? subcategory.name : category.name}</h3>
                <p class="form-hint">قم بتقييم كل معيار وإضافة ملاحظاتك</p>
                
                <div id="assessmentsList">
                    <p style="text-align: center; padding: 20px;">جاري تحميل المعايير...</p>
                </div>
                
                <button onclick="showAddCriteriaForm()" class="btn btn-secondary" style="margin-top: 20px;">➕ إضافة معيار جديد</button>
                
                <div id="addCriteriaForm" style="display: none; margin-top: 20px;">
                    <form onsubmit="submitAssessmentData(event)">
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
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">💾 حفظ التقييم</button>
                            <button type="button" onclick="hideAddCriteriaForm()" class="btn btn-secondary">❌ إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    } else if (dataType.inputType === 'formula') {
        // مؤشرات الأداء الشهري
        html += `
            <div class="entry-form-card">
                <h3>إدخال بيانات المؤشرات: ${category.name}</h3>
                
                <div class="month-year-selector">
                    <div class="form-group">
                        <label>الشهر *</label>
                        <select id="selectedMonth" onchange="loadPerformanceIndicators()" class="form-control">
                            <option value="">اختر الشهر</option>
                            <option value="1">يناير</option>
                            <option value="2">فبراير</option>
                            <option value="3">مارس</option>
                            <option value="4">أبريل</option>
                            <option value="5">مايو</option>
                            <option value="6">يونيو</option>
                            <option value="7">يوليو</option>
                            <option value="8">أغسطس</option>
                            <option value="9">سبتمبر</option>
                            <option value="10">أكتوبر</option>
                            <option value="11">نوفمبر</option>
                            <option value="12">ديسمبر</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>السنة *</label>
                        <input type="number" id="selectedYear" value="${selectedYear}" min="2020" max="2050" onchange="loadPerformanceIndicators()" class="form-control">
                    </div>
                </div>
                
                <div id="performanceIndicatorsList">
                    <p style="text-align: center; padding: 20px; color: #666;">اختر الشهر والسنة لعرض المؤشرات</p>
                </div>
            </div>
        `;
    } else if (dataType.inputType === 'monthly_data') {
        // مؤشرات التميز الشهرية
        html += `
            <div class="entry-form-card">
                <h3>إدخال مؤشرات التميز: ${category.name}</h3>
                
                <div class="month-year-selector">
                    <div class="form-group">
                        <label>الشهر *</label>
                        <select id="excellenceMonth" onchange="loadExcellenceIndicators()" class="form-control">
                            <option value="">اختر الشهر</option>
                            <option value="1">يناير</option>
                            <option value="2">فبراير</option>
                            <option value="3">مارس</option>
                            <option value="4">أبريل</option>
                            <option value="5">مايو</option>
                            <option value="6">يونيو</option>
                            <option value="7">يوليو</option>
                            <option value="8">أغسطس</option>
                            <option value="9">سبتمبر</option>
                            <option value="10">أكتوبر</option>
                            <option value="11">نوفمبر</option>
                            <option value="12">ديسمبر</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>السنة *</label>
                        <input type="number" id="excellenceYear" value="${selectedYear}" min="2020" max="2050" onchange="loadExcellenceIndicators()" class="form-control">
                    </div>
                </div>
                
                <div id="excellenceIndicatorsList">
                    <p style="text-align: center; padding: 20px; color: #666;">اختر الشهر والسنة لعرض المؤشرات</p>
                </div>
            </div>
        `;
    }
    
    entryFormSection.innerHTML = html;
    entryFormSection.style.display = 'block';
    
    // تحميل البيانات الحالية
    if (dataType.inputType === 'assessment') {
        loadCurrentAssessments(dataType.id, categoryId, subcategoryId);
    }
}

// ========================================
// دوال حفظ البيانات
// ========================================

function submitWorkforceData(event) {
    event.preventDefault();
    
    const countValue = parseInt(document.getElementById('countValue').value);
    
    const data = {
        dataType: selectedDataType,
        category: selectedCategory,
        count: countValue,
        facility: currentFacility ? currentFacility.id : null,
        user: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    const result = saveKPI(data);
    
    if (result.success) {
        showSuccess('تم حفظ البيانات بنجاح ✅');
        document.getElementById('countValue').value = '';
    } else {
        showError(result.message);
    }
}

function showAddCriteriaForm() {
    const form = document.getElementById('addCriteriaForm');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideAddCriteriaForm() {
    const form = document.getElementById('addCriteriaForm');
    if (form) {
        form.style.display = 'none';
        // مسح الحقول
        document.getElementById('criteriaName').value = '';
        document.getElementById('assessmentValue').value = '';
        document.getElementById('assessmentNotes').value = '';
    }
}

function submitAssessmentData(event) {
    event.preventDefault();
    
    const criteriaName = document.getElementById('criteriaName').value;
    const assessmentValue = document.getElementById('assessmentValue').value;
    const assessmentNotes = document.getElementById('assessmentNotes').value;
    
    const data = {
        dataType: selectedDataType,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        name: criteriaName,
        assessment: assessmentValue,
        notes: assessmentNotes,
        facility: currentFacility ? currentFacility.id : null,
        user: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    const result = saveKPI(data);
    
    if (result.success) {
        showSuccess('تم حفظ التقييم بنجاح ✅');
        hideAddCriteriaForm();
        loadCurrentAssessments(selectedDataType, selectedCategory, selectedSubcategory);
    } else {
        showError(result.message);
    }
}

function loadCurrentAssessments(dataTypeId, categoryId, subcategoryId = null) {
    const listContainer = document.getElementById('assessmentsList');
    if (!listContainer) return;
    
    let assessments;
    if (subcategoryId) {
        assessments = getKPIsBySubcategory(dataTypeId, categoryId, subcategoryId);
    } else {
        assessments = getKPIsByCategory(dataTypeId, categoryId);
    }
    
    if (assessments.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">لا توجد معايير مضافة بعد</p>';
        return;
    }
    
    let html = '<div class="assessments-table"><table class="data-table"><thead><tr><th>المعيار</th><th>التقييم</th><th>الملاحظات</th><th>الإجراءات</th></tr></thead><tbody>';
    
    assessments.forEach(item => {
        let assessmentBadge = '';
        if (item.assessment === '2') {
            assessmentBadge = '<span class="badge badge-success">⭐⭐ ممتاز</span>';
        } else if (item.assessment === '1') {
            assessmentBadge = '<span class="badge badge-warning">⭐ جيد</span>';
        } else if (item.assessment === '0') {
            assessmentBadge = '<span class="badge badge-danger">❌ ضعيف</span>';
        } else {
            assessmentBadge = '<span class="badge badge-secondary">⚪ لا ينطبق</span>';
        }
        
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${assessmentBadge}</td>
                <td>${item.notes || '-'}</td>
                <td>
                    <button onclick="editAssessment('${item.id}')" class="btn-icon" title="تعديل">✏️</button>
                    <button onclick="deleteAssessment('${dataTypeId}', '${categoryId}', '${item.id}', ${subcategoryId ? `'${subcategoryId}'` : 'null'})" class="btn-icon" title="حذف">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    listContainer.innerHTML = html;
}

function editAssessment(assessmentId) {
    showError('وظيفة التعديل قيد التطوير');
}

function deleteAssessment(dataTypeId, categoryId, assessmentId, subcategoryId = null) {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    
    const result = deleteKPI(dataTypeId, categoryId, assessmentId, subcategoryId);
    
    if (result.success) {
        showSuccess('تم حذف التقييم بنجاح');
        loadCurrentAssessments(dataTypeId, categoryId, subcategoryId);
    } else {
        showError(result.message);
    }
}

function loadPerformanceIndicators() {
    const month = document.getElementById('selectedMonth').value;
    const year = document.getElementById('selectedYear').value;
    const listContainer = document.getElementById('performanceIndicatorsList');
    
    if (!month || !year || !listContainer) {
        if (listContainer) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">اختر الشهر والسنة لعرض المؤشرات</p>';
        }
        return;
    }
    
    selectedMonth = parseInt(month);
    selectedYear = parseInt(year);
    
    // جلب المؤشرات من القسم الحالي
    const indicators = getKPIsByCategory(selectedDataType, selectedCategory);
    
    if (indicators.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">لا توجد مؤشرات مضافة في هذا القسم</p>';
        return;
    }
    
    let html = '<div class="indicators-list">';
    
    indicators.forEach(indicator => {
        const savedData = getMonthlyData(selectedDataType, selectedCategory, selectedYear, selectedMonth)
            .find(d => d.kpiCode === indicator.code);
        
        html += `
            <div class="indicator-card">
                <h4>${indicator.code} - ${indicator.name}</h4>
                <p class="indicator-desc">${indicator.formulaDescription || indicator.description || ''}</p>
                
                <form onsubmit="submitIndicatorData(event, '${indicator.id}', '${indicator.code}', '${indicator.indicatorType}')">
        `;
        
        if (indicator.indicatorType === 'formula') {
            html += `
                <div class="form-row">
                    <div class="form-group">
                        <label>البسط ${indicator.numeratorLabel ? '(' + indicator.numeratorLabel + ')' : ''}</label>
                        <input type="number" id="numerator_${indicator.id}" value="${savedData?.numerator || ''}" min="0" step="0.01" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>المقام ${indicator.denominatorLabel ? '(' + indicator.denominatorLabel + ')' : ''}</label>
                        <input type="number" id="denominator_${indicator.id}" value="${savedData?.denominator || ''}" min="0" step="0.01" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>النتيجة (تلقائي)</label>
                        <input type="text" id="result_${indicator.id}" value="${savedData?.result || '-'}" readonly class="form-control" style="background: #f5f5f5;">
                    </div>
                </div>
            `;
        } else if (indicator.indicatorType === 'direct') {
            html += `
                <div class="form-group">
                    <label>القيمة</label>
                    <input type="number" id="value_${indicator.id}" value="${savedData?.value || ''}" min="0" step="0.01" required class="form-control">
                </div>
            `;
        }
        
        html += `
                    <button type="submit" class="btn btn-primary btn-sm">💾 حفظ</button>
                </form>
            </div>
        `;
    });
    
    html += '</div>';
    listContainer.innerHTML = html;
}

function submitIndicatorData(event, indicatorId, kpiCode, indicatorType) {
    event.preventDefault();
    
    let data = {
        dataType: selectedDataType,
        category: selectedCategory,
        kpiCode: kpiCode,
        month: selectedMonth,
        year: selectedYear,
        indicatorType: indicatorType,
        facility: currentFacility ? currentFacility.id : null,
        user: currentUser.id
    };
    
    if (indicatorType === 'formula') {
        const numerator = parseFloat(document.getElementById(`numerator_${indicatorId}`).value);
        const denominator = parseFloat(document.getElementById(`denominator_${indicatorId}`).value);
        const result = calculateResult('formula', numerator, denominator);
        
        data.numerator = numerator;
        data.denominator = denominator;
        data.result = result;
        
        // عرض النتيجة
        document.getElementById(`result_${indicatorId}`).value = result.toFixed(2) + '%';
    } else if (indicatorType === 'direct') {
        const value = parseFloat(document.getElementById(`value_${indicatorId}`).value);
        data.value = value;
        data.result = value;
    }
    
    const saveResult = saveMonthlyData(data);
    
    if (saveResult.success) {
        showSuccess('تم حفظ البيانات بنجاح ✅');
    } else {
        showError(saveResult.message);
    }
}

function loadExcellenceIndicators() {
    const month = document.getElementById('excellenceMonth').value;
    const year = document.getElementById('excellenceYear').value;
    const listContainer = document.getElementById('excellenceIndicatorsList');
    
    if (!month || !year || !listContainer) {
        if (listContainer) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">اختر الشهر والسنة لعرض المؤشرات</p>';
        }
        return;
    }
    
    selectedMonth = parseInt(month);
    selectedYear = parseInt(year);
    
    const indicators = getKPIsByCategory(selectedDataType, selectedCategory);
    
    if (indicators.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">لا توجد مؤشرات مضافة في هذا القسم</p>';
        return;
    }
    
    let html = '<div class="indicators-list">';
    
    indicators.forEach(indicator => {
        const savedData = getMonthlyData(selectedDataType, selectedCategory, selectedYear, selectedMonth)
            .find(d => d.kpiCode === indicator.code);
        
        html += `
            <div class="indicator-card">
                <h4>${indicator.code} - ${indicator.name}</h4>
                <p class="indicator-desc">${indicator.calculationFormula || ''}</p>
                <p><small>الإدارة المسؤولة: ${indicator.responsibleDepartment}</small></p>
                
                <form onsubmit="submitExcellenceData(event, '${indicator.id}', '${indicator.code}')">
                    <div class="form-row">
                        <div class="form-group">
                            <label>البسط (القيمة الفعلية)</label>
                            <input type="number" id="excellence_numerator_${indicator.id}" value="${savedData?.numerator || ''}" min="0" step="0.01" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label>الهدف</label>
                            <input type="number" id="excellence_target_${indicator.id}" value="${savedData?.target || ''}" min="0" step="0.01" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label>النسبة المئوية (تلقائي)</label>
                            <input type="text" id="excellence_percentage_${indicator.id}" value="${savedData?.percentage ? savedData.percentage.toFixed(2) + '%' : '-'}" readonly class="form-control" style="background: #f5f5f5;">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm">💾 حفظ</button>
                </form>
            </div>
        `;
    });
    
    html += '</div>';
    listContainer.innerHTML = html;
}

function submitExcellenceData(event, indicatorId, kpiCode) {
    event.preventDefault();
    
    const numerator = parseFloat(document.getElementById(`excellence_numerator_${indicatorId}`).value);
    const target = parseFloat(document.getElementById(`excellence_target_${indicatorId}`).value);
    const percentage = calculateResult('monthly_data', numerator, null, target);
    
    const data = {
        dataType: selectedDataType,
        category: selectedCategory,
        kpiCode: kpiCode,
        month: selectedMonth,
        year: selectedYear,
        numerator: numerator,
        target: target,
        percentage: percentage,
        facility: currentFacility ? currentFacility.id : null,
        user: currentUser.id
    };
    
    // عرض النسبة
    document.getElementById(`excellence_percentage_${indicatorId}`).value = percentage.toFixed(2) + '%';
    
    const result = saveMonthlyData(data);
    
    if (result.success) {
        showSuccess('تم حفظ البيانات بنجاح ✅');
    } else {
        showError(result.message);
    }
}
// ========================================
// عرض البيانات
// ========================================

function loadDataView() {
    console.log('👁️ Loading data view...');
    
    const container = document.getElementById('dataViewContent');
    if (!container) return;
    
    const dataTypes = getAllDataTypes();
    
    let html = `
        <div class="data-view-container">
            <div class="section-header">
                <h2>عرض البيانات</h2>
                <p>استعراض البيانات المدخلة</p>
            </div>
            
            <div class="data-type-selector">
                <h3>اختر نوع البيانات:</h3>
                <div class="data-type-grid">
    `;
    
    dataTypes.forEach(dataType => {
        const stats = getKPIStatistics(dataType.id);
        
        html += `
            <div class="data-type-card" onclick="viewDataType('${dataType.id}')" style="border-left: 4px solid ${dataType.color}">
                <div class="data-type-icon" style="font-size: 3rem">${dataType.icon}</div>
                <h4>${dataType.name}</h4>
                <p class="data-type-desc">${dataType.description}</p>
                <div class="stats-badge">
                    <span>📊 ${stats.totalKPIs} مؤشر</span>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <div id="dataViewResults" style="display: none; margin-top: 30px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

function viewDataType(dataTypeId) {
    const resultsContainer = document.getElementById('dataViewResults');
    if (!resultsContainer) return;
    
    const dataType = getDataTypeInfo(dataTypeId);
    const categories = dataType.categories;
    
    let html = `
        <div class="data-view-results">
            <div class="breadcrumb">
                <span onclick="loadDataView()" style="cursor: pointer">← عرض البيانات</span>
                <span class="active">/ ${dataType.icon} ${dataType.name}</span>
            </div>
            
            <h3>البيانات حسب الأقسام:</h3>
    `;
    
    Object.values(categories).forEach(category => {
        const kpis = getKPIsByCategory(dataTypeId, category.id);
        
        html += `
            <div class="category-data-card" style="border-right: 4px solid ${category.color}">
                <div class="category-header">
                    <h4>${category.icon} ${category.name}</h4>
                    <span class="count-badge">${kpis.length} عنصر</span>
                </div>
        `;
        
        if (kpis.length === 0) {
            html += '<p style="color: #666; padding: 20px;">لا توجد بيانات مدخلة</p>';
        } else {
            html += '<div class="data-table-container"><table class="data-table"><thead><tr>';
            
            // رؤوس الجدول حسب نوع البيانات
            if (dataType.inputType === 'count') {
                html += '<th>العدد</th><th>تاريخ الإدخال</th>';
            } else if (dataType.inputType === 'assessment') {
                html += '<th>المعيار</th><th>التقييم</th><th>الملاحظات</th><th>تاريخ الإدخال</th>';
            } else if (dataType.inputType === 'formula') {
                html += '<th>الكود</th><th>المؤشر</th><th>النوع</th><th>الدورية</th>';
            } else if (dataType.inputType === 'monthly_data') {
                html += '<th>الكود</th><th>المؤشر</th><th>الإدارة المسؤولة</th><th>الدورية</th>';
            }
            
            html += '</tr></thead><tbody>';
            
            kpis.forEach(item => {
                html += '<tr>';
                
                if (dataType.inputType === 'count') {
                    html += `
                        <td><strong>${item.count}</strong></td>
                        <td>${formatDateArabic(item.createdAt)}</td>
                    `;
                } else if (dataType.inputType === 'assessment') {
                    let badge = '';
                    if (item.assessment === '2') badge = '<span class="badge badge-success">⭐⭐</span>';
                    else if (item.assessment === '1') badge = '<span class="badge badge-warning">⭐</span>';
                    else if (item.assessment === '0') badge = '<span class="badge badge-danger">❌</span>';
                    else badge = '<span class="badge badge-secondary">⚪</span>';
                    
                    html += `
                        <td>${item.name}</td>
                        <td>${badge}</td>
                        <td>${item.notes || '-'}</td>
                        <td>${formatDateArabic(item.createdAt)}</td>
                    `;
                } else if (dataType.inputType === 'formula') {
                    html += `
                        <td><strong>${item.code}</strong></td>
                        <td>${item.name}</td>
                        <td>${item.indicatorType === 'formula' ? '📊 صيغة حسابية' : '🔢 قيمة مباشرة'}</td>
                        <td>${item.frequency}</td>
                    `;
                } else if (dataType.inputType === 'monthly_data') {
                    html += `
                        <td><strong>${item.code}</strong></td>
                        <td>${item.name}</td>
                        <td>${item.responsibleDepartment || '-'}</td>
                        <td>${item.periodicity}</td>
                    `;
                }
                
                html += '</tr>';
            });
            
            html += '</tbody></table></div>';
        }
        
        html += '</div>';
    });
    
    html += '</div>';
    
    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
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
                <h2>التقارير</h2>
                <p>تقارير شاملة عن البيانات المدخلة</p>
            </div>
            
            <div class="reports-grid">
                <div class="report-card" onclick="generateMyDataReport()">
                    <div class="report-icon">📊</div>
                    <h3>تقرير بياناتي</h3>
                    <p>ملخص شامل لجميع بياناتك</p>
                </div>
                
                <div class="report-card" onclick="generateMonthlyReport()">
                    <div class="report-icon">📅</div>
                    <h3>التقرير الشهري</h3>
                    <p>بيانات الشهر الحالي</p>
                </div>
                
                <div class="report-card" onclick="generateAssessmentReport()">
                    <div class="report-icon">⭐</div>
                    <h3>تقرير التقييمات</h3>
                    <p>ملخص معايير التقييم</p>
                </div>
                
                <div class="report-card" onclick="exportMyData()">
                    <div class="report-icon">💾</div>
                    <h3>تصدير بياناتي</h3>
                    <p>تصدير جميع البيانات</p>
                </div>
            </div>
            
            <div id="reportResult" style="margin-top: 30px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
}

function generateMyDataReport() {
    const reportContainer = document.getElementById('reportResult');
    if (!reportContainer) return;
    
    const dataTypes = getAllDataTypes();
    let totalItems = 0;
    
    let html = `
        <div class="report-result">
            <h3>📊 تقرير بياناتي الشامل</h3>
            <div class="report-stats">
                <div class="stat-card">
                    <div class="stat-icon">📁</div>
                    <div class="stat-info">
                        <h4>أنواع البيانات</h4>
                        <p class="stat-value">${dataTypes.length}</p>
                    </div>
                </div>
    `;
    
    dataTypes.forEach(dataType => {
        const stats = getKPIStatistics(dataType.id);
        totalItems += stats.totalKPIs;
        
        html += `
            <div class="stat-card">
                <div class="stat-icon">${dataType.icon}</div>
                <div class="stat-info">
                    <h4>${dataType.name}</h4>
                    <p class="stat-value">${stats.totalKPIs}</p>
                </div>
            </div>
        `;
    });
    
    html += `
                <div class="stat-card stat-total">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <h4>إجمالي البيانات</h4>
                        <p class="stat-value">${totalItems}</p>
                    </div>
                </div>
            </div>
            
            <div class="report-details">
                <h4>التفاصيل:</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>نوع البيانات</th>
                            <th>عدد الأقسام</th>
                            <th>عدد العناصر</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    dataTypes.forEach(dataType => {
        const stats = getKPIStatistics(dataType.id);
        
        html += `
            <tr>
                <td>${dataType.icon} ${dataType.name}</td>
                <td>${stats.totalCategories}</td>
                <td>${stats.totalKPIs}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    reportContainer.innerHTML = html;
    reportContainer.scrollIntoView({ behavior: 'smooth' });
}

function generateMonthlyReport() {
    const reportContainer = document.getElementById('reportResult');
    if (!reportContainer) return;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    let html = `
        <div class="report-result">
            <h3>📅 التقرير الشهري - ${getMonthNameArabic(currentMonth)} ${currentYear}</h3>
            <p>البيانات المدخلة خلال الشهر الحالي</p>
        </div>
    `;
    
    reportContainer.innerHTML = html;
    showSuccess('تقرير الشهر الحالي قيد التطوير');
}

function generateAssessmentReport() {
    const reportContainer = document.getElementById('reportResult');
    if (!reportContainer) return;
    
    const assessmentType = getDataTypeInfo('hospital_assessment');
    
    if (!assessmentType) {
        reportContainer.innerHTML = '<p>لا توجد بيانات تقييم</p>';
        return;
    }
    
    const allAssessments = getAllKPIsByType('hospital_assessment');
    
    const excellent = allAssessments.filter(a => a.assessment === '2').length;
    const good = allAssessments.filter(a => a.assessment === '1').length;
    const poor = allAssessments.filter(a => a.assessment === '0').length;
    const na = allAssessments.filter(a => a.assessment === 'N/A').length;
    
    let html = `
        <div class="report-result">
            <h3>⭐ تقرير التقييمات</h3>
            <div class="assessment-summary">
                <div class="assessment-stat" style="background: #4caf50;">
                    <h4>⭐⭐ ممتاز</h4>
                    <p class="stat-value">${excellent}</p>
                </div>
                <div class="assessment-stat" style="background: #ff9800;">
                    <h4>⭐ جيد</h4>
                    <p class="stat-value">${good}</p>
                </div>
                <div class="assessment-stat" style="background: #f44336;">
                    <h4>❌ ضعيف</h4>
                    <p class="stat-value">${poor}</p>
                </div>
                <div class="assessment-stat" style="background: #9e9e9e;">
                    <h4>⚪ لا ينطبق</h4>
                    <p class="stat-value">${na}</p>
                </div>
            </div>
            <p style="margin-top: 20px;">إجمالي المعايير المقيمة: <strong>${allAssessments.length}</strong></p>
        </div>
    `;
    
    reportContainer.innerHTML = html;
    reportContainer.scrollIntoView({ behavior: 'smooth' });
}

function exportMyData() {
    const dataTypes = getAllDataTypes();
    const exportData = {
        user: {
            name: currentUser.name,
            email: currentUser.email,
            facility: currentFacility ? currentFacility.name : 'غير محدد'
        },
        exportDate: new Date().toISOString(),
        data: {}
    };
    
    dataTypes.forEach(dataType => {
        exportData.data[dataType.id] = getAllKPIsByType(dataType.id);
    });
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_data_${currentUser.id}_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccess('تم تصدير بياناتك بنجاح ✅');
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
    if (sectionId === 'dataEntry') {
        loadDataEntry();
    } else if (sectionId === 'dataView') {
        loadDataView();
    } else if (sectionId === 'reports') {
        loadReports();
    }
}

// ========================================
// دوال مساعدة
// ========================================

function formatDateArabic(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const monthName = getMonthNameArabic(month);
    
    return `${day} ${monthName} ${year} - ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// ========================================
// رسائل النجاح والخطأ
// ========================================

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.innerHTML = `
        <span class="notification-icon">✅</span>
        <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
        <span class="notification-icon">❌</span>
        <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

console.log('✅ User main script loaded (v2.0 - Complete)');
