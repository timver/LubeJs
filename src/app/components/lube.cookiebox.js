/**
 * [Lube.Cookiebox]
 * 
 * @author      [Stef Coenen & Tim Vermaelen]
 * @date        [2016]
 * @version     [0.4]
 * @type        [component]
 */

/**
 * @param        {Function} $ jQuery
 * @param        {Object} gad GiveADay
 */
window.Lube = (function ($, gad) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        cache: {
            container: '[data-module="cookiebox"]',
            button: '.btn'
        },
        classes: {
            active: 'active'
        },
        events: {
            click: 'click',
            load: 'load'
        },
        cookie: {
            name: 'cookiebox',
            value: 'accepted',
            expires: 365,
            domain: document.domain || window.location.hostname,
            json: false,
            path: '/',
            secure: false
        }
    };

    // 3. COMPONENT OBJECT
    gad.Cookiebox = {

        version: 0.1,

        /**
         *  Component initialization
         */
        init: function () {
            var cache = cfg.cache,
                events = cfg.events;

            $.cookie.defaults = cfg.cookie;

            this.cacheItems(cache);
            this.bindEvents(cache, events);
        },

        /**
         * @param {Object} cache : cfg.cache
         */
        cacheItems: function (cache) {
            this.win = $(window);
            this.container = $(cache.container);
        },

        /**
         * @param {Object} cache : cfg.cache
         * @param {Object} events : cfg.events
         */
        bindEvents: function (cache, events) {
            var self = this;

            this.win.on(events.load, this.toggle.call(this));
            this.container.on(events.click, cache.button, function (ev) {
                ev.preventDefault();
                self.accept();
            });
        },

        accept: function () {
            var options = cfg.cookie;

            $.cookie(options.name, options.value, options);
            this.toggle();
        },

        /**
         * Toggle the cookiebox
         */
        toggle: function () {
            var activeClass = cfg.classes.active;

            if (!$.cookie(cfg.cookie.name)) {
                this.container.addClass(activeClass);
            } else {
                this.container.removeClass(activeClass);
            }
        }

    };

    // 4. GLOBALIZE OBJECT
    return gad;

}(window.jQuery, window.Lube || {}));
