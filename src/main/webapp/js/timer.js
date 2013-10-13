function Timer(field, callback) {

    var time = -1;
    var counting = false;
    var withLimit = false;
    var limit;

    function count() {
        time++;
        field.value = time;
        if (withLimit && time >= limit) {
            callback();
        } else {
            setTimeout(function () {
                if (counting) {
                    count();
                }
            }, 1000);
        }
    }

    function startTimer() {
        counting = true;
        count();
    }

    function pauseTimer() {
        counting = false;
    }

    function stopTimer() {
        time = -1;
        counting = false;
    }

    function addLimit(plus) {
        limit += plus;
        console.log(limit);
    }

    return {
        start: function () {
            startTimer();
        },
        pause: function () {
            pauseTimer();
        },
        stop: function () {
            stopTimer();
        },
        current: function () {
            return time;
        },
        setLimit: function (newLimit) {
            limit = newLimit;
            withLimit = !isUndefined(limit);
        },
        limitUp: function () {
            addLimit(10);
        },
        limitDown: function () {
            limit = limit - 10;
        }

    };
}