sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem",
    'sap/m/table/ColumnWidthController',
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/FilterController",
    "sap/m/p13n/MetadataHelper",
    'sap/ui/model/Sorter',
    'sap/ui/model/Filter',
    'sap/ui/core/library',
    "sap/ui/core/dnd/DragDropInfo",
    "sap/m/table/columnmenu/QuickSort",
    "sap/m/table/columnmenu/ActionItem",
    // "sap/ui/unified/Menu",
    // "sap/ui/unified/MenuItem",
    "dps/screen/util/InputUtil"
], function (
    Control,
    Table,
    Column,
    Text,
    ColumnListItem,
    ColumnWidthController,
    Engine,
    SelectionController,
    SortController,
    GroupController,
    FilterController,
    MetadataHelper,
    Sorter,
    Filter,
    coreLibrary,
    DragDropInfo,
    QuickSort,
    ActionItem,
    // Menu,
    // MenuItem,
    InputUtil
) {
    "use strict";

    return Control.extend("insightzaptiles.control.Table", {
        metadata: {
            properties: {
                internalId: { type: "string", defaultValue: "Table" },
                tableId: { type: "string", defaultValue: null },
                mode: { type: "sap.m.ListMode", defaultValue: "None" },
                maximumColumns: { type: "int", defaultValue: 10 },
            },
            aggregations: {
                table: { type: "sap.m.Table", multiple: false },
                _tableMenu: { type: "sap.ui.core.IColumnHeaderMenu", multiple: false },
            },
        },
        init: function () {
            // Initialize the MetadataHelper without any metadata initially
            this.oMetadataHelper = new MetadataHelper([]);
            const oTableMenu = this._createMenuDepend();
            const oTable = new Table(this.getId() + '--table', {
                autoPopinMode: true,
                growing: true,
                contextualWidth: "auto",
                fixedLayout: "Strict",
                popinLayout: "GridLarge",
                growingScrollToLoad: false,
                mode: this.getProperty("mode")//"MultiSelect",
            });
            oTable.addDragDropConfig(new DragDropInfo({
                sourceAggregation: "columns",
                targetAggregation: "columns",
                drop: this.onColumnDrop.bind(this), // Handle column reordering
            }));
            oTable.addDependent(new sap.m.plugins.ColumnResizer({
                columnResize: this.onColumnResize.bind(this)
            }))

            oTable.addDependent(oTableMenu)

            // Register the table with the Personalization Engine
            // this.oMetadataHelper = new MetadataHelper([]);
            // this.registerEngine(oTable, this.oMetadataHelper);
            this.setAggregation("table", oTable);
            this.setAggregation("_tableMenu", oTableMenu);
        },

        /**
         * Configure the table dynamically with columns and data.
         * Registers the table to the personalization engine during configuration.
         * Adds drag-and-drop configuration for column reordering.
         * @param {Array} aColumns - Array of column metadata.
         * @param {Array} aData - Array of table row data.
         */
        configureTable: function (aColumns, aData) {
            // Retrieve or create the sap.m.Table instance
            let oTable = this.getAggregation("table");
            const oTableMenu = this.getAggregation("_tableMenu");
            // Clear previous columns and items
            oTable.destroyColumns();
            oTable.destroyItems();

            // Update MetadataHelper with new metadata
            this.oMetadataHelper = new MetadataHelper(
                aColumns.map((oColumnMeta) => ({
                    key: oColumnMeta.name, // 'name' is used for key and path
                    label: oColumnMeta.text,
                    path: oColumnMeta.name,
                    edmType: oColumnMeta.edmType
                }))
            );
            var idx = 1;
            // Add columns to the table
            aColumns.forEach((oColumnMeta) => {

                // const oColumn = this._createColumnWithMenu(oColumnMeta.text, oColumnMeta.name);
                const oColumn = new Column({
                    header: new Text({ text: oColumnMeta.text }),
                    width: oColumnMeta.width || "auto",
                    headerMenu: oTableMenu //"menu"
                });
                if (idx > this.getMaximumColumns()) {
                    oColumn.setVisible(false);
                }
                // Store personalization key in the column
                oColumn.data("p13nKey", oColumnMeta.name);
                oTable.addColumn(oColumn);

                idx++
            });

            // Bind data to the table
            const oModel = new sap.ui.model.json.JSONModel({ rows: aData });

            const oTemplate = this._createTemplate(aColumns);
            oTable.setModel(oModel);
            oTable.bindItems({
                path: "/rows",
                template: oTemplate,
            });

            // Register the table to the personalization engine
            Engine.getInstance().register(oTable, {
                helper: this.oMetadataHelper,
                controller: {
                    Columns: new SelectionController({
                        targetAggregation: "columns",
                        control: oTable,
                    }),
                    ColumnWidth: new ColumnWidthController({
                        control: oTable
                    }),
                    Sorter: new SortController({
                        control: oTable,
                    }),
                    Groups: new GroupController({
                        control: oTable,
                    }),
                    Filter: new FilterController({
                        control: oTable,
                    }),
                },
            });
            Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
        },
        beforeOpenColumnMenu: function (oEvt) {
            // const oMenu = this.byId("menu");
            const oMenu = this.getAggregation("_tableMenu");
            const oColumn = oEvt.getParameter("openBy");
            const oSortItem = oMenu.getQuickActions()[0].getItems()[0];
            // const oGroupItem = oMenu.getQuickActions()[1].getItems()[0];

            oSortItem.setKey(this._getKey(oColumn));
            oSortItem.setLabel(oColumn.getHeader().getText());
            oSortItem.setSortOrder(oColumn.getSortIndicator());

            // oGroupItem.setKey(this._getKey(oColumn));
            // oGroupItem.setLabel(oColumn.getHeader().getText());
            // oGroupItem.setGrouped(oColumn.data("grouped"));
        },
        _createMenuDepend: function () {
            return new sap.m.table.columnmenu.Menu({
                beforeOpen: this.beforeOpenColumnMenu.bind(this),
                quickActions: [
                    new QuickSort({
                        items: new sap.m.table.columnmenu.QuickSortItem(),
                        change: this.onSort.bind(this)
                    })
                ],
                items: [
                    // new ActionItem({
                    //     label: "Sort Ascending",
                    //     icon: "sap-icon://sort",
                    //     press: this.onColumnHeaderItemPress.bind(this),
                    // }),
                    // new ActionItem({
                    //     label: "Sort Descending",

                    //     press: this.onColumnHeaderItemPress.bind(this),
                    // }),
                    new ActionItem({
                        label: "Filter",
                        icon: "sap-icon://filter",
                        press: this.onColumnHeaderItemPress.bind(this),
                    }),
                ],
            });

            // return new Column({
            //     header: new Text({ text: sHeaderText }),
            //     menu: oMenu, // Attach the menu
            // });
        },
        onColumnHeaderItemPress: function (oEvt) {
            const oColumnHeaderItem = oEvt.getSource();
            let sPanel = "Columns";
            if (oColumnHeaderItem.getIcon().indexOf("group") >= 0) {
                sPanel = "Groups";
            } else if (oColumnHeaderItem.getIcon().indexOf("sort") >= 0) {
                sPanel = "Sorter";
            } else if (oColumnHeaderItem.getIcon().indexOf("filter") >= 0) {
                sPanel = "Filter";
            }

            this.openPersoDialog([sPanel]);
        },

        _createTemplate: function (aColumns) {
            return new ColumnListItem({
                cells: aColumns.map((oColumnMeta) => {
                    const oTypeFormatter = InputUtil.createFormatterObject(oColumnMeta.edmType);
                    return new Text({
                        wrapping: false,
                        text: {
                            parts: [{
                                path: oColumnMeta.name,
                                type: oTypeFormatter// oFormatter.formatFullName

                            }],
                        }
                    })
                }),
            });
        },
        onSort: function (oEvt) {
            const oSortItem = oEvt.getParameter("item");
            const oTable = this.getAggregation("table");
            const sAffectedProperty = oSortItem.getKey();
            const sSortOrder = oSortItem.getSortOrder();

            //Apply the state programatically on sorting through the column menu
            //1) Retrieve the current personalization state
            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                //2) Modify the existing personalization state --> clear all sorters before
                oState.Sorter.forEach(function (oSorter) {
                    oSorter.sorted = false;
                });

                if (sSortOrder !== coreLibrary.SortOrder.None) {
                    oState.Sorter.push({
                        key: sAffectedProperty,
                        descending: sSortOrder === coreLibrary.SortOrder.Descending
                    });
                }

                //3) Apply the modified personalization state to persist it in the VariantManagement
                Engine.getInstance().applyState(oTable, oState);
            });
        },

        onGroup: function (oEvt) {
            const oGroupItem = oEvt.getParameter("item");
            const oTable = this.setAggregation("table");
            // const oTable = this.byId("persoTable");
            const sAffectedProperty = oGroupItem.getKey();

            //1) Retrieve the current personalization state
            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                //2) Modify the existing personalization state --> clear all groupings before
                oState.Groups.forEach(function (oSorter) {
                    oSorter.grouped = false;
                });

                if (oGroupItem.getGrouped()) {
                    oState.Groups.push({
                        key: sAffectedProperty
                    });
                }

                //3) Apply the modified personalization state to persist it in the VariantManagement
                Engine.getInstance().applyState(oTable, oState);
            });
        },
        /**
         * Handle the drop event for column reordering.
         * @param {sap.ui.base.Event} oEvent - The drop event.
         */
        onColumnDrop: function (oEvent) {
            const oDraggedColumn = oEvent.getParameter("draggedControl");
            const oDroppedOnColumn = oEvent.getParameter("droppedControl");
            const sDropPosition = oEvent.getParameter("dropPosition");
            const oTable = this.getAggregation("table");

            const aColumns = oTable.getColumns();
            const iDraggedIndex = aColumns.indexOf(oDraggedColumn);
            const iDroppedIndex = aColumns.indexOf(oDroppedOnColumn);
            const sKey = this._getKey(oDraggedColumn);

            // Calculate new index
            let iNewIndex = sDropPosition === "Before" ? iDroppedIndex : iDroppedIndex + 1;

            // Adjust the index if moving within the same range
            if (iDraggedIndex < iNewIndex) {
                iNewIndex -= 1;
            }

            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                const oCol = oState.Columns.find(function (oColumn) {
                    return oColumn.key === sKey;
                }) || {
                    key: sKey
                };
                oCol.position = iNewIndex;

                Engine.getInstance().applyState(oTable, {
                    Columns: [oCol]
                });
            });


            // Move the column
            // oTable.removeColumn(oDraggedColumn);
            // oTable.insertColumn(oDraggedColumn, iNewIndex);
        },
        onColumnResize: function (oEvt) {
            const oColumn = oEvt.getParameter("column");
            const sWidth = oEvt.getParameter("width");
            const oTable = this.getAggregation("table");

            const oColumnState = {};
            oColumnState[this._getKey(oColumn)] = sWidth;

            Engine.getInstance().applyState(oTable, {
                ColumnWidth: oColumnState
            });
        },
        /**
         * Open the personalization dialog.
         * @param {Array} aPanels - List of panels to display (e.g., "Columns", "Sorter").
         */
        openPersoDialog: function (aPanels) {
            const oTable = this.getAggregation("table");
            Engine.getInstance().show(oTable, aPanels, {
                contentHeight: "50rem",
                contentWidth: "45rem",
            });
        },
        handleStateChange: function (oEvt) {
            const oTable = this.getAggregation("table");
            const oState = oEvt.getParameter("state");

            if (!oState) {
                return;
            }

            //Update the columns per selection in the state
            this.updateColumns(oState);

            //Create Filters & Sorters
            const aFilter = this.createFilters(oState);
            const aGroups = this.createGroups(oState);
            const aSorter = this.createSorters(oState, aGroups);

            const aCells = oState.Columns.map(function (oColumnState) {
                const oColProperties = this.oMetadataHelper.getProperty(oColumnState.key);
                const oTypeFormatter = InputUtil.createFormatterObject(oColProperties.edmType);
                return new Text({
                    text: {
                        parts: [{
                            path: oColProperties.path,
                            type: oTypeFormatter// oFormatter.formatFullName

                        }],
                    },
                    // text: "{" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
                });
            }.bind(this));
            // const oTemplate = this._createTemplate(oState.Columns);

            //rebind the table with the updated cell template
            oTable.bindItems({
                templateShareable: false,
                path: '/rows',
                sorter: aSorter.concat(aGroups),
                filters: aFilter,
                template:
                    new ColumnListItem({
                        cells: aCells
                    })
            });

        },

        createFilters: function (oState) {
            const aFilter = [];
            Object.keys(oState.Filter).forEach((sFilterKey) => {
                const filterPath = this.oMetadataHelper.getProperty(sFilterKey).path;

                oState.Filter[sFilterKey].forEach(function (oConditon) {
                    aFilter.push(new Filter(filterPath, oConditon.operator, oConditon.values[0]));
                });
            });

            // this.byId("filterInfo").setVisible(aFilter.length > 0);

            return aFilter;
        },

        createSorters: function (oState, aExistingSorter) {
            const aSorter = aExistingSorter || [];
            oState.Sorter.forEach(function (oSorter) {

                const oMetadataProperty = this.oMetadataHelper.getProperty(oSorter.key);
                const oTypeFormatter = InputUtil.createFormatterObject(oMetadataProperty.edmType);

                const oExistingSorter = aSorter.find(function (oSort) {
                    return oSort.sPath === oMetadataProperty.path;
                }.bind(this));

                if (oExistingSorter) {
                    oExistingSorter.bDescending = !!oSorter.descending;
                } else {
                    var oSort = new Sorter(oMetadataProperty.path, oSorter.descending);

                    if (oTypeFormatter.parseToType) {
                        oSort.fnCompare = function (a, b) {
                            return oTypeFormatter.parseToType(a) - oTypeFormatter.parseToType(b);
                        }

                    };
                    aSorter.push(oSort);
                }
            }.bind(this));

            oState.Sorter.forEach((oSorter) => {
                const oTable = this.getAggregation("table");
                const oCol = oTable.getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                if (oSorter.sorted !== false) {
                    oCol.setSortIndicator(oSorter.descending ? coreLibrary.SortOrder.Descending : coreLibrary.SortOrder.Ascending);
                }
            });

            return aSorter;
        },

        createGroups: function (oState) {
            const aGroupings = [];
            oState.Groups.forEach(function (oGroup) {
                aGroupings.push(new Sorter(this.oMetadataHelper.getProperty(oGroup.key).path, false, true));
            }.bind(this));

            oState.Groups.forEach((oSorter) => {
                const oTable = this.getAggregation("table");
                const oCol = oTable.getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                oCol.data("grouped", true);
            });

            return aGroupings;
        },
        _getKey: function (oControl) {
            return oControl.data("p13nKey");
        },
        updateColumns: function (oState) {
            const oTable = this.getAggregation("table");

            oTable.getColumns().forEach((oColumn, iIndex) => {
                oColumn.setVisible(false);
                oColumn.setWidth(oState.ColumnWidth[this._getKey(oColumn)]);
                oColumn.setSortIndicator(coreLibrary.SortOrder.None);
                oColumn.data("grouped", false);
            });

            oState.Columns.forEach((oProp, iIndex) => {
                const oCol = oTable.getColumns().find((oColumn) => oColumn.data("p13nKey") === oProp.key);
                oCol.setVisible(true);

                oTable.removeColumn(oCol);
                oTable.insertColumn(oCol, iIndex);
            });
        },

        destroy: function () {
            const oTable = this.getAggregation("table");
            if (oTable) {
                Engine.getInstance().deregister(oTable);
                oTable.destroy();
            }
            Control.prototype.destroy.apply(this, arguments);
        },
    });
});


