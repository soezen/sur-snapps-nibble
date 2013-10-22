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
};

/**
 *
 * @param object
 * @returns {boolean} true if object is a number
 */
sur.snapps.util.isNumber = function (object) {
    return !sur.snapps.util.isUndefined(object)
        && typeof object === 'number';
};

// TIMER
/**
 * Create Timer Object,
 * when started, counts until it has reached its limit (if one was specified,
 * otherwise counts until infinity). It is also possible to pause or stop
 * the timer, increase or decrease the limit.
 *
 * @param limit limit until which the timer counts
 * @param limitCallback called when the limit is reached
 * @param countCallback called on every count
 * @param callbackObject object which contains the callback function
 * @constructor
 */
sur.snapps.util.Timer = function Timer(limit, limitCallback, countCallback, callbackObject) {
    if (!(this instanceof Timer)) {
        return new Timer(limit, limitCallback, countCallback, callbackObject);
    }

    var time = -1;
    var running = false;
    limit = sur.snapps.util.isNumber(limit) ? limit : false;
    countCallback = sur.snapps.util.isFunction(countCallback) ? countCallback : false;

    function count() {
        time += 1;

        if (limit && time >= limit) {
            limitCallback.call(callbackObject);
            running = false;
        }

        setTimeout(function () {
            if (running) {
                if (countCallback) {
                    countCallback.call(callbackObject);
                }
                count();
            }
        }, 1000);
    }

    this.current = function () {
        return time;
    };

    this.isRunning = function () {
        return running;
    };

    this.start = function () {
        time = -1;
        running = true;
        count();
    };

    this.stop = function () {
        running = false;
    };

    this.increaseLimit = function (addLimit) {
        limit += addLimit;
    };

    this.decreaseLimit = function (removeLimit) {
        limit -= removeLimit;
        limit = limit < 0 ? -1 : limit;
    };
};