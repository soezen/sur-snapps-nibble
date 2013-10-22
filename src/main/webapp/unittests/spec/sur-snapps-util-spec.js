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