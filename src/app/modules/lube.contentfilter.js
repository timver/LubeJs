/**
 * [Lube.ContentFilter]
 * 
 * @author       [Stef Coenen & Tim Vermaelen]
 * @date         [2016]
 * @namespace    [Lube.ContentFilter]
 * @requires     [jQuery, Lube]
 * @revision     [0.1]
 */

/**
 * @param {Function} $ : jQuery library
 * @param {Object} ns : EuroConseur namespace
 * @augments {Function} Lube.Pager
 */
window.Lube = (function ($, ns) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        cache: {
            container: '[data-module="contentfilter"]',
            filter: '.btn',
            sort: '.listing__header__sort-by',
            sortItem: '.form__field--radio',
            sortItemSelected: '.form__field--radio:checked',
            result: '.search-result',
            resultItem: '.wheretobuy-nub'
        },
        classes: {
            active: 'active',
            disabled: 'disabled',
            hidden: 'hidden',
            odd: 'odd',
            even: 'even'
        },
        data: {
            filter: 'filter',
            sort: 'sort',
            mode: 'mode',
            name: 'name',
            distance: 'distance',
            price: 'price',
            value: 'value'
        },
        events: {
            filter: 'click',
            sort: 'change',
            window: 'load'
        },
        options: {
            filterAll: 'all',
            sortAbcLow: 'a-z',
            sortAbcHigh: 'z-a',
            sortNumericLow: '0-9',
            sortNumericHigh: '9-0',
            sortDistanceLow: 'km 0-9',
            sortDistanceHigh: 'km 9-0',
            isOddEven: false,
            isFilterAfterSort: true, // additional filter data on sort elements
            isSortAfterFilter: true, // additional sort data on filter elements
            isSortOnload: true
        },
        pagerOptions: {
            cache: {
                contentItem: '.wheretobuy-nub:visible',
            },
            options: {
                reInit: true
            }
        }
    };

    // 3. CONSTRUCTOR
    ns.ContentFilter = function (options) {
        this.settings = $.extend(true, {}, cfg, options);
        this.init();
    };

    // 4. PROTOTYPE OBJECT
    ns.ContentFilter.prototype = {

        version: 0.2,

        /**
         * Component initialization
         */
        init: function () {
            this.cacheItems();

            if (this.container.length) {
                this.activate();
            }
        },

        cacheItems: function () {
            var settings = this.settings,
                cache = settings.cache;

            this.container = $(cache.container);
            this.result = this.container.parent().find(cache.result).eq(0);
            this.items = this.result.find(cache.resultItem);
            this.filter = this.container.find(cache.filter);
            this.sort = $(cache.sort);
        },

        activate: function () {
            var settings = this.settings,
                classes = settings.classes;

            if (this.items.length) {
                this.bindEvents();
            } else {
                this.filter.addClass(classes.disabled);
                this.sort.addClass(classes.disabled);
            }
        },

        bindEvents: function () {
            var self = this,
                settings = this.settings,
                cache = settings.cache,
                events = settings.events,
                options = settings.options,
                pagerOptions = settings.pagerOptions;

            this.filter.on(events.filter, function (ev) {
                ev.preventDefault();
                self.toggleFilter(this);
                self.filterItems(this);

                return {
                    pager: new ns.Pager(pagerOptions)
                };
            });

            this.sort.on(events.sort, function () {
                self.sortItems($(this).find(cache.sortItemSelected));
            });

            if (options.isSortOnload) {
                $(window).on(events.window, function () {
                    var activeSort = self.sort.find(cache.sortItemSelected);

                    if (activeSort.length) {
                        activeSort.trigger(events.sort);
                    }
                });
            }
        },

        /**
         * @description Toggle filter buttons' active state and handles 'options.filterAll'
         * @param {Object} el : cache.filter
         */
        toggleFilter: function (el) {
            var settings = this.settings,
                classes = settings.classes,
                filter = $(el);

            filter.addClass(classes.active).siblings().removeClass(classes.active);
        },

        /**
         * @description Filter items based on active filters
         * @param {Object} el : cache.filter
         */
        filterItems: function (el) {
            var self = this,
                settings = this.settings,
                cache = settings.cache,
                data = settings.data,
                events = settings.events,
                options = settings.options,
                selected = $(el),
                dataFilter = selected.data(data.value),
                dataSort = selected.data(data.sort),
                sortSelector,
                arrVisible = [];

            // separate visible items based on dataFilter
            $.each(self.items, function () {
                var item = $(this),
                    itemFilter = item.data(data.filter);

                if (itemFilter.indexOf(dataFilter) !== -1 || dataFilter === options.filterAll) {
                    arrVisible.push(item);
                }
            });

            this.toggleItems(arrVisible);

            if (options.isSortAfterFilter && dataSort) {
                sortSelector = '[data-value="' + dataSort + '"]';
                this.sort.find(cache.sortItem).filter(sortSelector).trigger(events.filter);
            }
        },

        /**
         * @description Toggle sort buttons' active state
         * @param {Object} el : cache.filterItem
         */
        toggleSort: function (el) {
            var settings = this.settings,
                classes = settings.classes,
                order = $(el);

            order.parent().siblings().find('a').toggleClass(classes.active, false);
            order.toggleClass(classes.active, true);
        },

        /**
         * @description Sort items
         * @param {Object} el : cache.filterItem
         * @todo make sort functions more generic
         */
        sortItems: function (el) {
            var self = this,
                settings = this.settings,
                classes = settings.classes,
                data = settings.data,
                events = settings.events,
                options = settings.options,
                sortItem = $(el),
                sortArr = [],
                sortFunc,
                sortIndex,
                filterValue,
                filterSelector;

            function sortAz(a, b) {
                var aName = a[sortIndex];
                var bName = b[sortIndex];
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            function sortZa(a, b) {
                var aName = a[sortIndex];
                var bName = b[sortIndex];
                return ((aName > bName) ? -1 : ((aName < bName) ? 1 : 0));
            }

            function sortLowHigh(a, b) {
                var aPrice = a[sortIndex] ? parseFloat(a[sortIndex]) : 0;
                var bPrice = b[sortIndex] ? parseFloat(b[sortIndex]) : 0;
                return ((aPrice < bPrice) ? -1 : ((aPrice > bPrice) ? 1 : 0));
            }

            function sortHighLow(a, b) {
                var aPrice = a[sortIndex] ? parseFloat(a[sortIndex]) : 0;
                var bPrice = b[sortIndex] ? parseFloat(b[sortIndex]) : 0;
                return ((aPrice > bPrice) ? -1 : ((aPrice < bPrice) ? 1 : 0));
            }

            function sortDistanceLowHigh(a, b) {
                var aPrice = a[sortIndex] ? parseFloat(a[sortIndex]) : 0;
                var bPrice = b[sortIndex] ? parseFloat(b[sortIndex]) : 0;
                return ((aPrice < bPrice) ? -1 : ((aPrice > bPrice) ? 1 : 0));
            }

            function sortDistanceHighLow(a, b) {
                var aPrice = a[sortIndex] ? parseFloat(a[sortIndex]) : 0;
                var bPrice = b[sortIndex] ? parseFloat(b[sortIndex]) : 0;
                return ((aPrice > bPrice) ? -1 : ((aPrice < bPrice) ? 1 : 0));
            }

            $.each(this.items, function () {
                var item = $(this),
                    price = item.data(data.price),
                    distance = item.data(data.distance),
                    arr = [];

                arr.push(item, price, distance);
                sortArr.push(arr);
            });

            switch (sortItem.data(data.value)) {
                case options.sortAbcLow: sortFunc = sortAz; sortIndex = 2; break;
                case options.sortAbcHigh: sortFunc = sortZa; sortIndex = 2; break;
                case options.sortNumericLow: sortFunc = sortLowHigh; sortIndex = 1; break;
                case options.sortNumericHigh: sortFunc = sortHighLow; sortIndex = 1; break;
                case options.sortDistanceLow: sortFunc = sortDistanceLowHigh; sortIndex = 2; break;
                case options.sortDistanceHigh: sortFunc = sortDistanceHighLow; sortIndex = 2; break;
            }

            if (sortFunc) {
                sortArr.sort(sortFunc);
            }

            $.each(sortArr, function () {
                this[0].detach().appendTo(self.result);
            });

            //new Lube.Pager({ options: { reInit: true } });

            if (options.isFilterAfterSort) {
                filterValue = sortItem.data(data.filter);

                filterSelector = filterValue ? '[data-value="' + filterValue + '"]' : '.' + classes.active;
                this.filter.filter(filterSelector).trigger(events.filter);
            }
        },

        /**
         * @description Toggle the visibility of the items
         * @param {Array} arr : visible items
         */
        toggleItems: function (arr) {
            var settings = this.settings,
                classes = settings.classes;

            if (arr.length) {
                this.items.addClass(classes.hidden);
                $.each(arr, function () {
                    $(this).removeClass(classes.hidden);
                });
            }

            this.calcOddEven();
        },

        /**
         * Recalculate odd even
         */
        calcOddEven: function () {
            var settings = this.settings,
                cache = settings.cache,
                classes = settings.classes,
                options = settings.options;

            if (options.isOddEven) {
                this.items.removeClass(classes.odd + ' ' + classes.even);

                $.each(this.result.find(cache.resultItem).filter(':not(.' + classes.hidden + ')'), function (i) {
                    var cssClass = i % 2 !== 0 ? classes.odd : classes.even;
                    $(this).addClass(cssClass);
                });
            }
        }

    };

    // 5. GLOBALIZE OBJECT
    return ns;

}(window.jQuery, window.Lube || {}));
