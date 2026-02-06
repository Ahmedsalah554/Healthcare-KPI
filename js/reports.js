/**
 * ===== السكريبت الخاص بصفحة التقارير والتحليلات =====
 */

// متغيرات عامة
let allKPIData = [];
let facilities = [];
let filteredData = [];

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeReports();
});

// تهيئة التقارير
function initializeReports() {
    loadReportData();
    updateStatistics();
    loadFilters();
    createReportCharts();
    loadDetailedTable();
}

// تحميل البيانات
function loadReportData() {
    // جلب البيانات من LocalStorage
    allKPIData = getFromStorage('kpiData', []);
    facilities = getFromStorage('facilities', []);
    
    // التأكد من أنها arrays
    if (!Array.isArray(allKPIData)) allKPIData = [];
    if (!Array.isArray(facilities)) facilities = [];
    
    filteredData = [...allKPIData];
    
    console.log('📊 Report data loaded:', {
        totalData: allKPIData.length,
        facilities: facilities.length
    });
}

// تحديث الإحصائيات
function updateStatistics() {
    // إجمالي البيانات
    const totalCount = filteredData.length;
    document.getElementById('totalDataCount').textContent = totalCount;
    
    // البيانات المعتمدة
    const approvedData = filteredData.filter(d => d.status === 'approved');
    const approvedCount = approvedData.length;
    document.getElementById('approvedCount').textContent = approvedCount;
    
    // نسبة القبول
    const approvalRate = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : 0;
    const rateElement = document.getElementById('approvedRate');
    rateElement.textContent = `${approvalRate}% معدل القبول`;
    
    // تلوين حسب النسبة
    if (approvalRate >= 85) {
        rateElement.className = 'stat-subtitle good';
    } else if (approvalRate >= 70) {
        rateElement.className = 'stat-subtitle warning';
    } else {
        rateElement.className = 'stat-subtitle bad';
    }
    
    // قيد المراجعة
    const pendingCount = filteredData.filter(d => d.status === 'pending').length;
    document.getElementById('pendingCount').textContent = pendingCount;
    
    // المنشآت النشطة
    const activeFacilitiesCount = facilities.filter(f => f.status === 'active').length;
    document.getElementById('activeFacilities').textContent = activeFacilitiesCount;
}

// تحميل الفلاتر
function loadFilters() {
    // فلتر المنشآت
    const facilityFilter = document.getElementById('facilityFilter');
    if (facilityFilter) {
        facilityFilter.innerHTML = '<option value="">جميع المنشآت</option>' +
            facilities.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    }
    
    // فلتر الفئات
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
            Object.keys(KPI_CATEGORIES).map(key => 
                `<option value="${key}">${KPI_CATEGORIES[key]}</option>`
            ).join('');
    }
}

// تطبيق الفلاتر
function applyFilters() {
    const facilityId = document.getElementById('facilityFilter').value;
    const period = document.getElementById('periodFilter').value;
    const category = document.getElementById('categoryFilter').value;
    
    filteredData = allKPIData.filter(item => {
        let match = true;
        
        if (facilityId && item.facility !== facilityId) match = false;
        if (category && item.category !== category) match = false;
        if (period) {
            const itemDate = item.date.substring(0, 7); // YYYY-MM
            if (itemDate !== period) match = false;
        }
        
        return match;
    });
    
    // تحديث كل شيء
    updateStatistics();
    createReportCharts();
    loadDetailedTable();
    
    showSuccess('تم تحديث التقرير بنجاح');
}

// إنشاء الرسوم البيانية
function createReportCharts() {
    createPerformanceChart();
    createDistributionChart();
}

// رسم بياني لمقارنة الأداء
function createPerformanceChart() {
    if (filteredData.length === 0) {
        document.getElementById('performanceChart').innerHTML = 
            '<div style="text-align:center; padding:40px; color:#999;">لا توجد بيانات</div>';
        return;
    }
    
    // تجميع البيانات حسب المنشأة
    const facilityPerformance = {};
    
    filteredData.forEach(item => {
        const facilityName = item.facilityName || 'غير محدد';
        if (!facilityPerformance[facilityName]) {
            facilityPerformance[facilityName] = {
                results: [],
                targets: []
            };
        }
        facilityPerformance[facilityName].results.push(item.result || 0);
        facilityPerformance[facilityName].targets.push(item.target || 0);
    });
    
    const categories = Object.keys(facilityPerformance);
    const avgResults = categories.map(facility => {
        const results = facilityPerformance[facility].results;
        return results.reduce((sum, val) => sum + val, 0) / results.length;
    });
    
    const avgTargets = categories.map(facility => {
        const targets = facilityPerformance[facility].targets;
        return targets.reduce((sum, val) => sum + val, 0) / targets.length;
    });
    
    const chartOptions = {
        chart: {
            type: 'bar',
            height: 350,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        series: [
            {
                name: 'نسبة الإنجاز',
                data: avgResults
            },
            {
                name: 'نسبة الهدف',
                data: avgTargets
            }
        ],
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'النسبة المئوية (%)'
            }
        },
        colors: ['#1a73e8', '#f44336'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'top'
        }
    };
    
    const element = document.getElementById('performanceChart');
    if (element) {
        element.innerHTML = '';
        const chart = new ApexCharts(element, chartOptions);
        chart.render();
    }
}

