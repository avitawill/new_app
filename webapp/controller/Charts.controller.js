sap.ui.define([
    "./BaseController",
    "insightzaptiles/model/models",
    "sap/ui/table/Table",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    "sap/ui/core/library"
], function (BaseController, models, UITable, JSONModel, DragInfo, GridDropInfo, coreLibrary) {
    "use strict";
    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;
    return BaseController.extend("insightzaptiles.controller.Charts", {
        onInit: function () {

            this.getRouter().getRoute("Charts").attachPatternMatched(this._onObjectMatched, this);

            var oCardManifests =
                new JSONModel(sap.ui.require.toUrl("insightzaptiles/model/cardManifests.json"));
            this.getView().setModel(oCardManifests, "manifests");

            var oGrid = this.byId("chartsGrid");
            oGrid.addDragDropConfig(new DragInfo({
                sourceAggregation: "items"
            }));
            oGrid.addDragDropConfig(new GridDropInfo({
                targetAggregation: "items",
                dropPosition: DropPosition.Between,
                dropLayout: DropLayout.Horizontal,
                drop: function (oInfo) {
                    var oDragged = oInfo.getParameter("draggedControl"),
                        oDropped = oInfo.getParameter("droppedControl"),
                        sInsertPosition = oInfo.getParameter("dropPosition"),
                        iDragPosition = oGrid.indexOfItem(oDragged),
                        iDropPosition = oGrid.indexOfItem(oDropped);

                    oGrid.removeItem(oDragged);

                    if (iDragPosition < iDropPosition) {
                        iDropPosition--;
                    }

                    if (sInsertPosition === "After") {
                        iDropPosition++;
                    }
                    oGrid.insertItem(oDragged, iDropPosition);
                    oGrid.focusItem(iDropPosition);
                }
            }));

            // Use smaller margin around grid when on smaller screens
            oGrid.attachLayoutChange(function (oEvent) {
                var sLayout = oEvent.getParameter("layout");

                if (sLayout === "layoutXS" || sLayout === "layoutS") {
                    oGrid.removeStyleClass("sapUiSmallMargin");
                    oGrid.addStyleClass("sapUiTinyMargin");
                } else {
                    oGrid.removeStyleClass("sapUiTinyMargin");
                    oGrid.addStyleClass("sapUiSmallMargin");
                }
            });
        },
        _onObjectMatched: function (oEvent) {
            this.getModel('appSettings').setProperty("/selectedKey", oEvent.getParameter("name"))
        },
        onAfterLoad: function () {

            const oChartManager = this.getOwnerComponent().getChartManager();
            const aCharts = oChartManager.createVizFrames();

            const oContainer = this.getView().byId("chartsGrid");
            oContainer.removeAllItems();

            this.attachChartToContainer(oContainer, aCharts, true);
            //End

        }
    });
});