// sap.ui.define([
//     "sap/ui/core/Control",
//     "sap/m/Table",
//     "sap/m/Column",
//     "sap/m/Text",
//     "sap/m/ColumnListItem",
//     "sap/ui/core/dnd/DragDropInfo",
//     "sap/m/p13n/Engine",
//     "sap/m/p13n/SelectionController",
//     "sap/m/p13n/SortController",
//     "sap/m/p13n/FilterController",
//     "sap/m/p13n/GroupController",
//     'sap/m/p13n/MetadataHelper',
//     'sap/m/table/ColumnWidthController'
// ], function (
//     Control,
//     Table,
//     Column,
//     Text,
//     ColumnListItem,
//     DragDropInfo,
//     P13nEngine,
//     SelectionController,
//     SortController,
//     FilterController,
//     GroupController,
//     MetadataHelper,
//     ColumnWidthController
// ) {
//     "use strict";

//     return Control.extend("insightzaptiles.control.Table", {
//         metadata: {
//             properties: {
//                 tableId: { type: "string", defaultValue: null },
//             },
//             aggregations: {
//                 table: { type: "sap.m.Table", multiple: false },
//             },
//         },

//         // renderer: TableRenderer,

//         init: function () {
//             const oTable = new Table('Main' + "-table", {
//                 growing: true,
//                 growingScrollToLoad: true,
//                 mode: "MultiSelect",
//             });
//             oTable.addDragDropConfig(new DragDropInfo({
//                 sourceAggregation: "columns",
//                 targetAggregation: "columns",
//                 drop: this.onColumnDrop.bind(this), // Handle column reordering
//             }));
//             // Register the table with the Personalization Engine
//             // this.oMetadataHelper = new MetadataHelper([]);
//             // this.registerEngine(oTable, this.oMetadataHelper);
//             this.setAggregation("table", oTable);
//         },
//         registerEngine: function (oTable, oMetadataHelper) {
//             // oEngine.register
//             const oEngine = P13nEngine.getInstance();
//             oEngine.register(oTable, {

