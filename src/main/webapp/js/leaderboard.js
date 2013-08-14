function loadLeaderboard() {
    // clear table
    var tbody = $("#tblScores").find("tbody");
    tbody.empty();
    var scores = gameStorage.getScores();

    for (var key in scores) {
        if (scores.hasOwnProperty(key)) {
            createLeaderboardRow(tbody, scores[key]);
        }
    }
}

function createLeaderboardRow(tbl, values) {
    var row = document.createElement("tr");
    var currentUser = gameSession.getCurrentUser();
    if (currentUser == values.user) {
        $(row).addClass("warning");
    }

    appendCell(row, getPlaceInLeaderboard(values.score), false);
    appendCell(row, values.time, false);
    appendCell(row, values.user, false);
    appendCell(row, values.game, false);
    appendCell(row, values.speed, false);
    appendCell(row, values.score, false);

    tbl.append(row);
}

function getPlaceInLeaderboard(score) {
    var scores = gameStorage.getScores();
    var scoreIndex = -1;
    scores.sort(function (a, b) {
        return a.score < b.score;
    });

    $(scores).each(function (index) {
        if (this.score == score && scoreIndex == -1) {
            scoreIndex = index + 1;
        }
    });

    return scoreIndex;
}

// TODO SUR remove column speed and replace with game config details (as detail row)
// TODO SUR also add certain game configs as filter

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

    maxScore.val(gameStorage.getHighScore());

    minScore.off('change');
    maxScore.off('change');

    var scoreSlider = $("#scorerange").slider({
        range: true,
        min: 0,
        max: gameStorage.getHighScore(),
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
        if (Number(this.value) > Number(max)) {
            this.value = max;
        } else if (Number(this.value) < 0) {
            this.value = 0;
        }
        scoreSlider.slider("values", [this.value, max]);
        filter(tblName, this);
    });
    maxScore.change(function () {
        var min = minScore.val();
        if (Number(min) > Number(this.value)) {
            this.value = min;
        } else if (Number(this.value) > gameStorage.getHighScore()) {
            this.value = gameStorage.getHighScore();
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
