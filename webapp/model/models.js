sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime info for the device the UI5 app is running on as JSONModel
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            getURLParameter: function (sParam) {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] == sParam) {
                        return sParameterName[1];
                    }
                }
            },
            getUrlParameters: function () {

                return {
                    sapLanguage: this.getURLParameter("sap-ui-language"),
                    sapClient: this.getURLParameter("sap-client"),
                    layout: this.getURLParameter("layout"),
                    varType: this.getURLParameter("var_type"),
                    selParams: this.getURLParameter("sel_params"),
                    rainbowColor: this.getURLParameter("rainbow-color"),
                    rainbowLink: this.getURLParameter("rainbow-link"),
                    rainbowUnit: this.getURLParameter("rainbow-unit"),
                };

            },
            // readInsightMetadata: function (oComponents, oModel, sVariant) {

            //     var paramsMap = this.parametersMap(oComponents, sVariant);
            //     return oModel.loadData("/dps/ret/variants/" + sVariant,
            //         paramsMap, true);

            // },
            // readInsightSelScreen: function (oComponents, oModel, sVariant) {

            //     var paramsMap = this.parametersMap(oComponents, sVariant);
            //     return oModel.loadData("/dps/ret/variants/" + sVariant + "/sel",
            //         paramsMap, true);

            // },
            // parametersMap: function (oComponents, sVariant) {

            //     var oUrlParametersModel = oComponents.getModel('urlParameters');
            //     oUrlParametersModel.setProperty('/variant', sVariant);

            //     var paramsMap = {};
            //     if (oUrlParametersModel.getProperty('/sapLanguage') != null) {
            //         paramsMap["sap-language"] = oUrlParametersModel.getProperty('/sapLanguage');
            //     }
            //     if (oUrlParametersModel.getProperty('/layout') != null) {
            //         paramsMap["layout"] = oUrlParametersModel.getProperty('/layout');
            //     }
            //     if (oUrlParametersModel.getProperty('/varType') != null) {
            //         paramsMap["var_type"] = oUrlParametersModel.getProperty('/varType');
            //     }
            //     if (oUrlParametersModel.getProperty('/selParams') != null) {
            //         paramsMap["sel_params"] = oUrlParametersModel.getProperty('/selParams');
            //     }
            //     return paramsMap;

            // },
            mapDefinedProperties: function (source, target) {
                Object.keys(source).forEach((key) => {
                    if (source[key] !== undefined) {
                        target[key] = source[key];
                    }
                });
                return target;
            },
            loadDataForId: function (sUrl) {
                // var
                var paramsMap = {};

                this.mapDefinedProperties(this.getUrlParameters(), paramsMap);

                return new Promise(function (resolve, reject) {
                    const oModel = new JSONModel();

                    oModel.loadData(sUrl, paramsMap, true, "GET", false, false, {
                        "Content-Type": "application/json"
                    });

                    oModel.attachRequestCompleted(function (oEvent) {
                        if (oEvent.getParameter("success")) {
                            resolve(oModel.getData());
                        } else {
                            reject(oEvent.getParameter("errorobject"));
                        }
                    });

                    oModel.attachRequestFailed(function (oEvent) {
                        reject(oEvent.getParameter("error"));
                    });
                });
            },
            buildUrl: function (base, segments = [], queryParams = {}) {
                // Join the base URL with segments
                let url = [base, ...segments.filter(Boolean)].join("/");

                // Add query parameters if provided
                const queryString = Object.entries(queryParams)
                    .filter(([key, value]) => value !== undefined) // Only include defined values
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                    .join("&");

                return queryString ? `${url}?${queryString}` : url;
            },
            _CSRFTokenGet: function (component) {
                var oModel = component.getModel("token");
                oModel.setTokenHandlingEnabled(true);
                var that = component;
                oModel.refreshSecurityToken(function () {
                    var token = oModel.getSecurityToken();
                    // that.getModel("appView").setProperty("/token", token);
                    localStorage.setItem('token', token)
                });
            }


        };

    });