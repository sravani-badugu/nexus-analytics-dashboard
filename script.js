// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const currentDateEl = document.getElementById('currentDate');
const themeToggle = document.getElementById('themeToggle');

// Upload Elements
const dragArea = document.getElementById('dragArea');
const browseFileBtn = document.getElementById('browseFileBtn');
const csvFileInput = document.getElementById('csvFileInput');
const uploadStatus = document.getElementById('uploadStatus');

// KPI Elements
const kpiTotal = document.getElementById('kpiTotal');
const kpiSum = document.getElementById('kpiSum');
const kpiAvg = document.getElementById('kpiAvg');
const kpiMax = document.getElementById('kpiMax');

// Control Elements
const metricSelect = document.getElementById('metricSelect');
const dimensionSelect = document.getElementById('dimensionSelect');
const aiInsightsText = document.getElementById('aiInsightsText');
const searchInput = document.getElementById('searchInput');

// Table Elements
const tableHeadRow = document.getElementById('tableHeadRow');
const tableBody = document.getElementById('tableBody');
const tableFooter = document.getElementById('tableFooter');

// Export Elements
const exportCsvBtn = document.getElementById('exportCsv');
const exportPdfBtn = document.getElementById('exportPdf');

// Global State
let rawData = [];
let filteredData = [];
let columns = [];
let numericColumns = [];
let categoricalColumns = [];
let currentSortColumn = null;
let currentSortAsc = true;

// Chart Instances
let mainChart, pieChart, lineChart, areaChart, doughnutChart;

// Chart Colors
const chartColors = [
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(16, 185, 129, 0.8)', // green
    'rgba(139, 92, 246, 0.8)', // purple
    'rgba(245, 158, 11, 0.8)', // orange
    'rgba(239, 68, 68, 0.8)',  // red
    'rgba(20, 184, 166, 0.8)'  // teal
];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Set Current Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

    // Load Theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
    }

    // Load Sample Data initially
    loadSampleData();
});

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('light-mode')) {
        themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
        localStorage.setItem('theme', 'dark');
    }

    // Update charts theme
    if(rawData.length > 0) {
        updateCharts();
    }
});

// CSV Upload Logic
browseFileBtn.addEventListener('click', () => csvFileInput.click());

csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
});

dragArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragArea.classList.add('active');
});

dragArea.addEventListener('dragleave', () => {
    dragArea.classList.remove('active');
});

dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.classList.remove('active');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        handleFileUpload(file);
    } else {
        alert("Please upload a valid CSV file.");
    }
});

// File Handling
function handleFileUpload(file) {
    showLoading();
    uploadStatus.textContent = `File Loaded: ${file.name}`;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        processCSVData(text);
        hideLoading();
    };
    reader.readAsText(file);
}

// Load Sample Data Fetch
async function loadSampleData() {
    showLoading();
    try {
        const response = await fetch('sample_data.csv');
        if (response.ok) {
            const text = await response.text();
            processCSVData(text);
        } else {
            console.error("Failed to load sample data.");
        }
    } catch (error) {
        console.error("Error loading sample data:", error);
    }
    hideLoading();
}

// Simple CSV Parser
function processCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return;

    columns = lines[0].split(',').map(c => c.trim());
    rawData = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim());
        if (row.length === columns.length) {
            let rowObj = {};
            columns.forEach((col, index) => {
                let val = row[index];
                // Check if numeric
                if (!isNaN(val) && val !== '') {
                    val = parseFloat(val);
                }
                rowObj[col] = val;
            });
            rawData.push(rowObj);
        }
    }

    filteredData = [...rawData];

    // Identify Column Types
    numericColumns = [];
    categoricalColumns = [];

    if (rawData.length > 0) {
        columns.forEach(col => {
            if (typeof rawData[0][col] === 'number') {
                numericColumns.push(col);
            } else {
                categoricalColumns.push(col);
            }
        });
    }

    populateSelectDropdowns();
    updateDashboard();
}

// Dropdowns
function populateSelectDropdowns() {
    metricSelect.innerHTML = '';
    dimensionSelect.innerHTML = '';

    numericColumns.forEach(col => {
        const opt = document.createElement('option');
        opt.value = col;
        opt.textContent = col;
        metricSelect.appendChild(opt);
    });

    categoricalColumns.forEach(col => {
        const opt = document.createElement('option');
        opt.value = col;
        opt.textContent = col;
        dimensionSelect.appendChild(opt);
    });

    // Default Selection
    if(numericColumns.length > 0) metricSelect.value = numericColumns[0];
    if(categoricalColumns.length > 0) dimensionSelect.value = categoricalColumns[0];
}

metricSelect.addEventListener('change', updateDashboard);
dimensionSelect.addEventListener('change', updateDashboard);

// Main Update Function
function updateDashboard() {
    if (filteredData.length === 0) return;

    updateKPIs();
    renderTable();
    updateCharts();
    generateInsights();
}

// KPI Logic
function updateKPIs() {
    const metric = metricSelect.value || numericColumns[0];
    if (!metric) return;

    kpiTotal.textContent = filteredData.length.toLocaleString();

    let sum = 0, max = -Infinity, min = Infinity;
    filteredData.forEach(row => {
        const val = row[metric] || 0;
        sum += val;
        if (val > max) max = val;
        if (val < min) min = val;
    });

    const avg = sum / filteredData.length;

    kpiSum.textContent = formatNumber(sum);
    kpiAvg.textContent = formatNumber(avg);
    kpiMax.textContent = formatNumber(max);
}

