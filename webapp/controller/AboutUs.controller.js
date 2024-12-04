sap.ui.define([
    "./BaseController",
    "sap/ui/table/Table",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    // "./RevealGrid/RevealGrid",
    "sap/ui/core/library"
], function (BaseController, UITable, JSONModel, DragInfo, GridDropInfo, coreLibrary) {
    "use strict";
    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;
    return BaseController.extend("insightzaptiles.controller.AboutUs", {
        onInit: function () {

            // this.getOwnerComponent().getModel('insightModel').attachRequestCompleted(this._InsigthRequestCompleted.bind(this));
            // this.getRouter().getRoute("AboutUs").attachPatternMatched(this._onObjectMatched, this);

        },
        _onObjectMatched: function (oEvent) {
            // var oArguments = oEvent.getParameter("arguments");
            // var sVariant = oArguments.variant;
            // var oInsightModel = this.getModel('insightModel');

            // var paramsMap = this.parametersMap(sVariant);

            // oInsightModel.loadData("/dps/ret/variants/" + sVariant,
            //     paramsMap, true, undefined, undefined, undefined, { "X-CSRF-Token": "Fetch" });

        },
        columnsToTable: function (aColumns) {
            var oPage = this.byId('tablePage');
            // oPage.removeAllContent();
            oPage.setContent(this.createTable(aColumns));
        }
    });
});
