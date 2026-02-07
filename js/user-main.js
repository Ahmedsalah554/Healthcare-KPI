/**
 * ===== السكريبت الرئيسي لنظام المستخدم =====
 */

// متغيرات عامة
let currentUser = null;
let currentFacility = null;
let selectedKPI = null;
let userKPIData = [];
let currentDataType = 'performance'; // نوع البيانات الحالي
let selectedMonth = null;
let selectedCategory = null;

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
    selectedMonth = today.substring(0, 7); // YYYY-MM
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
    
    // عرض واجهة اختيار نوع البيانات
    showDataTypeSelection();
    
    // تحميل البيانات المدخلة
    loadDataHistory();
    
    // تحديث breadcrumb
    if (currentUser) {
        const breadcrumb = document.getElementById('facilityBreadcrumb');
        if (breadcrumb) {
            breadcrumb.textContent = currentUser.facilityName;
        }
    }
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    // البحث عن المستخدم في قاعدة البيانات
    const users = getFromStorage('users', []);
    const user = users.find(u => u.email === email && u.password === password && u.status === 'active');
    
    if (user) {
        // جلب معلومات المنشأة
        const facilities = getFromStorage('facilities', []);
        const facility = facilities.find(f => f.id === user.facility);
        
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            facility: user.facility,
            facilityType: user.facilityType || facility?.type || 'hospital', // نوع المنشأة
            facilityName: facility ? facility.name : 'غير محدد'
        };
        
        saveToStorage('currentUserApp', currentUser);
        showSuccess('تم تسجيل الدخول بنجاح');
        showAppPage();
    } else {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ بيانات الدخول غير صحيحة';
            errorDiv.style.display = 'block';
        }
    }
}

// معالجة تسجيل الخروج
function handleUserLogout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        removeFromStorage('currentUserApp');
        currentUser = null;
        showLoginPage();
        showSuccess('تم تسجيل الخروج بنجاح');
    }
}

// عرض معلومات المستخدم
function displayUserInfo() {
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userFacilityDisplay = document.getElementById('userFacilityDisplay');
        
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
        if (userFacilityDisplay) userFacilityDisplay.textContent = `🏥 ${currentUser.facilityName}`;
    }
}

// تحميل البيانات
function loadUserData() {
    userKPIData = getFromStorage('userKPIData', []);
    
    // فلترة البيانات الخاصة بالمستخدم الحالي فقط
    if (currentUser) {
        userKPIData = userKPIData.filter(entry => 
            entry.userId === currentUser.id || entry.facility === currentUser.facility
        );
    }
    
    console.log('📊 User data loaded:', userKPIData.length);
}

/**
 * ===== اختيار نوع البيانات =====
 */

