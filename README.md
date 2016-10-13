# LubeJs
Use LubeJs and strap it on!

# How it works
LubeJs uses a simple module pattern for easy configuration.
More info can be found [here](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)

Currently the only dependency is jQuery. The idea is to be independant in ES6.

# What it does
We have created components, modules and helper functions in JavaScript (ES5) to easily re-use recurring functionality.
Usable on any device inside your web browser. Simply config the modules by overriding the `cfg` object inside the `lube.strapon.js` file.

# Goal
To refactor functionality seen in other JavaScript libraries into one solid and lubed library without any hassle, quircks nor hacks.
We like to keep it clean and performant. 

# Components
 - cookiebox (usefull in countries where the [cookie law](https://www.cookielaw.org/the-cookie-law/) applies)

# Modules
 - contentfilter (easy filter system for a result list)
 - geolocation (HTML5 geolocation with fallback)
 - pager (pager system for a result list)
 - places (Google Places API on a text input)
 - toggle (Bootstrap functionality revised)
 - wizard (stepping form)

# Functions
 - deviceDetection (implemented device detection from http://detectmobilebrowsers.com)
 - renderTemplate (easy template system)
 - now (underscore functionality)
 - defer (Defers a function, scheduling it to run after the current call stack has cleared)
 - delay (Delays a function for the given number of milliseconds, and then calls it with the arguments supplied)
 - delayedEvent (delay events with the same id, good for window resize events, keystroke, etc ...)
 - throttle (Returns a function, that, when invoked, will only be triggered at most once during a given window of time)
 - debounce (Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds)
 - equalHeights (simple version to equally set height on items)
 - convertQsToLiteral (Convert a query alike string to an object literal)
 - getObjectProperty (Get an object from a list of objects by searching for a key:value pair)
 - pageOffset (jQuery functionality revised)
