/**
 * @author       [Stef Coenen & Tim Vermaelen]
 * @date         [2016]
 * @link         [http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html]
 * @namespace    [Lube.Toggle]
 * @requires     [jQuery, Lube]
 * @revision     [0.1]
 */

/**
 * @param {Function} $ : jQuery library
 * @param {Object} ns : Lube namespace
 */
window.Lube = (function ($, ns) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        cache: {
            container: '[data-toggle]',
            arrow: '.icon-arrow-right'
        },
        classes: {
            hidden: 'collapsed',
            active: 'active'
        },
        data: {
            selector: 'toggle'
        },
        events: {
            click: 'click'
        }
    };

    // 3. CONSTRUCTOR
    ns.Toggle = function (options) {
        this.settings = $.extend(true, {}, cfg, options);
        this.init();
    };

    // 3. PROTOTYPE OBJECT
    ns.Toggle.prototype = {

        version: 0.1,

        init: function () {
            var self = this;

            this.cacheItems();

            $.each(this.container, function () {
                self.bindEvents($(this));
            });
        },

        cacheItems: function () {
            this.container = $(this.settings.cache.container);
        },

        /**
         * @param {Object} parent : jquery object
         */
        bindEvents: function (parent) {
            var settings = this.settings,
                cache = settings.cache,
                classes = settings.classes,
                data = settings.data,
                events = settings.events;

            parent.on(events.click, function (ev) {
                var el = $(this),
                    triggerParent = el.closest(cache.container).parent(),
                    dataSelector = el.data(data.selector),
                    arrow = el.find(cache.arrow),
                    targets = triggerParent.find(dataSelector);

                ev.preventDefault();

                $.each(targets, function () {
                    $(this).toggleClass(classes.hidden);
                });

                arrow.toggleClass(classes.active);
            });
        }
    };

    // 4. GLOBALIZE OBJECT
    return ns;

}(window.jQuery, window.Lube || {}));
