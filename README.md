# Premium Data Analytics Dashboard
A responsive, high-performance Data Analytics Dashboard built with HTML, CSS, JavaScript, and Chart.js. This application allows users to upload CSV files, preview data, interact with multiple charts, view AI-generated insights, and export their reports.

## Features

- **Upload CSV Files:** Drag-and-drop or select a file to instantly visualize your data.
- **Glassmorphism UI:** A sleek, premium, and modern user interface.
- **Dark/Light Mode:** Seamless theme toggling for user comfort.
- **Interactive Charts (Chart.js):** Includes Bar, Pie, Line, Doughnut, and Area charts.
- **Data Table Preview:** A searchable and sortable raw data table.
- **KPI Metrics:** Dynamic calculation of Total Records, Total Sum, Average, and Max Values.
- **AI Insights:** Automatically generates statistical insights based on selected metrics.
- **Export Capabilities:** Download filtered data as a CSV or export the entire dashboard as a PDF report.

## Technologies Used

- **HTML5:** Semantic structure.
- **CSS3:** Flexbox, CSS Grid, CSS Variables for theming, and Glassmorphism techniques.
- **JavaScript (Vanilla ES6):** DOM manipulation, CSV parsing algorithms, and state management.
- **Chart.js:** For rendering highly interactive data visualizations.
- **html2pdf.js:** For exporting dashboard views to PDF.
- **Boxicons:** For crisp, modern scalable icons.

## How to Run Locally

1. Clone this repository.
2. Open the project folder in your terminal.
3. Serve the directory using a local web server to ensure Chart.js and Fetch API work correctly. For example, using Node.js:
   ```bash
   npx serve .
   ```
4. Navigate to `http://localhost:3000` in your web browser.

## Usage

1. By default, the dashboard will load the included `sample_data.csv`.
2. To upload your own data, drag and drop a `.csv` file into the upload zone or click "Browse File".
3. Use the metric and dimension dropdowns to configure the charts.
4. Use the search bar in the table section to instantly filter the table and all associated charts.
5. Click the "Export" button in the top right to save your analysis.

## Preview

*(Add screenshots of your dashboard here to make your portfolio stand out)*

---
*Created as part of an Advanced Agentic Coding Task.*

