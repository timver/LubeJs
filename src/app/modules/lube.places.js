/**
* [Lube.Places]
*
* @date         [2016]
* @revision     [0.1]
* @author       [Tim Vermaelen]
* @type         [module]
*/

// global function required to re-instantiate
function asyncGoogleMaps() { }

/**
 * @function $ : jQuery
 * @function google : Google
 * @namespace ns : namespace GiveADay
 */
window.Lube = (function ($, google, ns) {

    // 1. ECMA-262/5
    'use strict';

    // 2. CONFIGURATION
    var cfg = {
        cache: {
            container: '[data-class="places"]'
        },
        classes: {},
        data: {},
        events: {
            change: 'change',
            focus: 'focus',
            placeChanged: 'place_changed',
            status: 'status'
        },
        formData: {
            street_number: 'short_name',                    // 0. huisnummer
            route: 'long_name',                             // 1. straat
            sublocality_level_1: 'long_name',               // 2. gemeente
            locality: 'long_name',                          // 3. stad
            administrative_area_level_2: 'short_name',      // 4. stad
            administrative_area_level_1: 'short_name',      // 5. provincie
            country: 'short_name',                          // 6. land
            postal_code: 'short_name'                       // 7. postcode
        },
        scripts: {
            maps: '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=AIzaSyAO58KawXmkqBDsYkZ0JB-8KIBSFRcm-tk&callback=asyncGoogleMaps'
        }
    };

    // 3. CONSTRUCTOR
    ns.Places = function (options) {
        this.settings = $.extend(true, {}, cfg, options);
        this.init();
    };

    // 4. PROTOTYPE OBJECT
    ns.Places.prototype = {

        version: 0.1,

        init: function () {
            var self = this;

            this.cacheItems();

            if (this.containers.length) {
                this.getApi(function () {
                    google = window.google || {};
                    self.bindEvents();
                });
            }
        },

        cacheItems: function () {
            var settings = this.settings,
                cache = settings.cache;

            this.containers = $(cache.container);
            this.coords = undefined;
            this.placeSearch = undefined;
            this.autocomplete = undefined;
        },

        getApi: function (cb) {
            var settings = this.settings,
                scripts = settings.scripts;

            if (!google) {
                $.getScript(scripts.maps)
                    .done(cb)
                    .fail(function (jqxhr, obj, exception) {
                        console.warn('Google Maps - failed to load script: ' + exception);
                    }
                );
            }
        },

        bindEvents: function () {
            var self = this,
                settings = this.settings,
                events = settings.events;

            this.containers.on(events.focus, function () {
                self.autocomplete = self.autocomplete || new google.maps.places.Autocomplete(this, {
                    types: ['geocode']
                });

                self.coords = self.coords || new ns.Geolocation(function (data) {
                    var position = new google.maps.LatLng(parseFloat(data.latitude), parseFloat(data.longitude));
                    self.autocomplete.setBounds(new google.maps.LatLngBounds(position, position));
                    google.maps.event.addListener(self.autocomplete, events.placeChanged, function () {
                        self.setFormData();
                    });
                });
            });
        },

        getAddressComponentValue: function (place, id) {
            var settings = this.settings,
                formData = settings.formData,
                i = 0,
                addressComponent,
                addressFormat,
                val = '';

            for (; i < place.address_components.length; i++) {
                addressComponent = place.address_components[i];
                addressFormat = addressComponent.types[0] === id && formData[id];
                val = addressFormat ? addressComponent[addressFormat] : val;
            }

            return val;
        },

        setFormData: function () {
            var settings = this.settings,
                events = settings.events,
                formData = settings.formData,
                place = this.autocomplete.getPlace(),
                location = place.geometry.location,
                id,
                val,
                inpComponent,
                inpComponentObj,
                inpComponentOptions;

            $('#latitude').val(location.lat());
            $('#longitude').val(location.lng());

            for (id in formData) {
                if (formData.hasOwnProperty(id)) {
                    inpComponent = $('#' + id);
                    inpComponentObj = inpComponent.get(0);
                    val = this.getAddressComponentValue(place, id);

                    if (inpComponent.length && val) {
                        switch (inpComponentObj.type) {
                            case 'select-one':
                                inpComponentOptions = $(inpComponentObj.options);
                                inpComponentOptions.prop({ selected: false });
                                inpComponentOptions.filter('[value="' + val + '"]').prop({ selected: true });
                                break;
                            default:
                                inpComponent.prop({ disabled: false });
                                inpComponent.val(val);
                                break;
                        }

                        inpComponent.trigger(events.change);
                    }
                }
            }
        }

    };

    // 5. NAMESPACE
    return ns;

}(window.jQuery, window.google, window.Lube || {}));