//                 helper: oMetadataHelper,
//                 controller: {
//                     Columns: new SelectionController({
//                         // getKeyForItem: function(a){
//                         //     return a.data('key')
//                         //     // debugger;
//                         // },
//                         targetAggregation: "columns",
//                         control: oTable
//                     }),
//                     Sort: new SortController({
//                         targetAggregation: "rows",
//                         control: oTable
//                     }),
//                     Filter: new FilterController({
//                         targetAggregation: "rows",
//                         control: oTable
//                     }),
//                     Group: new GroupController({
//                         targetAggregation: "rows",
//                         control: oTable
//                     }),
//                     ColumnWidth: new ColumnWidthController({
// 						control: oTable
// 					}),
//                 },
//             });
//             oEngine.attachStateChange(this.handleStateChange.bind(this));
//         },
//         /**
//          * Handle the drop event for column reordering
//          * @param {sap.ui.base.Event} oEvent - The drop event
//          */
//         onColumnDrop: function (oEvent) {
//             const oEngine = P13nEngine.getInstance();
//             const oDraggedColumn = oEvent.getParameter("draggedControl");
//             const oDroppedColumn = oEvent.getParameter("droppedControl");

//             if (oDraggedColumn === oDroppedColumn) {
//                 return;
//             }

//             const oTable = this.getAggregation("table");;
//             const sDropPosition = oEvent.getParameter("dropPosition");
//             const iDraggedIndex = oTable.indexOfColumn(oDraggedColumn);
//             const iDroppedIndex = oTable.indexOfColumn(oDroppedColumn);
//             const iNewPos = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);
//             const sKey = this._getKey(oDraggedColumn);

