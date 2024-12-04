/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "insightzaptiles/control/charts/ChartManager",
    "insightzaptiles/control/Table",
    "sap/ui/model/json/JSONModel",
    "insightzaptiles/model/models"
],
    function (UIComponent, Device, ChartManager, Table, JSONModel, models) {
        "use strict";

        return UIComponent.extend("insightzaptiles.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */

            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                this._bInitialized = false;
                const oRouter = this.getRouter();
                // enable routing   
                oRouter.initialize();
                // AttachRouteChange
                oRouter.attachRouteMatched(this._onRouteMatched, this);

                this.oDynamicTable = new Table("mainTable");

                // Instanciate ChartManager:
                this.oChartManager = new ChartManager();

                const oChartModel = new JSONModel({ charts: [] });
                this.setModel(oChartModel, "charts");

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.setModel(new JSONModel(models.getUrlParameters()), 'urlParameters');

                this.setModel(new JSONModel(), 'insightModel');
                this.setModel(new JSONModel(), 'insightSelModel');
                this.setModel(new sap.ui.model.odata.v2.ODataModel("/dps/ret/variants/dummy", {
                    "skipMetadataAnnotationParsing": "true"
                }), "token");

                // var oModel = new JSONModel(sap.ui.require.toUrl("insightzaptiles/model/data.json"));
                // this.setModel(oModel, "navigationSettings");

            },
            _onRouteMatched: function (oEvent) {
                const oTargetViewControl = oEvent.getParameter("view").getController();
                if (!this._bInitialized) {
                    this._initializeApp(oEvent);
                    this._bInitialized = true;
                } else {
                    oTargetViewControl.onAfterLoad();
                }
            },
            _initializeApp: function (oEvent) {
                const sRouteName = oEvent.getParameter("name");
                const oArguments = oEvent.getParameter("arguments");
                const oTargetViewControl = oEvent.getParameter("view").getController();
                console.log('Routhe to ', sRouteName, 'Arguments', arguments);

                if (oArguments.variant) {
                    const sBaseUrl = "/dps/ret/variants";
                    var sVariantPath = models.buildUrl(sBaseUrl, [oArguments.variant]);
                    var sVariantSelPath = models.buildUrl(sBaseUrl, [oArguments.variant, 'sel']);
                    models.loadDataForId(sVariantPath)
                        .then((oMetadata) => {
                            console.log('Routhe to ', sRouteName, 'Arguments', oMetadata, '=>Success');
                            const oInsightModel = this.getModel("insightModel");
                            oInsightModel.setData(oMetadata);

                            this.loadChartData(oMetadata.metadata.graphs);
                            this.loadMainTableMetadataAndData(oMetadata.metadata.fields, oMetadata.contentData)
                            oTargetViewControl.onAfterLoad();
                        })
                        .catch((oError) => {
                            console.error("Error loading data:", oError, '=>Fail');
                        });

                    models.loadDataForId(sVariantSelPath, oArguments.variant)
                        .then((oSelMetadata) => {
                            console.log('Routhe to ', sRouteName, 'Arguments', oSelMetadata, '=>SelScreenSuccess');
                            const oInsightSelModel = this.getModel("insightSelModel");
                            oInsightSelModel.setData(oSelMetadata);
                        })
                        .catch((oError) => {
                            console.error("Error loading data:", oError, '=>SelScreenFail');
                        });
                }
            },
            loadChartData: function (chartConfigs) {
                // Load charts into the ChartManager
                this.oChartManager.loadCharts(chartConfigs);

                // Update the model with new chart data
                const oModel = this.getModel("charts");
                oModel.setProperty("/charts", chartConfigs);
            },

            // Destroy all charts
            destroyAllCharts: function () {
                this.oChartManager.destroyAllCharts();

                // Clear the charts model
                const oModel = this.getModel("charts");
                oModel.setProperty("/charts", []);
            },

            // Get the ChartManager instance
            getChartManager: function () {
                return this.oChartManager;
            },
            /**
             * Get the dynamic table instance
             * @returns {my.namespace.DynamicPersonalizedTable}
             */
            getDynamicTable: function () {
                return this.oDynamicTable;
            },
            loadMainTableMetadataAndData: async function (aColumns, aData) {
                // const aColumns = await fetchMetadataFn();
                // const aData = await fetchDataFn();
                this.getDynamicTable().configureTable(aColumns, aData);
            },

        });
    }
);