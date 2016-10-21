/**
 * @author       [Stef Coenen & Tim Vermaelen]
 * @date         [2016]
 * @namespace    [Lube.GoogleMaps]
 * @requires     [jQuery, Google.Maps, Lube]
 * @revision     [0.1]
 */

/**
 * Callback function, that is called upon completion of the async loading of the google maps api;
 */
function asyncGoogleMaps() {}

/**
 * @param {Function} $ - jQuery library
 * @param {Object} google - Google namespace
 * @param {Object} ns - Lube namespace
 */
window.Lube = (function($, google, ns) {
    'use strict';

    var cfg = {
        cache: {
            container: '[data-component="map"]'
        },
        classes: {

        },
        data: {

        },
        events: {
            click: 'click',
            update: 'update'
        },
        options: {
            zoom: 8,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {}
        },
        scripts: {
            maps: "//maps.googleapis.com/maps/api/js?signed_in=true&v=3.exp&libraries=geometry&key=AIzaSyBSMwwJVOZJmDDHtyWQsIRGDu-TZdF9LRM&callback=asyncGoogleMaps",
            infoBox: "/lib/google/infobox.min.js"
        }
    };

    ns.Googlemaps = function(options) {
        this.settings = $.extend(true, {}, cfg, options);

        this.cacheItems();
        this.bindEvents();

        this.init();
    };

    ns.Googlemaps.prototype = {
        init: function() {
            var settings = this.settings,
                scripts = settings.scripts;

            this.markers = [];
            if (this.container && this.container.length) {
                if (google && google.hasOwnProperty("maps")) {
                    this.activate();
                } else {
                    this.getScripts(scripts, this.init.bind(this));
                }
            }
        },
        cacheItems: function() {
            var settings = this.settings,
                cache = settings.cache;

            this.container = $(cache.container);
            this.map = this.container.children().first();
        },
        bindEvents: function() {
            var self = this,
                settings = this.settings,
                events = settings.events;

            this.container.on(events.update, function(events, result) {
                self.loadMarkers(result.MapItems);
            });
        },
        getScripts: function(scripts, callback) {
            function errorHandler(n, t, scripts) {
                throw new Error(scripts);
            }

            $.getScript(scripts.maps).done(function() {
                google = window.google || {};
                callback();
            }).fail(errorHandler);
        },
        activate: function() {
            if (!this.map.length) {
                this.createMapElement();
            }
            this.calculateMap();
            this.renderMap();

            var singleMarkerAttr = this.container.data('single-marker');
            if (singleMarkerAttr) {
                // Single marker configuration
                this.initSingleMarker();
            } else {
                // multi marker configuration
                this.initMarkers();
            }
        },
        createMapElement: function() {
            this.map = $('<div></div>');
            this.map.height(this.container.outerHeight());
            this.container.append(this.map);
        },
        calculateMap: function(n) {
            var settings = this.settings,
                options = settings.options,
                width = this.map.outerWidth(!!n),
                height = this.map.outerHeight(!!n) || width * parseFloat(options.mapRatio) || "100%";

            this.map.css({
                width: width,
                height: height
            });
        },

        renderMap: function() {
            var settings = this.settings,
                options = settings.options,
                map = $.extend({}, options, {
                    center: new google.maps.LatLng(50.862651, 4.361408),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.TOP_LEFT
                    }
                });
            this.instance = new google.maps.Map(this.map.get(0), map);
        },

        initSingleMarker: function() {
            var self = this;
            this.initInfoBox();

            // Read in single marker data
            var addressAttribute = this.container.data('address');
            if (addressAttribute) {
                // Parse address
                this.geocode(new google.maps.Geocoder(), addressAttribute, function(marker) {
                    self.toPlaceMarkers = [marker];
                    self.initMarkers();
                });
            }
        },

        geocode: function(geocoder, address, callback) {
            var location = address.street + ' ' + address.number + ', ' + address.postalcode + ' ' + address.city;
            geocoder.geocode({ 'address': location },
                function(results, status) {
                    if (status === 'OK') {
                        var marker = {
                            name: address.name,
                            location: results[0].geometry.location,
                            content: location
                        }
                        callback(marker);
                    } else {
                        console.error('Geocode was not successful for the following reason: ' + status);
                    }
                });
        },

        initMarkers: function() {
            this.initInfoBox();

            if (this.toPlaceMarkers !== undefined) {
                this.loadMarkers(this.toPlaceMarkers);
            }
        },

        initInfoBox: function() {
            var self = this,
                settings = this.settings,
                events = settings.events;

            this.infoBox = new google.maps.InfoWindow();
            this.infoBox.close();

            google.maps.event.addListener(this.instance, events.click, function() {
                self.infoBox.close();
            });
        },

        loadMarkers: function(newMarkers) {
            var self = this;

            function openMarker() {
                self.infoBox.close();
                self.infoBox.setOptions({ content: this.formatedText });
                self.infoBox.open(self.instance, this);
            }

            if (google === undefined || this.instance === undefined) {
                this.toPlaceMarkers = newMarkers;
            } else {
                this.removeMarkers(this.markers);

                var placesBounds = new google.maps.LatLngBounds();

                for (var i = 0; i < newMarkers.length; i++) {
                    var newMarker = newMarkers[i],
                        point;

                    if (newMarker.location instanceof google.maps.LatLng) {
                        point = newMarker.location;
                    } else {
                        point = new google.maps.LatLng(newMarker.Point[0], newMarker.Point[1]);
                    }

                    placesBounds.extend(point);

                    var marker = new google.maps.Marker({
                        draggable: false,
                        raiseOnDrag: false,
                        icon: newMarker.MarkerImage,
                        map: this.instance,
                        position: point
                    });

                    marker.formatedText = document.createElement("div");
                    marker.formatedText.innerHTML = '<h3>' + newMarker.name + '</h3><p>' + newMarker.content + '</p>';

                    google.maps.event.addListener(marker, "click", openMarker);

                    this.markers.push(marker);
                }

                if (this.markers.length > 1) {
                    this.instance.fitBounds(placesBounds);
                } else {
                    var latLng = this.markers[0].getPosition(); // returns LatLng object
                    this.instance.setCenter(latLng); // setCenter takes a LatLng object
                    this.instance.setZoom(14);
                }
            }
        },
        removeMarkers: function(markers) {
            $.each(markers, function() {
                this.setMap(null);
            });
            markers.length = 0;
        }
    };

    return ns;
}(window.jQuery, window.google || undefined, window.Lube || {}));
