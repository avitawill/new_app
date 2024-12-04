sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";
    const AGGREGATION_TYPES = {
        count: "count"
    }
    // Define the custom class by extending sap.ui.base.Object
    return BaseObject.extend("insightzaptiles.utils.AggregationField", {
        // Constructor function
        
        constructor: function (key, text, value, aggregationType) {
            // Call the base class constructor
            BaseObject.call(this);

            // Initialize properties
            this.key = key;
            this.text = text;
            this.value = value;
            this.aggregationType = AGGREGATION_TYPES.count;
        },

        // Define a method to get details
        getDetails: function () {
            return `Param1: ${this.param1}, Param2: ${this.param2}`;
        },

        // Define a method to set param1
        setParam1: function (value) {
            this.param1 = value;
        },

        // Define a method to set param2
        setParam2: function (value) {
            this.param2 = value;
        }
    });
});