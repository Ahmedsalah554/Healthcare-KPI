/**
 * ===== الدوال المساعدة =====
 */

// حفظ في LocalStorage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('خطأ في الحفظ:', error);
        return false;
    }
}

// استرجاع من LocalStorage
function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('خطأ في الاسترجاع:', error);
        return defaultValue;
    }
}

// حذف من LocalStorage
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('خطأ في الحذف:', error);
        return false;
    }
}

// مسح كل LocalStorage
function clearStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('خطأ في المسح:', error);
        return false;
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('ar-SA', options);
}

// تنسيق التاريخ والوقت
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('ar-SA', options);
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التحقق من صحة رقم الهاتف
function isValidPhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

// عرض رسالة نجاح
function showSuccess(message) {
    showNotification(message, 'success');
}

// عرض رسالة خطأ
function showError(message) {
    showNotification(message, 'error');
}

// عرض رسالة تحذير
function showWarning(message) {
    showNotification(message, 'warning');
}

// عرض إشعار
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        animation: slideDown 0.3s ease-out;
    `;
    
    // أيقونة حسب النوع
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <span style="font-size: 1.2rem; margin-left: 10px;">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // إزالة بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// تأكيد الإجراء
function confirmAction(message) {
    return confirm(message);
}

// تصدير JSON
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// تصدير CSV
function downloadCSV(data, filename, columns) {
    // العناوين
    let csv = columns.join(',') + '\n';
    
    // البيانات
    data.forEach(row => {
        const values = columns.map(col => {
            let value = row[col] || '';
            // إذا كانت القيمة تحتوي على فاصلة، ضعها بين علامات تنصيص
            if (String(value).includes(',')) {
                value = `"${value}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    
    // التحميل
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// تصدير PDF (بسيط)
function printToPDF() {
    window.print();
}

// Debounce للبحث
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// نسخ نص للحافظة
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('تم النسخ بنجاح');
        }).catch(err => {
            console.error('فشل النسخ:', err);
        });
    } else {
        // Fallback للمتصفحات القديمة
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccess('تم النسخ بنجاح');
        } catch (err) {
            console.error('فشل النسخ:', err);
        }
        document.body.removeChild(textArea);
    }
}

// توليد ID عشوائي
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// تحويل النص لـ HTML آمن
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// تنسيق الأرقام
function formatNumber(number, decimals = 2) {
    return Number(number).toFixed(decimals);
}

// حساب النسبة المئوية
function calculatePercentage(numerator, denominator) {
    if (denominator === 0) return 0;
    return (numerator * 100) / denominator;
}

// فرز مصفوفة حسب خاصية
function sortBy(array, key, order = 'asc') {
    return array.sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
}

// تجميع مصفوفة حسب خاصية
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

// البحث في مصفوفة
function searchInArray(array, searchTerm, keys) {
    searchTerm = searchTerm.toLowerCase();
    return array.filter(item => {
        return keys.some(key => {
            return String(item[key]).toLowerCase().includes(searchTerm);
        });
    });
}

// التحقق من كون الكائن فارغ
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// دمج كائنات
function mergeObjects(...objects) {
    return Object.assign({}, ...objects);
}

// استخراج قيم فريدة من مصفوفة
function getUniqueValues(array, key) {
    return [...new Set(array.map(item => item[key]))];
}

// الحصول على أول يوم في الشهر
function getFirstDayOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// الحصول على آخر يوم في الشهر
function getLastDayOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// التحقق من كون التاريخ في المستقبل
function isFutureDate(date) {
    return new Date(date) > new Date();
}

// حساب الفرق بين تاريخين (بالأيام)
function daysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
}

// تحميل سكريبت خارجي
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// التحقق من دعم localStorage
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// إنشاء عنصر HTML
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    element.innerHTML = content;
    return element;
}

// تبديل class
function toggleClass(element, className) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (element) {
        element.classList.toggle(className);
    }
}

// إضافة class
function addClass(element, className) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (element) {
        element.classList.add(className);
    }
}

// إزالة class
function removeClass(element, className) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (element) {
        element.classList.remove(className);
    }
}

// الانتظار (delay)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// تحويل الحجم بالبايت لصيغة قابلة للقراءة
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// التحقق من الاتصال بالإنترنت
function isOnline() {
    return navigator.onLine;
}

// الحصول على معلومات المتصفح
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
    } else if (ua.indexOf('Edge') > -1) {
        browserName = 'Edge';
    }
    
    return {
        name: browserName,
        userAgent: ua
    };
}

// console log*

