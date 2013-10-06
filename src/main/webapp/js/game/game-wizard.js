var tempGame;
var levels = {};

function nextStep() {
    var currentStep = $("#wzdgame").find("div").not(".hide").first();
    currentStep.toggleClass("hide");
    $("[data-wizardmenu='" + currentStep.data('wizardpage') + "']").toggleClass('hide');

    var nextStep = currentStep.next("div");
    nextStep.toggleClass("hide");
    // TODO SUR prone to injection...
    eval(nextStep.data("loadfunction") + "();");
    $("[data-wizardmenu='" + nextStep.data('wizardpage') + "']").toggleClass('hide');
}

function loadLevels() {
    var wzdMain = $("#wzd-main");
    var accLevels = $("#wzd-levels").find("#acclevels");
    var nbrLevels = Number(wzdMain.find("input[id=nbrlevels]").val());

    for (var i = 0; i < nbrLevels; i++) {
        var level = cloneTemplate("levelconfig");
        var header = level.find(".accordion-heading").find("a.accordion-toggle");
        header.text("Level " + (i + 1));
        header.attr("href", "#level" + (i + 1));
        var content = level.find("#level");
        content.attr("data-level", (i + 1));
        content.attr("id", "level" + (i + 1));
        content.find("[id]").each(function () {
            this.id = this.id + '-lvl' + (i + 1);
        });
        accLevels.append(level);
        $("#chance-lvl" + (i + 1)).slider({
            min: 1,
            max: 10,
            value: 5,
            range: false,
            slide: function (event, ui) {
                var lvl = getLevel(event.target);
                var bonusType = getActiveBonusType(lvl);
                bonusType.chance = ui.value;
            }
        });
        loadStage('canvas-lvl' + (i + 1));
    }
}

function getLevel(obj) {
    return $(obj).parents("div[data-level]").data("level");
}

function cancelCreateGame(menuItem) {
    tempGame = undefined;
    openPage(menuItem);
}

function createTemporaryGame() {
    var form = $("#wzd-main");
    var name = form.find("input#name").val();
    var rows = form.find("input#rows").val();
    var columns = form.find("input#columns").val();
    tempGame = {
        id: name.toLowerCase(),
        label: name,
        levels: [],
        rows: rows,
        columns: columns
    };
    nextStep();
}

function validateGameName($el, value, callback) {
    var valid = true;
    var message = '';
    if (nullOrEmpty(value)) {
        valid = false;
        message = 'Incorrect length [3-50]'
    } else if (gameNameNotUnique(value)) {
        valid = false;
        message = 'Name has already been used'
    }
    callback({
        value: value,
        valid: valid,
        message: message
    });
}

function gameNameNotUnique(name) {
    var games = gameStorage.getGames();
    return objectHasKey(games, name.toLowerCase());
}

function loadStage(cnvName) {
    var rows = tempGame.rows;
    var columns = tempGame.columns;
    var level = { blocks: {}, minBlocks: 0, bonusTypes: [] };
    tempGame.levels.push(level);

    var stage = new Kinetic.Stage({
        container: cnvName,
        width: getCanvasWidth(columns),
        height: getCanvasHeight(rows)
    });

    var bottomLayer = new Kinetic.Layer({});
    var topLayer = new Kinetic.Layer({});
    stage.add(bottomLayer);
    stage.add(topLayer);

    var listening = false;
    var fillColor = 'black';
    bottomLayer.on('mousedown', function () {
        listening = true;
    });
    document.addEventListener('mouseup', function () {
        listening = false;
    });

    function toggleRect(rect) {
        //noinspection JSUnresolvedFunction
        rect.setFill(fillColor);
        if (fillColor == 'black') {
            level.blocks[rect.row + 'x' + rect.column] = { type: types.wall, location: { x: rect.column, y: rect.row }};
        } else {
            delete level.blocks[rect.row + 'x' + rect.column];
        }
        bottomLayer.draw();
    }

    for (var row = 0; row < rows; row++) {
        for (var column = 0; column < columns; column++) {
            console.log('X: ' + row + 'x' + column);
            console.log('1');
            var rect = new Kinetic.Rect({
                x: getCoordinates({ y: row, x: column }).x,
                y: getCoordinates({ y: row, x: column }).y,
                width: length,
                height: length,
                fill: 'white',
                stroke: 'black',
                strokeWidth: strokeWidth
            });
            console.log('2');
            rect.row = row;
            rect.column = column;
            console.log('3');

            rect.on('mouseover mouseup', function () {
                console.log(this.row);

                if (listening) {
                    toggleRect(this);
                }
            });
            console.log('4');
            rect.on('mousedown', function () {
                if (this.getFill() == 'black') {
                    fillColor = 'white'
                } else {
                    fillColor = 'black';
                }
                toggleRect(this);
            });
            console.log('5');

            bottomLayer.add(rect);
            console.log('6');
        }
    }
    bottomLayer.draw();
    topLayer.draw();
}

function createGame() {
    for (var i = 0; i < tempGame.levels.length; i++) {
        var level = tempGame.levels[i];
        var goalType = $("#goaltype-lvl" + (i + 1)).val();
        var goalAmount = $("#goalamount-lvl" + (i + 1)).val();

        level.goal = {
            type: goalType,
            amount: Number(goalAmount)
        }
    }

    gameStorage.addGame(tempGame);
}