/**
 * ===== دوال الرسوم البيانية =====
 */

// الألوان الافتراضية للرسوم البيانية
const CHART_COLORS = {
    primary: '#1a73e8',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3',
    purple: '#9c27b0',
    cyan: '#00bcd4',
    pink: '#e91e63',
    teal: '#009688'
};

const CHART_COLORS_ARRAY = Object.values(CHART_COLORS);

// خيارات افتراضية للرسوم البيانية
const DEFAULT_CHART_OPTIONS = {
    chart: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        toolbar: {
            show: true,
            tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false
            }
        },
        animations: {
            enabled: true,
            speed: 800
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 4
    },
    tooltip: {
        theme: 'light',
        x: {
            show: true
        },
        y: {
            formatter: function(value) {
                return value ? value.toFixed(2) : '0';
            }
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center'
    }
};

// رسم بياني خطي
function createLineChart(elementId, data, options = {}) {
    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'line',
            height: 350
        },
        series: data.series || [],
        xaxis: {
            categories: data.categories || [],
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: function(value) {
                    return value ? value.toFixed(1) : '0';
                }
            }
        },
        colors: options.colors || [CHART_COLORS.primary],
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني عمودي
function createBarChart(elementId, data, options = {}) {
    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'bar',
            height: 350
        },
        series: data.series || [],
        xaxis: {
            categories: data.categories || [],
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: options.horizontal || false,
                columnWidth: '60%'
            }
        },
        colors: options.colors || [CHART_COLORS.primary],
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني دائري
function createPieChart(elementId, data, options = {}) {
    const chartOptions = {
        chart: {
            type: 'pie',
            height: 350,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        series: data.series || [],
        labels: data.labels || [],
        colors: options.colors || CHART_COLORS_ARRAY,
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + '%';
            }
        },
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني دائري مفرغ (Donut)
function createDonutChart(elementId, data, options = {}) {
    const chartOptions = {
        chart: {
            type: 'donut',
            height: 350,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        series: data.series || [],
        labels: data.labels || [],
        colors: options.colors || CHART_COLORS_ARRAY,
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
                    size: '65%'
                }
            }
        },
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني مساحي
function createAreaChart(elementId, data, options = {}) {
    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'area',
            height: 350
        },
        series: data.series || [],
        xaxis: {
            categories: data.categories || []
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3
            }
        },
        colors: options.colors || [CHART_COLORS.primary],
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني راداري
function createRadarChart(elementId, data, options = {}) {
    const chartOptions = {
        chart: {
            type: 'radar',
            height: 350,
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        series: data.series || [],
        xaxis: {
            categories: data.categories || []
        },
        colors: options.colors || [CHART_COLORS.primary, CHART_COLORS.success],
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني مختلط
function createMixedChart(elementId, data, options = {}) {
    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'line',
            height: 350
        },
        series: data.series || [],
        xaxis: {
            categories: data.categories || []
        },
        stroke: {
            width: [2, 2, 2],
            curve: 'smooth'
        },
        colors: options.colors || [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning],
        ...options
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني للاتجاهات
function createTrendChart(elementId, kpiData) {
    const categories = kpiData.map(item => formatDate(item.date));
    const results = kpiData.map(item => item.result);
    const targets = kpiData.map(item => item.target || 0);

    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'line',
            height: 350
        },
        series: [
            {
                name: 'النتيجة الفعلية',
                data: results
            },
            {
                name: 'المستهدف',
                data: targets
            }
        ],
        xaxis: {
            categories: categories,
            labels: {
                rotate: -45
            }
        },
        yaxis: {
            title: {
                text: 'النسبة المئوية (%)'
            }
        },
        colors: [CHART_COLORS.primary, CHART_COLORS.danger],
        stroke: {
            width: [3, 2],
            dashArray: [0, 5]
        }
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني للمقارنة بين المنشآت
function createFacilityComparisonChart(elementId, data) {
    const facilities = [...new Set(data.map(item => item.facilityName))];
    const kpiCodes = [...new Set(data.map(item => item.kpiCode))];

    const series = facilities.map(facility => ({
        name: facility,
        data: kpiCodes.map(code => {
            const item = data.find(d => d.facilityName === facility && d.kpiCode === code);
            return item ? item.result : 0;
        })
    }));

    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'bar',
            height: 400
        },
        series: series,
        xaxis: {
            categories: kpiCodes
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '70%'
            }
        },
        colors: CHART_COLORS_ARRAY
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني حسب الفئة
function createCategoryChart(elementId, data) {
    const categories = {};
    
    data.forEach(item => {
        const category = KPI_CATEGORIES[item.category] || item.category;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(item.result);
    });

    const labels = Object.keys(categories);
    const averages = labels.map(label => {
        const values = categories[label];
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    const chartOptions = {
        chart: {
            type: 'donut',
            height: 350
        },
        series: averages,
        labels: labels,
        colors: CHART_COLORS_ARRAY,
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + '%';
            }
        }
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني للحالة (معتمد، قيد المراجعة، مرفوض)
function createStatusChart(elementId, data) {
    const statusCounts = {
        'معتمد': 0,
        'قيد المراجعة': 0,
        'مرفوض': 0
    };

    data.forEach(item => {
        if (item.status === 'approved') statusCounts['معتمد']++;
        else if (item.status === 'pending') statusCounts['قيد المراجعة']++;
        else if (item.status === 'rejected') statusCounts['مرفوض']++;
    });

    const chartOptions = {
        chart: {
            type: 'pie',
            height: 300
        },
        series: Object.values(statusCounts),
        labels: Object.keys(statusCounts),
        colors: [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger],
        legend: {
            position: 'bottom'
        }
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني شهري
function createMonthlyChart(elementId, data) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const monthlyData = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    data.forEach(item => {
        const month = new Date(item.date).getMonth();
        monthlyData[month] += item.result;
        monthlyCounts[month]++;
    });

    const averages = monthlyData.map((sum, index) => 
        monthlyCounts[index] > 0 ? sum / monthlyCounts[index] : 0
    );

    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'area',
            height: 350
        },
        series: [{
            name: 'متوسط الأداء',
            data: averages
        }],
        xaxis: {
            categories: months
        },
        colors: [CHART_COLORS.primary],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3
            }
        }
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// رسم بياني ربع سنوي
function createQuarterlyChart(elementId, data) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyData = [0, 0, 0, 0];
    const quarterlyCounts = [0, 0, 0, 0];

    data.forEach(item => {
        const month = new Date(item.date).getMonth();
        const quarter = Math.floor(month / 3);
        quarterlyData[quarter] += item.result;
        quarterlyCounts[quarter]++;
    });

    const averages = quarterlyData.map((sum, index) => 
        quarterlyCounts[index] > 0 ? sum / quarterlyCounts[index] : 0
    );

    const chartOptions = {
        ...DEFAULT_CHART_OPTIONS,
        chart: {
            ...DEFAULT_CHART_OPTIONS.chart,
            type: 'bar',
            height: 350
        },
        series: [{
            name: 'متوسط الأداء',
            data: averages
        }],
        xaxis: {
            categories: quarters
        },
        colors: [CHART_COLORS.success],
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: '50%'
            }
        }
    };

    const chart = new ApexCharts(document.querySelector(`#${elementId}`), chartOptions);
    chart.render();
    return chart;
}

