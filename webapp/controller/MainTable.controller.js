sap.ui.define([
    "./BaseController",
    "insightzaptiles/model/models",
    "sap/ui/table/Table",

    "sap/ui/model/json/JSONModel",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    // "./RevealGrid/RevealGrid",
    "sap/ui/core/library"
], function (BaseController, models, UITable, JSONModel, DragInfo, GridDropInfo, coreLibrary) {
    "use strict";
    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;
    return BaseController.extend("insightzaptiles.controller.MainTable", {
        onInit: function () {
            this.getRouter().getRoute("MainTable").attachPatternMatched(this._onObjectMatched, this);
        },
        _onNavBack: function () {
            this.onNavBack();
        },
        _onObjectMatched: function (oEvent) {
            this.getModel('appSettings').setProperty("/selectedKey", oEvent.getParameter("name"))
        },
        onAfterLoad: function () {
            // debugger;
            // var oInsightModel = this.getModel("insightModel");
            // var aColumns = oInsightModel.getProperty('/metadata/fields');

            var oPage = this.byId('tablePage');
            oPage.setContent(this.getOwnerComponent().getDynamicTable());
        },
        onOpenPersonalization: function () {
            this.getOwnerComponent().getDynamicTable().openPersoDialog(["Columns", "Sorter", "Groups", "Filter"]);
        }
    });
});