//             oEngine.retrieveState(oTable).then(function (oState) {

//                 const oCol = oState.Columns.find(function (oColumn) {
//                     return oColumn.key === sKey;
//                 }) || {
//                     key: sKey
//                 };
//                 oCol.position = iNewPos;

//                 oEngine.applyState(oTable, {
//                     Columns: [oCol]
//                 });
//             });
//         },
//         /**
//          * Dynamically configure columns and data
//          * @param {Array} aColumns - Array of column metadata
//          * @param {Array} aData - Array of table row data
//          */
//         _getKey: function (oControl) {
//             return oControl.data("p13nKey");
//         },
//         configureTable: function (aColumns, aData) {
//             const oTable = this.getAggregation("table");
//             // const oEngine = P13nEngine.getInstance();
//             oTable.destroyColumns();
//             oTable.destroyItems();

//             // Dynamically create and add columns
//             aColumns.forEach((oColumnMeta) => {
//                 var oColumn = new Column({
//                     // key: oColumnMeta.name,
//                     header: new Text({ text: oColumnMeta.text }),
//                     width: oColumnMeta.width || "auto",
//                 })
//                 oColumn.data("p13nKey", oColumnMeta.name);
//                 oColumn.data("p13nLabel", oColumnMeta.text);
//                 oColumn.data("p13nPath", oColumnMeta.name);
//                 oTable.addColumn(oColumn);

