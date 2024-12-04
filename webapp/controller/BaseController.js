sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/Device",
  "insightzaptiles/control/Table",
  "sap/ui/table/Table",
  "sap/m/MessageBox",
  "insightzaptiles/model/models",
  "insightzaptiles/control/cardResize/CardResize"
], function (Controller, History, Device, Table, UITable, MessageBox, models, CardResize) {
  "use strict";
  var controller = Controller.extend("insightzaptiles.controller.BaseController", {
    /**
     * Convenience method for accessing the router in every controller of the application.
     * @public
     * @returns {sap.ui.core.routing.Router} the router for this component
     */
    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel: function (sName) {
      return this.getView().getModel(sName);
    },

    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel: function (oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle: function () {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    /**
     * Event handler for navigating back.
     * It there is a history entry we go one step back in the browser history
     * If not, it will replace the current entry of the browser history with the master route.
     * @public
     */
    onNavBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash();
      var sVariant = this.getModel('urlParameters').getProperty('/variant');
      if (sPreviousHash !== undefined) {
        // eslint-disable-next-line sap-no-history-manipulation
        history.go(-1);
      } else {
        this.getRouter().navTo('Main', { variant: sVariant });
      }
    },
    isPhone: function () {
      return Device.system.phone;
    },
    createTable: function (aColumns, sColNum) {
      var oTable;
      var oFlexItemData = new sap.m.FlexItemData({
        alignSelf: "Inherit",
        minHeight: "100%",
        maxHeight: "100%"
      });
      var that = this;
      // if (!this.isPhone()) {
      oTable = new UITable({
        rowMode: "Auto",
        // minAutoRowCount: 1
      });
      var oTableAutoRowMode = new sap.ui.table.rowmodes.Auto({

      })
      oTable.setRowMode(oTableAutoRowMode)

      oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
      oTable.setLayoutData(oFlexItemData);

      oTable.bindAggregation("rows", {
        path: "insightModel>/contentData"
        // events: {
        //     change: function () {
        //         that.update();
        //     }
        // }
      });
      if (!sColNum) {
        sColNum = aColumns.length;
      }

      for (let i = 0; i < sColNum; i++) {
        const oColumnData = aColumns[i];
        var oTypeFormatter = dps.screen.util.InputUtil.createFormatterObject(oColumnData.edmType);
        var oLabel = new sap.m.Label({
          wrapping: false,
          text: {
            parts: [
              {
                path: "insightModel>" + oColumnData.name,
                type: oTypeFormatter// oFormatter.formatFullName

              }
            ],
          }
          // "{insightModel>" + oColumnData.name + "}"
        })
        // console.log(oTypeFormatter);



        var oColumn = new sap.ui.table.Column({
          sortOrder: "None",
          autoResizable: true,
          minWidth: 100,
          label: new sap.m.Label({ text: oColumnData.text }),
          template: oLabel
        })
        oColumn.data({ name: oColumnData.name });


        oTable.addColumn(oColumn)
      }

      // } else {

      // }
      return oTable;
    },
    attachTableCardToContainer: function (oContainer, aFields) {
      var oInsightData = this.getModel('insightModel').getData();
      if (!this.oTable) {
        this.oTable = new Table("cardTable",{
          maximumColumns: 3
        });
        this.oTable.configureTable(oInsightData.metadata.fields, oInsightData.contentData);
      }
      // oMetadata.metadata.fields, oMetadata.contentData

      var oCard = new CardResize({
        // header: new sap.f.cards.Header({
        //   press: this.onTilePress.bind(this)
        // }),
        // headerContentRight: [new sap.m.Button({ text: "Right" })],
        headerContentLeft: [new sap.m.Button({ text: "Left" })],
        headerMenuItems: [new sap.m.MenuItem({ text: "Menu" })],
        resizable: true,
        content: this.oTable// this.createTable(aFields)
      })
      oCard.setLayoutData(new sap.f.GridContainerItemLayoutData({
        minRows: 2, columns: 6
      }))
      oContainer.addItem(oCard);


    },
    attachChartToContainer: function (oContainer, aCharts, bSelectable) {

      aCharts.forEach(oChart => {

        var oCard = new CardResize({
          // header: new sap.f.cards.Header({
          //   title: oChart.config.title
          // }),
          // headerContentRight: [new sap.m.Button({ text: "Right" })],
          resizable: true,
          content: oChart.getVizFrame(),
          selectable: bSelectable,
          selected: oChart.isSelected,
          select: function select(oEvent) {
            oChart.toggleSelectedCharts();
          }
        });
        // oCard.getCardHeader().setShowMenuButton(true);
        oCard.setLayoutData(new sap.f.GridContainerItemLayoutData({
          minRows: 3, columns: 3
        }));
        // if (bSelectable) {
        //   // oCard.getCardHeader().setIconSrc(oChart.getSelectIcon());
        //   oCard.getCardHeader().attachPress(function (data) {
        //     oChart.toggleSelectedCharts()
        //     data.getSource().setIconSrc(oChart.getSelectIcon());
        //   }, this)
        // }

        oContainer.addItem(oCard)
      });
    },
    _InsigthSelRequestCompleted: function (oEvent) {
      var oInsightData;
      var reqSuccess = oEvent.getParameter("success");

      try {

        if (reqSuccess) {
          oInsightData = oEvent.getSource().getData();

        } else {

        }

      } catch (err) {

      }
    },

    _InsigthRequestCompleted: function (oEvent) {
      var oInsightData = this.getModel('insightModel').getData();


      try {
        var reqSuccess = oEvent.getParameter("success");
        if (reqSuccess) {

          this.getOwnerComponent().loadChartData(oInsightData.metadata.graphs);

          this.getView().getController().columnsToTable(oInsightData.metadata.fields);
          // this.getOwnerComponent().oChartManager.loadCharts(oInsightData.metadata.graphs)
        } else {
          var msgTitle = this.getResourceBundle().getText("ReqError");
          MessageBox.error(
            oEvent.getParameter("errorobject").responseText, {
            title: msgTitle,
            onClose: null,                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
          }
          );
        }
      } catch (err) {
        console.error(err);
        var msgTitle = this.getResourceBundle().getText("Error");
        MessageBox.error(
          err.message, {
          title: msgTitle,
          onClose: null,                                       // default
          styleClass: "",                                      // default
          initialFocus: null,                                  // default
          textDirection: sap.ui.core.TextDirection.Inherit     // default
        }
        );
      }
      // return this;
    },

    _CSRFTokenGet: function () {
      models._CSRFTokenGet(this);
    }
  });

  return controller;

});