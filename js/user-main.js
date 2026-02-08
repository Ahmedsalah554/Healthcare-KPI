/**
 * ===== نظام المستخدم - إدخال البيانات (v3.0 - مع نظام القفل) =====
 */

let currentUser = null;
let currentFacility = null;
let selectedDataType = null;
let selectedCategory = null;
let selectedSubcategory = null;

// ========================================
// تسجيل الدخول
// ========================================

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
        
        // جلب بيانات المنشأة
        if (user.facility) {
            const facilities = getFromStorage('facilities', []);
            currentFacility = facilities.find(f => f.id === user.facility);
        }
        
        saveToStorage('currentUser', currentUser);
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        showUserPanel();
        
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

function displayUserInfo() {
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const facilityNameDisplay = document.getElementById('facilityNameDisplay');
        
        console.log('👤 Displaying user info:', {
            user: currentUser.name,
            facility: currentFacility ? currentFacility.name : 'غير محدد'
        });
        
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser.name;
        }
        
        if (currentFacility && facilityNameDisplay) {
            facilityNameDisplay.textContent = currentFacility.name;
        } else if (facilityNameDisplay) {
            facilityNameDisplay.textContent = 'غير محدد';
        }
    }
}

function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        currentUser = null;
        currentFacility = null;
        selectedDataType = null;
        selectedCategory = null;
        selectedSubcategory = null;
        
        removeFromStorage('currentUser');
        
        const loginPage = document.getElementById('loginPage');
        const appPage = document.getElementById('appPage');
        
        if (loginPage) loginPage.style.display = 'flex';
        if (appPage) appPage.style.display = 'none';
        
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        console.log('🚪 User logged out');
    }
}

// ========================================
// تحميل البيانات
// ========================================

function loadUserData() {
    // جلب بيانات المستخدم المحفوظة
    const savedUser = getFromStorage('currentUser');
    
    if (savedUser) {
        currentUser = savedUser;
        
        if (currentUser.facility) {
            const facilities = getFromStorage('facilities', []);
            currentFacility = facilities.find(f => f.id === currentUser.facility);
        }
        
        console.log('👤 User data loaded:', {
            user: currentUser.name,
            facility: currentFacility ? currentFacility.name : 'غير محدد'
        });
    }
}

// ========================================
// إدخال البيانات - الصفحة الرئيسية
// ========================================

