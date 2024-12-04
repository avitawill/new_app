sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel"
],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("insightzaptiles.controller.App", {
      onInit: function () {

        // var oModel = new JSONModel(sap.ui.require.toUrl("insightzaptiles/model/data.json"));
        // var oModel = this.getOwnerComponent().getModel('navigationSettings');
        // this.getView().setModel(oModel);
      },
      onSideNavButtonPress: function (oEvent) {

        var oToolPage = this.byId("toolPage");
        var bSideExpanded = oToolPage.getSideExpanded();

        this._setToggleButtonTooltip(bSideExpanded);

        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      },
      _setToggleButtonTooltip: function (bLarge) {
        var oToggleButton = this.byId('sideNavigationToggleButton');
        if (bLarge) {
          oToggleButton.setTooltip('Large Size Navigation');
        } else {
          oToggleButton.setTooltip('Small Size Navigation');
        }

      },
      onItemSelect: function (oEvent) {
        var sVariant = this.getModel('insightModel').getProperty('/metadata/varId')
        var oItem = oEvent.getParameter("item");
        this.getRouter().navTo(oItem.getKey(), {
          variant: sVariant
        });
        // var oNavContainer = this.byId("pageContainer");
        // let oPage = oNavContainer.getPage(oItem.getKey());
        // if (!oPage) {
        //   // Lazily load the page and add it to NavContainer
        //   oPage = sap.ui.xmlview(viewPath);
        //   oPage.setId(pageId);
        //   oNavContainer.addPage(oPage);
        // }

        // Navigate to the page
        // oNavContainer.to(pageId);
      },
      onChangeTheme: function (oEvent) {
        const sSelectedTheme = oEvent.getParameter("selectedItem").getKey();
        sap.ui.getCore().applyTheme(sSelectedTheme);
      },
      onPageNavigation: function (oEvent) {
        // debugger;
      }
    });
  }
);
