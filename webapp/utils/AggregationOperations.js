sap.ui.define([], function() {
  "use strict";

  const AggregationOperations = {
      sum: function(values) {
          return values.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      },

      average: function(values) {
          const nonEmptyValues = values.filter(val => val !== undefined && val !== null);
          return nonEmptyValues.length ? AggregationOperations.sum(nonEmptyValues) / nonEmptyValues.length : 0;
      },

      count: function(values) {
          return values.length;
      },

      countNonEmpty: function(values) {
          return values.filter(val => val !== undefined && val !== null).length;
      },

      min: function(values) {
          const nonEmptyValues = values.filter(val => val !== undefined && val !== null);
          return nonEmptyValues.length ? Math.min(...nonEmptyValues) : null;
      },

      max: function(values) {
          const nonEmptyValues = values.filter(val => val !== undefined && val !== null);
          return nonEmptyValues.length ? Math.max(...nonEmptyValues) : null;
      },

      product: function(values) {
          return values.reduce((acc, val) => acc * (val !== undefined && val !== null ? val : 1), 1);
      },

      stdev: function(values, isSample = true) {
          const nonEmptyValues = values.filter(val => val !== undefined && val !== null);
          const mean = AggregationOperations.average(nonEmptyValues);
          const variance = nonEmptyValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
              (isSample ? nonEmptyValues.length - 1 : nonEmptyValues.length);
          return Math.sqrt(variance);
      },

      variance: function(values, isSample = true) {
          const nonEmptyValues = values.filter(val => val !== undefined && val !== null);
          const mean = AggregationOperations.average(nonEmptyValues);
          return nonEmptyValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
              (isSample ? nonEmptyValues.length - 1 : nonEmptyValues.length);
      }
  };

  return AggregationOperations;
});