function loadDataEntry() {
    console.log('📝 Loading data entry...');
    
    const container = document.getElementById('mainDataEntry');
    
    if (!container) {
        console.error('❌ mainDataEntry container not found!');
        return;
    }
    
    console.log('✅ Container found!');
    
    const dataTypes = getAllDataTypes();
    console.log('📊 Data types:', dataTypes);
    
    if (!dataTypes || dataTypes.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">لا توجد أنواع بيانات متاحة</div>';
        return;
    }
    
    let html = `
        <div class="page-header">
            <h1>📋 إدخال بيانات المؤشرات</h1>
            <div class="breadcrumb">المنشأة: ${currentFacility ? currentFacility.name : 'غير محدد'}</div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 25px; font-size: 1.5rem;">اختر نوع البيانات:</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
    `;
    
    dataTypes.forEach(dataType => {
        html += `
            <div onclick="selectDataType('${dataType.id}')" style="
                background: white;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                border-left: 4px solid ${dataType.color};
            " onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)';" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.08)';">
                
                <div style="font-size: 3rem; margin-bottom: 15px;">${dataType.icon}</div>
                
                <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem;">${dataType.name}</h4>
                
                <p style="color: #666; font-size: 0.9rem; line-height: 1.5; min-height: 60px;">${dataType.description}</p>
                
                <span style="
                    background: ${dataType.color}20;
                    color: ${dataType.color};
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-block;
                    margin-top: 10px;
                ">${getInputTypeLabel(dataType.inputType)}</span>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    console.log('✅ Data entry HTML loaded successfully!');
    console.log('📊 Total data types shown:', dataTypes.length);
}

// ========================================
// اختيار نوع البيانات
// ========================================

function selectDataType(dataTypeId) {
    console.log('✅ Selected data type:', dataTypeId);
    
    selectedDataType = dataTypeId;
    selectedCategory = null;
    selectedSubcategory = null;
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    if (!dataType) {
        console.error('❌ Data type not found:', dataTypeId);
        showError('نوع البيانات غير موجود');
        return;
    }
    
    // إخفاء الصفحة الرئيسية
    const mainDataEntry = document.getElementById('mainDataEntry');
    if (mainDataEntry) {
        mainDataEntry.style.display = 'none';
    }
    
    // عرض صفحة إدخال البيانات
    showDataEntryPage(dataType);
}

function showDataEntryPage(dataType) {
    const appContent = document.querySelector('.app-content');
    
    if (!appContent) {
        console.error('❌ app-content not found!');
        return;
    }
    
    // إنشاء صفحة جديدة
    let dataEntryPage = document.getElementById('dataEntryPage');
    
    if (!dataEntryPage) {
        dataEntryPage = document.createElement('div');
        dataEntryPage.id = 'dataEntryPage';
        appContent.appendChild(dataEntryPage);
    }
    
    const categories = dataType.categories;
    
    let html = `
        <div style="animation: fadeIn 0.3s;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${dataType.color} 0%, ${dataType.color}cc 100%); color: white; padding: 25px 30px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <button onclick="backToMainMenu()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-bottom: 15px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ← العودة للقائمة الرئيسية
                </button>
                <h2 style="margin: 0; font-size: 1.8rem;">${dataType.icon} ${dataType.name}</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 1rem;">${dataType.description}</p>
            </div>
            
            <!-- Categories Grid -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;">
    `;
    
    Object.values(categories).forEach(category => {
        // التحقق من حالة إدخال البيانات
        const entryStatus = checkDataEntryStatus(dataType.id, category.id);
        const isLocked = entryStatus.isLocked;
        const hasData = entryStatus.hasData;
        
        let statusBadge = '';
        let cardStyle = '';
        let clickable = true;
        
        if (isLocked) {
            statusBadge = '<div style="background: #f44336; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; margin-top: 10px;">🔒 مقفل</div>';
            cardStyle = 'opacity: 0.6; cursor: not-allowed;';
            clickable = false;
        } else if (hasData) {
            statusBadge = '<div style="background: #4caf50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; margin-top: 10px;">✅ تم الإدخال</div>';
            cardStyle = 'border: 2px solid #4caf50;';
        } else {
            statusBadge = '<div style="background: #ff9800; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; margin-top: 10px;">⏳ في انتظار الإدخال</div>';
        }
        
        const onclick = clickable ? `onclick="selectCategoryForEntry('${dataType.id}', '${category.id}')"` : '';
        
        html += `
            <div ${onclick} style="
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                text-align: center;
                border-top: 3px solid ${category.color};
                transition: all 0.3s;
                ${cardStyle}
                ${clickable ? 'cursor: pointer;' : ''}
            " ${clickable ? `onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 5px 20px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.08)'"` : ''}>
                
                <div style="font-size: 2.5rem; color: ${category.color}; margin-bottom: 10px;">${category.icon}</div>
                <h4 style="color: #2c3e50; font-size: 1rem; margin: 0 0 5px 0;">${category.name}</h4>
                ${statusBadge}
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div id="categoryEntryForm" style="margin-top: 30px;"></div>
        </div>
    `;
    
    dataEntryPage.innerHTML = html;
    dataEntryPage.style.display = 'block';
}

// ========================================
// التحقق من حالة إدخال البيانات
// ========================================

function checkDataEntryStatus(dataTypeId, categoryId, subcategoryId = null) {
    const lockKey = `lock_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${currentUser.id}`;
    const dataKey = `data_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${currentUser.id}`;
    
    const isLocked = getFromStorage(lockKey, false);
    const hasData = getFromStorage(dataKey, null) !== null;
    
    return { isLocked, hasData };
}

// ========================================
// اختيار القسم لإدخال البيانات
// ========================================

function selectCategoryForEntry(dataTypeId, categoryId) {
    const entryStatus = checkDataEntryStatus(dataTypeId, categoryId);
    
    if (entryStatus.isLocked) {
        showError('🔒 هذا القسم مقفل! يرجى التواصل مع المسؤول لإعادة فتحه.');
        return;
    }
    
    const dataType = getDataTypeInfo(dataTypeId);
    const category = dataType.categories[categoryId];
    
    // التحقق من الأقسام الفرعية
    if (hasSubcategories(dataTypeId)) {
        const subcategories = getSubcategories(dataTypeId, categoryId);
        
        if (subcategories && Object.keys(subcategories).length > 0) {
            showSubcategoryEntrySelection(dataType, categoryId, subcategories);
            return;
        }
    }
    
    // عرض نموذج الإدخال
    showCategoryEntryForm(dataType, categoryId);
}

function showSubcategoryEntrySelection(dataType, categoryId, subcategories) {
    const formContainer = document.getElementById('categoryEntryForm');
    if (!formContainer) return;
    
    const category = dataType.categories[categoryId];
    
    let html = `
        <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">اختر القسم الفرعي من ${category.name}:</h3>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px;">
    `;
    
    Object.values(subcategories).forEach(subcategory => {
        const entryStatus = checkDataEntryStatus(dataType.id, categoryId, subcategory.id);
        const isLocked = entryStatus.isLocked;
        const hasData = entryStatus.hasData;
        
        let statusBadge = '';
        let cardStyle = '';
        let clickable = true;
        
        if (isLocked) {
            statusBadge = '<div style="background: #f44336; color: white; padding: 4px 8px; border-radius: 15px; font-size: 0.75rem; margin-top: 8px;">🔒</div>';
            cardStyle = 'opacity: 0.6; cursor: not-allowed;';
            clickable = false;
        } else if (hasData) {
            statusBadge = '<div style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 15px; font-size: 0.75rem; margin-top: 8px;">✅</div>';
            cardStyle = 'border: 2px solid #4caf50;';
        }
        
        const onclick = clickable ? `onclick="selectSubcategoryForEntry('${dataType.id}', '${categoryId}', '${subcategory.id}')"` : '';
        
        html += `
            <div ${onclick} style="
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                text-align: center;
                transition: all 0.3s;
                ${cardStyle}
                ${clickable ? 'cursor: pointer;' : ''}
            " ${clickable ? `onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'"` : ''}>
                
                <div style="font-size: 2rem; margin-bottom: 8px;">${subcategory.icon || '📋'}</div>
                <h4 style="color: #2c3e50; font-size: 0.85rem; margin: 0;">${subcategory.name}</h4>
                ${statusBadge}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    formContainer.innerHTML = html;
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function selectSubcategoryForEntry(dataTypeId, categoryId, subcategoryId) {
    const entryStatus = checkDataEntryStatus(dataTypeId, categoryId, subcategoryId);
    
    if (entryStatus.isLocked) {
        showError('🔒 هذا القسم الفرعي مقفل! يرجى التواصل مع المسؤول.');
        return;
    }
    
    const dataType = getDataTypeInfo(dataTypeId);
    showCategoryEntryForm(dataType, categoryId, subcategoryId);
}

// ========================================
// عرض نموذج الإدخال
// ========================================

function showCategoryEntryForm(dataType, categoryId, subcategoryId = null) {
    const formContainer = document.getElementById('categoryEntryForm');
    if (!formContainer) return;
    
    const category = dataType.categories[categoryId];
    const subcategory = subcategoryId ? getSubcategories(dataType.id, categoryId)[subcategoryId] : null;
    
    let html = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: ${category.color}20; padding: 20px; border-radius: 10px; border-right: 4px solid ${category.color}; margin-bottom: 25px;">
                <h3 style="margin: 0 0 5px 0; color: #2c3e50;">إدخال بيانات: ${category.name}</h3>
                ${subcategory ? `<p style="margin: 0; color: #666;">القسم الفرعي: ${subcategory.name}</p>` : ''}
            </div>
            
            <form onsubmit="submitCategoryData(event, '${dataType.id}', '${categoryId}', ${subcategoryId ? `'${subcategoryId}'` : 'null'})">
    `;
    
    // نموذج الإدخال حسب نوع البيانات
    if (dataType.inputType === 'count') {
        html += `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">العدد *</label>
                <input type="number" id="inputCount" required min="0" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                " placeholder="أدخل العدد">
            </div>
        `;
    } else if (dataType.inputType === 'assessment') {
        html += `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">التقييم *</label>
                <select id="inputAssessment" required style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                ">
                    <option value="">-- اختر التقييم --</option>
                    <option value="2">⭐⭐ ممتاز</option>
                    <option value="1">⭐ جيد</option>
                    <option value="0">❌ ضعيف</option>
                    <option value="N/A">⚪ لا ينطبق</option>
                </select>
            </div>
        `;
    } else if (dataType.inputType === 'formula' || dataType.inputType === 'monthly_data') {
        html += `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">القيمة *</label>
                <input type="number" id="inputValue" required step="0.01" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                " placeholder="أدخل القيمة">
            </div>
        `;
    }
    
    html += `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">ملاحظات (اختياري)</label>
                    <textarea id="inputNotes" rows="4" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 1rem;
                        resize: vertical;
                    " placeholder="أضف ملاحظاتك هنا..."></textarea>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button type="submit" style="
                        flex: 1;
                        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                        color: white;
                        padding: 14px;
                        border: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(76,175,80,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        💾 حفظ البيانات
                    </button>
                    
                    <button type="button" onclick="document.getElementById('categoryEntryForm').innerHTML=''" style="
                        background: #9e9e9e;
                        color: white;
                        padding: 14px 30px;
                        border: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='#757575'" onmouseout="this.style.background='#9e9e9e'">
                        ❌ إلغاء
                    </button>
                </div>
            </form>
        </div>
    `;
    
    formContainer.innerHTML = html;
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// حفظ البيانات وقفل القسم
// ========================================

function submitCategoryData(event, dataTypeId, categoryId, subcategoryId = null) {
    event.preventDefault();
    
    const dataType = getDataTypeInfo(dataTypeId);
    
    let data = {
        dataType: dataTypeId,
        category: categoryId,
        subcategory: subcategoryId,
        user: currentUser.id,
        userName: currentUser.name,
        facility: currentFacility ? currentFacility.id : null,
        facilityName: currentFacility ? currentFacility.name : null,
        timestamp: new Date().toISOString()
    };
    
    // جمع البيانات حسب النوع
    if (dataType.inputType === 'count') {
        data.count = parseInt(document.getElementById('inputCount').value);
    } else if (dataType.inputType === 'assessment') {
        data.assessment = document.getElementById('inputAssessment').value;
    } else if (dataType.inputType === 'formula' || dataType.inputType === 'monthly_data') {
        data.value = parseFloat(document.getElementById('inputValue').value);
    }
    
    const notesField = document.getElementById('inputNotes');
    if (notesField) {
        data.notes = notesField.value;
    }
    
    // حفظ البيانات
    const dataKey = `data_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${currentUser.id}`;
    const lockKey = `lock_${dataTypeId}_${categoryId}${subcategoryId ? '_' + subcategoryId : ''}_${currentUser.id}`;
    
    saveToStorage(dataKey, data);
    saveToStorage(lockKey, true); // قفل القسم
    
    // حفظ في قائمة البيانات العامة للأدمن
    let allData = getFromStorage('allUserData', []);
    allData.push(data);
    saveToStorage('allUserData', allData);
    
    showSuccess('✅ تم حفظ البيانات بنجاح! القسم الآن مقفل.');
    
    // إعادة تحميل الصفحة
    setTimeout(() => {
        showDataEntryPage(dataType);
    }, 1500);
}

// ========================================
// العودة للقائمة الرئيسية
// ========================================

function backToMainMenu() {
    const dataEntryPage = document.getElementById('dataEntryPage');
    const mainDataEntry = document.getElementById('mainDataEntry');
    
    if (dataEntryPage) {
        dataEntryPage.style.display = 'none';
    }
    
    if (mainDataEntry) {
        mainDataEntry.style.display = 'block';
    }
    
    selectedDataType = null;
    selectedCategory = null;
    selectedSubcategory = null;
}

// ========================================
// تهيئة النظام عند التحميل
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 User system initializing...');
    
    loadUserData();
    
    console.log('✅ User system ready');
});

console.log('✅ User main script loaded (v3.0 - Lock System)');
