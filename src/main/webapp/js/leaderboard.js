function loadLeaderboard() {
    // clear table
    $("#tblScores").find("tbody").empty();

    // fill table with data from local storage
    var history;
    if (isUndefined(localStorage.history)) {
        history = [];
    } else {
        history = JSON.parse(localStorage.history);
    }

    for (var i = 0; i < history.length; i++) {
        createRow(tbody, history[i]);
    }
}


function addTableSorter() {
    $("#tblScores").tablesorter({
        dateFormat: 'uk',
        headers: {
            0: {
                sorter: 'shortDate'
            }
        }
    });
}

function addDatepickers(tblName) {
    $("#filterDateBefore").datepicker({
        showOn: "button",
        buttonImage: "img/calendar-small.png",
        buttonImageOnly: true,
        dateFormat: 'yy-mm-dd',
        onSelect: function () {
            filter(tblName, this);
        }
    });
    $("#filterDateAfter").datepicker({
        showOn: "button",
        buttonImage: "img/calendar-small.png",
        buttonImageOnly: true,
        dateFormat: 'yy-mm-dd',
        onSelect: function () {
            filter(tblName, this);
        }
    });
}

function configureScoreSlider(tblName) {
    var minScore = $("#minscore");
    var maxScore = $("#maxscore");

    maxScore.val(gameStorage.getHighscore());

    minScore.off('change');
    maxScore.off('change');

    var scoreSlider = $("#scorerange").slider({
        range: true,
        min: 0,
        max: gameStorage.getHighscore(),
        values: [minScore.val(), maxScore.val()],
        slide: function (event, ui) {
            if (ui.values[0] == ui.value) {
                minScore.val(ui.values[0]);
                filter(tblName, document.getElementById("minscore"));
            } else if (ui.values[1] == ui.value) {
                maxScore.val(ui.values[1]);
                filter(tblName, document.getElementById("maxscore"));
            }
        }
    });
    minScore.change(function () {
        var max = maxScore.val();
        if (eval(this.value) > eval(max)) {
            this.value = max;
        } else if (eval(this.value) < 0) {
            this.value = 0;
        }
        scoreSlider.slider("values", [this.value, max]);
        filter(tblName, this);
    });
    maxScore.change(function () {
        var min = minScore.val();
        if (eval(min) > eval(this.value)) {
            this.value = min;
        } else if (eval(this.value) > gameStorage.getHighscore()) {
            this.value = gameStorage.getHighscore();
        }
        scoreSlider.slider("values", [min, this.value]);
        filter(tblName, this);
    });
}

function configureSpeedSlider(tblName) {
    var minSpeed = $("#minspeed");
    var maxSpeed = $("#maxspeed");

    minSpeed.off('change');
    maxSpeed.off('change');

    var speedSlider = $("#speedrange").slider({
        range: true,
        min: 0,
        max: 11,
        values: [0, 11],
        slide: function (event, ui) {
            if (ui.values[0] == ui.value) {
                minSpeed.val(ui.values[0]);
                filter(tblName, document.getElementById("minspeed"));
            } else if (ui.values[1] == ui.value) {
                maxSpeed.val(ui.values[1]);
                filter(tblName, document.getElementById("maxspeed"));
            }
        }
    });
    minSpeed.change(function () {
        var max = maxSpeed.val();
        if (eval(this.value) > eval(max)) {
            this.value = max;
        } else if (eval(this.value) < 0) {
            this.value = 0;
        }
        speedSlider.slider("values", [this.value, max]);
        filter(tblName, this);
    });
    maxSpeed.change(function () {
        var min = minSpeed.val();
        if (eval(min) > eval(this.value)) {
            this.value = min;
        } else if (eval(this.value) > 11) {
            this.value = 11;
        }
        speedSlider.slider("values", [min, this.value]);
        filter(tblName, this);
    });
}
