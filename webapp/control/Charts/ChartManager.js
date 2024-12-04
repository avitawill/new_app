sap.ui.define([
    "./Chart"
], function (Chart) {
    "use strict";

    return class ChartManager {
        constructor() {
            this.charts = []; // Empty at initialization
        }

        // Load or reload charts from configurations
        loadCharts(chartConfigs) {
            // Destroy existing charts before loading new ones
            this.destroyAllCharts();

            // Create Chart instances
            this.charts = chartConfigs.map(config => new Chart(config));
        }

        // Get all Chart instances
        getCharts() {
            return this.charts;
        }

        // Get a specific Chart by ID
        getChartById(graphId) {
            return this.charts.find(chart => chart.config.graphId === graphId);
        }
        getSelectedCharts() {
            return this.charts.filter(chart => chart.isSelected);
        }
        // Create VizFrames for all charts
        createVizFrames() {
            return this.charts.map(chart => chart.createVizFrame());
        }
        createSelectedVizFrames() {
            return this.getSelectedCharts().map(chart => chart.createVizFrame())
        }
        // Destroy all VizFrames and clear charts
        destroyAllCharts() {
            this.charts.forEach(chart => chart.destroyVizFrame());
            this.charts = [];
        }
    };
});


// sap.ui.define([
//     "./Chart"
// ], function (Chart) {
//     "use strict";

//     return class ChartManager {
//         constructor(chartConfigs = []) {
//             this.charts = [];
//             if (chartConfigs.length) {
//                 this.loadCharts(chartConfigs);
//             }
//         }

//         // Load new charts into the manager
//         loadCharts(chartConfigs) {
//             this.charts = chartConfigs.map(config => new Chart(config));
//         }

//         // Reload charts (e.g., refresh from backend or other source)
//         reloadCharts(newConfigs) {
//             this.loadCharts(newConfigs);
//         }

//         // Get selected charts
//         getSelectedCharts() {
//             return this.charts.filter(chart => chart.isSelected);
//         }

//         // Toggle chart selection
//         toggleChartSelection(graphId, isSelected) {
//             const chart = this.charts.find(chart => chart.graphId === graphId);
//             if (chart) {
//                 chart.isSelected = isSelected;
//             }
//         }

//         // Convert to JSON for binding
//         toJSON() {
//             return this.charts.map(chart => chart.toJSON());
//         }

//         // Cleanup resources
//         destroy() {
//             this.charts = [];
//         }
//     };
// });