// رسم بياني للتوزيع
function createDistributionChart() {
    if (filteredData.length === 0) {
        document.getElementById('distributionChart').innerHTML = 
            '<div style="text-align:center; padding:40px; color:#999;">لا توجد بيانات</div>';
        return;
    }
    
    // تجميع حسب الفئة
    const categoryCount = {};
    
    filteredData.forEach(item => {
        const category = KPI_CATEGORIES[item.category] || item.category || 'أخرى';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    const labels = Object.keys(categoryCount);
    const series = Object.values(categoryCount);
    
    const chartOptions = {
        chart: {
            type: 'donut',
            height: 350,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        series: series,
        labels: labels,
        colors: ['#1a73e8', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#8bc34a', '#ff5722', '#607d8b'],
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + '%';
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'الإجمالي',
                            fontSize: '16px',
                            fontWeight: 600,
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        }
    };
    
    const element = document.getElementById('distributionChart');
    if (element) {
        element.innerHTML = '';
        const chart = new ApexCharts(element, chartOptions);
        chart.render();
    }
}

// تحميل الجدول التفصيلي
function loadDetailedTable() {
    const tbody = document.getElementById('detailedTableBody');
    
    if (!tbody) return;
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:40px; color:#999;">
                    لا توجد بيانات لعرضها
                </td>
            </tr>
        `;
        return;
    }
    
    // ترتيب من الأحدث للأقدم
    const sortedData = [...filteredData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    tbody.innerHTML = sortedData.map(item => {
        const kpi = getKPIByCode(item.kpiCode);
        const kpiName = kpi ? kpi.name : item.kpiName || item.kpiCode;
        
        // حساب الانحراف
        const target = item.target || 0;
        const result = item.result || 0;
        const deviation = result - target;
        const deviationPercent = target > 0 ? ((deviation / target) * 100).toFixed(1) : 0;
        
        // تحديد الأداء
        let performance = '';
        let performanceClass = '';
        
        if (result >= target * 0.95) {
            performance = 'ممتاز';
            performanceClass = 'excellent';
        } else if (result >= target * 0.85) {
            performance = 'جيد';
            performanceClass = 'good';
        } else if (result >= target * 0.70) {
            performance = 'متوسط';
            performanceClass = 'medium';
        } else {
            performance = 'ضعيف';
            performanceClass = 'weak';
        }
        
        return `
            <tr>
                <td style="max-width: 250px;">
                    <strong>${item.kpiCode}</strong><br>
                    <small style="color:#666;">${kpiName.substring(0, 50)}${kpiName.length > 50 ? '...' : ''}</small>
                </td>
                <td><strong>${target}${item.unit || '%'}</strong></td>
                <td><strong>${result.toFixed(1)}${item.unit || '%'}</strong></td>
                <td>
                    <span class="deviation ${deviation >= 0 ? 'positive' : 'negative'}">
                        ${deviation >= 0 ? '+' : ''}${deviationPercent}%
                    </span>
                </td>
                <td>
                    <span class="performance-badge ${performanceClass}">
                        ${performance}
                    </span>
                </td>
                <td>${item.facilityName || '-'}</td>
                <td>${formatDate(item.date)}</td>
                <td style="font-size:0.85rem; color:#666;">${formatDateArabic(item.createdAt)}</td>
            </tr>
        `;
    }).join('');
}

// تصدير التقرير
function exportReport() {
    if (filteredData.length === 0) {
        showWarning('لا توجد بيانات للتصدير');
        return;
    }
    
    const data = filteredData.map(item => {
        const kpi = getKPIByCode(item.kpiCode);
        const deviation = (item.result || 0) - (item.target || 0);
        const deviationPercent = item.target > 0 ? ((deviation / item.target) * 100).toFixed(1) : 0;
        
        return {
            'كود المؤشر': item.kpiCode,
            'اسم المؤشر': kpi ? kpi.name : item.kpiName,
            'الفئة': KPI_CATEGORIES[item.category] || item.category,
            'المنشأة': item.facilityName,
            'التاريخ': formatDate(item.date),
            'الفترة': item.period,
            'المستهدف': item.target + (item.unit || '%'),
            'النتيجة': (item.result || 0).toFixed(1) + (item.unit || '%'),
            'الانحراف': deviationPercent + '%',
            'الحالة': item.status === 'approved' ? 'معتمد' : 
                      item.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'
        };
    });
    
    const filename = `KPI_Report_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(data, filename);
    showSuccess('✅ تم تصدير التقرير بنجاح');
}

console.log('✅ Reports.js loaded successfully');
