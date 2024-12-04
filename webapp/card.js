sap.ui.define(["./library", "./CardHeader", "sap/f/Card", "sap/f/CardRenderer",
  "sap/ui/Device", "sap/ui/core/ResizeHandler", "sap/me/shared/util/checkFlag",
  "sap/me/shared/util/roundTime"], function (library, CardHeader, FioriCard, CardRenderer, Device, ResizeHandler, checkFlag, roundTime) {
    "use strict";

    // shortcut for sap.me.cards.SizeBreakpoint
    var SizeBreakpoint = library.SizeBreakpoint;
    var CardBase = FioriCard.extend("sap.me.cards.CardBase", {
      metadata: {
        properties: {
          resizable: {
            type: "boolean",
            group: "Designtime",
            defaultValue: false
          },
          minimumWidth: {
            type: "sap.ui.core.CSSSize",
            defaultValue: "10rem"
          },
          maximumWidth: {
            type: "sap.ui.core.CSSSize",
            defaultValue: null
          },
          editmode: {
            type: "boolean",
            defaultValue: false
          },
          description: {
            type: "string",
            defaultValue: "",
            group: "Designtime"
          },
          preferredWidth: {
            type: "sap.ui.core.CSSSize",
            defaultValue: ""
          },
          supportsFullScreen: {
            type: "boolean",
            defaultValue: false
          },
          authorizations: {
            type: "sap.me.cards.AccessTypedAuthorization",
            group: "Behavior"
          },
          actionDefinitions: {
            type: "sap.me.cards.ActionDefinition[]",
            defaultValue: [{
              actionType: "sap.me.cards.MenuLinkAction",
              actionSettings: {}
            }],
            group: "Behavior"
          },
          cardTemplateId: {
            type: "string",
            defaultValue: ""
          }
        },
        aggregations: {
          // aggregations using forwarding are not cloned
          headerContentLeft: {
            type: "sap.ui.core.Control",
            multiple: true,
            singularName: "headerContentLeft"
          },
          headerContentRight: {
            type: "sap.ui.core.Control",
            multiple: true,
            singularName: "headerContentRight"
          },
          headerMenuItems: {
            type: "sap.m.MenuItem",
            multiple: true,
            singularName: "headerMenuItem",
            bindable: "bindable"
          },
          actions: {
            type: "sap.me.cards.CardAction",
            multiple: true,
            singularName: "action"
          }
        },
        defaultAggregation: "content",
        events: {
          actionsApplied: {},
          headerPress: {},
          sizeChanged: {}
        }
      },
      renderer: CardRenderer
    });
    CardBase.prototype.init = function () {
      FioriCard.prototype.init.apply(this, arguments);
      this.addStyleClass("sapMeCardBase");
      this.setHeader(new CardHeader(this.getId() + "-header", {
        card: this // always associate the header to this card
      }));

      // register the resize listener on-init, we also want to get resize events if the card is re-rendered!
      this._sResizeListenerId = ResizeHandler.register(this, this._handleResized.bind(this));
    };
    CardBase.prototype.setEditmode = function (bEditmode) {
      this.setProperty("editmode", bEditmode);
      this.toggleStyleClass("sapMeCardEditmode", bEditmode);
    };
    CardBase.prototype.setBusy = function (bBusy) {
      this._setBusy.apply(this, arguments);
      this._busyStateChange(bBusy);
      return this;
    };
    // we lend the setBusy method from FioriCard, so others may override the default behavior
    CardBase.prototype._setBusy = FioriCard.prototype.setBusy;
    CardBase.prototype.applySettings = function (mSettings, oScope) {
      FioriCard.prototype.applySettings.apply(this, arguments);

      // add the resizable style class, only for pointer based devices
      this.toggleStyleClass("sapMeCardResizable", Device.support.pointer && this.getResizable());
    };
    CardBase.prototype.setSupportsFullScreen = function (bSupportsFullScreen) {
      this.setProperty("supportsFullScreen", bSupportsFullScreen, false);
      //TODO  to be decided - if to call AddActions from here or somewhere else when actions are added throught Cardeditor
      if (bSupportsFullScreen && !(this instanceof sap.me.cards.TableCard)) {
        this.addActionDefinitions([{
          actionType: "sap.me.cards.FullScreenAction",
          actionSettings: {}
        }]);
      }
      return this;
    };
    CardBase.prototype.addHeaderContentLeft = function (oControl) {
      this.getHeader().addContentLeft(oControl);
    };
    CardBase.prototype.addHeaderContentRight = function (oControl) {
      this.getHeader().addContentRight(oControl);
    };
    CardBase.prototype.addHeaderMenuItem = function (oControl) {
      this.getHeader().addMenuItem(oControl);
    };
    CardBase.prototype.bindHeaderMenuItems = function () {
      var _this$getHeader;
      (_this$getHeader = this.getHeader()).bindMenuItems.apply(_this$getHeader, arguments);
    };
    CardBase.prototype.setActionDefinitions = function (aActionDefinitions) {
      this.setProperty("actionDefinitions", aActionDefinitions, false);
      // this.removeAllActions();
      this._applyActionDefinitions(aActionDefinitions);
      return this;
    };
    CardBase.prototype.addActionDefinitions = function (aActionDefinitions) {
      var _this$getActionDefini;
      this.setProperty("actionDefinitions", ((_this$getActionDefini = this.getActionDefinitions()) !== null && _this$getActionDefini !== void 0 ? _this$getActionDefini : []).concat(aActionDefinitions), false);
      this._applyActionDefinitions(aActionDefinitions);
      return this;
    };
    CardBase.prototype._applyActionDefinitions = function (aActionDefinitions) {
      var _this = this;
      return Promise.all((aActionDefinitions !== null && aActionDefinitions !== void 0 ? aActionDefinitions : []).map(function (_ref) {
        var sName = _ref.actionType,
          actionSettings = _ref.actionSettings;
        return new Promise(function (resolve, reject) {
          sap.ui.require([sName.replace(/\./g, "/")], function (ActionClass) {
            _this.addAction(new ActionClass(actionSettings), true);
            resolve();
          });
        });
      })).then(function () {
        _this.fireActionsApplied();
      });
    };
    CardBase.prototype.addAction = function (oAction, bSupressInvalidate) {
      var designTimeAttributes = oAction.getMetadata().getClass().prototype.designTimeAttributes,
        bIsActionSingleton = designTimeAttributes.isSingleton,
        bOnTrial = checkFlag("isTrial"),
        bAllowActionInTrial = designTimeAttributes.allowInTrial !== false,
        oExistingSingletonAction = bIsActionSingleton ? this.getActions().find(function (x) {
          return x.getMetadata() == oAction.getMetadata();
        }) : undefined;
      if (oExistingSingletonAction) {
        // TODO update Action settings or replace?
        // Should not be allowed
      } else {
        this.addAggregation("actions", oAction, bSupressInvalidate);
        if (!bOnTrial || bOnTrial && bAllowActionInTrial) {
          oAction.apply(this);
        }
      }
      return this;
    };
    CardBase.prototype.onAfterRendering = function () {
      FioriCard.prototype.onAfterRendering.apply(this, arguments);
      // set min-/max-width after rendering, as on re-render it is getting overridden
      this.$().css({
        "min-width": this.getMinimumWidth(),
        "max-width": this.getMaximumWidth()
      });
      this._trackBusyStateForCardLoad(); // on after rendering, which will either set the _vBusyStateTimeout or not if the method was overridden
    };
    CardBase.prototype._recordBecameActive = function () {
      this._iActiveTime || (this._iActiveTime = performance.now());
    };
    CardBase.prototype._trackBusyStateForCardLoad = function () {
      var _this2 = this;
      if (this._vBusyStateTimeout) {
        return;
      }

      // start the timer as soon as we start tracking the busy state
      this._recordBecameActive();

      // measure how long it took for the card to show data
      this._vBusyStateTimeout = setTimeout(function () {
        // if the card is currently busy we wait for the busy indicator to disappear
        // if not, it could mean that the card was busy already in which case the this._bWasBusy flag is set
        if (!_this2.isBusy() && !_this2._bWasBusy) {
          // if the card never was busy we cannot tell if it took time to load the card, so we don't track the time
          _this2._trackCardLoad(/* bIgnoreActive = */true);
        }
      }, 2e3);
    };
    CardBase.prototype._busyStateChange = function (bBusy) {
      this._trackBusyStateForCardLoad(); // call in case the card was not rendered yet, in order to start the timeout
      // in case there is no timeout, the _trackBusyStateForCardLoad method was overridden and
      // we will not use the busy state for determining whether to track the card or not
      if (this._vBusyStateTimeout) {
        if (bBusy) {
          this._bWasBusy = true;
        } else if (this._bWasBusy) {
          this._trackCardLoad();
        }
      }
    };
    CardBase.prototype._trackCardLoad = function (bIgnoreActiveTime) {
      if (!window["octobus"]) {
        return;
      }
      var sCardTemplateId = this.getCardTemplateId();
      if (sCardTemplateId && (this._iActiveTime > 0 || bIgnoreActiveTime && this._iActiveTime !== -1)) {
        octobus.trackCustomEvent("cardload", sCardTemplateId, !bIgnoreActiveTime ? roundTime(performance.now() - this._iActiveTime) : undefined);
        this._iActiveTime = -1; // set it to something truthy, so we don't override the time on next render, however if the card is again getting busy, we are not tracking the cardload again
      }
    };
    CardBase.prototype.exit = function () {
      if (this._sResizeListenerId) {
        ResizeHandler.deregister(this._sResizeListenerId);
        delete this._sResizeListenerId;
      }
    };
    CardBase.prototype.authorizationCheck = function (aUserAuthorizations) {
      var _this$getAuthorizatio;
      var oRequiredAuthorizations = ((_this$getAuthorizatio = this.getAuthorizations) === null || _this$getAuthorizatio === void 0 ? void 0 : _this$getAuthorizatio.call(this)) || {};
      if (!oRequiredAuthorizations.authorizations || oRequiredAuthorizations.authorizations.length === 0) {
        return true;
      }
      return oRequiredAuthorizations.bAnd === true ? oRequiredAuthorizations.authorizations.every(function (sRequiredAuthorization) {
        return aUserAuthorizations === null || aUserAuthorizations === void 0 ? void 0 : aUserAuthorizations.exists(sRequiredAuthorization);
      }) : oRequiredAuthorizations.authorizations.some(function (sRequiredAuthorization) {
        return aUserAuthorizations === null || aUserAuthorizations === void 0 ? void 0 : aUserAuthorizations.exists(sRequiredAuthorization);
      });
    };
    CardBase.prototype.getCurrentSizeBreakpoint = function () {
      return this._currentSizeBreakpoint;
    };

    /**
     * Compares a given breakpoint, to the current size breakpoint.
     *
     * @param {String} sBreakpoint The breakpoint to compare against
     * @returns {int} Undefined in case no breakpoint is currently defined, 0 if this breakpoint is equal to the argument breakpoint, a value less than 0 if the breakpoint of this card is smaller than the given breakpoint; and a value greater than 0 if the breakpoint of this card is larger than the argument breakpoint.
     */
    CardBase.prototype.compareToSizeBreakpoint = function (sBreakpoint) {
      if (!this._currentSizeBreakpoint) {
        return undefined;
      }
      return SizeBreakpoint[this._currentSizeBreakpoint] - SizeBreakpoint[sBreakpoint];
    };

    /**
     * Implements sap.f.ICard interface.
     *
     * @returns {sap.f.cards.IHeader} The header of the card.
     * @protected
     */
    CardBase.prototype.getCardHeader = function () {
      var _this$getShowTitle, _this$getHeader2, _this$getHeader3;
      // display the header only in case there is a title, or any headerContentLeft/Right set (also the menuButton will NOT be rendered, in case this isn't true)
      // TODO: move bShowHeader to a property showHeaderByDefault
      var bShowHeader = ((_this$getShowTitle = this.getShowTitle) === null
        || _this$getShowTitle === void 0 ? void 0 : _this$getShowTitle.call(this))
        && this.getTitle
        && !!this.getTitle()
        || !!((_this$getHeader2 = this.getHeader()) !== null
          && _this$getHeader2 !== void 0
          && _this$getHeader2.getContentLeft().length)
        || !!((_this$getHeader3 = this.getHeader()) !== null
          && _this$getHeader3 !== void 0
          && _this$getHeader3.getContentRight().length);

      return bShowHeader ? FioriCard.prototype.getCardHeader.apply(this, arguments) : null;
    };

    /**
    * Gets the ids of the elements labelling the Card container.
    *
    * @return {string} sAriaLabelledBy ids of elements that have to be labelled
    * @private
    */
    CardBase.prototype._getAriaLabelledIds = function () {
      var _this$getCardHeader, _this$getCardHeader$_, _this$getCardHeader$_2;
      return (this.getId() + "-ariaText " + (((_this$getCardHeader = this.getCardHeader()) === null || _this$getCardHeader === void 0 || (_this$getCardHeader$_ = _this$getCardHeader._getTitle) === null || _this$getCardHeader$_ === void 0 || (_this$getCardHeader$_ = _this$getCardHeader$_.call(_this$getCardHeader)) === null || _this$getCardHeader$_ === void 0 || (_this$getCardHeader$_2 = _this$getCardHeader$_.getId) === null || _this$getCardHeader$_2 === void 0 ? void 0 : _this$getCardHeader$_2.call(_this$getCardHeader$_)) || String())).trim();
    };
    CardBase.prototype._handleResized = function (oEvent) {
      // set the current size breakpoint as css class to the card
      var sBreakpoint = Object.keys(SizeBreakpoint).find(function (sBreakpoint) {
        return oEvent.size.width < SizeBreakpoint[sBreakpoint];
      });
      if (sBreakpoint != this._currentSizeBreakpoint) {
        if (this._currentSizeBreakpoint) {
          this.removeStyleClass("sapMeCard-SizeBp-" + this._currentSizeBreakpoint);
        }
        this.addStyleClass("sapMeCard-SizeBp-" + sBreakpoint);
        this._currentSizeBreakpoint = sBreakpoint;
      }

      // if the card was resized via css, an inline style width is set, this.$()[0].style.width only reads inline styles!
      if (this.getResizable()) {
        var sCardWidth = this.$()[0].style.width;
        if (sCardWidth && !["100%", "auto"].includes(sCardWidth)) {
          this._commitResize();
        }
      }

      // fire the size change event for other controls
      this.fireSizeChanged({
        size: oEvent.size,
        oldSize: oEvent.oldSize,
        breakpoint: sBreakpoint,
        oldBreakpoint: this._currentSizeBreakpoint
      });
    };
    CardBase.prototype._commitResize = function () {
      var $ = this.$();

      // this function is called by _handleResized on a irregular tick interval, if the card is still dragged, a timeout is set
      // in order to check if the card has been released in the meantime (as no further _handleResized event must occur, in case
      // the user just hovered at the same spot for a bit and then released the mouse). However in case the user did resize
      // the card and immediately release the mouse button, the _handleResized tick might hit this method before and the timeout
      // needs to be cleared, in order to not commit the size twice!
      if (this._vCommitResizeTimeout) {
        clearTimeout(this._vCommitResizeTimeout);
      }

      // actually the card needs to be inactive, if it is still :active, the card is still being dragged, so we set a timeout
      // to check whether the mouse button was released in some milliseconds (see comment above for a detailed explanation)
      if ($.is(":active")) {
        this._vCommitResizeTimeout = setTimeout(this._commitResize.bind(this), 100);
      } else {
        // set the preferred width to the current card width
        this.setPreferredWidth($.width() + "rem");
      }
    };
    return CardBase;
  });