/**
 * User: Soezen
 * Date: 22/10/13
 * Time: 12:31
 */

describe("Util.isUndefined()", function () {
    function callTestFunction(param) {
        return sur.snapps.util.isUndefined(param);
    }

    it("returns true if object is undefined", function () {
        expect(callTestFunction(undefined)).toBe(true);
    });
    it("returns false if object is not undefined", function () {
        expect(callTestFunction("")).toBe(false);
    });
});

describe("Util.isFunction()", function () {
    function callTestFunction(param) {
        return sur.snapps.util.isFunction(param);
    }

    it("returns true if object is a function", function () {
        expect(callTestFunction(function () {
        })).toBe(true);
    });
    it("returns false if object is undefined", function () {
        expect(callTestFunction(undefined)).toBe(false);
    });
    it("returns false if object is not a function", function () {
        expect(callTestFunction("")).toBe(false);
    });
});

describe("Util.isNumber()", function () {
    function callTestFunction(param) {
        return sur.snapps.util.isNumber(param);
    }

    it("returns false if object is undefined", function () {
        expect(callTestFunction(undefined)).toBe(false);
    });
    it("returns false if object is not a number", function () {
        expect(callTestFunction("")).toBe(false);
    });
    it("returns true if object is a number", function () {
        expect(callTestFunction(1)).toBe(true);
    });
});

describe("Util.Timer()", function () {

    var limitCallbackHits;
    var countCallbackHits;
    var timer;

    beforeEach(function () {
        limitCallbackHits = 0;
        countCallbackHits = 0;
        var limitCallback = function () {
            limitCallbackHits += 1;
        };
        var countCallback = function () {
            countCallbackHits += 1;
        };
        timer = new sur.snapps.util.Timer(5, limitCallback, countCallback);
        jasmine.Clock.useMock();
    });

    afterEach(function () {
        timer.stop();
    });

    it("returns a timer object when using new", function () {
        expect(typeof new sur.snapps.util.Timer()).toBe('object');
        expect(typeof sur.snapps.util.Timer()).toBe('object');
    });

    describe("start function", function () {
        it("starts the timer", function () {
            timer.start();
            expect(timer.isRunning()).toBe(true);
            jasmine.Clock.tick(2000);
            expect(timer.current()).toBeGreaterThan(0);
        });
        it("restarts when called again", function () {
            timer.start();
            jasmine.Clock.tick(3000);

            var current = timer.current();
            timer.start();
            var newCurrent = timer.current();
            expect(newCurrent).toBeLessThan(current);
        });
    });

    describe("stop function", function () {
        it("stops the timer if timer is running", function () {
            timer.start();
            expect(timer.isRunning()).toBe(true);
            timer.stop();
            expect(timer.isRunning()).toBe(false);
        });
        it("does nothing if timer is not running", function () {
            timer.stop();
            expect(timer.isRunning()).toBe(false);
        });
    });

    describe("increase limit function", function () {
        it("increases the limit of the timer", function () {
            timer.start();
            timer.increaseLimit(5);
            jasmine.Clock.tick(12000);

            expect(timer.isRunning()).toBe(false);
            expect(timer.current()).toBe(10);
            expect(limitCallbackHits).toBe(1);
            expect(countCallbackHits).toBe(10);
        });
        it("initializes the limit of the timer if non was set yet", function () {
            timer = new sur.snapps.util.Timer("test");
            timer.increaseLimit(5);
            timer.start();
            jasmine.Clock.tick(7000);

            expect(timer.current()).toBe(5);

        });
    });

    describe("decrease limit function", function () {
        it("decreases the limit of the timer", function () {
            timer.decreaseLimit(3);
            timer.start();
            jasmine.Clock.tick(5000);

            expect(timer.isRunning()).toBe(false);
            expect(timer.current()).toBe(2);
        });
    });
});