// تحديث رسم بياني موجود
function updateChart(chart, newData) {
    if (chart && newData) {
        chart.updateSeries(newData.series || []);
        if (newData.categories) {
            chart.updateOptions({
                xaxis: {
                    categories: newData.categories
                }
            });
        }
    }
}

// تدمير رسم بياني
function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}

// تصدير رسم بياني كصورة
function exportChartAsImage(chart, filename = 'chart.png') {
    if (chart) {
        chart.dataURI().then(({ imgURI }) => {
            const link = document.createElement('a');
            link.href = imgURI;
            link.download = filename;
            link.click();
        });
    }
}

// إنشاء رسوم بيانية للوحة المعلومات
function createDashboardCharts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const kpiData = getFromStorage('kpiData', []);
    
    if (kpiData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>لا توجد بيانات</h3>
                <p>لم يتم إدخال أي بيانات بعد لعرض الرسوم البيانية</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="charts-container">
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">توزيع البيانات حسب الفئة</div>
                </div>
                <div class="chart-body" id="categoryChart"></div>
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">حالة البيانات</div>
                </div>
                <div class="chart-body" id="statusChart"></div>
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">الأداء الشهري</div>
                </div>
                <div class="chart-body" id="monthlyChart"></div>
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">الأداء الربع سنوي</div>
                </div>
                <div class="chart-body" id="quarterlyChart"></div>
            </div>
        </div>
    `;

    // إنشاء الرسوم البيانية
    setTimeout(() => {
        createCategoryChart('categoryChart', kpiData);
        createStatusChart('statusChart', kpiData);
        createMonthlyChart('monthlyChart', kpiData);
        createQuarterlyChart('quarterlyChart', kpiData);
    }, 100);
}

console.log('✅ Charts.js loaded successfully');
