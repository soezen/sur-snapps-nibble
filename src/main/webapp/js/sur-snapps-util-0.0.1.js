/**
 * User: Soezen
 * Date: 22/10/13
 * Time: 13:03
 */

sur.snapps.util = {};

/**
 *
 * @param object
 * @returns {boolean} true if object is undefined
 */
sur.snapps.util.isUndefined = function (object) {
    return object === undefined;
};

/**
 *
 * @param object
 * @returns {boolean} true if object is a function
 */
sur.snapps.util.isFunction = function (object) {
    return !sur.snapps.util.isUndefined(object)
        && typeof object === 'function';
}

// TIMER
/**
 * Create Timer Object, when started, counts until it has reached its limit (if one was specified, otherwise counts until infinity). It is also possible to pause or stop the timer, increase or decrease the limit.
 *
 * @param field field in which the current time will be displayed
 * @param limitCallback called when the limit is reached
 * @param countCallback called on every count
 * @param callbackObject object which contains the callback function
 * @constructor
 */
sur.snapps.util.Timer = function (limit, limitCallback, countCallback, callbackObject) {
    var time = -1;
    var running = false;
    var withLimit = !sur.snapps.util.isUndefined(limit);

    this.count = function () {
        time += 1;
        if (sur.snapps.util.isFunction(countCallback)) {
            countCallback.call(callbackObject);
        }
    }
};