function formatNumber(num) {
    if(num > 1000000) return (num/1000000).toFixed(2) + 'M';
    if(num > 1000) return (num/1000).toFixed(2) + 'K';
    return num.toFixed(2);
}

// Chart Logistics
function updateCharts() {
    const metric = metricSelect.value;
    const dimension = dimensionSelect.value;
    if (!metric || !dimension) return;

    const aggregatedData = aggregateData(dimension, metric);
    const labels = Object.keys(aggregatedData);
    const dataValues = Object.values(aggregatedData);

    const isDarkMode = document.body.classList.contains('dark-mode');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#94a3b8' : '#475569';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = 'Inter';

    // 1. Main Chart (Bar)
    if(mainChart) mainChart.destroy();
    mainChart = new Chart(document.getElementById('mainChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Total ${metric} by ${dimension}`,
                data: dataValues,
                backgroundColor: chartColors[0],
                borderRadius: 6
            }]
        },
        options: getChartOptions(gridColor)
    });

    // 2. Pie Chart
    if(pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: chartColors,
                borderWidth: isDarkMode ? 0 : 2,
                borderColor: isDarkMode ? 'transparent' : '#fff'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. Line Chart
    if(lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Trend of ${metric}`,
                data: dataValues,
                borderColor: chartColors[1],
                backgroundColor: chartColors[1],
                tension: 0.4,
                fill: false,
                borderWidth: 3
            }]
        },
        options: getChartOptions(gridColor)
    });

    // 4. Doughnut Chart
    if(doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(document.getElementById('doughnutChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: chartColors,
                borderWidth: isDarkMode ? 0 : 2,
                borderColor: isDarkMode ? 'transparent' : '#fff'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 5. Area Chart
    if(areaChart) areaChart.destroy();
    areaChart = new Chart(document.getElementById('areaChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Cumulative ${metric}`,
                data: dataValues,
                borderColor: chartColors[2],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: getChartOptions(gridColor)
    });
}

function getChartOptions(gridColor) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { color: gridColor } },
            y: { grid: { color: gridColor }, beginAtZero: true }
        }
    };
}

// Data Aggregation
function aggregateData(dimension, metric) {
    const agg = {};
    filteredData.forEach(row => {
        const dimVal = row[dimension] || 'Unknown';
        const metVal = row[metric] || 0;
        if(agg[dimVal]) {
            agg[dimVal] += metVal;
        } else {
            agg[dimVal] = metVal;
        }
    });
    return agg;
}

// Table Logic
function renderTable() {
    tableHeadRow.innerHTML = '';
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableFooter.textContent = 'No data available.';
        return;
    }

    // Render Headers
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.addEventListener('click', () => sortTable(col));
        tableHeadRow.appendChild(th);
    });

    // Render Rows (Limit to 50 for performance preview)
    const limit = Math.min(filteredData.length, 50);
    for (let i = 0; i < limit; i++) {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = filteredData[i][col];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    }

    tableFooter.textContent = `Showing ${limit} of ${filteredData.length} entries`;
}

// Sort Table
function sortTable(column) {
    if (currentSortColumn === column) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortColumn = column;
        currentSortAsc = true;
    }

    filteredData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSortAsc ? -1 : 1;
        if (valA > valB) return currentSortAsc ? 1 : -1;
        return 0;
    });

    updateDashboard();
}

// Search Logic
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if(query === '') {
        filteredData = [...rawData];
    } else {
        filteredData = rawData.filter(row => {
            return columns.some(col => {
                return String(row[col]).toLowerCase().includes(query);
            });
        });
    }
    updateDashboard();
});

// AI Insights Generator
function generateInsights() {
    const metric = metricSelect.value;
    const dimension = dimensionSelect.value;
    if(!metric || !dimension) return;

    const agg = aggregateData(dimension, metric);
    let maxKey = '', maxVal = -Infinity;
    let sum = 0;

    for (let key in agg) {
        if (agg[key] > maxVal) {
            maxVal = agg[key];
            maxKey = key;
        }
        sum += agg[key];
    }

    const percentage = ((maxVal / sum) * 100).toFixed(1);

    aiInsightsText.innerHTML = `<strong>Insight:</strong> The dimension <strong>${dimension}</strong> '${maxKey}' leads the ${metric} metric with <strong>${formatNumber(maxVal)}</strong>, contributing to roughly <strong>${percentage}%</strong> of the total filtered value.`;
}

// Loading Overlay
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    setTimeout(() => {
        loadingOverlay.classList.remove('active');
    }, 500); // Small delay for visual effect
}

// Export CSV
exportCsvBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (filteredData.length === 0) return;

    const csvContent = [
        columns.join(','),
        ...filteredData.map(row => columns.map(col => row[col]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nexus_export.csv';
    link.click();
});

// Export PDF using html2pdf
exportPdfBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const element = document.getElementById('pdfArea');
    const opt = {
      margin:       0.5,
      filename:     'dashboard_report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
});
