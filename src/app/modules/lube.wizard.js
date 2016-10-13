/**
 * [Lube.Wizard]
 *
 * @author       [Tim Vermaelen]
 * @date         [2016]
 * @type         [module]
 * @revision     [0.1]
 */

/**
 * @function $ : jQuery
 * @namespace ns : Lube namespace
 */
window.Lube = (function ($, ns) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        cache: {
            container: '[data-class="wizard"]',
            form : 'form',
            trigger: '[data-trigger]',
            triggerLink: '.wizard-steps-link',
            target: '[data-target]',
            fixedElements: '.navbar, .footer, .breadcrumb, .copyright'
        },
        classes: {
            active: 'active',
            disabled: 'disabled',
            previous: 'previous',
            hidden: 'hidden',
            success: 'success'
        },
        data: {
            trigger: 'trigger',
            target: 'target'
        },
        events: {
            click: 'click',
            ready: 'ready'
        },
        options: {
            enableValidation: true,
            enableDynamicHeight: true,
            validation: {
                cache: {
                    container: '[data-class="formhandler"]',
                    partial: '[data-target]'
                },
                options: {
                    enablePartialValidation: true
                }
            }
        },
        props: {
            href: 'href'
        }
    };

    // 3. CONSTRUCTOR
    ns.Wizard = function (options) {
        this.settings = $.extend(true, {}, cfg, options);
        this.init();
    };

    // 4. PROTOTYPE OBJECT
    ns.Wizard.prototype = {
        version: 0.1,

        /**
         * Initialize
         * @return {Object} validator : jquery validator instance
         */
        init: function () {
            this.cacheItems();

            if (this.containers.length) {
                this.bindEvents();
                this.toggleTriggerLinks();
            }
        },

        /**
         * Cache items
         */
        cacheItems: function () {
            var settings = this.settings,
                cache = settings.cache;

            this.containers = $(cache.container);
            this.targets = this.containers.find(cache.target);
            this.triggers = this.containers.find(cache.trigger);
            this.triggerLinks = this.triggers.filter(cache.triggerLink);

            this.fixedElements = $(document.body).find(cache.fixedElements);

            this.validator = undefined;
        },

        /**
         * Bind events
         */
        bindEvents: function () {
            var self = this,
                settings = this.settings,
                cache = settings.cache,
                events = settings.events,
                options = settings.options;

            this.containers.on(events.click, cache.trigger, function () {
                self.toggleTriggerLinks($(this));
            });

            if (options.enableValidation) {
                this.validator = this.validator || new ns.Validation(options.validation);
            }
        },

        /**
         * Toggle the visibility of all trigger links
         * @param {Object} el : cache.trigger
         */
        toggleTriggerLinks: function (el) {
            var self = this,
                settings = this.settings,
                classes = settings.classes,
                data = settings.data,
                options = settings.options,
                props = settings.props,
                triggers = this.triggerLinks,
                len = triggers.length,
                isUrl = document.URL === triggers.first().prop(props.href),
                triggerId = el ? el.data(data.trigger) : isUrl ? 1 : 2,
                isConfirm = triggers.eq(-1).hasClass(classes.success);

            function doToggle() {
                triggers.slice(0, triggerId).addClass(classes.previous).removeClass(classes.active);
                triggers.slice(triggerId, len).removeClass(classes.previous).removeClass(classes.active);
                triggers.filter('[data-trigger="' + triggerId + '"]').addClass(classes.active).toggleClass(classes.previous, isUrl && triggerId > 1);
                triggers.slice(1).toggleClass(classes.disabled, isUrl);

                if (!isUrl) {
                    triggers.eq(0).addClass(classes.disabled, true);
                } else {
                    self.setTargetHeight(self.targets.eq(0));
                }
            }

            if (!isConfirm) {
                if (options.enableValidation && el) {
                    this.toggleTarget(el, doToggle);
                } else {
                    doToggle();
                }
            }
        },

        /**
         * Set minimum height on the steps
         * @param {Object} target : jquery object
         */
        setTargetHeight: function (target) {
            var h = 105;

            $.each(this.fixedElements, function() {
                h += $(this).outerHeight();
            });

            if (target.length) {
                target.siblings().prop({ style: '' });
                target.stop(true, true).animate({ minHeight: window.screen.availHeight - h });
            }
        },

        /**
         * Toggle the visibility of panels
         * @param {Object} el : cache.trigger
         * @param {Function} cb : callback function
         */
        toggleTarget: function (el, cb) {
            var settings = this.settings,
                classes = settings.classes,
                data = settings.data,
                triggerId = el.data(data.trigger),
                target = this.targets.filter('[data-target=' + triggerId + ']');

            if (!el.hasClass(classes.disabled)) {
                this.validate(target, cb);
            }
        },

        /**
         * Validate to switch the step to the target container
         * @param {} target
         * @returns {}
         */
        validate: function (target, cb) {
            var self = this,
                settings = this.settings,
                classes = settings.classes,
                options = settings.options;

            function doToggle() {
                self.targets.addClass(classes.hidden);
                target.removeClass(classes.hidden);
                if (options.enableDynamicHeight) {
                    self.setTargetHeight(target);
                }
                cb();
            }

            if (this.validator) {
                this.validator.validateTarget(target.prev(), doToggle);
            } else {
                doToggle();
            }
        }

    };

    // 5. NAMESPACE
    return ns;

}(window.jQuery, window.Lube || {}));