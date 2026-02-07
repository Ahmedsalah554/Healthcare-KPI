/**
 * ===== نظام التخزين المحلي (LocalStorage) =====
 */

// حفظ البيانات
function saveToStorage(key, data) {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(key, jsonData);
        console.log(`✅ Data saved to storage: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving to storage:', error);
        return false;
    }
}

// جلب البيانات
function getFromStorage(key, defaultValue = null) {
    try {
        const jsonData = localStorage.getItem(key);
        if (jsonData === null) {
            console.log(`ℹ️ No data found for key: ${key}, returning default value`);
            return defaultValue;
        }
        const data = JSON.parse(jsonData);
        console.log(`✅ Data loaded from storage: ${key}`);
        return data;
    } catch (error) {
        console.error('❌ Error loading from storage:', error);
        return defaultValue;
    }
}

// حذف البيانات
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        console.log(`✅ Data removed from storage: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ Error removing from storage:', error);
        return false;
    }
}

// مسح كل البيانات
function clearAllStorage() {
    try {
        localStorage.clear();
        console.log('✅ All storage cleared');
        return true;
    } catch (error) {
        console.error('❌ Error clearing storage:', error);
        return false;
    }
}

// التحقق من وجود مفتاح
function storageHasKey(key) {
    return localStorage.getItem(key) !== null;
}

// الحصول على حجم التخزين المستخدم (بالـ KB)
function getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return (total / 1024).toFixed(2); // KB
}

// عرض جميع المفاتيح المخزنة
function getAllStorageKeys() {
    return Object.keys(localStorage);
}

// تصدير جميع البيانات
function exportAllStorage() {
    const allData = {};
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            try {
                allData[key] = JSON.parse(localStorage[key]);
            } catch {
                allData[key] = localStorage[key];
            }
        }
    }
    return allData;
}

// استيراد البيانات
function importToStorage(data) {
    try {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                saveToStorage(key, data[key]);
            }
        }
        console.log('✅ Data imported successfully');
        return true;
    } catch (error) {
        console.error('❌ Error importing data:', error);
        return false;
    }
}

// نسخ احتياطي للبيانات
function backupStorage() {
    const backup = exportAllStorage();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi_backup_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('✅ Backup created successfully');
}

// استعادة من نسخة احتياطية
function restoreFromBackup(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                importToStorage(data);
                resolve(true);
            } catch (error) {
                console.error('❌ Error restoring backup:', error);
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject('Failed to read file');
        };
        
        reader.readAsText(file);
    });
}

// دالات مساعدة للبيانات الخاصة بالنظام
function getCurrentUser() {
    return getFromStorage('currentUser');
}

function setCurrentUser(user) {
    return saveToStorage('currentUser', user);
}

function logout() {
    removeFromStorage('currentUser');
    console.log('✅ User logged out');
}

// دوال مساعدة لعرض الرسائل
function showSuccess(message) {
    console.log('✅ Success:', message);
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.innerHTML = `
        <span class="notification-icon">✅</span>
        <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showError(message) {
    console.error('❌ Error:', message);
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
        <span class="notification-icon">❌</span>
        <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // إخفاء الإشعار بعد 4 ثوانٍ
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// تهيئة البيانات الافتراضية (عند أول تشغيل)
function initializeDefaultData() {
    // التحقق من وجود بيانات سابقة
    if (!storageHasKey('initialized')) {
        console.log('🔧 Initializing default data...');
        
        // بيانات افتراضية للمنشآت
        const defaultFacilities = [];
        saveToStorage('facilities', defaultFacilities);
        
        // بيانات افتراضية للمستخدمين
        const defaultUsers = [];
        saveToStorage('users', defaultUsers);
        
        // وضع علامة على التهيئة
        saveToStorage('initialized', true);
        
        console.log('✅ Default data initialized');
    }
}
// ========================================
// دوال مساعدة للتاريخ والوقت
// ========================================

function formatDateArabic(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return '-';
        }
        
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        const monthName = getMonthNameArabic(month);
        
        return `${day} ${monthName} ${year} - ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

function getMonthNameArabic(month) {
    const months = {
        1: 'يناير',
        2: 'فبراير',
        3: 'مارس',
        4: 'أبريل',
        5: 'مايو',
        6: 'يونيو',
        7: 'يوليو',
        8: 'أغسطس',
        9: 'سبتمبر',
        10: 'أكتوبر',
        11: 'نوفمبر',
        12: 'ديسمبر'
    };
    
    return months[month] || '';
}

function getInputTypeLabel(inputType) {
    const labels = {
        'count': '📊 عدد',
        'formula': '🧮 صيغة حسابية',
        'assessment': '⭐ تقييم',
        'monthly_data': '📅 بيانات شهرية',
        'direct': '🔢 قيمة مباشرة'
    };
    
    return labels[inputType] || inputType;
}

function getFacilityTypeName(typeId) {
    const types = getAllFacilityTypes();
    const type = types.find(t => t.id === typeId);
    return type ? `${type.icon} ${type.name}` : typeId;
}

function getAllFacilityTypes() {
    return [
        { id: 'hospital', name: 'مستشفى', icon: '🏥' },
        { id: 'clinic', name: 'عيادة', icon: '🏪' },
        { id: 'center', name: 'مركز صحي', icon: '🏢' },
        { id: 'laboratory', name: 'مختبر', icon: '🔬' },
        { id: 'pharmacy', name: 'صيدلية', icon: '💊' }
    ];
}

function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    
    return parseFloat(num).toFixed(decimals);
}

function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    
    return formatNumber(value, decimals) + '%';
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

function getCurrentDateTime() {
    return new Date().toISOString();
}

function getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isThisMonth(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isThisYear(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getFullYear() === today.getFullYear();
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'الآن';
    } else if (diffMins < 60) {
        return `منذ ${diffMins} دقيقة`;
    } else if (diffHours < 24) {
        return `منذ ${diffHours} ساعة`;
    } else if (diffDays < 7) {
        return `منذ ${diffDays} يوم`;
    } else {
        return formatDateArabic(dateString);
    }
}

console.log('✅ Date/Time helper functions loaded');

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultData();
});

console.log('✅ Storage system loaded');
console.log(`📊 Current storage size: ${getStorageSize()} KB`);