// عرض واجهة اختيار نوع البيانات
function showDataTypeSelection() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header">
            <h1>📊 إدخال البيانات</h1>
            <p>اختر نوع البيانات المراد إدخالها</p>
        </div>
        
        <div class="data-type-grid">
            ${Object.keys(DATA_TYPES).map(typeKey => {
                const type = DATA_TYPES[typeKey];
                const availableKPIs = getKPIsForFacilityType(type.id, currentUser.facilityType);
                
                return `
                    <div class="data-type-card" onclick="selectDataTypeForEntry('${type.id}')" 
                         style="border-left: 4px solid ${type.color};">
                        <div class="card-icon" style="color: ${type.color};">${type.icon}</div>
                        <h3>${type.name}</h3>
                        <p>${type.description}</p>
                        <div class="card-footer">
                            <span class="badge" style="background: ${type.color};">
                                ${availableKPIs.length} مؤشر متاح
                            </span>
                            <span class="badge-secondary">
                                ${type.frequency === 'monthly' ? '📅 شهري' : '📅 سنوي'}
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="card mt-20">
            <div class="card-header">
                <h3>📋 البيانات المدخلة مؤخراً</h3>
            </div>
            <div class="card-body" id="recentEntriesContainer">
                <!-- سيتم تحميل البيانات المدخلة هنا -->
            </div>
        </div>
    `;
    
    // تحميل البيانات المدخلة مؤخراً
    loadRecentEntries();
}

// تحميل البيانات المدخلة مؤخراً
function loadRecentEntries() {
    const container = document.getElementById('recentEntriesContainer');
    
    if (!userKPIData || userKPIData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>لم تقم بإدخال أي بيانات بعد</p>
            </div>
        `;
        return;
    }
    
    // أحدث 5 إدخالات
    const recentEntries = [...userKPIData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    container.innerHTML = `
        <div class="entries-list">
            ${recentEntries.map(entry => {
                const dataTypeInfo = DATA_TYPES[entry.dataType];
                return `
                    <div class="entry-item">
                        <div class="entry-icon">${dataTypeInfo?.icon || '📊'}</div>
                        <div class="entry-info">
                            <h4>${dataTypeInfo?.name || entry.dataType}</h4>
                            <p>${entry.categoryName || entry.category || 'غير محدد'}</p>
                            <small>📅 ${formatDateArabic(entry.createdAt)}</small>
                        </div>
                        <div class="entry-actions">
                            <button class="btn-icon" onclick="viewEntry('${entry.id}')" title="عرض">
                                👁️
                            </button>
                            <button class="btn-icon" onclick="editEntry('${entry.id}')" title="تعديل">
                                ✏️
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// اختيار نوع البيانات للإدخال
function selectDataTypeForEntry(dataType) {
    currentDataType = dataType;
    
    // التحقق من وجود مؤشرات متاحة
    const availableKPIs = getKPIsForFacilityType(dataType, currentUser.facilityType);
    
    if (availableKPIs.length === 0) {
        showError('لا توجد مؤشرات متاحة لنوع منشأتك في هذه الفئة');
        return;
    }
    
    // عرض واجهة اختيار الشهر والفئة
    showMonthAndCategorySelection(dataType);
}

/**
 * ===== اختيار الشهر والفئة =====
 */

// عرض واجهة اختيار الشهر والفئة
function showMonthAndCategorySelection(dataType) {
    const mainContent = document.getElementById('mainContent');
    const dataTypeInfo = DATA_TYPES[dataType];
    
    // جلب الفئات المتاحة
    const allCategories = getCategoriesByDataType(dataType);
    const availableCategories = getAvailableCategoriesForUser(dataType);
    
    mainContent.innerHTML = `
        <div class="page-header">
            <button class="btn btn-secondary btn-small" onclick="showDataTypeSelection()">
                ← رجوع
            </button>
            <h1>${dataTypeInfo.icon} ${dataTypeInfo.name}</h1>
            <p>اختر ${dataTypeInfo.frequency === 'monthly' ? 'الشهر' : 'السنة'} والفئة</p>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div class="form-group">
                    <label>${dataTypeInfo.frequency === 'monthly' ? '📅 الشهر' : '📅 السنة'} *</label>
                    <input type="${dataTypeInfo.frequency === 'monthly' ? 'month' : 'number'}" 
                           id="selectedPeriod" 
                           value="${dataTypeInfo.frequency === 'monthly' ? selectedMonth : new Date().getFullYear()}"
                           onchange="updateAvailableCategories('${dataType}')">
                </div>
                
                <div class="form-group">
                    <label>${dataType === 'excellence' ? '📋 الإدارة المسؤولة' : dataType === 'monitoring' ? '📋 القسم' : '📋 الفئة'} *</label>
                    <select id="selectedCategory" onchange="proceedToDataEntry('${dataType}')">
                        <option value="">اختر...</option>
                    </select>
                    <small id="categoryHint" style="color: #666; display: block; margin-top: 5px;">
                        سيتم إخفاء الفئات المدخلة تلقائياً
                    </small>
                </div>
            </div>
        </div>
        
        <div class="card" id="enteredCategoriesCard" style="display: none;">
            <div class="card-header">
                <h3>✅ الفئات المدخلة</h3>
            </div>
            <div class="card-body" id="enteredCategoriesList">
                <!-- سيتم عرض الفئات المدخلة هنا -->
            </div>
        </div>
    `;
    
    // تحديث قائمة الفئات المتاحة
    updateAvailableCategories(dataType);
}

// تحديث الفئات المتاحة
function updateAvailableCategories(dataType) {
    const periodInput = document.getElementById('selectedPeriod');
    const categorySelect = document.getElementById('selectedCategory');
    const period = periodInput.value;
    
    if (!period) return;
    
    selectedMonth = period;
    
    // جلب الفئات المتاحة (غير المدخلة)
    const availableCategories = getAvailableCategoriesForUser(dataType, period);
    
    // تحديث القائمة المنسدلة
    categorySelect.innerHTML = '<option value="">اختر...</option>';
    
    Object.keys(availableCategories).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${key} - ${availableCategories[key]}`;
        categorySelect.appendChild(option);
    });
    
    // عرض الفئات المدخلة
    displayEnteredCategories(dataType, period);
    
    // إظهار رسالة إذا كل الفئات مدخلة
    if (Object.keys(availableCategories).length === 0) {
        categorySelect.innerHTML = '<option value="">تم إدخال جميع الفئات ✅</option>';
        categorySelect.disabled = true;
        showSuccess('تم إدخال جميع الفئات لهذه الفترة! 🎉');
    } else {
        categorySelect.disabled = false;
    }
}

// جلب الفئات المتاحة للمستخدم (غير المدخلة)
function getAvailableCategoriesForUser(dataType, period = null) {
    const allCategories = getCategoriesByDataType(dataType);
    const selectedPeriod = period || selectedMonth;
    
    // جلب الفئات المدخلة
    const enteredCategories = userKPIData.filter(entry => 
        entry.dataType === dataType &&
        entry.userId === currentUser.id &&
        entry.month === selectedPeriod &&
        entry.status === 'completed'
    ).map(entry => entry.category || entry.department || entry.section);
    
    // إرجاع الفئات غير المدخلة فقط
    const availableCategories = {};
    Object.keys(allCategories).forEach(key => {
        if (!enteredCategories.includes(key)) {
            // التحقق من وجود مؤشرات متاحة لهذه الفئة
            const kpis = getAvailableKPIs(dataType, key, currentUser.facilityType);
            if (kpis.length > 0) {
                availableCategories[key] = allCategories[key];
            }
        }
    });
    
    return availableCategories;
}

// عرض الفئات المدخلة
function displayEnteredCategories(dataType, period) {
    const card = document.getElementById('enteredCategoriesCard');
    const container = document.getElementById('enteredCategoriesList');
    
    // جلب الفئات المدخلة
    const enteredEntries = userKPIData.filter(entry => 
        entry.dataType === dataType &&
        entry.userId === currentUser.id &&
        entry.month === period
    );
    
    if (enteredEntries.length === 0) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    container.innerHTML = `
        <div class="entered-categories-list">
            ${enteredEntries.map(entry => {
                const categoryName = getCategoryName(dataType, entry.category || entry.department || entry.section);
                return `
                    <div class="entered-category-item">
                        <div class="category-info">
                            <strong>✓ ${categoryName}</strong>
                            <small>📅 ${formatDateArabic(entry.createdAt)}</small>
                        </div>
                        <div class="category-actions">
                            <button class="btn-icon btn-small" onclick="viewEntry('${entry.id}')" title="عرض">
                                👁️
                            </button>
                            <button class="btn-icon btn-small" onclick="editEntry('${entry.id}')" title="تعديل">
                                ✏️
                            </button>
                            <button class="btn-icon btn-small btn-danger" onclick="confirmDeleteEntry('${entry.id}')" title="حذف">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// المتابعة لإدخال البيانات
function proceedToDataEntry(dataType) {
    const categorySelect = document.getElementById('selectedCategory');
    const category = categorySelect.value;
    
    if (!category) {
        showError('الرجاء اختيار الفئة');
        return;
    }
    
    selectedCategory = category;
    
    // عرض نموذج إدخال البيانات
    showDataEntryForm(dataType, category);
}

/**
 * ===== نموذج إدخال البيانات =====
 */

// عرض نموذج إدخال البيانات
function showDataEntryForm(dataType, category) {
    const mainContent = document.getElementById('mainContent');
    const dataTypeInfo = DATA_TYPES[dataType];
    const categoryName = getCategoryName(dataType, category);
    
    // جلب المؤشرات المتاحة لهذه الفئة ونوع المنشأة
    const kpis = getAvailableKPIs(dataType, category, currentUser.facilityType);
    
    if (kpis.length === 0) {
        showError('لا توجد مؤشرات متاحة لهذه الفئة');
        showMonthAndCategorySelection(dataType);
        return;
    }
    
    mainContent.innerHTML = `
        <div class="page-header">
            <button class="btn btn-secondary btn-small" onclick="showMonthAndCategorySelection('${dataType}')">
                ← رجوع
            </button>
            <div>
                <h1>${dataTypeInfo.icon} ${categoryName}</h1>
                <p>🏥 ${currentUser.facilityName} | 📅 ${selectedMonth}</p>
            </div>
        </div>
        
        <form id="dataEntryForm" onsubmit="handleDataEntrySubmit(event, '${dataType}', '${category}')">
            <div class="card">
                <div class="card-header">
                    <h3>إدخال البيانات (${kpis.length} مؤشر)</h3>
                    <div class="progress-indicator">
                        <span id="progressText">0 / ${kpis.length}</span>
                    </div>
                </div>
                <div class="card-body">
                    ${renderKPIInputFields(kpis, dataType)}
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-large">
                    💾 حفظ البيانات
                </button>
                <button type="button" class="btn btn-secondary" onclick="showMonthAndCategorySelection('${dataType}')">
                    ❌ إلغاء
                </button>
            </div>
        </form>
    `;
    
    // إضافة مستمعات للتحديث التلقائي
    addAutoCalculationListeners();
}

// رسم حقول إدخال المؤشرات
function renderKPIInputFields(kpis, dataType) {
    const dataTypeInfo = DATA_TYPES[dataType];
    
    return kpis.map((kpi, index) => {
        if (dataTypeInfo.hasNumeratorDenominator) {
            // مؤشرات الأداء والتميز (بسط/مقام)
            return `
                <div class="kpi-entry-item" data-index="${index}">
                    <div class="kpi-entry-header">
                        <h4>${index + 1}. ${kpi.code} - ${kpi.name}</h4>
                        ${kpi.formula ? `<small>الصيغة: ${kpi.formula}</small>` : ''}
                        ${kpi.target ? `<small>المستهدف: ${kpi.target} ${kpi.unit || ''}</small>` : ''}
                    </div>
                    
                    <div class="kpi-entry-inputs">
                        <div class="form-group">
                            <label>${kpi.numeratorLabel || 'البسط'}</label>
                            <input type="number" 
                                   id="kpi_${kpi.id}_numerator" 
                                   data-kpi-id="${kpi.id}"
                                   class="numerator-input"
                                   step="0.01" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label>${kpi.denominatorLabel || 'المقام'}</label>
                            <input type="number" 
                                   id="kpi_${kpi.id}_denominator" 
                                   data-kpi-id="${kpi.id}"
                                   class="denominator-input"
                                   step="0.01" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label>النتيجة (${kpi.unit || '%'})</label>
                            <input type="number" 
                                   id="kpi_${kpi.id}_result" 
                                   class="result-input"
                                   readonly 
                                   style="background: #f0f0f0;">
                        </div>
                    </div>
                </div>
            `;
        } else if (dataTypeInfo.hasScore) {
            // المتابعة الشهرية (تقييم)
            return `
                <div class="kpi-entry-item" data-index="${index}">
                    <div class="kpi-entry-header">
                        <h4>${index + 1}. ${kpi.name}</h4>
                    </div>
                    
                    <div class="score-selector">
                        <label>
                            <input type="radio" name="kpi_${kpi.id}_score" value="2" required>
                            <span class="score-option score-2">2 - ممتاز</span>
                        </label>
                        <label>
                            <input type="radio" name="kpi_${kpi.id}_score" value="1">
                            <span class="score-option score-1">1 - مقبول</span>
                        </label>
                        <label>
                            <input type="radio" name="kpi_${kpi.id}_score" value="0">
                            <span class="score-option score-0">0 - غير مستوف</span>
                        </label>
                        <label>
                            <input type="radio" name="kpi_${kpi.id}_score" value="N/A">
                            <span class="score-option score-na">N/A - غير متاح</span>
                        </label>
                    </div>
                    
                    <div class="form-group mt-10">
                        <label>ملاحظات (اختياري)</label>
                        <textarea id="kpi_${kpi.id}_notes" rows="2" placeholder="أضف ملاحظات..."></textarea>
                    </div>
                </div>
            `;
        } else if (dataTypeInfo.hasCount) {
            // القوى البشرية (أرقام مباشرة)
            return `
                <div class="kpi-entry-item" data-index="${index}">
                    <div class="kpi-entry-header">
                        <h4>${index + 1}. ${kpi.name}</h4>
                    </div>
                    
                    <div class="form-group">
                        <label>العدد</label>
                        <input type="number" 
                               id="kpi_${kpi.id}_count" 
                               data-kpi-id="${kpi.id}"
                               step="1" 
                               min="0"
                               required>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// إضافة مستمعات للحساب التلقائي
function addAutoCalculationListeners() {
    // حساب النتيجة تلقائياً عند إدخال البسط والمقام
    document.querySelectorAll('.numerator-input, .denominator-input').forEach(input => {
        input.addEventListener('input', function() {
            const kpiId = this.dataset.kpiId;
            const numerator = parseFloat(document.getElementById(`kpi_${kpiId}_numerator`)?.value || 0);
            const denominator = parseFloat(document.getElementById(`kpi_${kpiId}_denominator`)?.value || 0);
            const resultInput = document.getElementById(`kpi_${kpiId}_result`);
            
            if (denominator > 0) {
                const result = (numerator / denominator) * 100;
                resultInput.value = result.toFixed(2);
            } else {
                resultInput.value = '';
            }
            
            updateProgress();
        });
    });
    
    // تحديث التقدم عند تحديد التقييم
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateProgress);
    });
}

// تحديث شريط التقدم
function updateProgress() {
    const totalItems = document.querySelectorAll('.kpi-entry-item').length;
    let completedItems = 0;
    
    document.querySelectorAll('.kpi-entry-item').forEach(item => {
        const numeratorInput = item.querySelector('.numerator-input');
        const scoreInput = item.querySelector('input[type="radio"]:checked');
        const countInput = item.querySelector('input[type="number"]');
        
        if ((numeratorInput && numeratorInput.value) || scoreInput || (countInput && countInput.value)) {
            completedItems++;
        }
    });
    
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `${completedItems} / ${totalItems}`;
    }
}

// معالجة إرسال نموذج البيانات
function handleDataEntrySubmit(event, dataType, category) {
    event.preventDefault();
    
    const dataTypeInfo = DATA_TYPES[dataType];
    const kpis = getAvailableKPIs(dataType, category, currentUser.facilityType);
    const entries = [];
    
    // جمع البيانات المدخلة
    kpis.forEach(kpi => {
        if (dataTypeInfo.hasNumeratorDenominator) {
            const numerator = parseFloat(document.getElementById(`kpi_${kpi.id}_numerator`)?.value || 0);
            const denominator = parseFloat(document.getElementById(`kpi_${kpi.id}_denominator`)?.value || 0);
            const result = denominator > 0 ? (numerator / denominator) * 100 : 0;
            
            entries.push({
                kpiId: kpi.id,
                kpiCode: kpi.code,
                kpiName: kpi.name,
                numerator: numerator,
                denominator: denominator,
                result: result,
                unit: kpi.unit || '%'
            });
        } else if (dataTypeInfo.hasScore) {
            const scoreInput = document.querySelector(`input[name="kpi_${kpi.id}_score"]:checked`);
            const notes = document.getElementById(`kpi_${kpi.id}_notes`)?.value || '';
            
            entries.push({
                kpiId: kpi.id,
                kpiCode: kpi.code,
                kpiName: kpi.name,
                score: scoreInput ? scoreInput.value : null,
                notes: notes
            });
        } else if (dataTypeInfo.hasCount) {
            const count = parseInt(document.getElementById(`kpi_${kpi.id}_count`)?.value || 0);
            
            entries.push({
                kpiId: kpi.id,
                kpiCode: kpi.code,
                kpiName: kpi.name,
                count: count
            });
        }
    });
    
    // إنشاء كائن البيانات
    const entryData = {
        id: generateId(),
        userId: currentUser.id,
        facility: currentUser.facility,
        facilityType: currentUser.facilityType,
        facilityName: currentUser.facilityName,
        dataType: dataType,
        month: selectedMonth,
        entries: entries,
        status: 'completed',
        createdAt: new Date().toISOString()
    };
    
    // إضافة الفئة/الإدارة/القسم حسب النوع
    if (dataType === 'performance') {
        entryData.category = category;
        entryData.categoryName = getCategoryName(dataType, category);
    } else if (dataType === 'excellence') {
        entryData.department = category;
        entryData.categoryName = getCategoryName(dataType, category);
    } else if (dataType === 'monitoring') {
        entryData.section = category;
        entryData.categoryName = getCategoryName(dataType, category);
    } else if (dataType === 'workforce') {
        entryData.category = category;
        entryData.categoryName = getCategoryName(dataType, category);
    }
    
    // حفظ البيانات
    userKPIData.push(entryData);
    saveToStorage('userKPIData', userKPIData);
    
    // حفظ في kpiData العام (للتقارير)
    const allKPIData = getFromStorage('kpiData', []);
    allKPIData.push(entryData);
    saveToStorage('kpiData', allKPIData);
    
    showSuccess('✅ تم حفظ البيانات بنجاح!');
    
    // العودة لاختيار الشهر والفئة
    showMonthAndCategorySelection(dataType);
}

/**
 * ===== عرض وتعديل البيانات المدخلة =====
 */

// عرض البيانات المدخلة
function loadDataHistory() {
    // يتم عرض البيانات المدخلة مؤخراً في الصفحة الرئيسية
    // تم تنفيذه في loadRecentEntries()
}

// عرض تفاصيل إدخال
function viewEntry(entryId) {
    const entry = userKPIData.find(e => e.id === entryId);
    if (!entry) {
        showError('البيانات غير موجودة');
        return;
    }
    
    // TODO: عرض modal بتفاصيل الإدخال
    showInfo('عرض التفاصيل - قيد التطوير');
}

// تعديل إدخال
function editEntry(entryId) {
    const entry = userKPIData.find(e => e.id === entryId);
    if (!entry) {
        showError('البيانات غير موجودة');
        return;
    }
    
    // TODO: فتح نموذج التعديل
    showInfo('تعديل البيانات - قيد التطوير');
}

// حذف إدخال
function confirmDeleteEntry(entryId) {
    if (!confirm('هل أنت متأكد من حذف هذه البيانات؟')) {
        return;
    }
    
    // حذف من البيانات المحلية
    userKPIData = userKPIData.filter(e => e.id !== entryId);
    saveToStorage('userKPIData', userKPIData);
    
    // حذف من البيانات العامة
    let allKPIData = getFromStorage('kpiData', []);
    allKPIData = allKPIData.filter(e => e.id !== entryId);
    saveToStorage('kpiData', allKPIData);
    
    showSuccess('تم حذف البيانات بنجاح');
    
    // تحديث العرض
    if (currentDataType && selectedMonth) {
        updateAvailableCategories(currentDataType);
    } else {
        showDataTypeSelection();
    }
}

// دالة مساعدة لعرض رسالة معلوماتية
function showInfo(message) {
    alert('ℹ️ ' + message);
}
