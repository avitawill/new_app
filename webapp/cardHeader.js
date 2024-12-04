sap.ui.define(["./library", "sap/ui/base/EventProvider", "sap/ui/core/Control", "sap/ui/Device", "sap/m/library", "sap/m/MenuButton", "sap/m/Menu", "sap/m/MenuItem", "sap/m/OverflowToolbar", "sap/m/OverflowToolbarLayoutData", "sap/m/ToolbarSpacer", "sap/m/Button", "sap/m/Title", "sap/me/shared/FeatureToggles"], function (library, EventProvider, Control, Device, mlibrary, MenuButton, Menu, MenuItem, OverflowToolbar, OverflowToolbarLayoutData, ToolbarSpacer, Button, Title, FeatureToggles) {
  "use strict";

  // shortcut for sap.me.cards.CardState
  var CardState = library.CardState,
    OverflowPriority = mlibrary.OverflowToolbarPriority;
  var Header = Control.extend("sap.me.cards.CardHeader", {
    metadata: {
      interfaces: ["sap.f.cards.IHeader"],
      properties: {
        showMenuButton: {
          type: "boolean",
          defaultValue: true
        }
      },
      aggregations: {
        _title: {
          type: "sap.m.Title",
          multiple: false,
          visibility: "hidden"
        },
        _menuButton: {
          type: "sap.m.MenuButton",
          multiple: false,
          visibility: "hidden"
        },
        _menu: {
          type: "sap.m.Menu",
          multiple: false,
          singularName: "menu"
        },
        _closeButton: {
          type: "sap.m.Button",
          multiple: false,
          visibility: "hidden"
        },
        _aboutButton: {
          type: "sap.m.Button",
          multiple: false,
          visibility: "hidden"
        },
        _toolbar: {
          type: "sap.m.OverflowToolbar",
          multiple: false
        },
        contentLeft: {
          type: "sap.ui.core.Control",
          multiple: true,
          singularName: "contentLeft"
        },
        contentRight: {
          type: "sap.ui.core.Control",
          multiple: true,
          singularName: "contentRight"
        },
        menuItems: {
          type: "sap.m.MenuItem",
          multiple: true,
          singularName: "menuItem",
          bindable: "bindable",
          forwarding: {
            idSuffix: "-menu",
            aggregation: "items"
          }
        },
        subHeader: {
          type: "sap.ui.core.Control",
          multiple: false
        },
        messageStrip: {
          type: "sap.m.MessageStrip",
          multiple: false
        }
      },
      associations: {
        card: {
          type: "sap.me.Card",
          multiple: false
        }
      }
    },
    renderer: {
      apiVersion: 2,
      // enable in-place DOM patching
      render: function render(oRm, oControl) {
        var _oCard$getState;
        oRm.openStart("div", oControl);
        oRm.class("sapFCardHeader");
        oRm.class("sapMeCardHeader");
        oRm.attr("tabindex", 0);
        oRm.openEnd();
        var oCard = oControl._getCard(),
          sCardState = oCard === null || oCard === void 0 || (_oCard$getState = oCard.getState) === null || _oCard$getState === void 0 ? void 0 : _oCard$getState.call(oCard);

        // CardState.About and CardState.Authorizations are DEPRECATED
        // in non content cards states, toolbar is not rendered & therfore rendering the title here is necessary
        if (!FeatureToggles.get("enable-card-header-overflow") || [CardState.About, CardState.Authorizations, CardState.Unauthorized].includes(sCardState)) {
          var _oCard$getShowTitle;
          if ((_oCard$getShowTitle = oCard.getShowTitle) !== null && _oCard$getShowTitle !== void 0 && _oCard$getShowTitle.call(oCard) && oControl._getTitle().getText() || oCard.getShowRowCount && oCard.getShowRowCount()) {
            oRm.renderControl(oControl._getTitle());
          }
        }
        oRm.openStart("div");
        oRm.style("flex-grow", 1);
        oRm.openEnd();
        if (!FeatureToggles.get("enable-card-header-overflow")) {
          // CardState.About and CardState.Authorizations are DEPRECATED
          if (![CardState.About, CardState.Authorizations, CardState.Unauthorized].includes(sCardState) && oControl.getContentLeft().length) {
            oControl.getContentLeft().forEach(function (oControl) {
              oRm.renderControl(oControl.addStyleClass("sapMeCardHeaderItemLeft"));
            });
          }
        }
        oRm.close("div");
        switch (sCardState) {
          // CardState.About and CardState.Authorizations are DEPRECATED
          case CardState.About:
          case CardState.Authorizations:
            oRm.renderControl(oControl._getCloseButton());
            break;
          case CardState.Unauthorized:
            oRm.renderControl(oControl._getAboutButton());
            break;
          default:
            if (!FeatureToggles.get("enable-card-header-overflow")) {
              oControl.getContentRight().forEach(function (oControl) {
                oRm.renderControl(oControl.addStyleClass("sapMeCardHeaderItemRight"));
              });
              if (oControl.getShowMenuButton()) {
                oRm.renderControl(oControl.getAggregation("_menuButton"));
              }
            } else {
              oRm.renderControl(oControl.get_toolbar());
            }
        }
        oRm.close("div");
        if (sCardState == CardState.Content) {
          // TODO move follwing aggregations to card for simplicity solving edge cases
          if (oControl.getSubHeader()) {
            oRm.renderControl(oControl.getSubHeader());
          }
          if (oControl.getMessageStrip()) {
            oRm.renderControl(oControl.getMessageStrip().addStyleClass("sapUiSmallMargin"));
          }
        }
      }
    }
  });
  Header.prototype.init = function () {
    var _this = this;
    this._oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.me.cards");
    this.toggleStyleClass("sapMeCardResponsiveHeader", FeatureToggles.get("enable-card-header-overflow"));
    this.setAggregation("_toolbar", new OverflowToolbar(this.getId() + "-toolbar", {
      width: "100%",
      style: "Clear",
      design: "Transparent",
      content: [new Title(), new ToolbarSpacer() // separator between content left & right
      ]
    }));
    this.setAggregation("_menuButton", new MenuButton(this.getId() + "-menuButton", {
      icon: "sap-icon://overflow",
      type: sap.m.ButtonType.Unstyled,
      menu: new Menu(this.getId() + "-menu"),
      tooltip: this._oBundle.getText("cardMenuTooltip")
    }).addStyleClass("sapMeCardHeaderMenuButton"));
    if (!FeatureToggles.get("enable-about-card-in-dialog")) {
      // DEPRECATED version of adding What is this Card About menu item
      this.addMenuItem(this._oAboutMenuItem = new MenuItem({
        icon: "sap-icon://sys-help",
        text: this._oBundle.getText("aboutThisCard"),
        visible: false,
        press: function press(oEvent) {
          var _this$_getCard;
          return (_this$_getCard = _this._getCard()) === null || _this$_getCard === void 0 ? void 0 : _this$_getCard.transitionToState(CardState.About);
        }
      }));
    }
  };
  Header.prototype.insertContentLeft = function (oContent, iIndex) {
    if (FeatureToggles.get("enable-card-header-overflow")) {
      var oToolbar = this.get_toolbar(),
        iLIndex = iIndex !== undefined ? iIndex + 1 /* account for title */ : oToolbar.getContent().findIndex(function (oItem) {
          return oItem instanceof ToolbarSpacer;
        });
      oToolbar.insertContent(oContent, iLIndex);
    } else {
      this.insertAggregation("contentLeft", oContent, iIndex);
    }
    return this;
  };
  Header.prototype.addContentLeft = function (oContent) {
    return FeatureToggles.get("enable-card-header-overflow") ? this.insertContentLeft(oContent) : this.addAggregation("contentLeft", oContent);
  };
  Header.prototype.insertContentRight = function (oContent, iIndex) {
    if (FeatureToggles.get("enable-card-header-overflow")) {
      var oToolbar = this.get_toolbar(),
        iRIndex;
      if (iIndex === undefined) {
        var iOverflowIndex = oToolbar.getContent().findIndex(function (oItem) {
          var _oItem$getLayoutData;
          return ((_oItem$getLayoutData = oItem.getLayoutData()) === null || _oItem$getLayoutData === void 0 ? void 0 : _oItem$getLayoutData.getPriority()) == OverflowPriority.AlwaysOverflow;
        });
        iOverflowIndex = iOverflowIndex > -1 ? iOverflowIndex : oToolbar.getContent().length - 1;
        iRIndex = iOverflowIndex;
      } else {
        !(iIndex > -1) ? 0 : iIndex;
        iRIndex = iIndex + oToolbar.getContent().findIndex(function (oItem) {
          return oItem instanceof ToolbarSpacer;
        }) + 1;
      }
      oToolbar.insertContent(oContent, iRIndex);
    } else {
      this.insertAggregation("contentRight", oContent, iIndex);
    }
    return this;
  };
  Header.prototype.addContentRight = function (oContent) {
    return FeatureToggles.get("enable-card-header-overflow") ? this.insertContentRight(oContent) : this.addAggregation("contentRight", oContent);
  };
  Header.prototype.getContentLeft = function () {
    if (FeatureToggles.get("enable-card-header-overflow")) {
      var oToolbar = this.getAggregation("_toolbar"),
        iSpacerIndex = oToolbar.getContent().findIndex(function (oItem) {
          return oItem instanceof ToolbarSpacer;
        });
      return oToolbar.getContent().slice(1, iSpacerIndex);
    } else {
      return this.getAggregation("contentLeft", []);
    }
  };
  Header.prototype.getContentRight = function () {
    if (FeatureToggles.get("enable-card-header-overflow")) {
      var oToolbar = this.getAggregation("_toolbar"),
        iSpacerIndex = oToolbar.getContent().findIndex(function (oItem) {
          return oItem instanceof ToolbarSpacer;
        });
      return oToolbar.getContent().slice(iSpacerIndex + 1).filter(function (oContentItem) {
        var _oContentItem$getLayo;
        return !(((_oContentItem$getLayo = oContentItem.getLayoutData()) === null || _oContentItem$getLayo === void 0 ? void 0 : _oContentItem$getLayo.getPriority()) === OverflowPriority.AlwaysOverflow);
      });
    } else {
      return this.getAggregation("contentRight", []);
    }
  };
  Header.prototype.insertMenuItem = function (oMenuItem, iIndex) {
    var oToolbar = this.getAggregation("_toolbar"),
      oMenuButton;
    if (oMenuItem.isA("sap.m.MenuItem") && FeatureToggles.get("enable-card-header-overflow")) {
      var _EventProvider$getEve;
      // this branch can be removed once mapping items is no longer necessary
      var oOnPress = (_EventProvider$getEve = EventProvider.getEventList(oMenuItem).press) === null || _EventProvider$getEve === void 0 ? void 0 : _EventProvider$getEve[0],
        oButtonSettings = {
          enabled: oMenuItem.getEnabled(),
          visible: oMenuItem.getVisible(),
          icon: oMenuItem.getIcon(),
          text: oMenuItem.getText() || oMenuItem.getBindingInfo("text"),
          layoutData: new OverflowToolbarLayoutData({
            priority: OverflowPriority.AlwaysOverflow
          })
        };
      if (!oMenuItem.getItems().length) {
        oMenuButton = new Button(oButtonSettings);
        oOnPress && oMenuButton.attachPress(oOnPress.fFunction, oOnPress.oListener);
      } else {
        oMenuButton = new MenuButton(Object.assign({}, oButtonSettings, {
          menu: new Menu({
            items: oMenuItem.getItems().map(function (oItem) {
              return oItem.clone();
            })
          })
        }));
      }
      oMenuItem.attachEvent("aggregationChanged", function (oEvent) {
        if (!oMenuButton.isA("sap.m.MenuButton")) {
          var iIndex = oToolbar.indexOfAggregation("content", oMenuButton);
          var oNewMenuButton = new MenuButton(Object.assign({}, oButtonSettings, {
            menu: new Menu({
              items: oMenuItem.getItems().map(function (oItem) {
                return oItem.clone();
              })
            })
          }));
          oToolbar.removeContent(oMenuButton);
          oToolbar.insertContent(oNewMenuButton, iIndex);
          oMenuButton = oNewMenuButton;
        }
        var oParams = oEvent.getParameters();
        if (oParams.aggregationName === "items") {
          if (oParams.methodName === "removeall") {
            oMenuButton.getMenu().removeAllItems();
          } else if (oParams.methodName === "add") {
            oMenuButton.getMenu().addItem(oParams.methodParams.item.clone());
          } else if (oParams.methodName === "insert") {
            oMenuButton.getMenu().insertItem(oParams.methodParams.item.clone(), oParams.methodParams.index);
          }
        }
      }, this);
      oMenuItem.attachEvent("propertyChanged", function (oEvent) {
        if (oEvent.getParameter("propertyKey") === "enabled") {
          oMenuButton.setEnabled(oEvent.getParameter("propertyValue"));
        } else if (oEvent.getParameter("propertyKey") === "visible") {
          oMenuButton.setVisible(oEvent.getParameter("propertyValue"));
        }
      }, this);
    } else {
      oMenuButton = oMenuItem;
    }
    if (FeatureToggles.get("enable-card-header-overflow")) {
      var _ref, _oToolbar$getContent$;
      oMenuButton.setLayoutData(new OverflowToolbarLayoutData({
        priority: OverflowPriority.AlwaysOverflow
      }));
      var iOverflowIndex = iIndex === undefined ? oToolbar.getContent().length : ((_ref = (_oToolbar$getContent$ = oToolbar.getContent().findIndex(function (oItem) {
        var _oItem$getLayoutData2;
        return ((_oItem$getLayoutData2 = oItem.getLayoutData()) === null || _oItem$getLayoutData2 === void 0 ? void 0 : _oItem$getLayoutData2.getPriority()) == OverflowPriority.AlwaysOverflow;
      })) !== null && _oToolbar$getContent$ !== void 0 ? _oToolbar$getContent$ : oToolbar.getContent().findIndex(function (oItem) {
        return oItem instanceof ToolbarSpacer;
      })) !== null && _ref !== void 0 ? _ref : 0) + iIndex + 1;
      oToolbar.insertContent(oMenuButton, iOverflowIndex);
    } else {
      this.insertAggregation("menuItems", oMenuItem, iIndex);
    }
    return this;
  };
  Header.prototype.addMenuItem = function (oMenuItem) {
    return FeatureToggles.get("enable-card-header-overflow") ? this.insertMenuItem(oMenuItem) : this.addAggregation("menuItems", oMenuItem);
  };
  Header.prototype.onBeforeRendering = function () {
    var _oCard$getState2, _oCard$getTitle;
    var oCard = this._getCard(),
      sState = oCard === null || oCard === void 0 || (_oCard$getState2 = oCard.getState) === null || _oCard$getState2 === void 0 ? void 0 : _oCard$getState2.call(oCard),
      sTitle = oCard === null || oCard === void 0 || (_oCard$getTitle = oCard.getTitle) === null || _oCard$getTitle === void 0 ? void 0 : _oCard$getTitle.call(oCard);
    if (!FeatureToggles.get("enable-about-card-in-dialog")) {
      // DEPRECATED
      this._oAboutMenuItem.setVisible(!!(oCard !== null && oCard !== void 0 && oCard.getDescription()));
    }
    if (sState == CardState.About) {
      // DEPRECATED
      this._getTitle().setText(this._oBundle.getText("aboutThisCardTitle"));
    } else if (sState == CardState.Authorizations) {
      // DEPRECATED
      this._getTitle().setText(this._oBundle.getText("requiredAuthorizationsTitle"));
    } else {
      this._getTitle().setText(sTitle).setVisible(!!sTitle);
    }
    var bIsAnyMenuItemVisible = this.getMenuItems().map(function (x) {
      return x.getVisible();
    }).includes(true);
    this.getAggregation("_menuButton").setVisible(bIsAnyMenuItemVisible);
  };
  Header.prototype._getTitle = function () {
    var oTitle;
    if (FeatureToggles.get("enable-card-header-overflow")) {
      oTitle = this.get_toolbar().getContent()[0];
    } else {
      oTitle = this.getAggregation("_title");
      if (!oTitle) {
        this.setAggregation("_title", oTitle = new Title());
      }
    }
    return oTitle;
  };
  Header.prototype._getCard = function () {
    return this.getCard() ? sap.ui.getCore().byId(this.getCard()) : null;
  };
  Header.prototype._getCloseButton = function () {
    var _this2 = this;
    var oButton = this.getAggregation("_closeButton");
    if (!oButton) {
      this.setAggregation("_closeButton", oButton = new Button(this.getId() + "-closeButton", {
        icon: "sap-icon://decline",
        type: sap.m.ButtonType.Transparent,
        press: function press(oEvent) {
          var _this2$_getCard, _this2$_getCard2, _this2$_getCard3, _this2$_getCard4, _this2$_getCard5;
          return (_this2$_getCard = _this2._getCard()) === null || _this2$_getCard === void 0 ? void 0 : _this2$_getCard.transitionToState(!((_this2$_getCard2 = _this2._getCard()) !== null && _this2$_getCard2 !== void 0 && _this2$_getCard2._sPreviousCardState) || ((_this2$_getCard3 = _this2._getCard()) === null || _this2$_getCard3 === void 0 ? void 0 : _this2$_getCard3._sPreviousCardState) == ((_this2$_getCard4 = _this2._getCard()) === null || _this2$_getCard4 === void 0 ? void 0 : _this2$_getCard4.getState()) ? CardState.Content : (_this2$_getCard5 = _this2._getCard()) === null || _this2$_getCard5 === void 0 ? void 0 : _this2$_getCard5._sPreviousCardState);
        }
      }));
    }
    return oButton;
  };
  Header.prototype._getAboutButton = function () {
    var _this3 = this;
    var oButton = this.getAggregation("_aboutButton");
    if (!oButton) {
      this.setAggregation("_aboutButton", oButton = new Button(this.getId() + "-aboutButton", {
        icon: "sap-icon://sys-help",
        text: this._oBundle.getText("aboutThisCard"),
        press: function press(oEvent) {
          if (!FeatureToggles.get("enable-about-card-in-dialog")) {
            var _this3$_getCard;
            (_this3$_getCard = _this3._getCard()) === null || _this3$_getCard === void 0 || _this3$_getCard.transitionToState(CardState.About);
          } else {
            var _this3$_getCard2;
            (_this3$_getCard2 = _this3._getCard()) === null || _this3$_getCard2 === void 0 || (_this3$_getCard2 = _this3$_getCard2.getAboutAction()) === null || _this3$_getCard2 === void 0 || _this3$_getCard2.showDialogText();
          }
        }
      }));
    }
    return oButton;
  };
  Header.prototype._handlePress = function (oEvent) {
    var oCard;
    if (this.getCard() && oEvent.srcControl === this && (oCard = this._getCard()) && (oCard.getEnabled ? oCard.getEnabled() : true) && oCard.getVisible()) {
      oCard.fireHeaderPress();
    }
  };
  Header.prototype.onsapenter = Header.prototype._handlePress;
  if (Device.support.touch) {
    Header.prototype.ontap = Header.prototype._handlePress;
  } else {
    Header.prototype.onclick = Header.prototype._handlePress;
  }
  Header.prototype.getAriaRoleDescription = function () {
    var _this$hasListeners;
    return (this._oRb ? this._oRb : this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f")).getText((_this$hasListeners = this.hasListeners) !== null && _this$hasListeners !== void 0 && _this$hasListeners.call(this, "press") ? "ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER" : "ARIA_ROLEDESCRIPTION_CARD_HEADER");
  };
  return Header;
});