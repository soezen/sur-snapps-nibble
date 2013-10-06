function Timer(field, callback) {

    var time = -1;
    var counting = false;
    var withLimit = false;
    var limit;

    function count() {
        time++;
        field.value = time + " seconds";
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
        time = -1;
        counting = true;
        count();
    }

    function stopTimer() {
        counting = false;
    }

    return {
        start: function () {
            startTimer();
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
        }
    };
}