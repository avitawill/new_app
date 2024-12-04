/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
    "sap/ui/Device",
    "sap/m/FlexBoxRenderer",
    "sap/m/VBoxRenderer",
    "sap/m/library",
    "sap/ui/core/Renderer",
    "sap/ui/core/IconPool" // side effect: required when calling RenderManager#icon
], function (Device, FlexBoxRenderer,VBoxRenderer, library, Renderer, IconPool) {
    "use strict";

    // shortcut for sap.m.FlexRendertype
    var FlexRendertype = library.FlexRendertype;

    var FlexBoxResizableRenderer = Renderer.extend(VBoxRenderer);

    FlexBoxResizableRenderer.apiVersion = 2;
    FlexBoxResizableRenderer.render = function (oRM, oFlexBox) {
        var sId = oFlexBox.getId();
        // var sElementType = oFlexBox.getRenderType() === FlexRendertype.List ? "ul" : "div";

        oRM.openStart("div", oFlexBox)
            .style("width", oFlexBox.getWidth())
            .style("height", "100%")
            .style("padding", "20px")
            .class("sapFCard")
            .openEnd();
        FlexBoxRenderer.render.apply(this, arguments);

        // FlexBoxRenderer.render(oRM, oFlexBox);

        if (Device.system.desktop) {
            FlexBoxResizableRenderer.renderResizeHandle(oRM, sId);
        }
        oRM.close("div");

    };

    FlexBoxResizableRenderer.renderResizeHandle = function (oRM, sId) {
        oRM.openStart("div", sId + "-resizer")
            .class("sapMDialogResizeHandle")

            .openEnd();

        oRM.icon("sap-icon://resize-corner", ["sapMDialogResizeHandleIcon"], { "title": null, "aria-label": null });

        oRM.close("div");
    };

    return FlexBoxResizableRenderer;
}, /* bExport= */ true);