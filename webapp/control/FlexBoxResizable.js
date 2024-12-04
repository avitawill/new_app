sap.ui.define([
    "sap/ui/Device",
    "sap/m/FlexBox",
    "sap/m/VBox",
    "insightzaptiles/control/FlexBoxResizableRenderer"

], function (Device, FlexBox,VBox, FlexBoxResizableRenderer) {
    "use strict";

    var FlexBoxResizable = VBox.extend("insightzaptiles.control.FlexBoxResizable", {
        constructor: function (sId, mSettings) {
            FlexBox.prototype.constructor.apply(this, arguments);
        },
        metadata: {
            // library: "dps.screen",
            properties: {

                // fieldType: { type: "dps.screen.FieldType", defaultValue: '', bindable: "bindable" },

                // displayFormat: { type: "string", defaultValue: '', bindable: "bindable" },



            },
            aggregations: {
                layoutData: { type: "sap.ui.core.LayoutData", multiple: false },
                // _time: { type: "sap.m.TimePicker", multiple: false },
                // _dateTime: { type: "sap.m.DateTimePicker", multiple: false },
            },
            events: {
                dubleClick: {

                },
            },
            Renderer: FlexBoxResizableRenderer

        },
    });

    FlexBoxResizable.prototype.init = function () {
        FlexBox.prototype.init.apply(this, arguments);

    };

    FlexBoxResizable.prototype.applySettings = function () {
        FlexBox.prototype.applySettings.apply(this, arguments);

    };
    FlexBoxResizable.prototype.onAfterRendering = function () {
        FlexBox.prototype.onAfterRendering.apply(this, arguments);
        //register the content resize handler
        // this._registerResizeObserver();
        if(!this._isPhone()){
            this._applyDragToResize();

        }
    }
    FlexBoxResizable.prototype._deregisterResizeObserver = function () {
        if (this._oResizeObserver) {
            this._oResizeObserver.disconnect();
            this._oResizeObserver = null;
        }
    };
    FlexBoxResizable.prototype._registerResizeObserver = function () {
        if (!this._oResizeObserver) {
            this._oResizeObserver = new ResizeObserver(() => {
                window.requestAnimationFrame(() => {
                    this._onResize();
                });
            });

            this._oResizeObserver.observe(this.getDomRef("scrollCont"));
        }

        //set the initial size of the content container so when a dialog with large content is open there will be a scroller
        this._onResize();
    };
    FlexBoxResizable.prototype._isPhone = function () {
        return sap.ui.Device.system.phone;
    };
    FlexBoxResizable.prototype._applyDragToResize = function (e) {
        // debugger;
        const resizer = this.getDomRef("resizer");
        const resizable = this.getDomRef();
        const gridSize = 50; // Size of each grid unit in pixels
        let that = this;
        let oLayoutData = this.getLayoutData();
        let isResizing = false;
        let startWidth, startHeight, startX, startY;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            that, oLayoutData;
            // let oLayoutData = this.getLayoutData();
            // Initial measurements
            startWidth = resizable.clientWidth;
            startHeight = resizable.clientHeight;
            startX = e.clientX;
            startY = e.clientY;

            // Start the animation loop
            requestAnimationFrame(resizeLoop);
        });

        function resizeLoop() {
            if (isResizing) {
                document.addEventListener('mousemove', onResize);
                document.addEventListener('mouseup', stopResize);

                requestAnimationFrame(resizeLoop); // Continue until mouse is released
            }
        }

        function onResize(e) {
            // Calculate the change in position
            console.log("startX:", startX,"startY:", startY)
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            console.log(dx, dy)
            // Calculate new size in grid units, rounding to snap to nearest grid size
            const newWidth = Math.round((startWidth + dx) / gridSize) * gridSize;
            const newHeight = Math.round((startHeight + dy) / gridSize) * gridSize;
            console.log("newWidth:",newWidth,"newHeight:", newHeight)
            // console.log(newWidth, newHeight)
            // Update size while keeping within grid bounds
            resizable.style.width = `${newWidth}px`;
            resizable.style.height = `${newHeight}px`;
            
            that.setHeight(`${newHeight}px`);
            resizable.style.border = 'dashed';
            // that.getParent()

            // Update display text to show current size in grid units
            const columns = newWidth / gridSize;
            const rows = newHeight / gridSize;
            that.getLayoutData().setColumns(columns);
            that.getLayoutData().setRows(rows);
            
            
            // oGrid.focusItem(iDropPosition);
            // that.setAggregation('layoutData', that.getLayoutData())
            // that.setLayoutData(that.getLayoutData());
            // resizable.textContent = `${columns}x${rows}`;
        }

        function stopResize() {
            resizable.style.border = 'none';
            var iDropPosition = that.getParent().indexOfItem(that);
            var oGrid = that.getParent();
            oGrid.removeItem(that);
            oGrid.insertItem(that, iDropPosition);
            oGrid.focusItem(iDropPosition);
            isResizing = false;
            document.removeEventListener('mousemove', onResize);
            document.removeEventListener('mouseup', stopResize);
        }
    }
    // FlexBoxResizable.prototype.setLayoutData = function () {

    // }
    FlexBoxResizable.prototype._onResize = function () {
        if (!this.getDomRef()) {
            return;
        }

        // var $dialog = this.$(),
        //     $dialogContent = this.$('cont'),
        //     sContentWidth = this.getWidth(),
        //     iMaxDialogWidth = '90%' //this._calcMaxSizes().maxWidth; // 90% of the max screen size

        //if height is set by manually resizing return;
        // if (this._oManuallySetSize) {
        //     $dialogContent.css({
        //         width: 'auto'
        //     });
        //     return;
        // }

        // Browsers except chrome do not increase the width of the container to include scrollbar (when width is auto). So we need to compensate
        if (Device.system.desktop && !Device.browser.chrome) {

            var iCurrentWidthAndHeight = $dialogContent.width() + "x" + $dialogContent.height(),
                bMinWidth = $dialog.css("min-width") !== $dialog.css("width");

            // Apply the fix only if width or height did actually change.
            // And when the width is not equal to the min-width.
            if (iCurrentWidthAndHeight !== this._iLastWidthAndHeightWithScroll && bMinWidth) {
                if (this._hasVerticalScrollbar() &&					// - there is a vertical scroll
                    (!sContentWidth || sContentWidth == 'auto') &&	// - when the developer hasn't set it explicitly
                    !this.getStretch() && 							// - when the dialog is not stretched
                    $dialogContent.width() < iMaxDialogWidth) {		// - if the dialog can't grow anymore

                    $dialog.addClass("sapMDialogVerticalScrollIncluded");
                    $dialogContent.css({ "padding-right": SCROLLBAR_WIDTH });
                    this._iLastWidthAndHeightWithScroll = iCurrentWidthAndHeight;
                } else {
                    $dialog.removeClass("sapMDialogVerticalScrollIncluded");
                    $dialogContent.css({ "padding-right": "" });
                    this._iLastWidthAndHeightWithScroll = null;
                }
            } else if (!this._hasVerticalScrollbar() || !bMinWidth) {
                $dialog.removeClass("sapMDialogVerticalScrollIncluded");
                $dialogContent.css({ "padding-right": "" });
                this._iLastWidthAndHeightWithScroll = null;
            }
        }

        // if (!this._oManuallySetSize && !this._bDisableRepositioning) {
        //     this._positionDialog();
        // }
    };
    return FlexBoxResizable;
});