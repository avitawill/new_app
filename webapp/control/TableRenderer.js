sap.ui.define([
    "sap/ui/core/Renderer",
    "sap/m/TableRenderer"
], function (Renderer, TableRenderer) {
    "use strict";

    /**
     * Custom renderer for DynamicPersonalizedTable.
     */
    var CustomTableRenderer = Renderer.extend(TableRenderer);

    // Add custom rendering logic if needed
    // Example: Add a CSS class or additional HTML elements
    CustomTableRenderer.apiVersion = 2; // Enable UI5's modern rendering mode

    CustomTableRenderer.render = function (oRm, oControl) {
        // Start rendering
        oRm.openStart("div", oControl);
        oRm.class("myDynamicPersonalizedTable");
        oRm.openEnd();

        // Render the table aggregation
        oRm.renderControl(oControl.getAggregation("table"));

        // End rendering
        oRm.close("div");
    };

    return CustomTableRenderer;
});
