/**
 * @author       [Stef Coenen & Tim Vermaelen]
 * @date         [2016]
 * @namespace    [Lube.Geolocation]
 * @requires     [jQuery, Modernizr, Google.Maps, Lube]
 * @revision     [0.1]
 */

/**
 * @param {Function} $ - jQuery library
 * @param {Object} modernizr - Modernizr library
 * @param {Object} google - Google namespace
 * @param {Object} ns - Lube namespace
 * @augments {Function} $.cookie
 */
window.Lube = (function ($, modernizr, google, ns) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        geoIpServiceUrl: '//freegeoip.net/json/',
        currentPositionOptions: {
            maximumAge: 60000,
            timeout: 5000,
            enableHighAccuracy: true
        },
        cookieOptions: {
            name: 'geolocation',
            expires: undefined,
            domain: document.domain,
            json: false,
            path: '/',
            secure: false
        },
        options: {
            isEnabled: true
        }
    };

    // 3. CONSTRUCTOR
    /**
     * @param {Function} cb : callback function
     * @param {Object} options : object literal like cfg
     */
    ns.Geolocation = function (cb, options) {
        this.settings = $.extend(true, {}, cfg, options);
        this.callback = cb;
        this.init();
    };

    // 3. COMPONENT OBJECT
    ns.Geolocation.prototype = {

        version: 0.2,

        /**
         * Component initialization
         */
        init: function () {
            this.cacheItems();

            if (this.settings.options.isEnabled) {
                this.activate();
            } else {
                if (typeof this.callback === 'function') {
                    this.callback();
                }
            }
        },

        cacheItems: function () {
            $.cookie.defaults = this.settings.cookieOptions;
        },

        /**
         * Activates cookie information, native browser support or webservice fallback
         */
        activate: function () {
            var settings = this.settings,
                cookieOptions = settings.cookieOptions,
                currentPositionOptions = settings.currentPositionOptions,
                cookie = $.cookie(cookieOptions.name);

            if (cookie) {
                this.setCoords(ns.fn.convertQsToLiteral(cookie));
            } else if (modernizr && modernizr.geolocation && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.setCoords.bind(this), this.geoAlternative.bind(this), currentPositionOptions);
            } else {
                this.geoAlternative();
            }
        },

        geoAlternative: function () {
            var self = this;

            $.getJSON(this.settings.geoIpServiceUrl).done(function (data) {
                self.setCoords(data);
            }).fail(function (xhr, status) {
                console.warn('GeoLocation: ' + status);
                self.callback();
            });
        },

        /**
         * Format position with coördinates from webservice data
         * @param {Object} data : webservice data
         */
        setCoords: function (data) {
            var position;

            data = data.coords || data;
            position = {
                latitude: data.latitude,
                longitude: data.longitude
            };

            $.cookie(this.settings.cookieOptions.name, $.param(position));
            this.callback(position);
        }

    };

    // 4. EXPOSE NAMESPACE
    return ns;

}(window.jQuery, window.Modernizr, window.google || undefined, window.Lube || {}));