//             });
//             // aColumns.map(column => ({
//             //     key: column.name,
//             //     label: column.text,
//             //     path: column.name
//             // }));
//             // console.log(oEngine);


//             // Bind data dynamically
//             const oTemplate = new ColumnListItem({
//                 cells: aColumns.map((oColumnMeta) => new Text({ text: `{${oColumnMeta.name}}` })),
//             });

//             const oModel = new sap.ui.model.json.JSONModel({ rows: aData });
//             oTable.setModel(oModel);
//             oTable.bindItems({ path: "/rows", template: oTemplate });

//             // Update metadata for personalization
//             this.oMetadataHelper = new MetadataHelper(this.mapColumnsToMetadata(aColumns));
//             this.registerEngine(oTable, this.oMetadataHelper);
//             // this._updatePersonalizationMetadata(oTable, aColumns);
//         },
//         mapColumnsToMetadata: function (columns) {
//             return columns.map(column => ({
//                 key: column.name,
//                 label: column.text,
//                 path: column.name
//             }));
//         },
//         openPersoDialog: function (aPanels) {
//             const oTable = this.getAggregation("table");
//             Engine.getInstance().show(oTable, aPanels, {
//                 contentHeight: "50rem",
//                 contentWidth: "45rem",
//             });
//         },
//         onOpenPersonalization: function () {
//             const oTable = this.getAggregation("table");
//             oTable.openPersoDialog(["Columns", "Sorter", "Groups", "Filter"]);
//         },
//         /**
//          * Update metadata for personalization controllers
//          * @param {sap.m.Table} oTable - The table instance
//          * @param {Array} aColumns - Column metadata
//          */
//         // _updatePersonalizationMetadata: function (oTable, aColumns) {
//         //     const aColumnMetadata = aColumns.map((oColumn) => ({
//         //         key: oColumn.field,
//         //         label: oColumn.label,
//         //         type: oColumn.type || "string",
//         //     }));

