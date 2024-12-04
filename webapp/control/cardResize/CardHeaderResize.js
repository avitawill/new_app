sap.ui.define([
    "sap/ui/base/EventProvider",
    "sap/ui/core/Control",
    "sap/ui/Device",
    "sap/m/library",
    "sap/m/MenuButton",
    "sap/m/Menu",
    "sap/m/MenuItem",
    "sap/m/OverflowToolbar",
    "sap/m/OverflowToolbarLayoutData",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/Title"],
    function (EventProvider, Control, Device, mlibrary, MenuButton, Menu, MenuItem, OverflowToolbar, OverflowToolbarLayoutData, ToolbarSpacer, Button, Title) {
        "use strict";


        var OverflowPriority = mlibrary.OverflowToolbarPriority;
        var Header = Control.extend("insightzaptiles.control.CardHeaderResize", {
            metadata: {
                interfaces: ["sap.f.cards.IHeader"],
                properties: {
                    showMenuButton: {
                        type: "boolean",
                        defaultValue: true
                    },
                    selectable: {
                        type: "boolean",
                        defaultValue: false,
                        // invalidate: true
                    },
                    selected: {
                        type: "boolean",
                        defaultValue: false,
                        // invalidate: true
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
                    _checkBox: {
                        type: "sap.m.CheckBox",
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
                        type: "insightzaptiles.control.CardResize",
                        multiple: false
                    }
                }
            },
            renderer: {
                apiVersion: 2,
                // enable in-place DOM patching
                render: function render(oRm, oControl) {
                    // var _oCard$getState;
                    // var oCard = oControl._getCard();
                    oRm.openStart("div", oControl);
                    oRm.class("sapFCardHeader");
                    oRm.class("sapMeCardHeader");
                    oRm.attr("tabindex", 0);
                    oRm.openEnd();

                    oRm.openStart("div");
                    oRm.style("flex-grow", 1);
                    oRm.openEnd();

                    oRm.close("div");

                    // if (oControl.getShowMenuButton()) {
                    oRm.renderControl(oControl.getAggregation("_menuButton"));

                    // } else {
                    // oRm.renderControl(oControl.get_toolbar());
                    // }

                    // oControl.getContentLeft().forEach(function (oControl) {

                    // if (![CardState.About, CardState.Authorizations, CardState.Unauthorized].includes(sCardState) && oControl.getContentLeft().length) {
                    if (oControl.getSelectable()) {
                        oControl.addStyleClass("sapMeCardHeaderItemLeft")
                        oRm.renderControl(oControl.get_checkBox());
                    }
                    oControl.getContentLeft().forEach(function (oControl) {
                        oRm.renderControl(oControl.addStyleClass("sapMeCardHeaderItemLeft"));
                    });
                    //   }
                    oControl.getContentRight().forEach(function (oControl) {
                        oRm.renderControl(oControl.addStyleClass("sapMeCardHeaderItemRight"));
                    });
                    oRm.close("div");

                    if (oControl.getSubHeader()) {
                        oRm.renderControl(oControl.getSubHeader());
                    }
                    if (oControl.getMessageStrip()) {
                        oRm.renderControl(oControl.getMessageStrip().addStyleClass("sapUiSmallMargin"));
                    }
                    // }
                }
            }
        });
        Header.prototype.init = function () {
            var _this = this;
            // this._oBundle = sap.ui.getCore().getLibraryResourceBundle("insightzaptiles.i18n")
            // this.toggleStyleClass("sapMeCardResponsiveHeader", FeatureToggles.get("enable-card-header-overflow"));
            this.setAggregation("_checkBox", new sap.m.CheckBox(this.getId() + "-checkBox", {

            }));

            // this.setAggregation("_toolbar", new OverflowToolbar(this.getId() + "-toolbar", {
            //     width: "100%",
            //     style: "Clear",
            //     design: "Transparent",
            //     content: [new Title(), new ToolbarSpacer() // separator between content left & right
            //     ]
            // }));
            this.setAggregation("_menuButton", new MenuButton(this.getId() + "-menuButton", {
                icon: "sap-icon://overflow",
                type: sap.m.ButtonType.Unstyled,
                menu: new Menu(this.getId() + "-menu"),
                // tooltip: this._oBundle.getText("cardMenuTooltip")
            }).addStyleClass("sapMeCardHeaderMenuButton"));;

            this.addMenuItem(this._oAboutMenuItem = new MenuItem({
                icon: "sap-icon://sys-help",
                text: "Menu Item",
                visible: false,
                press: function press(oEvent) {
                    var _this$_getCard;
                    return (_this$_getCard = _this._getCard()) === null || _this$_getCard === void 0 ? void 0 : _this$_getCard.transitionToState(CardState.About);
                }
            }));
        };
        Header.prototype.insertContentLeft = function (oContent, iIndex) {
            this.insertAggregation("contentLeft", oContent, iIndex);
            return this;
        };
        Header.prototype.addContentLeft = function (oContent) {
            // return FeatureToggles.get("enable-card-header-overflow") ? this.insertContentLeft(oContent) : this.addAggregation("contentLeft", oContent);
            return this.addAggregation("contentLeft", oContent);
        };
        Header.prototype.insertContentRight = function (oContent, iIndex) {
            this.insertAggregation("contentRight", oContent, iIndex);
            return this;
        };
        Header.prototype.addContentRight = function (oContent) {
            return this.addAggregation("contentRight", oContent);
        };
        Header.prototype.getContentLeft = function () {
            return this.getAggregation("contentLeft", []);
        };
        Header.prototype.getContentRight = function () {
            return this.getAggregation("contentRight", []);
        }
        Header.prototype.insertMenuItem = function (oMenuItem, iIndex) {
            this.insertAggregation("menuItems", oMenuItem, iIndex);
            return this;
        };
        Header.prototype.setSelectable = function (bSelectable) {
            // this.getHeader().setSelectable(bSelectable);
            return this.setProperty("selectable", bSelectable, true);
        }
        Header.prototype.getSelected = function (bSelectable) {
            
            return this.getAggregation("_checkBox").getSelected();
        }
        Header.prototype.addMenuItem = function (oMenuItem) {
            // return FeatureToggles.get("enable-card-header-overflow") ? this.insertMenuItem(oMenuItem) : this.addAggregation("menuItems", oMenuItem);
            return this.addAggregation("menuItems", oMenuItem);
        };
        Header.prototype.onBeforeRendering = function () {
            var bIsAnyMenuItemVisible =
                this.getMenuItems().map(function (x) {
                    return x.getVisible();
                }).includes(true);
            this.getAggregation("_menuButton").setVisible(bIsAnyMenuItemVisible);
        };
        Header.prototype._getTitle = function () {

            var oTitle = this.getAggregation("_title");
            if (!oTitle) {
                this.setAggregation("_title", oTitle = new Title());
            }
            // }
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
                        // var _this2$_getCard, _this2$_getCard2, _this2$_getCard3, _this2$_getCard4, _this2$_getCard5;
                        // return (_this2$_getCard = _this2._getCard()) === null || _this2$_getCard === void 0 ? void 0 : _this2$_getCard.transitionToState(!((_this2$_getCard2 = _this2._getCard()) !== null && _this2$_getCard2 !== void 0 && _this2$_getCard2._sPreviousCardState) || ((_this2$_getCard3 = _this2._getCard()) === null || _this2$_getCard3 === void 0 ? void 0 : _this2$_getCard3._sPreviousCardState) == ((_this2$_getCard4 = _this2._getCard()) === null || _this2$_getCard4 === void 0 ? void 0 : _this2$_getCard4.getState()) ? CardState.Content : (_this2$_getCard5 = _this2._getCard()) === null || _this2$_getCard5 === void 0 ? void 0 : _this2$_getCard5._sPreviousCardState);
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
                        // if (!FeatureToggles.get("enable-about-card-in-dialog")) {
                        //     var _this3$_getCard;
                        //     (_this3$_getCard = _this3._getCard()) === null || _this3$_getCard === void 0 || _this3$_getCard.transitionToState(CardState.About);
                        // } else {
                        var _this3$_getCard2;
                        (_this3$_getCard2 = _this3._getCard()) === null || _this3$_getCard2 === void 0 || (_this3$_getCard2 = _this3$_getCard2.getAboutAction()) === null || _this3$_getCard2 === void 0 || _this3$_getCard2.showDialogText();
                        // }
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