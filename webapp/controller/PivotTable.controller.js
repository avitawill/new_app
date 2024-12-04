sap.ui.define([
    "./BaseController",
    "insightzaptiles/model/models",
    "sap/ui/table/Table",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    "insightzaptiles/utils/AggregationOperations",
    "insightzaptiles/utils/AggregationField",
    // "./RevealGrid/RevealGrid",
    "sap/ui/core/library"
], function (BaseController, models, UITable, JSONModel, DragInfo, GridDropInfo, AggregationOperations, AggregationField, coreLibrary) {
    "use strict";
    const PIVOT_ROWS_MODEL = 'PivotTableRows';
    const PIVOT_FIELDS_MODEL = 'PivotTableFields';
    const PIVOT_COLS_MODEL = 'PivotTableColumns';
    const PIVOT_VALUES_MODEL = 'PivotTableValues';

    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;
    return BaseController.extend("insightzaptiles.controller.PivotTable", {
        onInit: function () {
            this.setModel(new JSONModel([]), "PivotTableFields");
            this.setModel(new JSONModel([]), "PivotTableRows");
            this.setModel(new JSONModel([]), "PivotTableColumns");
            this.setModel(new JSONModel([]), "PivotTableValues");
        },
        _onObjectMatched: function (oEvent) {
            this.getModel('appSettings').setProperty("/selectedKey", oEvent.getParameter("name"))
        },
        _onNavBack: function () {
            this.onNavBack();
        },

        onAfterLoad: function () {
            // items="{insightModel>/metadata/fields/}"
            var oInsightModel = this.getModel("insightModel");
            var aColumns = oInsightModel.getProperty('/metadata/fields');
            var oPivotTableFields = this.getModel("PivotTableFields");

            oPivotTableFields.setData(aColumns);
            oPivotTableFields.refresh();

        },
        onDropToPropertiesTable: function (oEvent) {
            // console.log(oEvent);
            // console.log(oEvent.getParameters());

            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oSourceTableControl = oDraggedItem.getParent();
            var sSourceControlModelName = oSourceTableControl.getBindingInfo('items').model
            var oDraggedItemContext = oDraggedItem.getBindingContext(sSourceControlModelName);
            if (!oDraggedItemContext) {
                return;
            }
            var oLineData = oDraggedItemContext.getObject();
            var oAggregationField = new AggregationField(
                oLineData.name,
                oLineData.text
                // value:
            )

            var oTargetControl = oEvent.getParameter("droppedControl");
            var sTargetControlModelName = oTargetControl.getBindingInfo('items').model;
            var oProductsModel = oTargetControl.getModel(sTargetControlModelName) //oAvailableProductsTable.getModel();

            this.fieldsLocationValidation(sSourceControlModelName, sTargetControlModelName, oAggregationField.key)

            var aTable = oProductsModel.getData();

            aTable.push(oAggregationField);


            oProductsModel.setData(aTable);
            oProductsModel.refresh();

            this.applyPivot();
            // oProductsModel.createBindingContext('/0', oDraggedItemContext);

        },
        deleteIfExistInModel: function (sKey, sModelName) {
            var oModel = this.getModel(sModelName);
            var oModelData = oModel.getData();

            var iExistsIndex;
            for (let i = 0; i < oModelData.length; i++) {
                const element = oModelData[i];
                if (element.key === sKey) {
                    iExistsIndex = i;
                }
            }
            if (iExistsIndex !== undefined) {
                oModelData.splice(iExistsIndex, 1);
                oModel.refresh();
            }
        },
        fieldsLocationValidation: function (sSourceModel, sTargetModel, sKey) {
            if (sSourceModel === PIVOT_FIELDS_MODEL
                && (sTargetModel === PIVOT_ROWS_MODEL
                    || sTargetModel === PIVOT_COLS_MODEL)) {

                this.deleteIfExistInModel(sKey, PIVOT_ROWS_MODEL);
                this.deleteIfExistInModel(sKey, PIVOT_COLS_MODEL);

            } else if (sSourceModel === PIVOT_FIELDS_MODEL
                && (sTargetModel === PIVOT_VALUES_MODEL)) {

                this.deleteIfExistInModel(sKey, PIVOT_VALUES_MODEL);
            }
        },
        onPressDeletePivotProperty: function (oEvent) {
            var sKey = oEvent.getSource().data('key');
            var sModelName = oEvent.getSource().data('model');

            this.deleteIfExistInModel(sKey, sModelName);
            this.applyPivot();
        },
        applyPivot: function () {
            var oPivotTableDataBox = this.byId('PivotTableData');
            oPivotTableDataBox.removeAllItems();
            var oInsightData = this.getModel('insightModel').getData();
            var aRows = this.getModel(PIVOT_ROWS_MODEL).getData();
            var aColumns = this.getModel(PIVOT_COLS_MODEL).getData();
            var aValues = this.getModel(PIVOT_VALUES_MODEL).getData();

            var aPivotTable = this.buildPivotTable(oInsightData.contentData, aRows, aColumns, aValues);
            var oTable = this.createPivotTableControl(aPivotTable);
            oPivotTableDataBox.addItem(oTable);
            // console.log(aPivotTable);
        },
        createPivotTableControl: function (oPivotTable) {
            this.setModel(new JSONModel(oPivotTable), "PivotTableModel")
            var aPivotColumns = Object.keys(oPivotTable[0]);
            var oTable = new UITable({});

            oTable.bindAggregation("rows", {
                path: "PivotTableModel>/"
            });
            for (let i = 0; i < aPivotColumns.length; i++) {
                const oColumnData = aPivotColumns[i];

                var oColumn = new sap.ui.table.Column({
                    sortOrder: "None",
                    autoResizable: true,
                    minWidth: 100,
                    label: new sap.m.Label({ text: oColumnData }),
                    template: new sap.m.Label({ wrapping: false, text: "{PivotTableModel>" + oColumnData + "}" })
                })
                oColumn.data({ name: oColumnData });
                oTable.addColumn(oColumn)
            }
            return oTable;
        },
        onChangeAggType: function (oEvent) {
            this.applyPivot();
        },
        buildPivotTable: function (data, rowFields, columnFields, valueFields) {
            const pivotData = {};
            var rowText;
            data.forEach(row => {
                var rowKey;

                var columnKey;
                // Create row key based on multiple rowFields
                rowKey = rowFields.map(field => row[field.key]).join(" | ");
                rowText = rowFields.map(field => field.text).join(" | ");

                // Create column key based on multiple columnFields
                columnKey = columnFields.map(field => row[field.key]).join(" | ");

                // Initialize the row in the pivot data if it doesn't exist
                if (!pivotData[rowKey]) {
                    pivotData[rowKey] = {};
                }
                // Initialize the column in the row if it doesn't exist
                if (!pivotData[rowKey][columnKey]) {
                    pivotData[rowKey][columnKey] = {};
                    if (Array.isArray(valueFields)) {
                        valueFields.forEach(valueField => {
                            pivotData[rowKey][columnKey][valueField.text] = [];//valueField.init()
                        });
                    }
                }

                // Aggregate each value field
                valueFields.forEach(valueField => {
                    const value = row[valueField.key] !== undefined ? row[valueField.key] : null;
                    pivotData[rowKey][columnKey][valueField.text].push(value);
                });
            }, rowText);

            // Convert the pivot data to an array format suitable for display
            var result = [];
            for (const rowKey in pivotData) {
                var row = {};
                row[rowText] = rowKey;
                for (const columnKey in pivotData[rowKey]) {
                    // row[columnKey] = {};
                    valueFields.forEach(valueField => {
                        const values = pivotData[rowKey][columnKey][valueField.text];
                        row[`${columnKey} | ${valueField.text}`] = AggregationOperations[valueField.aggregationType](values);
                    });

                }
                result.push(row);
            }

            return result;
        }
    });
});
