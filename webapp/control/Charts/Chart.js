
sap.ui.define([
    "sap/viz/ui5/controls/VizFrame",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
], function (VizFrame, FlattenedDataset, FeedItem) {
    "use strict";

    return class Chart {
        constructor(config) {

            this.config = config;
            this.isSelected = false;
            this.vizFrame = null; // To store the created VizFrame instance
            // this.createVizFrame();

        }
        toggleSelectedCharts() {
            if (this.isSelected) {
                this.isSelected = false;
            } else {
                this.isSelected = true;
            }

            return this.isSelected;
        }
        getSelectIcon() {
            if (this.isSelected) {
                return "sap-icon://complete";
            } else {
                return "sap-icon://border";
            }
        }
        // getSelectedCharts() {
        //     return this.charts.filter(chart => chart.isSelected);
        // }
        createVizFrame() {
            const config = this.config;

            // Create the FlattenedDataset
            const oDataset = new FlattenedDataset({
                dimensions: [{
                    name: config.xColumn,
                    value: "{" + config.xColumn + "}"
                }],
                measures: [{
                    name: config.yColumn,
                    value: "{" + config.yColumn + "}"
                }],
                data: {
                    path: "insightModel>/contentData" // Path to the data model
                }
            });

            // Create the VizFrame
            this.vizFrame = new VizFrame({
                width: "100%",
                height: "auto",
                // height: "400px",
                vizType: this._chartTypeByGraphTypeGet(config.graphType),
                dataset: oDataset,
                vizProperties: {
                    title: {
                        visible: false
                    },
                    general: {
                        background: {
                            gradientDirection: "horizontal"
                        }
                    },
                    // legend:{
                    //     isScrollable: true
                    // },
                    legendGroup: {
                        // innerRadiusRatio: '0.2',
                        linesOfWrap: 3,
                        forceToShow: "true",
                        layout: {
                            // width: "70%",
                            // height: "20%",
                            position: "auto", // Positions the legend at the bottom, displaying it horizontally
                            alignment: "middle"
                        },
                        column: 2
                    },
                    plotArea: {
                        background: {
                            gradientDirection: "horizontal"
                        },
                        showLabel: config.valueLabel
                    }
                }
            });

            // Add FeedItems
            if (config.graphType === "PI") {
                this.vizFrame.addFeed(new FeedItem({
                    uid: "color",
                    type: "Dimension",
                    values: [config.xColumn]
                }));
                this.vizFrame.addFeed(new FeedItem({
                    uid: "size",
                    type: "Measure",
                    values: [config.yColumn]
                }));
            } else {
                this.vizFrame.addFeed(new FeedItem({
                    uid: "categoryAxis",
                    type: "Dimension",
                    values: [config.xColumn]
                }));
                this.vizFrame.addFeed(new FeedItem({
                    uid: "valueAxis",
                    type: "Measure",
                    values: [config.yColumn]
                }));
            }

            return this;
        }
        getVizFrame() {
            if (this.vizFrame) {
                return this.vizFrame; // Return existing VizFrame if already created
            }
        }
        _chartTypeByGraphTypeGet(graphType) {
            var chartType = "";

            // var field = this._fieldGet(xColumn);

            var bTimeAxis = false;
            // switch (field.type) {
            //   case 'date':
            //   case 'time':
            //     bTimeAxis = true;
            //     break;
            // }

            switch (graphType) {
                case "VB": // Columns
                    if (bTimeAxis) {
                        chartType = 'timeseries_column';
                    }
                    else {
                        chartType = "column";
                    }
                    break;
                case "VS": // Stacked Columns
                    if (bTimeAxis) {
                        chartType = 'timeseries_stacked_column';
                    }
                    else {
                        chartType = "stacked_column";
                    }
                    break;
                case "HB": // Bars
                    chartType = "bar";
                    break;
                case "HS": // Stacked Bars
                    chartType = "stacked_bar";
                    break;
                case "LN": // Lines
                    if (bTimeAxis) {
                        chartType = 'timeseries_line';
                    }
                    else {
                        chartType = "line";
                    }
                    break;
                case "SA": // Stacked Area
                    // not supported
                    break;
                case "MA": // Area
                    chartType = "area";
                    break;
                case "PI": // Pie
                    chartType = "pie";
                    break;
                case "TP": // Doughnut
                    chartType = "donut";
                    break;
            }

            return chartType;
        }
        // _chartAttributesGet(graph) {
        //     var chartAttributes = {
        //         timeAxis: false
        //     };

        //     if (graph.chartType.startsWith('timeseries')) {
        //         chartAttributes.timeAxis = true;
        //     }

        //     var field = this._fieldGet(graph.xColumn);
        //     switch (field.type) {
        //         case 'date':
        //             if (field.edmType == 'Edm.DateTimeOffset') { // Timestamp
        //                 chartAttributes.levels = ["second", "minute", "hour", "day", "month", "year"];
        //             }
        //             else {
        //                 switch (field.semantic) {
        //                     case "yearmonth":
        //                         chartAttributes.levels = ["month", "year"];
        //                         break;
        //                     default:
        //                         chartAttributes.levels = ["day", "month", "year"];
        //                 }
        //             }
        //             break;
        //         case 'time':
        //             chartAttributes.levels = ["second", "minute", "hour"];
        //             break;
        //     };

        //     return chartAttributes;
        // }
        toJSON() {
            const config = this.config;
            return {
                graphId: config.graphId,
                graphType: config.graphType,
                title: config.title,
                xColumn: config.xColumn,
                yColumn: config.yColumn,
                aggrFunc: config.aggrFunc,
                valueLabel: config.valueLabel,
                isSelected: config.isSelected
            };
        }
        destroyVizFrame() {
            if (this.vizFrame) {
                this.vizFrame.destroy();
                this.vizFrame = null;
            }
        }
    };
});

// sap.ui.define([], function () {
//     "use strict";

//     return class Chart {
//         constructor(config) {
//             this.graphId = config.graphId;
//             this.graphType = config.graphType;
//             this.title = config.title;
//             this.xColumn = config.xColumn;
//             this.yColumn = config.yColumn;
//             this.aggrFunc = config.aggrFunc || "SUM";
//             this.valueLabel = config.valueLabel || false;
//             this.isSelected = config.isSelected || false;
//         }

//         toJSON() {
//             return {
//                 graphId: this.graphId,
//                 graphType: this.graphType,
//                 title: this.title,
//                 xColumn: this.xColumn,
//                 yColumn: this.yColumn,
//                 aggrFunc: this.aggrFunc,
//                 valueLabel: this.valueLabel,
//                 isSelected: this.isSelected
//             };
//         }
//     };
// });