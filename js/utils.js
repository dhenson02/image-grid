"use strict";

export const checkTouch = () => (
    document.createEvent('TouchEvent') && (
        'ontouchstart' in document.documentElement ||
        'ontouchstart' in window
    ) ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
);

/**
 * Courtesy of:
 * http://stackoverflow.com/a/4819886/2780033
 * @returns {boolean}
 */
export const isTouchDevice = (() => {
    try {
        return checkTouch();
    }
    catch ( e ) {
        return false;
    }
})();

/**
 * Courtesy of Mr. Paul Lewis.
 * https://developers.google.com/web/updates/2015/08/using-requestidlecallback
 * @type {Function}
 */

export const requestIdleShimBack = ( cb ) => {
    const start = Date.now();
    return setTimeout(function () {
        cb({
            didTimeout: false,
            timeRemaining: function () {
                const time = 50 - (Date.now() - start);
                return time > 0 ?
                       time :
                       0;
            }
        });
    }, 1);
};

export const requestIdleCallback =
    window.requestIdleCallback ||
    requestIdleShimBack;

export const cancelIdleCallback =
    window.cancelIdleCallback ||
    clearTimeout;