//         //     // const oEngine = P13nEngine.getInstance();
//         //     // oEngine.createP13nData(oTable, "Columns", aColumnMetadata);
//         //     // oEngine.createP13nData(oTable, "Sort", aColumnMetadata);
//         //     // oEngine.createP13nData(oTable, "Filter", aColumnMetadata);
//         //     // oEngine.createP13nData(oTable, "Group", aColumnMetadata);
//         // },
//         handleStateChange: function (oEvent) {
//             const oTable = this.getAggregation("table");
//             const oState = oEvent.getParameter("state");

//             if (!oState) {
//                 return;
//             }

//             //Update the columns per selection in the state
//             this.updateColumns(oState);

//             //Create Filters & Sorters
//             const aFilter = this.createFilters(oState);
//             const aGroups = this.createGroups(oState);
//             const aSorter = this.createSorters(oState, aGroups);

//             const aCells = oState.Columns.map(function (oColumnState) {
//                 return new Text({
//                     text: "{" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
//                 });
//             }.bind(this));

//             //rebind the table with the updated cell template
//             oTable.bindItems({
//                 templateShareable: false,
//                 path: '/items',
//                 sorter: aSorter.concat(aGroups),
//                 filters: aFilter,
//                 template: new ColumnListItem({
//                     cells: aCells
//                 })
//             });

//         },
//         updateColumns: function(oState) {
// 			const oTable = this.getAggregation("table");

// 			oTable.getColumns().forEach((oColumn, iIndex) => {
// 				oColumn.setVisible(false);
// 				oColumn.setWidth(oState.ColumnWidth[this._getKey(oColumn)]);
// 				oColumn.setSortIndicator(coreLibrary.SortOrder.None);
// 				oColumn.data("grouped", false);
// 			});

// 			oState.Columns.forEach((oProp, iIndex) => {
// 				const oCol = oTable.getColumns().find((oColumn) => oColumn.data("p13nKey") === oProp.key);
// 				oCol.setVisible(true);

// 				oTable.removeColumn(oCol);
// 				oTable.insertColumn(oCol, iIndex);
// 			});
// 		},
//         destroy: function () {
//             const oTable = this.getAggregation("table");
//             if (oTable) {
//                 P13nEngine.getInstance().deregister(oTable);
//                 oTable.destroy();
//             }
//             Control.prototype.destroy.apply(this, arguments);
//         },
//     });
// });
