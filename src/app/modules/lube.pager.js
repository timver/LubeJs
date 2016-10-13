/**
 * @author       [Stef Coenen & Tim Vermaelen]
 * @date         [2016]
 * @namespace    [Lube.Pager]
 * @requires     [jQuery, Lube]
 * @revision     [0.1]
 */

/**
 * @param {Function} $ - jQuery library
 * @param {Object} ns - Lube namespace
 */
window.Lube = (function ($, ns) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        cache: {
            container: '[data-module="pagination"] ul',
            pagerItem: '.pagination__item a',
            pagerItemFirst: '.pagination__item--first a',
            pagerItemLast: '.pagination__item--last a',
            pagerPrev: '.pagination__item--previous a',
            pagerNext: '.pagination__item--next a',
            pagerHellip: '.pagination__dynamic-space',
            contentItem: '.wheretobuy-nub',
            activeFilter: '[data-module="contentfilter"] .btn--active'
        },
        classes: {
            pagerItem: 'pagination__item',
            pagerItemFirst: 'pagination__item--first',
            pagerItemLast: 'pagination__item--last',
            active: 'pagination__item--current',
            disabled: 'disabled',
            hidden: 'mfp-hide',
            visible: 'visible'
        },
        data: {
            page: 'page',
            value: 'value'
        },
        events: {
            load: 'load',
            click: 'click'
        },
        options: {
            maxItemsOnPage: 10,
            maxDisplayedPages: 5,
            currentPage: 1,
            isFirstPageFixed: true, // todo: make dynamic
            isLastPageFixed: true, // todo: make dynamic
            reInit: false
        },
        tpl: {
            pagerItem: '<li><a>{{id}}</a></li>',
            pagerHellip: '<li class="pagination__dynamic-space">&hellip;</li>'
        }
    };

    // 3. CONSTRUCTOR
    /**
     * @param {Object} options : object literal like cfg
     */
    ns.Pager = function (options) {
        this.settings = $.extend(true, {}, cfg, options);
        this.init();
    };

    // 3. COMPONENT OBJECT
    ns.Pager.prototype = {

        version: 0.3,

        /**
         * Component initialization
         */
        init: function () {
            var settings = this.settings,
                options = settings.options;

            this.cacheItems();

            if (this.container.length) {
                if (options.reInit) {
                    this.destroy();
                }

                if (!this.pagerItems.length) {
                    this.renderPagination();
                    this.cacheItems();
                }

                this.setupPagination();
                this.bindEvents();
            }
        },

        cacheItems: function () {
            var settings = this.settings,
                cache = settings.cache,
                options = settings.options;

            // pager
            this.container = $(cache.container);
            this.pagerPrev = this.container.find(cache.pagerPrev);
            this.pagerNext = this.container.find(cache.pagerNext);
            this.pagerItemFirst = this.container.find(cache.pagerItemFirst);
            this.pagerItemLast = this.container.find(cache.pagerItemLast);
            this.pagerItems = this.container.find(cache.pagerItem).add(this.pagerItemFirst).add(this.pagerItemLast);
            this.pagerHellip = this.container.find(cache.pagerHellip);

            // content
            this.contentItems = $(cache.contentItem);
            this.contentItemsTotal = this.contentItems.length;

            // calculated options
            this.maxPages = Math.ceil(this.contentItemsTotal / options.maxItemsOnPage);
            this.displayedPagerItems = this.maxPages >= options.maxDisplayedPages ? options.maxDisplayedPages : this.maxPages;
            this.currentPageId = options.currentPage || 1;
        },

        /**
         * Render der pagination based on templates
         */
        renderPagination: function () {
            var settings = this.settings,
                classes = settings.classes,
                tpl = settings.tpl,
                arr = [];

            for (var i = 1; i <= this.displayedPagerItems; i++) {
                if (i === this.displayedPagerItems) {
                    arr.push($(tpl.pagerHellip));
                    arr.push($(ns.fn.renderTemplate({ id: i }, tpl.pagerItem)).addClass(classes.pagerItemLast));
                } else if (i === 1) {
                    arr.push($(ns.fn.renderTemplate({ id: i }, tpl.pagerItem)).addClass(classes.pagerItemFirst));
                    arr.push($(tpl.pagerHellip));
                } else {
                    arr.push($(ns.fn.renderTemplate({ id: i }, tpl.pagerItem)).addClass(classes.pagerItem));
                }
            }

            // insert in between prev/next
            this.pagerPrev.parent().after(arr);
        },

        /**
         * Pager elements dynamic setup
         */
        setupPagination: function () {
            var settings = this.settings,
                classes = settings.classes,
                data = settings.data,
                options = settings.options;

            // hide pager when only one page
            this.container.toggleClass(classes.hidden, this.maxPages < 2);

            // show hellip when more pages
            this.pagerHellip.eq(0).toggleClass(classes.visible, false);
            this.pagerHellip.eq(1).toggleClass(classes.visible, this.maxPages > options.maxDisplayedPages);

            // set the data and text of the pager items
            for (var i = 0; i < this.displayedPagerItems; i++) {
                var pageItem = this.pagerItems.eq(i),
                    pageData = i + 1;

                //pageItem.data(data.page, pageData).text(pageData).parent().toggleClass(classes.hidden, i + 1 >= this.maxPages);
                pageItem.data(data.page, pageData).text(pageData);
            }

            // set the first/last pagerItem separately
            this.pagerItemFirst.data(data.page, options.currentPage).text(options.currentPage);
            this.pagerItemLast.data(data.page, this.maxPages).text(this.maxPages);

            // toggle the first page
            this.togglePage(options.currentPage || 1);
        },

        /**
         * Bind events
         */
        bindEvents: function () {
            var self = this,
                settings = this.settings,
                data = settings.data,
                events = settings.events;

            this.pagerItems.add(this.pagerPrev).add(this.pagerNext).on(events.click, function (ev) {
                ev.preventDefault();
                self.togglePage($(ev.currentTarget).data(data.page));
            });
        },

        /**
         * Unbind previously added events
         */
        destroy: function () {
            var settings = this.settings,
                events = settings.events;

            this.pagerItems.add(this.pagerPrev).add(this.pagerNext).off(events.click);
        },

        /**
         * Toggle visibility between page id's
         * @param {String} id : page id (1|2|3|...|8)
         */
        togglePage: function (id) {
            this.togglePagerItems(id);
            this.togglePrevNext(id);
            this.toggleContent(id);
        },

        /**
         * Toggle active state between pager items
         * @param {String} id : page id (1|2|3|...|8)
         */
        togglePagerItems: function (id) {
            var settings = this.settings,
                classes = settings.classes,
                options = settings.options,
                pagerItemParents = this.pagerItems.parent(),
                isLastPage = id === this.maxPages,
                isFirstPage = id === 1,
                isBeforeLastPage = id === this.maxPages - 1 && this.maxPages > 3,
                shift = isFirstPage ? 0 : isBeforeLastPage ? 3 : id >= (options.maxDisplayedPages / 2) ? 2 : 1,
                pageToShow = this.maxPages > options.maxDisplayedPages ? shift : id - 1;

            this.shiftPagerItems(id);
            pagerItemParents.removeClass(classes.active);
            pagerItemParents.eq(pageToShow).toggleClass(classes.active, !isLastPage);
            this.pagerItemLast.parent().toggleClass(classes.active, isLastPage);


            if (isFirstPage) {
                this.pagerPrev.parent().hide();
            } else {
                this.pagerPrev.parent().show();
            }
            if (isLastPage) {
                this.pagerNext.parent().hide();
            } else {
                this.pagerNext.parent().show();
            }
        },

        /**
         * Move the pager items
         * @param {String} id : page id (1|2|3|...|8)
         */
        shiftPagerItems: function (id) {
            var settings = this.settings,
                classes = settings.classes,
                data = settings.data,
                options = settings.options,
                isUp = id > this.currentPageId && id <= this.maxPages,
                isDown = id < this.currentPageId && id > 0,
                shift1,
                shift2,
                shift3;

            if ((isUp || isDown) && this.maxPages > options.maxDisplayedPages) {
                if (id === this.maxPages) {
                    shift1 = id - 3;
                    shift2 = id - 2;
                    shift3 = id - 1;
                } else if (id === this.maxPages - 1) {
                    shift1 = id - 2;
                    shift2 = id - 1;
                    shift3 = id;
                } else if (id === 2) {
                    shift1 = id;
                    shift2 = id + 1;
                    shift3 = id + 2;
                } else if (id === 1) {
                    shift1 = id + 1;
                    shift2 = id + 2;
                    shift3 = id + 3;
                } else {
                    shift1 = id - 1;
                    shift2 = id;
                    shift3 = id + 1;
                }

                this.pagerItems.eq(1).data(data.page, shift1).text(shift1);
                this.pagerItems.eq(2).data(data.page, shift2).text(shift2);
                this.pagerItems.eq(3).data(data.page, shift3).text(shift3);
                this.currentPageId = id;
                this.pagerHellip.eq(0).toggleClass(classes.visible, id > 3);
                this.pagerHellip.eq(1).toggleClass(classes.visible, this.maxPages - 2 > id);
            } else {
                this.pagerItems.eq(1).toggleClass(classes.hidden, this.maxPages < 3);
                this.pagerItems.eq(2).toggleClass(classes.hidden, this.maxPages < 4);
                this.pagerItems.eq(3).toggleClass(classes.hidden, this.maxPages < 5);
            }
        },

        /**
         * Toggle visibility between previous and next
         * @param {String} id : page id (1|2|3|...|8)
         */
        togglePrevNext: function (id) {
            var settings = this.settings,
                classes = settings.classes,
                data = settings.data,
                prevParent = this.pagerPrev.parent(),
                nextParent = this.pagerNext.parent(),
                prev = id - 1,
                next = id + 1;

            if (prev < 1) {
                prev = id;
                prevParent.addClass(classes.disabled);
            } else {
                prevParent.removeClass(classes.disabled);
            }

            if (next > this.maxPages) {
                next = id;
                nextParent.addClass(classes.disabled);
            } else {
                nextParent.removeClass(classes.disabled);
            }

            this.pagerPrev.data(data.page, prev);
            this.pagerNext.data(data.page, next);
        },

        /**
         * Toggle visibility between content pages
         * @param {String} id : page id
         */
        toggleContent: function (id) {
            var settings = this.settings,
                cache = settings.cache,
                data = settings.data,
                classes = settings.classes,
                options = settings.options,
                start = (id * options.maxItemsOnPage) - options.maxItemsOnPage,
                take = start + options.maxItemsOnPage,
                filter = $(cache.activeFilter).data(data.value) || 'all',
                items = this.contentItems.filter('[data-filter*="' + filter + '"]');

            if (id > 1) {
                items.slice(0, start).addClass(classes.hidden);
            }

            items.slice(start, take).removeClass(classes.hidden);
            items.slice(take).addClass(classes.hidden);
        }
    };

    // 4. GLOBALIZE OBJECT
    return ns;

}(window.jQuery, window.Lube || {}));
